"""
Wallet Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from decimal import Decimal
from datetime import datetime

from app.database.session import get_db
from app.models.wallet import Wallet, Transaction, WithdrawalRequest as WithdrawalRequestModel, ReferralEarning
from app.models.user import User
from app.core.dependencies import get_current_active_user
from app.core.config import settings
from app.schemas.wallet import (
    WalletResponse,
    TopUpRequest,
    WithdrawalRequest,
    WithdrawalResponse,
    TransactionResponse
)

router = APIRouter()


@router.get("/balance", response_model=WalletResponse)
async def get_balance(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get wallet balance for current user
    """
    result = await db.execute(
        select(Wallet).where(Wallet.user_id == current_user.id)
    )
    wallet = result.scalar_one_or_none()

    if not wallet:
        # Create wallet if doesn't exist
        wallet = Wallet(user_id=current_user.id)
        db.add(wallet)
        await db.commit()
        await db.refresh(wallet)

    return WalletResponse(
        id=str(wallet.id),
        user_id=str(wallet.user_id),
        main_balance=wallet.main_balance,
        referral_balance=wallet.referral_balance,
        currency=wallet.currency
    )


@router.post("/topup")
async def topup_wallet(
    request: TopUpRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Top up wallet balance (main balance)

    Note: In production, this would integrate with MBank payment gateway.
    For now, it's a placeholder that creates a pending transaction.
    """
    if request.amount < 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum top-up amount is 100 KGS"
        )

    # Get user with referrer info
    user_result = await db.execute(
        select(User).where(User.id == current_user.id)
    )
    user = user_result.scalar_one()

    # Get wallet
    result = await db.execute(
        select(Wallet).where(Wallet.user_id == current_user.id)
    )
    wallet = result.scalar_one_or_none()

    if not wallet:
        wallet = Wallet(user_id=current_user.id)
        db.add(wallet)
        await db.flush()

    # Add to main balance
    wallet.main_balance += Decimal(str(request.amount))

    # Create transaction record
    transaction = Transaction(
        user_id=current_user.id,
        type="topup",
        amount=request.amount,
        balance_type="main",
        description="Пополнение баланса",
        status="completed"
    )
    db.add(transaction)
    await db.flush()  # Flush to get transaction.id

    # Check if user has active referrer and give 20% bonus
    if user.referred_by and user.referral_expires_at and user.referral_expires_at > datetime.utcnow():
        bonus_amount = Decimal(str(request.amount)) * Decimal('0.20')  # 20%

        # Get referrer wallet
        referrer_wallet_result = await db.execute(
            select(Wallet).where(Wallet.user_id == user.referred_by)
        )
        referrer_wallet = referrer_wallet_result.scalar_one_or_none()

        if referrer_wallet:
            # Add to referrer's referral balance
            referrer_wallet.referral_balance += bonus_amount

            # Create referral earning record
            earning = ReferralEarning(
                referrer_id=user.referred_by,
                referee_id=current_user.id,
                transaction_id=transaction.id,
                topup_amount=Decimal(str(request.amount)),
                earning_amount=bonus_amount,
                status="completed"
            )
            db.add(earning)

            # Create transaction for referrer
            referrer_transaction = Transaction(
                user_id=user.referred_by,
                type="referral",
                amount=bonus_amount,
                balance_type="referral",
                description=f"Реферальный бонус от пополнения пользователя",
                reference_id=transaction.id,
                status="completed"
            )
            db.add(referrer_transaction)

    await db.commit()
    await db.refresh(wallet)

    return {
        "message": "Balance topped up successfully",
        "transaction_id": str(transaction.id),
        "amount": float(request.amount),
        "status": "pending",
        "payment_url": "https://payment.mbank.kg/..."  # Placeholder
    }


@router.post("/withdraw", response_model=WithdrawalResponse)
async def withdraw_funds(
    request: WithdrawalRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Request withdrawal of referral balance

    Minimum withdrawal amount: 1000 KGS
    Can only withdraw from referral balance
    """
    if request.amount < 1000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Minimum withdrawal amount is 1000 KGS"
        )

    if not request.mbank_phone:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MBank phone number is required"
        )

    # Get wallet
    result = await db.execute(
        select(Wallet).where(Wallet.user_id == current_user.id)
    )
    wallet = result.scalar_one_or_none()

    if not wallet or wallet.referral_balance < request.amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient referral balance"
        )

    # Deduct from referral balance
    wallet.referral_balance -= Decimal(str(request.amount))

    # Create withdrawal request
    withdrawal = WithdrawalRequestModel(
        user_id=current_user.id,
        amount=request.amount,
        method=request.method,
        mbank_phone=request.mbank_phone,
        account_number=request.account_number,
        account_name=request.account_name,
        balance_type="referral",
        status="pending"
    )
    db.add(withdrawal)

    # Create transaction
    transaction = Transaction(
        user_id=current_user.id,
        type="withdrawal",
        amount=request.amount,
        balance_type="referral",
        description=f"Вывод средств на MBank {request.mbank_phone}",
        reference_id=withdrawal.id,
        status="pending"
    )
    db.add(transaction)

    await db.commit()
    await db.refresh(withdrawal)

    return WithdrawalResponse(
        id=str(withdrawal.id),
        user_id=str(withdrawal.user_id),
        amount=withdrawal.amount,
        method=withdrawal.method,
        account_number=withdrawal.account_number or "",
        account_name=withdrawal.account_name or "",
        status=withdrawal.status,
        created_at=withdrawal.created_at
    )


