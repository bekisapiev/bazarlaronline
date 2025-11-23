"""
Admin Endpoints for Moderation
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.database.session import get_db
from app.models.product import Product
from app.models.user import User
from app.core.dependencies import get_current_active_user

router = APIRouter()


async def check_admin_access(current_user: User = Depends(get_current_active_user)):
    """Dependency to check if user is admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


@router.get("/products/moderation")
async def get_products_for_moderation(
    limit: int = Query(30, le=100),
    offset: int = 0,
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Get products pending moderation (admin only)

    Returns products with status = 'moderation'
    """
    result = await db.execute(
        select(Product)
        .where(Product.status == "moderation")
        .order_by(desc(Product.created_at))
        .limit(limit)
        .offset(offset)
    )
    products = result.scalars().all()

    # Count total
    count_result = await db.execute(
        select(func.count())
        .select_from(Product)
        .where(Product.status == "moderation")
    )
    total = count_result.scalar()

    return {
        "items": [
            {
                "id": str(p.id),
                "seller_id": str(p.seller_id),
                "title": p.title,
                "description": p.description,
                "price": float(p.price),
                "discount_price": float(p.discount_price) if p.discount_price else None,
                "images": p.images or [],
                "characteristics": p.characteristics or [],
                "category_id": p.category_id,
                "delivery_type": p.delivery_type,
                "status": p.status,
                "created_at": p.created_at
            }
            for p in products
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.put("/products/{product_id}/moderate")
async def moderate_product(
    product_id: UUID,
    action: str = Query(..., description="approve or reject"),
    reason: Optional[str] = Query(None, description="Rejection reason"),
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Moderate a product (admin only)

    Actions:
    - approve: Change status to 'active'
    - reject: Change status to 'rejected' with reason
    """
    if action not in ["approve", "reject"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action must be 'approve' or 'reject'"
        )

    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    if product.status != "moderation":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product is not pending moderation (current status: {product.status})"
        )

    if action == "approve":
        product.status = "active"
        product.moderation_result = {
            "status": "approved",
            "by": str(admin_user.id),
            "at": datetime.utcnow().isoformat()
        }
    else:  # reject
        if not reason:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Rejection reason is required"
            )
        product.status = "rejected"
        product.moderation_result = {
            "status": "rejected",
            "reason": reason,
            "by": str(admin_user.id),
            "at": datetime.utcnow().isoformat()
        }

    product.updated_at = datetime.utcnow()
    await db.commit()

    return {
        "message": f"Product {action}ed successfully",
        "product_id": str(product.id),
        "new_status": product.status,
        "moderation_result": product.moderation_result
    }


