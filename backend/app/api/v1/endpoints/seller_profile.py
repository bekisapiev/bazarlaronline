"""
Seller Profile Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.user import User, SellerProfile
from app.core.dependencies import get_current_active_user
from app.schemas.user import SellerProfileUpdate, SellerProfileResponse

router = APIRouter()


@router.post("/", response_model=SellerProfileResponse)
async def create_seller_profile(
    profile_data: SellerProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create seller profile for current user

    Requirements:
    - User must not already have a seller profile
    - shop_name is required
    """
    # Check if user already has seller profile
    result = await db.execute(
        select(SellerProfile).where(SellerProfile.user_id == current_user.id)
    )
    existing_profile = result.scalar_one_or_none()

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a seller profile"
        )

    if not profile_data.shop_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="shop_name is required"
        )

    # Create new seller profile
    seller_profile = SellerProfile(
        user_id=current_user.id,
        shop_name=profile_data.shop_name,
        description=profile_data.description,
        banner_url=profile_data.banner_url,
        logo_url=profile_data.logo_url,
        category_id=profile_data.category_id,
        city_id=profile_data.city_id,
        seller_type=profile_data.seller_type,
        market_id=profile_data.market_id,
        address=profile_data.address,
        latitude=profile_data.latitude,
        longitude=profile_data.longitude
    )

    db.add(seller_profile)
    await db.commit()
    await db.refresh(seller_profile)

    return SellerProfileResponse(
        id=str(seller_profile.id),
        user_id=str(seller_profile.user_id),
        shop_name=seller_profile.shop_name,
        description=seller_profile.description,
        banner_url=seller_profile.banner_url,
        logo_url=seller_profile.logo_url,
        category_id=seller_profile.category_id,
        city_id=seller_profile.city_id,
        seller_type=seller_profile.seller_type,
        market_id=seller_profile.market_id,
        address=seller_profile.address,
        rating=seller_profile.rating,
        reviews_count=seller_profile.reviews_count,
        is_verified=seller_profile.is_verified,
        created_at=seller_profile.created_at
    )


@router.put("/", response_model=SellerProfileResponse)
async def update_seller_profile(
    profile_data: SellerProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update seller profile for current user
    """
    # Get existing seller profile
    result = await db.execute(
        select(SellerProfile).where(SellerProfile.user_id == current_user.id)
    )
    seller_profile = result.scalar_one_or_none()

    if not seller_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller profile not found. Create one first."
        )

    # Update fields
    if profile_data.shop_name is not None:
        seller_profile.shop_name = profile_data.shop_name
    if profile_data.description is not None:
        seller_profile.description = profile_data.description
    if profile_data.banner_url is not None:
        seller_profile.banner_url = profile_data.banner_url
    if profile_data.logo_url is not None:
        seller_profile.logo_url = profile_data.logo_url
    if profile_data.category_id is not None:
        seller_profile.category_id = profile_data.category_id
    if profile_data.city_id is not None:
        seller_profile.city_id = profile_data.city_id
    if profile_data.seller_type is not None:
        seller_profile.seller_type = profile_data.seller_type
    if profile_data.market_id is not None:
        seller_profile.market_id = profile_data.market_id
    if profile_data.address is not None:
        seller_profile.address = profile_data.address
    if profile_data.latitude is not None:
        seller_profile.latitude = profile_data.latitude
    if profile_data.longitude is not None:
        seller_profile.longitude = profile_data.longitude

    await db.commit()
    await db.refresh(seller_profile)

    return SellerProfileResponse(
        id=str(seller_profile.id),
        user_id=str(seller_profile.user_id),
        shop_name=seller_profile.shop_name,
        description=seller_profile.description,
        banner_url=seller_profile.banner_url,
        logo_url=seller_profile.logo_url,
        category_id=seller_profile.category_id,
        city_id=seller_profile.city_id,
        seller_type=seller_profile.seller_type,
        market_id=seller_profile.market_id,
        address=seller_profile.address,
        rating=seller_profile.rating,
        reviews_count=seller_profile.reviews_count,
        is_verified=seller_profile.is_verified,
        created_at=seller_profile.created_at
    )
