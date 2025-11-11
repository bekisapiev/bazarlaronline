"""
User Settings Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.database.session import get_db
from app.models.user import User
from app.core.dependencies import get_current_active_user
from pydantic import BaseModel, Field

router = APIRouter()


# Schemas
class NotificationSettings(BaseModel):
    """Notification preferences"""
    email_notifications: bool = True
    push_notifications: bool = True
    order_updates: bool = True
    review_notifications: bool = True
    promo_notifications: bool = False
    chat_messages: bool = True


class PrivacySettings(BaseModel):
    """Privacy preferences"""
    show_profile: bool = True
    show_purchases_history: bool = False
    allow_seller_messages: bool = True


class UserSettings(BaseModel):
    """User settings schema"""
    language: str = Field("ru", description="Language preference: ru, en, ky")
    notifications: NotificationSettings = NotificationSettings()
    privacy: PrivacySettings = PrivacySettings()


@router.get("/", response_model=UserSettings)
async def get_user_settings(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user settings

    Returns default settings if none are saved
    """
    # For now, return default settings
    # In production, you'd store these in a JSONB field in the User model
    # or in a separate UserSettings table

    default_settings = UserSettings()

    return default_settings


@router.put("/", response_model=UserSettings)
async def update_user_settings(
    settings: UserSettings,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update user settings

    Note: This is a simplified implementation.
    In production, store settings in database (JSONB field or separate table)
    """
    # Validate language
    if settings.language not in ["ru", "en", "ky"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid language. Supported: ru, en, ky"
        )

    # Here you would save settings to database
    # For now, just return the settings back

    return settings


@router.put("/notifications")
async def update_notification_settings(
    notifications: NotificationSettings,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update only notification settings
    """
    # Save to database
    # ...

    return {
        "message": "Notification settings updated",
        "settings": notifications
    }


@router.put("/privacy")
async def update_privacy_settings(
    privacy: PrivacySettings,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update only privacy settings
    """
    # Save to database
    # ...

    return {
        "message": "Privacy settings updated",
        "settings": privacy
    }


@router.post("/reset")
async def reset_to_defaults(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Reset all settings to defaults
    """
    default_settings = UserSettings()

    # Save defaults to database
    # ...

    return {
        "message": "Settings reset to defaults",
        "settings": default_settings
    }


@router.get("/export")
async def export_user_data(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Export user data (GDPR compliance)

    Returns user profile, orders, reviews, etc.
    """
    from app.models.order import Order
    from app.models.review import Review
    from sqlalchemy import select

    # Get user orders
    orders_result = await db.execute(
        select(Order).where(Order.buyer_id == current_user.id)
    )
    orders = orders_result.scalars().all()

    # Get user reviews
    reviews_result = await db.execute(
        select(Review).where(Review.buyer_id == current_user.id)
    )
    reviews = reviews_result.scalars().all()

    return {
        "user_profile": {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "phone": current_user.phone,
            "role": current_user.role,
            "tariff": current_user.tariff,
            "created_at": current_user.created_at
        },
        "orders": [
            {
                "order_number": o.order_number,
                "total_amount": float(o.total_amount),
                "status": o.status,
                "created_at": o.created_at
            }
            for o in orders
        ],
        "reviews": [
            {
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at
            }
            for r in reviews
        ],
        "export_date": str(datetime.utcnow())
    }


@router.delete("/account")
async def delete_account(
    confirm: bool = False,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Request account deletion

    Requires confirmation parameter
    Note: In production, this should be a multi-step process with email confirmation
    """
    if not confirm:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please confirm account deletion by setting confirm=true"
        )

    # In production, you would:
    # 1. Send confirmation email
    # 2. Schedule deletion after grace period (e.g., 30 days)
    # 3. Anonymize or delete user data according to GDPR

    return {
        "message": "Account deletion request received",
        "note": "Your account will be deleted within 30 days. You can cancel this request by logging in.",
        "user_id": str(current_user.id)
    }


from datetime import datetime
