"""
User Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from uuid import UUID

from app.database.session import get_db
from app.models.user import User, SellerProfile

router = APIRouter()


@router.get("/me")
async def get_current_user(
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user profile
    """
    # TODO: Implement authentication dependency
    return {
        "message": "Get current user - not implemented yet"
    }


@router.put("/me")
async def update_current_user(
    db: AsyncSession = Depends(get_db)
):
    """
    Update current user profile
    """
    # TODO: Implement user update
    return {
        "message": "Update user - not implemented yet"
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
