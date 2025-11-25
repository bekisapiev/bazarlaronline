"""
Tariff Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from decimal import Decimal

from app.database.session import get_db
from app.models.user import User, SellerProfile
from app.models.wallet import Wallet, Transaction
from app.core.dependencies import get_current_active_user
from app.core.config import settings
from app.schemas.wallet import TariffUpgradeRequest

router = APIRouter()


TARIFF_PRICES = {
    "free": 0,
    "pro": settings.PRO_MONTHLY_PRICE,
    "business": settings.BUSINESS_MONTHLY_PRICE
}

TARIFF_FEATURES = {
    "free": {
        "max_products": 10,
        "show_in_catalog": False,
        "promotion_price": settings.FREE_PROMOTION_PRICE,
        "auto_promotion": False,
        "partner_program": False,
        "online_payments": False
    },
    "pro": {
        "max_products": 100,
        "show_in_catalog": True,
        "promotion_price": settings.PRO_PROMOTION_PRICE,
        "auto_promotion": True,
        "partner_program": False,
        "online_payments": True
    },
    "business": {
        "max_products": 1000,
        "show_in_catalog": True,
        "promotion_price": settings.BUSINESS_PROMOTION_PRICE,
        "auto_promotion": True,
        "partner_program": True,
        "online_payments": True,
        "analytics": True
    }
}


@router.get("/plans")
async def get_tariff_plans():
    """
    Get all available tariff plans with features and pricing
    """
    return {
        "plans": [
            {
                "name": "free",
                "price": 0,
                "price_per_month": 0,
                "features": TARIFF_FEATURES["free"]
            },
            {
                "name": "pro",
                "price": TARIFF_PRICES["pro"],
                "price_per_month": TARIFF_PRICES["pro"],
                "features": TARIFF_FEATURES["pro"]
            },
            {
                "name": "business",
                "price": TARIFF_PRICES["business"],
                "price_per_month": TARIFF_PRICES["business"],
                "features": TARIFF_FEATURES["business"]
            }
        ]
    }


@router.get("/current")
async def get_current_tariff(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's tariff info
    """
    return {
        "tariff": current_user.tariff,
        "expires_at": current_user.tariff_expires_at,
        "is_active": (
            current_user.tariff == "free" or
            (current_user.tariff_expires_at and current_user.tariff_expires_at > datetime.utcnow())
        ),
        "features": TARIFF_FEATURES.get(current_user.tariff, TARIFF_FEATURES["free"])
    }


@router.post("/upgrade")
async def upgrade_tariff(
    request: TariffUpgradeRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upgrade user tariff

    This endpoint:
    1. Checks wallet balance
    2. Deducts payment from main balance
    3. Updates user tariff
    4. Creates transaction record
    """
    if request.tariff not in ["pro", "business"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid tariff. Must be 'pro' or 'business'"
        )

    if request.duration_months < 1 or request.duration_months > 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Duration must be between 1 and 12 months"
        )

    # Calculate total price
    monthly_price = TARIFF_PRICES[request.tariff]
    total_price = Decimal(monthly_price * request.duration_months)

    # Get wallet
    result = await db.execute(
        select(Wallet).where(Wallet.user_id == current_user.id)
    )
    wallet = result.scalar_one_or_none()

    if not wallet or wallet.main_balance < total_price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Required: {total_price} KGS"
        )

    # Deduct from wallet
    wallet.main_balance -= total_price

    # Update user tariff
    if current_user.tariff_expires_at and current_user.tariff_expires_at > datetime.utcnow():
        # Extend existing subscription
        current_user.tariff_expires_at += timedelta(days=30 * request.duration_months)
    else:
        # New subscription
        current_user.tariff = request.tariff
        current_user.tariff_expires_at = datetime.utcnow() + timedelta(days=30 * request.duration_months)

    # Auto-create SellerProfile for Pro/Business users if it doesn't exist
    if request.tariff in ["pro", "business"]:
        # Check if seller profile already exists
        seller_profile_result = await db.execute(
            select(SellerProfile).where(SellerProfile.user_id == current_user.id)
        )
        existing_profile = seller_profile_result.scalar_one_or_none()

        if not existing_profile:
            # Create default seller profile
            default_shop_name = current_user.full_name if current_user.full_name else f"Магазин {current_user.phone}"
            seller_profile = SellerProfile(
                user_id=current_user.id,
                shop_name=default_shop_name,
                description="",
                seller_type="shop"  # Default: shop (allowed: market, boutique, shop, office, home, mobile, warehouse)
            )
            db.add(seller_profile)

    # Create transaction record
    transaction = Transaction(
        user_id=current_user.id,
        type="tariff_upgrade",
        amount=total_price,
        balance_type="main",
        description=f"Подписка {request.tariff.capitalize()} на {request.duration_months} мес.",
        status="completed"
    )
    db.add(transaction)

    await db.commit()
    await db.refresh(current_user)

    return {
        "message": "Tariff upgraded successfully",
        "tariff": current_user.tariff,
        "expires_at": current_user.tariff_expires_at,
        "amount_paid": float(total_price)
    }


@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Cancel auto-renewal of subscription

    Note: User will keep their tariff until expiration date,
    but it won't auto-renew.
    """
    if current_user.tariff == "free":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You're on a free plan, nothing to cancel"
        )

    # In a real system, we'd mark a flag to prevent auto-renewal
    # For now, just return success

    return {
        "message": "Subscription cancelled. You can use your plan until expiration.",
        "expires_at": current_user.tariff_expires_at
    }