@router.get("/stats")
async def get_admin_stats(
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Get platform statistics (admin only)

    Returns counts of users, products, orders, withdrawals, and partner program stats
    """
    from app.models.order import Order
    from app.models.wallet import WithdrawalRequest, Transaction
    from decimal import Decimal

    # Count total users
    users_result = await db.execute(
        select(func.count()).select_from(User)
    )
    total_users = users_result.scalar()

    # Count active users (non-banned)
    active_users_result = await db.execute(
        select(func.count()).select_from(User).where(User.is_banned == False)
    )
    active_users = active_users_result.scalar()

    # Count new users this month
    from datetime import datetime
    first_day_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    new_users_result = await db.execute(
        select(func.count())
        .select_from(User)
        .where(User.created_at >= first_day_of_month)
    )
    new_users_this_month = new_users_result.scalar()

    # Count products by status
    products_moderation_result = await db.execute(
        select(func.count())
        .select_from(Product)
        .where(Product.status == "moderation")
    )
    products_moderation = products_moderation_result.scalar()

    products_active_result = await db.execute(
        select(func.count())
        .select_from(Product)
        .where(Product.status == "active")
    )
    products_active = products_active_result.scalar()

    products_rejected_result = await db.execute(
        select(func.count())
        .select_from(Product)
        .where(Product.status == "rejected")
    )
    products_rejected = products_rejected_result.scalar()

    total_products = (products_moderation or 0) + (products_active or 0) + (products_rejected or 0)

    # Count orders
    orders_result = await db.execute(
        select(func.count()).select_from(Order)
    )
    total_orders = orders_result.scalar()

    # Calculate total revenue (sum of all completed orders)
    revenue_result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0))
        .select_from(Order)
        .where(Order.status == "completed")
    )
    total_revenue = revenue_result.scalar() or Decimal(0)

    # Withdrawal statistics
    pending_withdrawals_result = await db.execute(
        select(func.count())
        .select_from(WithdrawalRequest)
        .where(WithdrawalRequest.status == "pending")
    )
    pending_withdrawals = pending_withdrawals_result.scalar()

    total_withdrawals_result = await db.execute(
        select(func.coalesce(func.sum(WithdrawalRequest.amount), 0))
        .select_from(WithdrawalRequest)
        .where(WithdrawalRequest.status.in_(["completed", "pending"]))
    )
    total_withdrawals_amount = total_withdrawals_result.scalar() or Decimal(0)

    # Partner program statistics
    partner_products_result = await db.execute(
        select(func.count())
        .select_from(Product)
        .where(Product.partner_percent > 0, Product.status == "active")
    )
    partner_active_products = partner_products_result.scalar()

    # Sum of all partner commission transactions
    partner_commission_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .select_from(Transaction)
        .where(Transaction.type == "referral_commission", Transaction.status == "completed")
    )
    partner_total_commission = partner_commission_result.scalar() or Decimal(0)

    # Sum of all orders with referral commission
    partner_sales_result = await db.execute(
        select(func.coalesce(func.sum(Order.total_amount), 0))
        .select_from(Order)
        .where(Order.referral_commission != None, Order.status == "completed")
    )
    partner_total_sales = partner_sales_result.scalar() or Decimal(0)

    # Calculate distribution (40% partner, 60% platform)
    partner_referrer_share = partner_total_commission * Decimal('0.40')
    partner_platform_share = partner_total_commission * Decimal('0.60')

    return {
        # User stats
        "total_users": total_users or 0,
        "active_users": active_users or 0,
        "new_users_this_month": new_users_this_month or 0,

        # Product stats
        "total_products": total_products,
        "pending_products": products_moderation or 0,
        "active_products": products_active or 0,
        "rejected_products": products_rejected or 0,

        # Order stats
        "total_orders": total_orders or 0,
        "total_revenue": float(total_revenue),

        # Withdrawal stats
        "pending_withdrawals": pending_withdrawals or 0,
        "total_withdrawals_amount": float(total_withdrawals_amount),

        # Partner program stats
        "partner_active_products": partner_active_products or 0,
        "partner_total_sales": float(partner_total_sales),
        "partner_total_commission": float(partner_total_commission),
        "partner_referrer_share": float(partner_referrer_share),
        "partner_platform_share": float(partner_platform_share)
    }


@router.get("/users")
async def get_users_list(
    limit: int = Query(50, le=100),
    offset: int = 0,
    search: Optional[str] = Query(None, description="Search by email or name"),
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of users (admin only)
    """
    query = select(User)

    if search:
        query = query.where(
            (User.email.ilike(f"%{search}%")) |
            (User.full_name.ilike(f"%{search}%"))
        )

    query = query.order_by(desc(User.created_at)).limit(limit).offset(offset)

    result = await db.execute(query)
    users = result.scalars().all()

    # Count total
    count_query = select(func.count()).select_from(User)
    if search:
        count_query = count_query.where(
            (User.email.ilike(f"%{search}%")) |
            (User.full_name.ilike(f"%{search}%"))
        )

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return {
        "items": [
            {
                "id": str(u.id),
                "email": u.email,
                "full_name": u.full_name,
                "tariff": u.tariff,
                "role": u.role,
                "is_banned": u.is_banned,
                "ban_reason": u.ban_reason,
                "created_at": u.created_at
            }
            for u in users
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.put("/users/{user_id}/ban")
async def ban_user(
    user_id: UUID,
    reason: str = Query(..., description="Ban reason"),
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Ban a user (admin only)
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    if user.role == "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot ban admin users"
        )

    user.is_banned = True
    user.ban_reason = reason  # Сохраняем причину бана
    await db.commit()

    return {
        "message": "User banned successfully",
        "user_id": str(user.id),
        "reason": reason
    }


@router.put("/users/{user_id}/unban")
async def unban_user(
    user_id: UUID,
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Unban a user (admin only)
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    user.is_banned = False
    user.ban_reason = None  # Очищаем причину бана
    await db.commit()

    return {
        "message": "User unbanned successfully",
        "user_id": str(user.id)
    }


@router.get("/withdrawals")
async def get_withdrawal_requests(
    limit: int = Query(50, le=100),
    offset: int = 0,
    status_filter: Optional[str] = Query(None, description="Filter by status: pending, approved, rejected, completed"),
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of withdrawal requests (admin only)
    """
    from app.models.wallet import WithdrawalRequest

    query = select(WithdrawalRequest)

    if status_filter:
        query = query.where(WithdrawalRequest.status == status_filter)

    query = query.order_by(desc(WithdrawalRequest.created_at)).limit(limit).offset(offset)

    result = await db.execute(query)
    withdrawals = result.scalars().all()

    # Count total
    count_query = select(func.count()).select_from(WithdrawalRequest)
    if status_filter:
        count_query = count_query.where(WithdrawalRequest.status == status_filter)

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # Get user info for each withdrawal
    items = []
    for w in withdrawals:
        user_result = await db.execute(
            select(User).where(User.id == w.user_id)
        )
        user = user_result.scalar_one_or_none()

        items.append({
            "id": str(w.id),
            "user_id": str(w.user_id),
            "user_email": user.email if user else "Unknown",
            "user_name": user.full_name if user else "Unknown",
            "amount": float(w.amount),
            "method": w.method,
            "mbank_phone": w.mbank_phone,
            "account_number": w.account_number,
            "account_name": w.account_name,
            "balance_type": w.balance_type,
            "status": w.status,
            "admin_note": w.admin_note,
            "created_at": w.created_at,
            "updated_at": w.updated_at
        })

    return {
        "items": items,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.put("/withdrawals/{withdrawal_id}/approve")
async def approve_withdrawal(
    withdrawal_id: UUID,
    admin_note: Optional[str] = Query(None, description="Admin note"),
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Approve a withdrawal request (admin only)
    """
    from app.models.wallet import WithdrawalRequest

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

    withdrawal.status = "completed"
    withdrawal.admin_note = admin_note
    withdrawal.updated_at = datetime.utcnow()

    await db.commit()

    return {
        "message": "Withdrawal approved successfully",
        "withdrawal_id": str(withdrawal.id),
        "amount": float(withdrawal.amount)
    }


@router.put("/withdrawals/{withdrawal_id}/reject")
async def reject_withdrawal(
    withdrawal_id: UUID,
    reason: str = Query(..., description="Rejection reason"),
    admin_user: User = Depends(check_admin_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Reject a withdrawal request and return funds (admin only)
    """
    from app.models.wallet import WithdrawalRequest, Wallet, Transaction

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

    # Return funds to user's balance
    wallet_result = await db.execute(
        select(Wallet).where(Wallet.user_id == withdrawal.user_id)
    )
    wallet = wallet_result.scalar_one_or_none()

    if wallet:
        # Return to appropriate balance
        if withdrawal.balance_type == "referral":
            wallet.referral_balance += withdrawal.amount
        else:
            wallet.main_balance += withdrawal.amount

        # Create refund transaction
        transaction = Transaction(
            user_id=withdrawal.user_id,
            type="withdrawal_refund",
            amount=withdrawal.amount,
            balance_type=withdrawal.balance_type,
            description=f"Возврат средств - отклоненный запрос на вывод. Причина: {reason}",
            reference_id=withdrawal.id,
            status="completed"
        )
        db.add(transaction)

    withdrawal.status = "rejected"
    withdrawal.admin_note = reason
    withdrawal.updated_at = datetime.utcnow()

    await db.commit()

    return {
        "message": "Withdrawal rejected and funds returned",
        "withdrawal_id": str(withdrawal.id),
        "amount": float(withdrawal.amount),
        "reason": reason
    }
