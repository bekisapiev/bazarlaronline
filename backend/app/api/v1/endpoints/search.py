"""
Search Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, or_, and_
from typing import Optional, List
from uuid import UUID

from app.database.session import get_db
from app.models.product import Product, Category
from app.models.user import User, SellerProfile
from app.core.config import settings
from app.api.v1.endpoints.products import get_category_ids_with_children

router = APIRouter()


@router.get("/suggestions")
async def get_search_suggestions(
    q: str = Query(..., min_length=2, description="Search query"),
    limit: int = Query(10, le=20),
    db: AsyncSession = Depends(get_db)
):
    """
    Get search suggestions (autocomplete)

    Returns suggestions for products and categories matching the query
    Minimum 2 characters required
    """
    search_term = f"%{q}%"

    # Search in products
    products_result = await db.execute(
        select(Product.title)
        .where(
            and_(
                Product.status == "active",
                Product.title.ilike(search_term)
            )
        )
        .distinct()
        .limit(limit)
    )
    product_suggestions = [title for (title,) in products_result.all()]

    # Search in categories
    categories_result = await db.execute(
        select(Category.name)
        .where(
            and_(
                Category.is_active == True,
                Category.name.ilike(search_term)
            )
        )
        .limit(5)
    )
    category_suggestions = [name for (name,) in categories_result.all()]

    # Search in seller shop names
    sellers_result = await db.execute(
        select(SellerProfile.shop_name)
        .where(SellerProfile.shop_name.ilike(search_term))
        .limit(5)
    )
    seller_suggestions = [name for (name,) in sellers_result.all()]

    return {
        "query": q,
        "suggestions": {
            "products": product_suggestions[:limit],
            "categories": category_suggestions,
            "sellers": seller_suggestions
        }
    }


@router.get("/")
async def search_all(
    q: str = Query(..., min_length=2, description="Search query"),
    type: Optional[str] = Query(None, description="Filter by type: products, sellers, categories"),
    city_id: Optional[int] = Query(None, description="Filter by city"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    sort_by: str = Query("relevance", description="Sort by: relevance, price_asc, price_desc, newest, popular"),
    limit: int = Query(30, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Universal search across products, sellers, and categories

    Returns results based on search query and filters
    Supports multiple sort options
    """
    search_term = f"%{q}%"
    results = {}

    # Search products if no type specified or type is 'products'
    if not type or type == "products":
        from app.models.user import SellerProfile

        # Build query
        if city_id:
            query = select(Product).join(
                SellerProfile,
                Product.seller_id == SellerProfile.user_id
            ).where(
                and_(
                    Product.status == "active",
                    or_(
                        Product.title.ilike(search_term),
                        Product.description.ilike(search_term)
                    )
                )
            )
        else:
            query = select(Product).where(
                and_(
                    Product.status == "active",
                    or_(
                        Product.title.ilike(search_term),
                        Product.description.ilike(search_term)
                    )
                )
            )

        # Apply filters
        if category_id:
            # Get all child categories to include products from subcategories
            category_ids = await get_category_ids_with_children(category_id, db)
            query = query.where(Product.category_id.in_(category_ids))

        if min_price is not None:
            query = query.where(Product.price >= min_price)

        if max_price is not None:
            query = query.where(Product.price <= max_price)

        if city_id:
            query = query.where(SellerProfile.city_id == city_id)

        # Apply sorting
        if sort_by == "price_asc":
            query = query.order_by(Product.price.asc())
        elif sort_by == "price_desc":
            query = query.order_by(Product.price.desc())
        elif sort_by == "newest":
            query = query.order_by(desc(Product.created_at))
        elif sort_by == "popular":
            query = query.order_by(desc(Product.views_count))
        else:  # relevance (default)
            # Order by promoted first, then by views
            query = query.order_by(
                desc(Product.is_promoted),
                desc(Product.views_count)
            )

        # Count total
        count_query = select(func.count()).select_from(Product)
        if city_id:
            count_query = count_query.join(
                SellerProfile,
                Product.seller_id == SellerProfile.user_id
            )

        count_query = count_query.where(
            and_(
                Product.status == "active",
                or_(
                    Product.title.ilike(search_term),
                    Product.description.ilike(search_term)
                )
            )
        )

        if category_id:
            # Use same category_ids list for count query
            count_query = count_query.where(Product.category_id.in_(category_ids))
        if min_price is not None:
            count_query = count_query.where(Product.price >= min_price)
        if max_price is not None:
            count_query = count_query.where(Product.price <= max_price)
        if city_id:
            count_query = count_query.where(SellerProfile.city_id == city_id)

        count_result = await db.execute(count_query)
        products_total = count_result.scalar()

        # Pagination
        query = query.limit(limit).offset(offset)

        products_result = await db.execute(query)
        products = products_result.scalars().all()

        results["products"] = {
            "items": [
                {
                    "id": str(p.id),
                    "seller_id": str(p.seller_id),
                    "title": p.title,
                    "description": p.description,
                    "price": float(p.price),
                    "discount_price": float(p.discount_price) if p.discount_price else None,
                    "discount_percent": p.discount_percent,
                    "images": p.images or [],
                    "is_promoted": p.is_promoted,
                    "views_count": p.views_count,
                    "created_at": p.created_at
                }
                for p in products
            ],
            "total": products_total or 0,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + limit) < (products_total or 0)
        }

    # Search sellers if no type specified or type is 'sellers'
    if not type or type == "sellers":
        query = select(SellerProfile).where(
            or_(
                SellerProfile.shop_name.ilike(search_term),
                SellerProfile.description.ilike(search_term)
            )
        )

        if city_id:
            query = query.where(SellerProfile.city_id == city_id)

        # Order by rating
        query = query.order_by(
            desc(SellerProfile.rating),
            desc(SellerProfile.reviews_count)
        )

        # Count total
        count_query = select(func.count()).select_from(SellerProfile).where(
            or_(
                SellerProfile.shop_name.ilike(search_term),
                SellerProfile.description.ilike(search_term)
            )
        )
        if city_id:
            count_query = count_query.where(SellerProfile.city_id == city_id)

        count_result = await db.execute(count_query)
        sellers_total = count_result.scalar()

        # Pagination
        query = query.limit(limit).offset(offset)

        sellers_result = await db.execute(query)
        sellers = sellers_result.scalars().all()

        results["sellers"] = {
            "items": [
                {
                    "id": str(s.id),
                    "user_id": str(s.user_id),
                    "shop_name": s.shop_name,
                    "description": s.description,
                    "logo_url": s.logo_url,
                    "city_id": s.city_id,
                    "seller_type": s.seller_type,
                    "rating": float(s.rating),
                    "reviews_count": s.reviews_count,
                    "is_verified": s.is_verified
                }
                for s in sellers
            ],
            "total": sellers_total or 0,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + limit) < (sellers_total or 0)
        }

    # Search categories if no type specified or type is 'categories'
    if not type or type == "categories":
        query = select(Category).where(
            and_(
                Category.is_active == True,
                Category.name.ilike(search_term)
            )
        ).order_by(Category.sort_order, Category.name)

        categories_result = await db.execute(query)
        categories = categories_result.scalars().all()

        results["categories"] = {
            "items": [
                {
                    "id": c.id,
                    "name": c.name,
                    "slug": c.slug,
                    "level": c.level,
                    "icon": c.icon
                }
                for c in categories
            ],
            "total": len(categories)
        }

    return {
        "query": q,
        "filters": {
            "type": type,
            "city_id": city_id,
            "category_id": category_id,
            "min_price": min_price,
            "max_price": max_price,
            "sort_by": sort_by
        },
        "results": results
    }


@router.get("/trending")
async def get_trending_searches(
    limit: int = Query(10, le=20),
    db: AsyncSession = Depends(get_db)
):
    """
    Get trending/popular searches

    Returns most viewed products titles as trending searches
    This is a simplified version - in production, you'd track actual search queries
    """
    result = await db.execute(
        select(Product.title, Product.views_count)
        .where(Product.status == "active")
        .order_by(desc(Product.views_count))
        .limit(limit)
    )
    products = result.all()

    return {
        "trending": [
            {
                "query": title,
                "views": views_count
            }
            for title, views_count in products
        ]
    }