@router.post("/transfer")
async def transfer_between_balances(
    amount: Decimal,
    from_balance: str,  # "referral" or "main"
    to_balance: str,    # "referral" or "main"
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Transfer funds between main and referral balances
    Only referral -> main is allowed
    """
    if from_balance != "referral" or to_balance != "main":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only transfers from referral to main balance are allowed"
        )

    if amount <= 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Amount must be greater than 0"
        )

    # Get wallet
    result = await db.execute(
        select(Wallet).where(Wallet.user_id == current_user.id)
    )
    wallet = result.scalar_one_or_none()

    if not wallet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wallet not found"
        )

    if wallet.referral_balance < amount:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Insufficient referral balance"
        )

    # Transfer
    wallet.referral_balance -= amount
    wallet.main_balance += amount

    # Create transaction
    transaction = Transaction(
        user_id=current_user.id,
        type="transfer",
        amount=amount,
        balance_type="main",
        description=f"Перевод с реферального баланса на основной",
        status="completed"
    )
    db.add(transaction)

    await db.commit()
    await db.refresh(wallet)

    return {
        "message": "Transfer completed successfully",
        "amount": float(amount),
        "main_balance": float(wallet.main_balance),
        "referral_balance": float(wallet.referral_balance)
    }


@router.get("/transactions")
async def get_transactions(
    limit: int = 30,
    offset: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get transaction history for current user
    """
    result = await db.execute(
        select(Transaction)
        .where(Transaction.user_id == current_user.id)
        .order_by(desc(Transaction.created_at))
        .limit(limit)
        .offset(offset)
    )
    transactions = result.scalars().all()

    return {
        "items": [
            TransactionResponse(
                id=str(t.id),
                user_id=str(t.user_id),
                type=t.type,
                amount=t.amount,
                balance_type=t.balance_type,
                description=t.description,
                status=t.status,
                created_at=t.created_at
            )
            for t in transactions
        ],
        "total": len(transactions),
        "limit": limit,
        "offset": offset
    }


@router.get("/withdrawals")
async def get_withdrawal_requests(
    limit: int = 30,
    offset: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get withdrawal requests for current user
    """
    result = await db.execute(
        select(WithdrawalRequestModel)
        .where(WithdrawalRequestModel.user_id == current_user.id)
        .order_by(desc(WithdrawalRequestModel.created_at))
        .limit(limit)
        .offset(offset)
    )
    withdrawals = result.scalars().all()

    return {
        "items": [
            WithdrawalResponse(
                id=str(w.id),
                user_id=str(w.user_id),
                amount=w.amount,
                method=w.method,
                account_number=w.account_number,
                account_name=w.account_name,
                status=w.status,
                created_at=w.created_at
            )
            for w in withdrawals
        ],
        "total": len(withdrawals),
        "limit": limit,
        "offset": offset
    }
