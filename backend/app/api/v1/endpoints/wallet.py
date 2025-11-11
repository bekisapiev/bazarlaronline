"""
Wallet Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from decimal import Decimal
from datetime import datetime

from app.database.session import get_db
from app.models.wallet import Wallet, Transaction, WithdrawalRequest as WithdrawalRequestModel
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

    # Get wallet
    result = await db.execute(
        select(Wallet).where(Wallet.user_id == current_user.id)
    )
    wallet = result.scalar_one_or_none()

    if not wallet:
        wallet = Wallet(user_id=current_user.id)
        db.add(wallet)
        await db.flush()

    # Create transaction record
    transaction = Transaction(
        user_id=current_user.id,
        type="topup",
        amount=request.amount,
        balance_type="main",
        description="Пополнение баланса",
        status="pending"  # Will be "completed" after payment confirmation
    )
    db.add(transaction)
    await db.commit()

    # TODO: Integrate MBank payment gateway here
    # payment_url = create_mbank_payment(request.amount, transaction.id)

    return {
        "message": "Top-up initiated",
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

    Minimum withdrawal amount: 3000 KGS
    """
    if request.amount < settings.MIN_WITHDRAWAL_AMOUNT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Minimum withdrawal amount is {settings.MIN_WITHDRAWAL_AMOUNT} KGS"
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

    # Create withdrawal request
    withdrawal = WithdrawalRequestModel(
        user_id=current_user.id,
        amount=request.amount,
        method=request.method,
        account_number=request.account_number,
        account_name=request.account_name,
        status="pending"
    )
    db.add(withdrawal)
    await db.commit()
    await db.refresh(withdrawal)

    return WithdrawalResponse(
        id=str(withdrawal.id),
        user_id=str(withdrawal.user_id),
        amount=withdrawal.amount,
        method=withdrawal.method,
        account_number=withdrawal.account_number,
        account_name=withdrawal.account_name,
        status=withdrawal.status,
        created_at=withdrawal.created_at
    )


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
