"""
Product Recommendations Endpoints
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, and_, or_
from typing import Optional
from uuid import UUID

from app.database.session import get_db
from app.models.product import Product
from app.models.favorite import ViewHistory
from app.models.user import User
from app.core.dependencies import get_current_active_user
from app.api.v1.endpoints.products import get_category_ids_with_children

router = APIRouter()


@router.get("/for-you")
async def get_personalized_recommendations(
    limit: int = Query(20, le=50),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get personalized product recommendations for current user

    Based on:
    - User's view history (categories they viewed)
    - Popular products in those categories
    - Fallback to trending products if no history
    """
    # Get user's viewed categories from history
    viewed_categories_result = await db.execute(
        select(Product.category_id, func.count(ViewHistory.id).label('view_count'))
        .select_from(ViewHistory)
        .join(Product, ViewHistory.product_id == Product.id)
        .where(
            ViewHistory.user_id == current_user.id,
            Product.category_id.isnot(None)
        )
        .group_by(Product.category_id)
        .order_by(desc('view_count'))
        .limit(3)
    )
    viewed_categories = [cat_id for cat_id, _ in viewed_categories_result.all()]

    # Get products from viewed categories that user hasn't viewed yet
    if viewed_categories:
        # Get IDs of products user already viewed
        viewed_products_result = await db.execute(
            select(ViewHistory.product_id)
            .where(ViewHistory.user_id == current_user.id)
        )
        viewed_product_ids = [p_id for (p_id,) in viewed_products_result.all()]

        # Get recommendations from categories user viewed
        query = select(Product).where(
            and_(
                Product.status == "active",
                Product.category_id.in_(viewed_categories),
                ~Product.id.in_(viewed_product_ids) if viewed_product_ids else True
            )
        ).order_by(
            desc(func.coalesce(Product.promotion_views_remaining, 0)),
            desc(Product.views_count),
            desc(Product.created_at)
        ).limit(limit)

        result = await db.execute(query)
        products = result.scalars().all()

        # If not enough products, add trending products
        if len(products) < limit:
            remaining = limit - len(products)
            trending_query = select(Product).where(
                and_(
                    Product.status == "active",
                    ~Product.id.in_([p.id for p in products]),
                    ~Product.id.in_(viewed_product_ids) if viewed_product_ids else True
                )
            ).order_by(
                desc(Product.views_count),
                desc(func.coalesce(Product.promotion_views_remaining, 0))
            ).limit(remaining)

            trending_result = await db.execute(trending_query)
            trending_products = trending_result.scalars().all()
            products.extend(trending_products)

    else:
        # No history - show trending products
        query = select(Product).where(
            Product.status == "active"
        ).order_by(
            desc(Product.views_count),
            desc(func.coalesce(Product.promotion_views_remaining, 0))
        ).limit(limit)

        result = await db.execute(query)
        products = result.scalars().all()

    return {
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
                "category_id": p.category_id,
                "is_promoted": p.is_promoted,
                "views_count": p.views_count
            }
            for p in products
        ],
        "total": len(products),
        "based_on": "view_history" if viewed_categories else "trending"
    }


@router.get("/similar/{product_id}")
async def get_similar_products(
    product_id: UUID,
    limit: int = Query(10, le=30),
    db: AsyncSession = Depends(get_db)
):
    """
    Get similar products to a specific product

    Based on:
    - Same category
    - Similar price range
    - Same seller (if available)
    """
    # Get the reference product
    product_result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = product_result.scalar_one_or_none()

    if not product:
        return {"items": [], "total": 0}

    # Calculate price range (±30%)
    price = float(product.price)
    min_price = price * 0.7
    max_price = price * 1.3

    # Get similar products
    query = select(Product).where(
        and_(
            Product.status == "active",
            Product.id != product_id,
            or_(
                # Same category
                Product.category_id == product.category_id,
                # Same seller
                Product.seller_id == product.seller_id
            ),
            # Similar price range
            Product.price.between(min_price, max_price)
        )
    ).order_by(
        desc(func.coalesce(Product.promotion_views_remaining, 0)),
        desc(Product.views_count)
    ).limit(limit)

    result = await db.execute(query)
    similar_products = result.scalars().all()

    return {
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
                "category_id": p.category_id,
                "is_promoted": p.is_promoted,
                "views_count": p.views_count,
                "similarity_reason": "same_category" if p.category_id == product.category_id else "same_seller"
            }
            for p in similar_products
        ],
        "total": len(similar_products),
        "reference_product_id": str(product_id)
    }


