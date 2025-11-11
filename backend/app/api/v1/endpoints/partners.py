"""
Partner/Referral Program Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import Optional
from decimal import Decimal

from app.database.session import get_db
from app.models.user import User
from app.models.order import Order
from app.models.wallet import Transaction
from app.core.dependencies import get_current_active_user
from app.core.config import settings
from app.schemas.partner import ReferralStatsResponse, ReferralHistoryItem, PartnerLinkResponse

router = APIRouter()


@router.get("/stats", response_model=ReferralStatsResponse)
async def get_referral_stats(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get referral statistics for current user

    Returns:
    - Referral code
    - Total number of referrals
    - Total earnings from referral commissions
    - Current referral balance
    """
    # Count total referrals (users who signed up with this referral code)
    referrals_result = await db.execute(
        select(func.count())
        .select_from(User)
        .where(User.referred_by == current_user.id)
    )
    total_referrals = referrals_result.scalar()

    # Calculate total earnings from referral commissions
    earnings_result = await db.execute(
        select(func.coalesce(func.sum(Transaction.amount), 0))
        .select_from(Transaction)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.type == "referral_commission",
            Transaction.status == "completed"
        )
    )
    total_earnings = earnings_result.scalar()

    # Get current wallet
    from app.models.wallet import Wallet
    wallet_result = await db.execute(
        select(Wallet).where(Wallet.user_id == current_user.id)
    )
    wallet = wallet_result.scalar_one_or_none()
    referral_balance = wallet.referral_balance if wallet else Decimal(0)

    return ReferralStatsResponse(
        referral_code=current_user.referral_id,
        total_referrals=total_referrals or 0,
        total_earnings=Decimal(total_earnings or 0),
        referral_balance=referral_balance,
        pending_earnings=Decimal(0)  # Can be calculated if there are pending orders
    )


@router.get("/link", response_model=PartnerLinkResponse)
async def get_partner_link(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get partner referral link

    Returns referral code and formatted link for sharing
    """
    # In production, use actual domain from settings
    referral_link = f"https://bazarlar.kg/ref/{current_user.referral_id}"
    qr_code_url = f"https://api.bazarlar.kg/qr/{current_user.referral_id}.png"

    return PartnerLinkResponse(
        referral_code=current_user.referral_id,
        referral_link=referral_link,
        qr_code_url=qr_code_url
    )


@router.get("/referrals")
async def get_referrals(
    limit: int = Query(30, le=100),
    offset: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of users who signed up using your referral code
    """
    result = await db.execute(
        select(User)
        .where(User.referred_by == current_user.id)
        .order_by(desc(User.created_at))
        .limit(limit)
        .offset(offset)
    )
    referrals = result.scalars().all()

    # Count total
    count_result = await db.execute(
        select(func.count())
        .select_from(User)
        .where(User.referred_by == current_user.id)
    )
    total = count_result.scalar()

    return {
        "items": [
            {
                "id": str(r.id),
                "email": r.email,
                "full_name": r.full_name,
                "joined_at": r.created_at
            }
            for r in referrals
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.get("/earnings")
async def get_referral_earnings(
    limit: int = Query(30, le=100),
    offset: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed earnings history from referral commissions

    Shows all transactions where user earned referral commission
    """
    result = await db.execute(
        select(Transaction)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.type == "referral_commission"
        )
        .order_by(desc(Transaction.created_at))
        .limit(limit)
        .offset(offset)
    )
    transactions = result.scalars().all()

    # Count total
    count_result = await db.execute(
        select(func.count())
        .select_from(Transaction)
        .where(
            Transaction.user_id == current_user.id,
            Transaction.type == "referral_commission"
        )
    )
    total = count_result.scalar()

    # Get order details for each transaction if reference_id exists
    earnings_with_details = []
    for t in transactions:
        earning = {
            "id": str(t.id),
            "amount": t.amount,
            "description": t.description,
            "status": t.status,
            "created_at": t.created_at,
            "order_id": str(t.reference_id) if t.reference_id else None
        }

        # If reference_id exists, try to get order details
        if t.reference_id:
            order_result = await db.execute(
                select(Order).where(Order.id == t.reference_id)
            )
            order = order_result.scalar_one_or_none()
            if order:
                earning["order_number"] = order.order_number
                earning["order_total"] = float(order.total_amount)

        earnings_with_details.append(earning)

    return {
        "items": earnings_with_details,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.get("/top-products")
async def get_top_performing_products(
    limit: int = Query(10, le=50),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get top performing products for partners

    Shows products with highest partner commission that can be promoted
    (Only available for Business tariff users)
    """
    # This endpoint helps partners find the best products to promote
    from app.models.product import Product

    # Get products with partner_percent > 0, ordered by partner_percent desc
    result = await db.execute(
        select(Product)
        .where(
            Product.status == "active",
            Product.partner_percent > 0
        )
        .order_by(desc(Product.partner_percent), desc(Product.views_count))
        .limit(limit)
    )
    products = result.scalars().all()

    return {
        "items": [
            {
                "id": str(p.id),
                "title": p.title,
                "price": float(p.price),
                "discount_price": float(p.discount_price) if p.discount_price else None,
                "partner_percent": float(p.partner_percent),
                "potential_commission": float(
                    (p.discount_price if p.discount_price else p.price) * p.partner_percent / 100
                ),
                "seller_id": str(p.seller_id),
                "images": p.images[:1] if p.images else [],
                "views_count": p.views_count
            }
            for p in products
        ],
        "total": len(products)
    }
