"""
Admin Endpoints - System maintenance and cron jobs
"""
from fastapi import APIRouter, Depends, HTTPException, status, Header, Query, Body
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

from app.database.session import get_db
from app.services.tariff_renewal import check_and_renew_tariffs
from app.models.wallet import WithdrawalRequest, Wallet, Transaction
from app.models.user import User
from app.models.product import Product
from app.core.dependencies import get_current_active_user

router = APIRouter()

# Simple API key for cron authentication
CRON_API_KEY = "your-secret-cron-key-change-in-production"


class UserRoleUpdate(BaseModel):
    role: str


class ProductModeration(BaseModel):
    status: str


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


# User Management Endpoints

@router.get("/users/all")
async def get_all_users(
    limit: int = Query(100, le=500),
    offset: int = 0,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get all users (admin only)"""
    query = select(User).order_by(desc(User.created_at)).limit(limit).offset(offset)
    
    result = await db.execute(query)
    users = result.scalars().all()
    
    return [
        {
            "id": str(u.id),
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "tariff": u.tariff,
            "is_active": not u.is_banned,
            "is_banned": u.is_banned,
            "created_at": u.created_at,
            "avatar": u.avatar
        }
        for u in users
    ]


@router.put("/users/{user_id}/ban")
async def ban_user(
    user_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Ban a user (admin only)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_banned = True
    user.ban_reason = "Заблокирован администратором"
    await db.commit()
    
    return {"success": True, "message": "User banned"}


@router.put("/users/{user_id}/unban")
async def unban_user(
    user_id: UUID,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Unban a user (admin only)"""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_banned = False
    user.ban_reason = None
    await db.commit()
    
    return {"success": True, "message": "User unbanned"}


@router.put("/users/{user_id}/role")
async def change_user_role(
    user_id: UUID,
    data: UserRoleUpdate,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Change user role (admin only)"""
    if data.role not in ["buyer", "seller", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )
    
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.role = data.role
    await db.commit()
    
    return {"success": True, "message": f"User role changed to {data.role}"}


# Product Moderation Endpoints

@router.put("/products/{product_id}/moderate")
async def moderate_product(
    product_id: UUID,
    data: ProductModeration,
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Moderate a product (admin only)"""
    if data.status not in ["active", "rejected", "pending", "moderation"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status"
        )
    
    result = await db.execute(select(Product).where(Product.id == product_id))
    product = result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    product.status = data.status
    await db.commit()
    
    return {"success": True, "message": f"Product status changed to {data.status}"}


# Platform Statistics

@router.get("/stats")
async def get_platform_stats(
    current_user: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    """Get platform statistics (admin only)"""
    # Count users
    total_users_result = await db.execute(select(func.count()).select_from(User))
    total_users = total_users_result.scalar()
    
    active_users_result = await db.execute(
        select(func.count()).select_from(User).where(User.is_banned == False)
    )
    active_users = active_users_result.scalar()
    
    # Count products
    total_products_result = await db.execute(select(func.count()).select_from(Product))
    total_products = total_products_result.scalar()
    
    pending_products_result = await db.execute(
        select(func.count()).select_from(Product).where(Product.status == "moderation")
    )
    pending_products = pending_products_result.scalar()
    
    # Partner program statistics
    partner_products_result = await db.execute(
        select(func.count()).select_from(Product).where(
            Product.is_referral_enabled == True,
            Product.status == "active"
        )
    )
    partner_active_products = partner_products_result.scalar()
    
    return {
        "total_users": total_users or 0,
        "active_users": active_users or 0,
        "total_products": total_products or 0,
        "total_orders": 0,  # TODO: Implement when orders are added
        "total_revenue": 0,  # TODO: Implement when orders are added
        "pending_reports": 0,  # TODO: Implement from reports
        "pending_products": pending_products or 0,
        "partner_total_sales": 0,  # TODO: Implement from orders
        "partner_total_commission": 0,  # TODO: Implement from transactions
        "partner_referrer_share": 0,  # TODO: Calculate from transactions
        "partner_platform_share": 0,  # TODO: Calculate from transactions  
        "partner_active_products": partner_active_products or 0
    }
