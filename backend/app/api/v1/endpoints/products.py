"""
Product Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional, List
from uuid import UUID

from app.database.session import get_db
from app.models.product import Product, Category
from app.core.config import settings

router = APIRouter()


@router.get("/")
async def get_products(
    type: Optional[str] = Query(None, description="goods or services"),
    category_id: Optional[int] = None,
    city_id: Optional[int] = None,
    seller_type: Optional[str] = None,
    search: Optional[str] = None,
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, le=settings.MAX_PAGE_SIZE),
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of products with filters
    """
    query = select(Product).where(Product.status == "active")

    # Apply filters
    if category_id:
        query = query.where(Product.category_id == category_id)

    if search:
        query = query.where(Product.title.ilike(f"%{search}%"))

    # Order by promoted first, then by created_at
    query = query.order_by(
        desc(Product.is_promoted),
        desc(Product.promoted_at),
        desc(Product.created_at)
    )

    # Pagination
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    products = result.scalars().all()

    # Count total
    count_query = select(Product).where(Product.status == "active")
    if category_id:
        count_query = count_query.where(Product.category_id == category_id)
    total_result = await db.execute(count_query)
    total = len(total_result.scalars().all())

    return {
        "items": [
            {
                "id": str(p.id),
                "title": p.title,
                "price": float(p.price),
                "discount_price": float(p.discount_price) if p.discount_price else None,
                "discount_percent": p.discount_percent,
                "images": p.images or [],
                "is_promoted": p.is_promoted
            }
            for p in products
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.get("/{product_id}")
async def get_product_by_id(
    product_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get product details by ID
    """
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Increment views
    product.views_count += 1
    await db.commit()

    return {
        "id": str(product.id),
        "title": product.title,
        "description": product.description,
        "price": float(product.price),
        "discount_price": float(product.discount_price) if product.discount_price else None,
        "discount_percent": product.discount_percent,
        "images": product.images or [],
        "characteristics": product.characteristics or [],
        "delivery_type": product.delivery_type,
        "delivery_methods": product.delivery_methods,
        "views_count": product.views_count,
        "created_at": product.created_at
    }


@router.post("/")
async def create_product(
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new product
    """
    # TODO: Implement product creation
    return {
        "message": "Create product - not implemented yet"
    }


@router.put("/{product_id}")
async def update_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Update product
    """
    # TODO: Implement product update
    return {
        "message": "Update product - not implemented yet"
    }


@router.delete("/{product_id}")
async def delete_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Delete product
    """
    # TODO: Implement product deletion
    return {
        "message": "Delete product - not implemented yet"
    }


@router.post("/{product_id}/promote")
async def promote_product(
    product_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Promote (boost) product to top of listings
    """
    # TODO: Implement product promotion
    return {
        "message": "Promote product - not implemented yet"
    }


@router.get("/categories/")
async def get_categories(
    parent_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get product categories
    """
    query = select(Category).where(Category.is_active == True)

    if parent_id is not None:
        query = query.where(Category.parent_id == parent_id)
    else:
        query = query.where(Category.parent_id == None)

    query = query.order_by(Category.sort_order, Category.name)

    result = await db.execute(query)
    categories = result.scalars().all()

    return {
        "items": [
            {
                "id": c.id,
                "name": c.name,
                "slug": c.slug,
                "level": c.level,
                "icon": c.icon
            }
            for c in categories
        ]
    }
