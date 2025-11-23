"""
Tariff Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
from decimal import Decimal

from app.database.session import get_db
from app.models.user import User
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
    Activate user tariff

    НОВАЯ ЛОГИКА:
    - Тариф активируется БЕСПЛАТНО при наличии достаточного баланса
    - Средства НЕ списываются при активации
    - Списание происходит только при:
      * Продвижении товаров/услуг
      * Автоподнятии
      * Оплате партнерских комиссий (Business тариф)

    This endpoint:
    1. Checks wallet balance (минимальный порог для активации)
    2. Activates tariff without charging
    3. Creates activation record (without payment)
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

    # Calculate required balance (минимальный порог для активации)
    # Требуем баланс хотя бы на 1 продвижение
    monthly_price = TARIFF_PRICES[request.tariff]
    promotion_price = TARIFF_FEATURES[request.tariff]["promotion_price"]
    min_required_balance = Decimal(promotion_price)

    # Get wallet
    result = await db.execute(
        select(Wallet).where(Wallet.user_id == current_user.id)
    )
    wallet = result.scalar_one_or_none()

    if not wallet or wallet.main_balance < min_required_balance:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Minimum required for activation: {min_required_balance} KGS (price for 1 promotion)"
        )

    # Update user tariff (БЕЗ списания средств)
    if current_user.tariff_expires_at and current_user.tariff_expires_at > datetime.utcnow():
        # Extend existing subscription
        current_user.tariff_expires_at += timedelta(days=30 * request.duration_months)
    else:
        # New subscription
        current_user.tariff = request.tariff
        current_user.tariff_expires_at = datetime.utcnow() + timedelta(days=30 * request.duration_months)

    # Create activation record (БЕЗ списания)
    transaction = Transaction(
        user_id=current_user.id,
        type="tariff_activation",
        amount=Decimal(0),  # Активация бесплатная
        balance_type="main",
        description=f"Активация тарифа {request.tariff.capitalize()} на {request.duration_months} мес.",
        status="completed"
    )
    db.add(transaction)

    await db.commit()
    await db.refresh(current_user)

    return {
        "message": "Tariff activated successfully (no charge)",
        "tariff": current_user.tariff,
        "expires_at": current_user.tariff_expires_at,
        "amount_paid": 0.0,
        "promotion_price": float(promotion_price),
        "info": "Средства списываются только при продвижении товаров/услуг и оплате партнерских комиссий"
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
