"""
Favorites and View History Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, and_
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.database.session import get_db
from app.models.favorite import Favorite, ViewHistory
from app.models.product import Product
from app.models.user import User
from app.core.dependencies import get_current_active_user

router = APIRouter()


@router.post("/favorites/{product_id}")
async def add_to_favorites(
    product_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Add product to favorites

    Returns error if product is already in favorites
    """
    # Check if product exists
    product_result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = product_result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check if already in favorites
    existing_result = await db.execute(
        select(Favorite).where(
            and_(
                Favorite.user_id == current_user.id,
                Favorite.product_id == product_id
            )
        )
    )
    existing = existing_result.scalar_one_or_none()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product is already in favorites"
        )

    # Add to favorites
    favorite = Favorite(
        user_id=current_user.id,
        product_id=product_id
    )
    db.add(favorite)
    await db.commit()

    return {
        "message": "Product added to favorites",
        "product_id": str(product_id)
    }


@router.delete("/favorites/{product_id}")
async def remove_from_favorites(
    product_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Remove product from favorites
    """
    result = await db.execute(
        select(Favorite).where(
            and_(
                Favorite.user_id == current_user.id,
                Favorite.product_id == product_id
            )
        )
    )
    favorite = result.scalar_one_or_none()

    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not in favorites"
        )

    await db.delete(favorite)
    await db.commit()

    return {
        "message": "Product removed from favorites",
        "product_id": str(product_id)
    }


@router.get("/favorites")
async def get_favorites(
    limit: int = Query(30, le=100),
    offset: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's favorite products

    Returns paginated list with product details
    """
    from app.models.user import SellerProfile

    # Get favorites with product and seller profile join
    query = (
        select(Favorite, Product, SellerProfile)
        .join(Product, Favorite.product_id == Product.id)
        .join(SellerProfile, Product.seller_id == SellerProfile.user_id)
        .where(Favorite.user_id == current_user.id)
        .order_by(desc(Favorite.created_at))
    )

    # Count total
    count_result = await db.execute(
        select(func.count())
        .select_from(Favorite)
        .where(Favorite.user_id == current_user.id)
    )
    total = count_result.scalar()

    # Pagination
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    rows = result.all()

    # Return list of products directly (not wrapped in "items")
    favorites_list = [
        {
            "id": str(product.id),
            "title": product.title,
            "description": product.description,
            "price": float(product.price),
            "discount_price": float(product.discount_price) if product.discount_price else None,
            "discount_percent": product.discount_percent,
            "images": product.images or [],
            "status": product.status,
            "is_promoted": product.is_promoted,
            "views_count": product.views_count,
            "seller_name": seller_profile.shop_name,
            "created_at": favorite.created_at.isoformat()
        }
        for favorite, product, seller_profile in rows
    ]

    return favorites_list


@router.get("/favorites/check/{product_id}")
async def check_is_favorite(
    product_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Check if product is in user's favorites

    Useful for UI to show favorite state
    """
    result = await db.execute(
        select(Favorite).where(
            and_(
                Favorite.user_id == current_user.id,
                Favorite.product_id == product_id
            )
        )
    )
    favorite = result.scalar_one_or_none()

    return {
        "product_id": str(product_id),
        "is_favorite": favorite is not None
    }


@router.post("/view-history/{product_id}")
async def record_product_view(
    product_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Record product view for current user

    This should be called when user views product details
    Also increments product views_count
    """
    # Check if product exists
    product_result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = product_result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Record view history
    view_history = ViewHistory(
        user_id=current_user.id,
        product_id=product_id,
        viewed_at=datetime.utcnow()
    )
    db.add(view_history)

    # Increment product views count
    product.views_count += 1

    await db.commit()

    return {
        "message": "Product view recorded",
        "product_id": str(product_id),
        "total_views": product.views_count
    }


@router.get("/view-history")
async def get_view_history(
    limit: int = Query(30, le=100),
    offset: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user's product view history

    Returns paginated list with unique products (latest view first)
    """
    # Get distinct products from view history
    # We'll use a subquery to get the latest view for each product
    from sqlalchemy import distinct

    # First, get all product IDs viewed by user, ordered by latest view
    subquery = (
        select(
            ViewHistory.product_id,
            func.max(ViewHistory.viewed_at).label('last_viewed')
        )
        .where(ViewHistory.user_id == current_user.id)
        .group_by(ViewHistory.product_id)
        .order_by(desc('last_viewed'))
        .limit(limit)
        .offset(offset)
        .subquery()
    )

    # Join with products to get product details
    query = (
        select(Product, subquery.c.last_viewed)
        .join(subquery, Product.id == subquery.c.product_id)
        .order_by(desc(subquery.c.last_viewed))
    )

    result = await db.execute(query)
    rows = result.all()

    # Count total unique products viewed
    count_result = await db.execute(
        select(func.count(distinct(ViewHistory.product_id)))
        .select_from(ViewHistory)
        .where(ViewHistory.user_id == current_user.id)
    )
    total = count_result.scalar()

    return {
        "items": [
            {
                "product_id": str(product.id),
                "title": product.title,
                "description": product.description,
                "price": float(product.price),
                "discount_price": float(product.discount_price) if product.discount_price else None,
                "discount_percent": product.discount_percent,
                "images": product.images or [],
                "status": product.status,
                "is_promoted": product.is_promoted,
                "views_count": product.views_count,
                "last_viewed_at": last_viewed
            }
            for product, last_viewed in rows
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.delete("/view-history")
async def clear_view_history(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Clear all view history for current user
    """
    result = await db.execute(
        select(ViewHistory).where(ViewHistory.user_id == current_user.id)
    )
    views = result.scalars().all()

    count = len(views)
    for view in views:
        await db.delete(view)

    await db.commit()

    return {
        "message": f"Cleared {count} view history entries",
        "count": count
    }
