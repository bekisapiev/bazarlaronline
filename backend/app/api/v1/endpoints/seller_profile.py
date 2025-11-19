"""
Seller Profile Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from sqlalchemy.orm import selectinload
from typing import Optional
from uuid import UUID

from app.database.session import get_db
from app.models.user import User, SellerProfile
from app.models.product import Product
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


@router.get("/catalog")
async def get_sellers_catalog(
    city_id: Optional[int] = Query(None, description="Filter by city"),
    seller_type: Optional[str] = Query(None, description="Filter by seller type"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    market_id: Optional[int] = Query(None, description="Filter by market"),
    search: Optional[str] = Query(None, description="Search in shop names"),
    limit: int = Query(30, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Get catalog of all sellers

    Returns list of seller profiles with filters
    """
    query = select(SellerProfile).options(
        selectinload(SellerProfile.city),
        selectinload(SellerProfile.market),
        selectinload(SellerProfile.category)
    )

    # Apply filters
    if city_id:
        query = query.where(SellerProfile.city_id == city_id)

    if seller_type:
        query = query.where(SellerProfile.seller_type == seller_type)

    if category_id:
        query = query.where(SellerProfile.category_id == category_id)

    if market_id:
        query = query.where(SellerProfile.market_id == market_id)

    if search:
        query = query.where(SellerProfile.shop_name.ilike(f"%{search}%"))

    # Order by rating desc, then by reviews count
    query = query.order_by(
        desc(SellerProfile.rating),
        desc(SellerProfile.reviews_count),
        desc(SellerProfile.created_at)
    )

    # Count total before pagination
    count_query = select(func.count()).select_from(SellerProfile)
    if city_id:
        count_query = count_query.where(SellerProfile.city_id == city_id)
    if seller_type:
        count_query = count_query.where(SellerProfile.seller_type == seller_type)
    if category_id:
        count_query = count_query.where(SellerProfile.category_id == category_id)
    if market_id:
        count_query = count_query.where(SellerProfile.market_id == market_id)
    if search:
        count_query = count_query.where(SellerProfile.shop_name.ilike(f"%{search}%"))

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # Pagination
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    sellers = result.scalars().all()

    return {
        "items": [
            {
                "id": str(s.id),
                "user_id": str(s.user_id),
                "shop_name": s.shop_name,
                "description": s.description,
                "logo_url": s.logo_url,
                "banner_url": s.banner_url,
                "seller_type": s.seller_type,
                "rating": float(s.rating),
                "reviews_count": s.reviews_count,
                "is_verified": s.is_verified,
                "city": {"id": s.city.id, "name": s.city.name} if s.city else None,
                "market": {"id": s.market.id, "name": s.market.name} if s.market else None,
                "category": {"id": s.category.id, "name": s.category.name} if s.category else None
            }
            for s in sellers
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.get("/{seller_id}")
async def get_seller_profile_details(
    seller_id: UUID,
    include_products: bool = Query(False, description="Include seller products"),
    products_limit: int = Query(10, le=50),
    db: AsyncSession = Depends(get_db)
):
    """
    Get seller profile details by seller ID (user_id)

    Optionally includes:
    - Recent products (if include_products=true)
    - City and market information
    - Rating statistics
    """
    # Get seller profile
    result = await db.execute(
        select(SellerProfile).where(SellerProfile.user_id == seller_id)
    )
    seller_profile = result.scalar_one_or_none()

    if not seller_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller profile not found"
        )

    # Get user info
    user_result = await db.execute(
        select(User).where(User.id == seller_id)
    )
    user = user_result.scalar_one_or_none()

    # Get city info if available
    city_name = None
    if seller_profile.city_id:
        from app.models.location import City
        city_result = await db.execute(
            select(City).where(City.id == seller_profile.city_id)
        )
        city = city_result.scalar_one_or_none()
        if city:
            city_name = city.name

    # Get market info if available
    market_name = None
    if seller_profile.market_id:
        from app.models.location import Market
        market_result = await db.execute(
            select(Market).where(Market.id == seller_profile.market_id)
        )
        market = market_result.scalar_one_or_none()
        if market:
            market_name = market.name

    # Count products
    products_count_result = await db.execute(
        select(func.count())
        .select_from(Product)
        .where(Product.seller_id == seller_id, Product.status == "active")
    )
    products_count = products_count_result.scalar()

    response = {
        "id": str(seller_profile.id),
        "user_id": str(seller_profile.user_id),
        "shop_name": seller_profile.shop_name,
        "description": seller_profile.description,
        "banner_url": seller_profile.banner_url,
        "logo_url": seller_profile.logo_url,
        "city_id": seller_profile.city_id,
        "city_name": city_name,
        "seller_type": seller_profile.seller_type,
        "market_id": seller_profile.market_id,
        "market_name": market_name,
        "address": seller_profile.address,
        "latitude": float(seller_profile.latitude) if seller_profile.latitude else None,
        "longitude": float(seller_profile.longitude) if seller_profile.longitude else None,
        "rating": float(seller_profile.rating),
        "reviews_count": seller_profile.reviews_count,
        "is_verified": seller_profile.is_verified,
        "products_count": products_count or 0,
        "created_at": seller_profile.created_at,
        "user_tariff": user.tariff if user else None
    }

    # Include products if requested
    if include_products:
        products_result = await db.execute(
            select(Product)
            .where(Product.seller_id == seller_id, Product.status == "active")
            .order_by(desc(Product.is_promoted), desc(Product.created_at))
            .limit(products_limit)
        )
        products = products_result.scalars().all()

        response["products"] = [
            {
                "id": str(p.id),
                "title": p.title,
                "price": float(p.price),
                "discount_price": float(p.discount_price) if p.discount_price else None,
                "images": p.images or [],
                "is_promoted": p.is_promoted,
                "views_count": p.views_count
            }
            for p in products
        ]

    return response


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



@router.get("/{seller_id}")
async def get_seller_profile_details(
    seller_id: UUID,
    include_products: bool = Query(False, description="Include seller products"),
    products_limit: int = Query(10, le=50),
    db: AsyncSession = Depends(get_db)
):
    """
    Get seller profile details by seller ID (user_id)

    Optionally includes:
    - Recent products (if include_products=true)
    - City and market information
    - Rating statistics
    """
    # Get seller profile
    result = await db.execute(
        select(SellerProfile).where(SellerProfile.user_id == seller_id)
    )
    seller_profile = result.scalar_one_or_none()

    if not seller_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller profile not found"
        )

    # Get user info
    user_result = await db.execute(
        select(User).where(User.id == seller_id)
    )
    user = user_result.scalar_one_or_none()

    # Get city info if available
    city_name = None
    if seller_profile.city_id:
        from app.models.location import City
        city_result = await db.execute(
            select(City).where(City.id == seller_profile.city_id)
        )
        city = city_result.scalar_one_or_none()
        if city:
            city_name = city.name

    # Get market info if available
    market_name = None
    if seller_profile.market_id:
        from app.models.location import Market
        market_result = await db.execute(
            select(Market).where(Market.id == seller_profile.market_id)
        )
        market = market_result.scalar_one_or_none()
        if market:
            market_name = market.name

    # Count products
    products_count_result = await db.execute(
        select(func.count())
        .select_from(Product)
        .where(Product.seller_id == seller_id, Product.status == "active")
    )
    products_count = products_count_result.scalar()

    response = {
        "id": str(seller_profile.id),
        "user_id": str(seller_profile.user_id),
        "shop_name": seller_profile.shop_name,
        "description": seller_profile.description,
        "banner_url": seller_profile.banner_url,
        "logo_url": seller_profile.logo_url,
        "city_id": seller_profile.city_id,
        "city_name": city_name,
        "seller_type": seller_profile.seller_type,
        "market_id": seller_profile.market_id,
        "market_name": market_name,
        "address": seller_profile.address,
        "latitude": float(seller_profile.latitude) if seller_profile.latitude else None,
        "longitude": float(seller_profile.longitude) if seller_profile.longitude else None,
        "rating": float(seller_profile.rating),
        "reviews_count": seller_profile.reviews_count,
        "is_verified": seller_profile.is_verified,
        "products_count": products_count or 0,
        "created_at": seller_profile.created_at,
        "user_tariff": user.tariff if user else None
    }

    # Include products if requested
    if include_products:
        products_result = await db.execute(
            select(Product)
            .where(Product.seller_id == seller_id, Product.status == "active")
            .order_by(desc(Product.is_promoted), desc(Product.created_at))
            .limit(products_limit)
        )
        products = products_result.scalars().all()

        response["products"] = [
            {
                "id": str(p.id),
                "title": p.title,
                "price": float(p.price),
                "discount_price": float(p.discount_price) if p.discount_price else None,
                "images": p.images or [],
                "is_promoted": p.is_promoted,
                "views_count": p.views_count
            }
            for p in products
        ]

    return response
