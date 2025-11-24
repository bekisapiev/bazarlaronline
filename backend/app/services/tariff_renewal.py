"""
Tariff Renewal Service - Automatic subscription management

This service handles monthly tariff renewals:
- Checks expired tariffs
- Deducts monthly fee if balance is sufficient
- Downgrades to Free if insufficient balance
- Disables Business features when downgraded
"""
import logging
from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.models.wallet import Wallet, Transaction
from app.models.product import Product

logger = logging.getLogger(__name__)

# Tariff prices
TARIFF_PRICES = {
    "pro": Decimal("2990.00"),
    "business": Decimal("29990.00")
}


async def check_and_renew_tariffs(db: AsyncSession) -> dict:
    """
    Check all users with expired tariffs and renew or downgrade them

    Returns:
        dict: Statistics about renewals and downgrades
    """
    stats = {
        "checked": 0,
        "renewed": 0,
        "downgraded": 0,
        "errors": 0
    }

    try:
        # Find all users with expired tariffs (pro or business)
        now = datetime.utcnow()
        result = await db.execute(
            select(User)
            .options(selectinload(User.wallet))
            .where(
                and_(
                    User.tariff.in_(["pro", "business"]),
                    User.tariff_expires_at <= now
                )
            )
        )
        expired_users = result.scalars().all()

        logger.info(f"Found {len(expired_users)} users with expired tariffs")

        for user in expired_users:
            stats["checked"] += 1
            try:
                await process_tariff_renewal(db, user, stats)
            except Exception as e:
                logger.error(f"Error processing tariff renewal for user {user.id}: {e}")
                stats["errors"] += 1

        await db.commit()

    except Exception as e:
        logger.error(f"Error in check_and_renew_tariffs: {e}")
        await db.rollback()
        raise

    return stats


async def process_tariff_renewal(db: AsyncSession, user: User, stats: dict):
    """
    Process tariff renewal for a single user

    Args:
        db: Database session
        user: User object
        stats: Statistics dictionary to update
    """
    tariff = user.tariff
    price = TARIFF_PRICES.get(tariff)

    if not price:
        logger.warning(f"Unknown tariff {tariff} for user {user.id}")
        return

    # Get user's wallet
    if not user.wallet:
        wallet_result = await db.execute(
            select(Wallet).where(Wallet.user_id == user.id)
        )
        user.wallet = wallet_result.scalar_one_or_none()

    if not user.wallet:
        logger.error(f"Wallet not found for user {user.id}")
        return

    # Check if user has sufficient balance
    if user.wallet.main_balance >= price:
        # RENEW: Deduct money and extend subscription
        user.wallet.main_balance -= price

        # Create transaction
        transaction = Transaction(
            user_id=user.id,
            type="purchase",
            amount=-price,
            balance_type="main",
            description=f"Автопродление тарифа {tariff.upper()}",
            status="completed"
        )
        db.add(transaction)

        # Extend tariff for another 30 days
        user.tariff_expires_at = datetime.utcnow() + timedelta(days=30)

        logger.info(f"Renewed {tariff} for user {user.id}. New expiration: {user.tariff_expires_at}")
        stats["renewed"] += 1

    else:
        # DOWNGRADE: Insufficient balance - downgrade to Free
        old_tariff = user.tariff
        user.tariff = "free"
        user.tariff_expires_at = None

        logger.info(f"Downgraded user {user.id} from {old_tariff} to free due to insufficient balance")
        stats["downgraded"] += 1

        # If downgraded from Business, disable partner features
        if old_tariff == "business":
            await disable_business_features(db, user)


async def disable_business_features(db: AsyncSession, user: User):
    """
    Disable Business tariff features when user is downgraded

    - Disable is_referral_enabled on all user's products
    - Set referral_commission_percent to 0
    """
    # Disable referral program on all user's products
    result = await db.execute(
        select(Product).where(
            and_(
                Product.seller_id == user.id,
                Product.is_referral_enabled == True
            )
        )
    )
    products = result.scalars().all()

    disabled_count = 0
    for product in products:
        product.is_referral_enabled = False
        product.referral_commission_percent = None
        product.referral_commission_amount = None
        disabled_count += 1

    logger.info(f"Disabled referral program on {disabled_count} products for user {user.id}")


async def get_partner_products_for_user(db: AsyncSession, user_id, include_expired: bool = False):
    """
    Get partner products for a user

    If user's referrer has expired Business tariff, mark products accordingly

    Args:
        db: Database session
        user_id: User ID
        include_expired: Whether to include products from expired Business accounts
    """
    # Get user with referrer
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    user = result.scalar_one_or_none()

    if not user or not user.referred_by:
        return []

    # Get referrer
    referrer_result = await db.execute(
        select(User).where(User.id == user.referred_by)
    )
    referrer = referrer_result.scalar_one_or_none()

    if not referrer:
        return []

    # Check if referrer has active Business tariff
    referrer_has_active_business = (
        referrer.tariff == "business" and
        referrer.tariff_expires_at and
        referrer.tariff_expires_at > datetime.utcnow()
    )

    # Get partner products
    query = select(Product).where(
        and_(
            Product.seller_id == referrer.id,
            Product.is_referral_enabled == True,
            Product.status == "active"
        )
    )

    result = await db.execute(query)
    products = result.scalars().all()

    # Mark products with expired status
    products_data = []
    for product in products:
        product_dict = {
            "id": product.id,
            "title": product.title,
            "price": product.price,
            "is_expired": not referrer_has_active_business,
            "commission_percent": product.referral_commission_percent if referrer_has_active_business else 0,
            "commission_amount": product.referral_commission_amount if referrer_has_active_business else 0,
        }
        products_data.append(product_dict)

    return products_data
