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

    Returns counts of users, products, orders, etc.
    """
    from app.models.order import Order

    # Count users
    users_result = await db.execute(
        select(func.count()).select_from(User)
    )
    total_users = users_result.scalar()

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

    # Count orders
    orders_result = await db.execute(
        select(func.count()).select_from(Order)
    )
    total_orders = orders_result.scalar()

    # Count orders by status
    orders_pending_result = await db.execute(
        select(func.count())
        .select_from(Order)
        .where(Order.status == "pending")
    )
    orders_pending = orders_pending_result.scalar()

    orders_completed_result = await db.execute(
        select(func.count())
        .select_from(Order)
        .where(Order.status == "completed")
    )
    orders_completed = orders_completed_result.scalar()

    return {
        "users": {
            "total": total_users or 0
        },
        "products": {
            "moderation": products_moderation or 0,
            "active": products_active or 0,
            "rejected": products_rejected or 0,
            "total": (products_moderation or 0) + (products_active or 0) + (products_rejected or 0)
        },
        "orders": {
            "total": total_orders or 0,
            "pending": orders_pending or 0,
            "completed": orders_completed or 0
        }
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
    await db.commit()

    return {
        "message": "User unbanned successfully",
        "user_id": str(user.id)
    }
