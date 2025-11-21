"""
Sellers Endpoints - Public catalog of sellers
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from typing import Optional
from uuid import UUID

from app.database.session import get_db
from app.models.user import User, SellerProfile
from app.models.product import Product
from app.models.location import City, Market

router = APIRouter()


@router.get("/")
async def get_sellers(
    city_id: Optional[int] = Query(None, description="Filter by city"),
    market_id: Optional[int] = Query(None, description="Filter by market"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    seller_type: Optional[str] = Query(None, description="Filter by seller type"),
    search: Optional[str] = Query(None, description="Search in shop names"),
    min_rating: Optional[float] = Query(None, ge=0, le=5, description="Minimum rating"),
    verified_only: bool = Query(False, description="Show only verified sellers"),
    sort_by: str = Query("rating", description="Sort by: rating, reviews, created_at"),
    page: int = Query(1, ge=1),
    page_size: int = Query(24, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of sellers with filters

    Public endpoint - returns paginated list of seller profiles
    """
    query = select(SellerProfile)

    # Apply filters
    if city_id:
        query = query.where(SellerProfile.city_id == city_id)

    if market_id:
        query = query.where(SellerProfile.market_id == market_id)

    if category_id:
        query = query.where(SellerProfile.category_id == category_id)

    if seller_type:
        query = query.where(SellerProfile.seller_type == seller_type)

    if search:
        query = query.where(SellerProfile.shop_name.ilike(f"%{search}%"))

    if min_rating:
        query = query.where(SellerProfile.rating >= min_rating)

    if verified_only:
        query = query.where(SellerProfile.is_verified == True)

    # Sorting
    if sort_by == "reviews":
        query = query.order_by(desc(SellerProfile.reviews_count), desc(SellerProfile.rating))
    elif sort_by == "created_at":
        query = query.order_by(desc(SellerProfile.created_at))
    else:  # default: rating
        query = query.order_by(desc(SellerProfile.rating), desc(SellerProfile.reviews_count))

    # Count total
    count_query = select(func.count()).select_from(SellerProfile)

    # Apply same filters to count query
    if city_id:
        count_query = count_query.where(SellerProfile.city_id == city_id)
    if market_id:
        count_query = count_query.where(SellerProfile.market_id == market_id)
    if category_id:
        count_query = count_query.where(SellerProfile.category_id == category_id)
    if seller_type:
        count_query = count_query.where(SellerProfile.seller_type == seller_type)
    if search:
        count_query = count_query.where(SellerProfile.shop_name.ilike(f"%{search}%"))
    if min_rating:
        count_query = count_query.where(SellerProfile.rating >= min_rating)
    if verified_only:
        count_query = count_query.where(SellerProfile.is_verified == True)

    count_result = await db.execute(count_query)
    total = count_result.scalar() or 0

    # Pagination
    offset = (page - 1) * page_size
    query = query.limit(page_size).offset(offset)

    result = await db.execute(query)
    sellers = result.scalars().all()

    # Prepare response with city and market names
    items = []
    for s in sellers:
        seller_data = {
            "id": str(s.user_id),  # Use user_id as seller ID
            "shop_name": s.shop_name,
            "description": s.description,
            "logo_url": s.logo_url,
            "banner_url": s.banner_url,
            "rating": float(s.rating),
            "reviews_count": s.reviews_count,
            "is_verified": s.is_verified,
            "seller_type": s.seller_type,
            "city": None,
            "market": None,
            "category": None
        }

        # Get city name
        if s.city_id:
            city_result = await db.execute(select(City).where(City.id == s.city_id))
            city = city_result.scalar_one_or_none()
            if city:
                seller_data["city"] = {"id": city.id, "name": city.name}

        # Get market name
        if s.market_id:
            market_result = await db.execute(select(Market).where(Market.id == s.market_id))
            market = market_result.scalar_one_or_none()
            if market:
                seller_data["market"] = {"id": market.id, "name": market.name}

        # Get category name
        if s.category_id:
            from app.models.product import Category
            category_result = await db.execute(select(Category).where(Category.id == s.category_id))
            category = category_result.scalar_one_or_none()
            if category:
                seller_data["category"] = {"id": category.id, "name": category.name}

        items.append(seller_data)

    total_pages = (total + page_size - 1) // page_size

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.get("/{seller_id}")
async def get_seller_details(
    seller_id: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Get seller details by ID

    Returns full seller profile with city, market, and product count
    """
    try:
        seller_uuid = UUID(seller_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid seller ID format"
        )

    # Get seller profile
    result = await db.execute(
        select(SellerProfile).where(SellerProfile.user_id == seller_uuid)
    )
    seller_profile = result.scalar_one_or_none()

    if not seller_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found"
        )

    # Get user info
    user_result = await db.execute(
        select(User).where(User.id == seller_uuid)
    )
    user = user_result.scalar_one_or_none()

    # Get city info
    city_data = None
    if seller_profile.city_id:
        city_result = await db.execute(select(City).where(City.id == seller_profile.city_id))
        city = city_result.scalar_one_or_none()
        if city:
            city_data = {"id": city.id, "name": city.name}

    # Get market info
    market_data = None
    if seller_profile.market_id:
        market_result = await db.execute(select(Market).where(Market.id == seller_profile.market_id))
        market = market_result.scalar_one_or_none()
        if market:
            market_data = {"id": market.id, "name": market.name}

    # Get category info
    category_data = None
    if seller_profile.category_id:
        from app.models.product import Category
        category_result = await db.execute(select(Category).where(Category.id == seller_profile.category_id))
        category = category_result.scalar_one_or_none()
        if category:
            category_data = {"id": category.id, "name": category.name}

    # Count products
    products_count_result = await db.execute(
        select(func.count())
        .select_from(Product)
        .where(Product.seller_id == seller_uuid, Product.status == "active")
    )
    products_count = products_count_result.scalar() or 0

    return {
        "id": str(seller_profile.user_id),
        "shop_name": seller_profile.shop_name,
        "description": seller_profile.description,
        "banner_url": seller_profile.banner_url,
        "logo_url": seller_profile.logo_url,
        "city": city_data,
        "market": market_data,
        "category": category_data,
        "seller_type": seller_profile.seller_type,
        "address": seller_profile.address,
        "latitude": float(seller_profile.latitude) if seller_profile.latitude else None,
        "longitude": float(seller_profile.longitude) if seller_profile.longitude else None,
        "rating": float(seller_profile.rating),
        "reviews_count": seller_profile.reviews_count,
        "is_verified": seller_profile.is_verified,
        "products_count": products_count,
        "created_at": seller_profile.created_at.isoformat() if seller_profile.created_at else None,
        "tariff": user.tariff if user else None
    }
