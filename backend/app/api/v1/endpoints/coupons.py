"""
Coupon/Promo Code Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, and_
from typing import Optional
from uuid import UUID
from datetime import datetime, timedelta

from app.database.session import get_db
from app.models.coupon import Coupon, CouponUsage, CouponType
from app.models.user import User
from app.core.dependencies import get_current_active_user
from pydantic import BaseModel, Field

router = APIRouter()


# Schemas
class CouponCreate(BaseModel):
    """Coupon creation schema"""
    code: str = Field(..., min_length=3, max_length=50, pattern="^[A-Z0-9-]+$")
    type: str = Field(..., description="Type: percentage or fixed")
    value: int = Field(..., gt=0, description="Percentage (1-100) or fixed amount in KGS")
    max_uses: Optional[int] = Field(None, gt=0)
    max_uses_per_user: int = Field(1, gt=0, le=10)
    min_order_amount: Optional[int] = Field(None, gt=0)
    valid_days: int = Field(30, gt=0, le=365, description="Number of days coupon is valid")
    description: Optional[str] = Field(None, max_length=500)
    seller_id: Optional[str] = Field(None, description="Seller ID for seller-specific coupon")


class CouponResponse(BaseModel):
    """Coupon response schema"""
    id: str
    code: str
    type: str
    value: int
    max_uses: Optional[int]
    used_count: int
    max_uses_per_user: int
    min_order_amount: Optional[int]
    valid_from: datetime
    valid_until: datetime
    is_active: bool
    seller_id: Optional[str]
    description: Optional[str]
    created_at: datetime


class CouponValidateResponse(BaseModel):
    """Coupon validation response"""
    is_valid: bool
    message: str
    discount_amount: Optional[int] = None
    coupon: Optional[CouponResponse] = None


# Helper to check admin or seller access
async def check_coupon_creation_access(current_user: User = Depends(get_current_active_user)):
    """Only admin or seller can create coupons"""
    if current_user.role not in ["admin", "seller"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin or seller can create coupons"
        )
    return current_user


@router.post("/", response_model=CouponResponse)
async def create_coupon(
    coupon_data: CouponCreate,
    current_user: User = Depends(check_coupon_creation_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new coupon

    - Admins can create platform-wide coupons
    - Sellers can create coupons for their own products
    """
    # Validate coupon type
    try:
        coupon_type = CouponType(coupon_data.type)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid coupon type: {coupon_data.type}"
        )

    # Validate value based on type
    if coupon_type == CouponType.PERCENTAGE and (coupon_data.value < 1 or coupon_data.value > 100):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Percentage value must be between 1 and 100"
        )

    # Check if code already exists
    existing_result = await db.execute(
        select(Coupon).where(Coupon.code == coupon_data.code.upper())
    )
    if existing_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Coupon code '{coupon_data.code}' already exists"
        )

    # Validate seller_id if provided
    seller_id = None
    if coupon_data.seller_id:
        seller_id = UUID(coupon_data.seller_id)
        # If current user is seller, they can only create coupons for themselves
        if current_user.role == "seller" and seller_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Sellers can only create coupons for themselves"
            )
    elif current_user.role == "seller":
        # Sellers must specify their own ID
        seller_id = current_user.id

    # Calculate valid_until
    valid_until = datetime.utcnow() + timedelta(days=coupon_data.valid_days)

    # Create coupon
    coupon = Coupon(
        code=coupon_data.code.upper(),
        type=coupon_type,
        value=coupon_data.value,
        max_uses=coupon_data.max_uses,
        max_uses_per_user=coupon_data.max_uses_per_user,
        min_order_amount=coupon_data.min_order_amount,
        valid_until=valid_until,
        seller_id=seller_id,
        created_by=current_user.id,
        description=coupon_data.description
    )

    db.add(coupon)
    await db.commit()
    await db.refresh(coupon)

    return CouponResponse(
        id=str(coupon.id),
        code=coupon.code,
        type=coupon.type.value,
        value=coupon.value,
        max_uses=coupon.max_uses,
        used_count=coupon.used_count,
        max_uses_per_user=coupon.max_uses_per_user,
        min_order_amount=coupon.min_order_amount,
        valid_from=coupon.valid_from,
        valid_until=coupon.valid_until,
        is_active=coupon.is_active,
        seller_id=str(coupon.seller_id) if coupon.seller_id else None,
        description=coupon.description,
        created_at=coupon.created_at
    )