@router.get("/trending")
async def get_trending_products(
    limit: int = Query(20, le=50),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    city_id: Optional[int] = Query(None, description="Filter by seller city"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get trending products

    Based on views count and promotion status
    Can be filtered by category or city
    """
    from app.models.user import SellerProfile

    # Build query
    if city_id:
        query = select(Product).join(
            SellerProfile,
            Product.seller_id == SellerProfile.user_id
        ).where(Product.status == "active")
    else:
        query = select(Product).where(Product.status == "active")

    # Apply filters
    if category_id:
        # Get all child categories to include products from subcategories
        category_ids = await get_category_ids_with_children(category_id, db)
        query = query.where(Product.category_id.in_(category_ids))

    if city_id:
        query = query.where(SellerProfile.city_id == city_id)

    # Order by trending score (promoted + views)
    query = query.order_by(
        desc(func.coalesce(Product.promotion_views_remaining, 0)),
        desc(Product.views_count),
        desc(Product.created_at)
    ).limit(limit)

    result = await db.execute(query)
    products = result.scalars().all()

    return {
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
                "category_id": p.category_id,
                "is_promoted": p.is_promoted,
                "views_count": p.views_count,
                "created_at": p.created_at
            }
            for p in products
        ],
        "total": len(products),
        "filters": {
            "category_id": category_id,
            "city_id": city_id
        }
    }


@router.get("/new-arrivals")
async def get_new_arrivals(
    limit: int = Query(20, le=50),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get newest products

    Recently added products that passed moderation
    """
    query = select(Product).where(Product.status == "active")

    if category_id:
        # Get all child categories to include products from subcategories
        category_ids = await get_category_ids_with_children(category_id, db)
        query = query.where(Product.category_id.in_(category_ids))

    query = query.order_by(desc(Product.created_at)).limit(limit)

    result = await db.execute(query)
    products = result.scalars().all()

    return {
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
                "category_id": p.category_id,
                "is_promoted": p.is_promoted,
                "views_count": p.views_count,
                "created_at": p.created_at
            }
            for p in products
        ],
        "total": len(products)
    }


@router.get("/deals")
async def get_deals(
    limit: int = Query(20, le=50),
    min_discount: int = Query(10, description="Minimum discount percentage"),
    category_id: Optional[int] = Query(None, description="Filter by category"),
    db: AsyncSession = Depends(get_db)
):
    """
    Get products with discounts

    Returns products with discount_price set and minimum discount percentage
    """
    query = select(Product).where(
        and_(
            Product.status == "active",
            Product.discount_price.isnot(None)
        )
    )

    if category_id:
        # Get all child categories to include products from subcategories
        category_ids = await get_category_ids_with_children(category_id, db)
        query = query.where(Product.category_id.in_(category_ids))

    query = query.order_by(
        desc(func.coalesce(Product.promotion_views_remaining, 0)),
        desc(Product.created_at)
    ).limit(limit * 2)  # Get more to filter by discount percentage

    result = await db.execute(query)
    products = result.scalars().all()

    # Filter by minimum discount percentage
    filtered_products = [
        p for p in products
        if p.discount_percent and p.discount_percent >= min_discount
    ][:limit]

    return {
        "items": [
            {
                "id": str(p.id),
                "seller_id": str(p.seller_id),
                "title": p.title,
                "description": p.description,
                "price": float(p.price),
                "discount_price": float(p.discount_price),
                "discount_percent": p.discount_percent,
                "images": p.images or [],
                "category_id": p.category_id,
                "is_promoted": p.is_promoted,
                "views_count": p.views_count
            }
            for p in filtered_products
        ],
        "total": len(filtered_products),
        "min_discount": min_discount
    }
