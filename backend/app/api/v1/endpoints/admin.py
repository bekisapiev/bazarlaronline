"""
Admin Endpoints - System maintenance and cron jobs
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from uuid import UUID
from datetime import datetime

from app.database.session import get_db
from app.services.tariff_renewal import check_and_renew_tariffs
from app.models.wallet import WithdrawalRequest, Wallet, Transaction
from app.models.user import User
from app.core.dependencies import get_current_active_user

router = APIRouter()

# Simple API key for cron authentication
CRON_API_KEY = "your-secret-cron-key-change-in-production"


def require_admin(current_user: User = Depends(get_current_active_user)):
    """Dependency to require admin role"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.post("/cron/renew-tariffs")
async def cron_renew_tariffs(
    db: AsyncSession = Depends(get_db),
    x_api_key: str = Header(None)
):
    """
    Cron job endpoint: Check and renew/downgrade expired tariffs

    This should be called daily by a cron job or task scheduler

    Headers:
        X-API-Key: Secret API key for authentication
    """
    # Verify API key
    if x_api_key != CRON_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API key"
        )

    try:
        stats = await check_and_renew_tariffs(db)

        return {
            "success": True,
            "message": "Tariff renewal check completed",
            "stats": stats
        }

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing tariff renewals: {str(e)}"
        )


@router.get("/withdrawals")
async def get_withdrawal_requests(
    status_filter: str = Query(None, description="Filter by status: pending, processing, approved, rejected"),
    limit: int = Query(50, le=200),
    offset: int = 0,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all withdrawal requests (admin only)

    Filter by status and paginate results
    """
    query = select(WithdrawalRequest).order_by(desc(WithdrawalRequest.created_at))

    if status_filter:
        query = query.where(WithdrawalRequest.status == status_filter)

    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    withdrawals = result.scalars().all()

    # Get user details for each withdrawal
    withdrawal_list = []
    for w in withdrawals:
        user_result = await db.execute(
            select(User).where(User.id == w.user_id)
        )
        user = user_result.scalar_one_or_none()

        withdrawal_list.append({
            "id": str(w.id),
            "user_id": str(w.user_id),
            "user_email": user.email if user else None,
            "user_full_name": user.full_name if user else None,
            "amount": float(w.amount),
            "method": w.method,
            "mbank_phone": w.mbank_phone,
            "account_name": w.account_name,
            "balance_type": w.balance_type,
            "status": w.status,
            "processed_by": str(w.processed_by) if w.processed_by else None,
            "processed_at": w.processed_at,
            "rejection_reason": w.rejection_reason,
            "created_at": w.created_at
        })

    return {
        "items": withdrawal_list,
        "limit": limit,
        "offset": offset
    }


@router.put("/withdrawals/{withdrawal_id}/approve")
async def approve_withdrawal(
    withdrawal_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Approve a withdrawal request (admin only)

    Updates withdrawal status to 'approved' and marks transaction as completed
    """
    result = await db.execute(
        select(WithdrawalRequest).where(WithdrawalRequest.id == withdrawal_id)
    )
    withdrawal = result.scalar_one_or_none()

    if not withdrawal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Withdrawal request not found"
        )

    if withdrawal.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot approve withdrawal with status: {withdrawal.status}"
        )

    # Update withdrawal status
    withdrawal.status = "approved"
    withdrawal.processed_by = current_user.id
    withdrawal.processed_at = datetime.utcnow()

    # Update related transaction status
    transaction_result = await db.execute(
        select(Transaction).where(Transaction.reference_id == withdrawal.id)
    )
    transaction = transaction_result.scalar_one_or_none()

    if transaction:
        transaction.status = "completed"

    await db.commit()

    return {
        "success": True,
        "message": "Withdrawal approved successfully",
        "withdrawal_id": str(withdrawal.id),
        "amount": float(withdrawal.amount),
        "user_id": str(withdrawal.user_id)
    }


@router.put("/withdrawals/{withdrawal_id}/reject")
async def reject_withdrawal(
    withdrawal_id: UUID,
    rejection_reason: str,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Reject a withdrawal request (admin only)

    Updates withdrawal status to 'rejected', returns money to user's referral balance,
    and marks transaction as failed
    """
    result = await db.execute(
        select(WithdrawalRequest).where(WithdrawalRequest.id == withdrawal_id)
    )
    withdrawal = result.scalar_one_or_none()

    if not withdrawal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Withdrawal request not found"
        )

    if withdrawal.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot reject withdrawal with status: {withdrawal.status}"
        )

    # Update withdrawal status
    withdrawal.status = "rejected"
    withdrawal.processed_by = current_user.id
    withdrawal.processed_at = datetime.utcnow()
    withdrawal.rejection_reason = rejection_reason

    # Return money to user's referral balance
    wallet_result = await db.execute(
        select(Wallet).where(Wallet.user_id == withdrawal.user_id)
    )
    wallet = wallet_result.scalar_one_or_none()

    if wallet:
        wallet.referral_balance += withdrawal.amount

        # Create transaction for refund
        refund_transaction = Transaction(
            user_id=withdrawal.user_id,
            type="withdrawal_refund",
            amount=withdrawal.amount,
            balance_type="referral",
            description=f"Возврат средств: вывод отклонен ({rejection_reason})",
            reference_id=withdrawal.id,
            status="completed"
        )
        db.add(refund_transaction)

    # Update related transaction status
    transaction_result = await db.execute(
        select(Transaction).where(Transaction.reference_id == withdrawal.id)
    )
    transaction = transaction_result.scalar_one_or_none()

    if transaction:
        transaction.status = "failed"

    await db.commit()

    return {
        "success": True,
        "message": "Withdrawal rejected and funds returned",
        "withdrawal_id": str(withdrawal.id),
        "amount": float(withdrawal.amount),
        "user_id": str(withdrawal.user_id),
        "reason": rejection_reason
    }