@router.get("/validate/{code}")
async def validate_coupon(
    code: str,
    order_amount: int = Query(..., gt=0, description="Order amount in KGS"),
    seller_id: Optional[UUID] = Query(None, description="Seller ID for seller-specific coupons"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Validate a coupon code

    Returns validation status and potential discount amount
    """
    # Get coupon
    result = await db.execute(
        select(Coupon).where(Coupon.code == code.upper())
    )
    coupon = result.scalar_one_or_none()

    if not coupon:
        return CouponValidateResponse(
            is_valid=False,
            message="Coupon code not found"
        )

    # Check if active
    if not coupon.is_active:
        return CouponValidateResponse(
            is_valid=False,
            message="Coupon is not active"
        )

    # Check validity period
    now = datetime.utcnow()
    if now < coupon.valid_from:
        return CouponValidateResponse(
            is_valid=False,
            message=f"Coupon is not yet valid (starts from {coupon.valid_from.strftime('%Y-%m-%d')})"
        )

    if now > coupon.valid_until:
        return CouponValidateResponse(
            is_valid=False,
            message="Coupon has expired"
        )

    # Check usage limit
    if coupon.max_uses and coupon.used_count >= coupon.max_uses:
        return CouponValidateResponse(
            is_valid=False,
            message="Coupon usage limit reached"
        )

    # Check seller restriction
    if coupon.seller_id:
        if not seller_id or coupon.seller_id != seller_id:
            return CouponValidateResponse(
                is_valid=False,
                message="Coupon is only valid for specific seller"
            )

    # Check user usage limit
    user_usage_result = await db.execute(
        select(func.count())
        .select_from(CouponUsage)
        .where(
            CouponUsage.coupon_id == coupon.id,
            CouponUsage.user_id == current_user.id
        )
    )
    user_usage_count = user_usage_result.scalar()

    if user_usage_count >= coupon.max_uses_per_user:
        return CouponValidateResponse(
            is_valid=False,
            message=f"You have already used this coupon {coupon.max_uses_per_user} time(s)"
        )

    # Check minimum order amount
    if coupon.min_order_amount and order_amount < coupon.min_order_amount:
        return CouponValidateResponse(
            is_valid=False,
            message=f"Minimum order amount is {coupon.min_order_amount} KGS"
        )

    # Calculate discount
    if coupon.type == CouponType.PERCENTAGE:
        discount = int(order_amount * coupon.value / 100)
    else:  # FIXED
        discount = min(coupon.value, order_amount)  # Can't discount more than order amount

    return CouponValidateResponse(
        is_valid=True,
        message="Coupon is valid",
        discount_amount=discount,
        coupon=CouponResponse(
            id=str(coupon.id),
            code=coupon.code,
            type=coupon.type.value,
            value=coupon.value,
            max_uses=coupon.max_uses,
            used_count=coupon.used_count,
            max_uses_per_user=coupon.max_uses_per_user,
            min_order_amount=coupon.min_order_amount,
            valid_from=coupon.valid_from,
            valid_until=coupon.valid_until,
            is_active=coupon.is_active,
            seller_id=str(coupon.seller_id) if coupon.seller_id else None,
            description=coupon.description,
            created_at=coupon.created_at
        )
    )


@router.get("/my-coupons")
async def get_my_coupons(
    limit: int = Query(30, le=100),
    offset: int = 0,
    current_user: User = Depends(check_coupon_creation_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Get coupons created by current user (admin or seller)
    """
    query = select(Coupon).where(Coupon.created_by == current_user.id)

    # If seller, show only their coupons
    if current_user.role == "seller":
        query = query.where(Coupon.seller_id == current_user.id)

    query = query.order_by(desc(Coupon.created_at))

    # Count total
    count_query = select(func.count()).select_from(Coupon).where(
        Coupon.created_by == current_user.id
    )
    if current_user.role == "seller":
        count_query = count_query.where(Coupon.seller_id == current_user.id)

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # Pagination
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    coupons = result.scalars().all()

    return {
        "items": [
            {
                "id": str(c.id),
                "code": c.code,
                "type": c.type.value,
                "value": c.value,
                "max_uses": c.max_uses,
                "used_count": c.used_count,
                "max_uses_per_user": c.max_uses_per_user,
                "min_order_amount": c.min_order_amount,
                "valid_from": c.valid_from,
                "valid_until": c.valid_until,
                "is_active": c.is_active,
                "is_valid": c.is_valid(),
                "description": c.description,
                "created_at": c.created_at
            }
            for c in coupons
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.put("/{coupon_id}/deactivate")
async def deactivate_coupon(
    coupon_id: UUID,
    current_user: User = Depends(check_coupon_creation_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Deactivate a coupon

    Only creator can deactivate
    """
    result = await db.execute(
        select(Coupon).where(Coupon.id == coupon_id)
    )
    coupon = result.scalar_one_or_none()

    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )

    # Check ownership
    if coupon.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only deactivate your own coupons"
        )

    coupon.is_active = False
    coupon.updated_at = datetime.utcnow()
    await db.commit()

    return {
        "message": "Coupon deactivated successfully",
        "coupon_id": str(coupon_id)
    }


@router.get("/{coupon_id}/usage")
async def get_coupon_usage(
    coupon_id: UUID,
    limit: int = Query(30, le=100),
    offset: int = 0,
    current_user: User = Depends(check_coupon_creation_access),
    db: AsyncSession = Depends(get_db)
):
    """
    Get usage history for a coupon

    Only creator can view usage
    """
    # Get coupon
    coupon_result = await db.execute(
        select(Coupon).where(Coupon.id == coupon_id)
    )
    coupon = coupon_result.scalar_one_or_none()

    if not coupon:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Coupon not found"
        )

    # Check ownership
    if coupon.created_by != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view usage of your own coupons"
        )

    # Get usage records
    query = select(CouponUsage).where(CouponUsage.coupon_id == coupon_id).order_by(
        desc(CouponUsage.used_at)
    )

    # Count total
    count_result = await db.execute(
        select(func.count()).select_from(CouponUsage).where(
            CouponUsage.coupon_id == coupon_id
        )
    )
    total = count_result.scalar()

    # Pagination
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    usage_records = result.scalars().all()

    return {
        "coupon_code": coupon.code,
        "total_uses": total,
        "items": [
            {
                "id": str(u.id),
                "user_id": str(u.user_id),
                "order_id": str(u.order_id),
                "discount_amount": u.discount_amount,
                "used_at": u.used_at
            }
            for u in usage_records
        ],
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }
