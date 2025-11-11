"""
User Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import Optional
from uuid import UUID

from app.database.session import get_db
from app.models.user import User, SellerProfile
from app.core.dependencies import get_current_active_user
from app.schemas.user import UserProfileUpdate, SellerProfileUpdate, UserWithProfileResponse, SellerProfileResponse

router = APIRouter()


@router.get("/me", response_model=UserWithProfileResponse)
async def get_current_user(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user profile with seller profile if exists
    """
    # Load seller profile if exists
    result = await db.execute(
        select(User)
        .options(selectinload(User.seller_profile))
        .where(User.id == current_user.id)
    )
    user = result.scalar_one()

    return UserWithProfileResponse(
        id=str(user.id),
        email=user.email,
        full_name=user.full_name,
        referral_id=user.referral_id,
        tariff=user.tariff,
        role=user.role,
        created_at=user.created_at,
        seller_profile=SellerProfileResponse(
            id=str(user.seller_profile.id),
            user_id=str(user.seller_profile.user_id),
            shop_name=user.seller_profile.shop_name,
            description=user.seller_profile.description,
            banner_url=user.seller_profile.banner_url,
            logo_url=user.seller_profile.logo_url,
            category_id=user.seller_profile.category_id,
            city_id=user.seller_profile.city_id,
            seller_type=user.seller_profile.seller_type,
            market_id=user.seller_profile.market_id,
            address=user.seller_profile.address,
            rating=user.seller_profile.rating,
            reviews_count=user.seller_profile.reviews_count,
            is_verified=user.seller_profile.is_verified,
            created_at=user.seller_profile.created_at
        ) if user.seller_profile else None
    )


@router.put("/me")
async def update_current_user(
    update_data: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user profile (basic info)
    """
    # Update user fields
    if update_data.full_name is not None:
        current_user.full_name = update_data.full_name
    if update_data.phone is not None:
        current_user.phone = update_data.phone

    await db.commit()
    await db.refresh(current_user)

    return {
        "message": "User profile updated successfully",
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "phone": current_user.phone
        }
    }


@router.get("/{user_id}")
async def get_user_by_id(
    user_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get user profile by ID
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

    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "tariff": user.tariff,
        "created_at": user.created_at
    }


@router.get("/{user_id}/seller-profile")
async def get_seller_profile(
    user_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get seller profile by user ID
    """
    result = await db.execute(
        select(SellerProfile).where(SellerProfile.user_id == user_id)
    )
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller profile not found"
        )

    return {
        "id": str(profile.id),
        "shop_name": profile.shop_name,
        "description": profile.description,
        "rating": float(profile.rating),
        "reviews_count": profile.reviews_count,
        "is_verified": profile.is_verified
    }
