"""
Analytics Endpoints for Sellers
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from typing import Optional
from datetime import datetime, timedelta
from decimal import Decimal

from app.database.session import get_db
from app.models.user import User, SellerProfile
from app.models.product import Product
from app.models.order import Order
from app.models.review import Review
from app.core.dependencies import get_current_active_user

router = APIRouter()


async def verify_seller_access(current_user: User):
    """Verify user has seller access"""
    if current_user.role not in ["seller", "admin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Seller access required"
        )
    return current_user


@router.get("/dashboard")
async def get_seller_dashboard(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get seller dashboard statistics

    Returns:
    - Total sales count and revenue
    - Total products (active, moderation, rejected)
    - Total views
    - Average rating and reviews count
    - Recent orders
    """
    await verify_seller_access(current_user)

    # Get seller profile
    seller_profile_result = await db.execute(
        select(SellerProfile).where(SellerProfile.user_id == current_user.id)
    )
    seller_profile = seller_profile_result.scalar_one_or_none()

    if not seller_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller profile not found"
        )

    # Count products by status
    products_active_result = await db.execute(
        select(func.count())
        .select_from(Product)
        .where(Product.seller_id == current_user.id, Product.status == "active")
    )
    products_active = products_active_result.scalar() or 0

    products_moderation_result = await db.execute(
        select(func.count())
        .select_from(Product)
        .where(Product.seller_id == current_user.id, Product.status == "moderation")
    )
    products_moderation = products_moderation_result.scalar() or 0

    products_rejected_result = await db.execute(
        select(func.count())
        .select_from(Product)
        .where(Product.seller_id == current_user.id, Product.status == "rejected")
    )
    products_rejected = products_rejected_result.scalar() or 0

    # Count total views
    views_result = await db.execute(
        select(func.sum(Product.views_count))
        .select_from(Product)
        .where(Product.seller_id == current_user.id)
    )
    total_views = views_result.scalar() or 0

    # Count orders and calculate revenue
    orders_result = await db.execute(
        select(
            func.count(Order.id),
            func.sum(Order.total_amount)
        )
        .select_from(Order)
        .where(
            Order.seller_id == current_user.id,
            Order.status.in_(["completed", "shipped", "pending"])
        )
    )
    orders_count, total_revenue = orders_result.one()

    # Count completed orders
    completed_orders_result = await db.execute(
        select(func.count())
        .select_from(Order)
        .where(
            Order.seller_id == current_user.id,
            Order.status == "completed"
        )
    )
    completed_orders = completed_orders_result.scalar() or 0

    # Get recent orders (last 10)
    recent_orders_result = await db.execute(
        select(Order)
        .where(Order.seller_id == current_user.id)
        .order_by(desc(Order.created_at))
        .limit(10)
    )
    recent_orders = recent_orders_result.scalars().all()

    return {
        "products": {
            "active": products_active,
            "moderation": products_moderation,
            "rejected": products_rejected,
            "total": products_active + products_moderation + products_rejected
        },
        "orders": {
            "total": orders_count or 0,
            "completed": completed_orders,
            "revenue": float(total_revenue) if total_revenue else 0.0
        },
        "views": {
            "total": int(total_views)
        },
        "rating": {
            "average": float(seller_profile.rating),
            "reviews_count": seller_profile.reviews_count
        },
        "recent_orders": [
            {
                "id": str(o.id),
                "order_number": o.order_number,
                "buyer_id": str(o.buyer_id),
                "total_amount": float(o.total_amount),
                "status": o.status,
                "created_at": o.created_at
            }
            for o in recent_orders
        ]
    }


@router.get("/products/performance")
async def get_products_performance(
    limit: int = Query(10, le=50, description="Number of products to return"),
    sort_by: str = Query("views", description="Sort by: views, orders, revenue"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get top performing products

    Sort options:
    - views: Most viewed products
    - orders: Most ordered products
    - revenue: Highest revenue products
    """
    await verify_seller_access(current_user)

    if sort_by == "views":
        # Get products sorted by views
        result = await db.execute(
            select(Product)
            .where(Product.seller_id == current_user.id, Product.status == "active")
            .order_by(desc(Product.views_count))
            .limit(limit)
        )
        products = result.scalars().all()

        return {
            "items": [
                {
                    "id": str(p.id),
                    "title": p.title,
                    "price": float(p.price),
                    "views_count": p.views_count,
                    "status": p.status,
                    "is_promoted": p.is_promoted
                }
                for p in products
            ],
            "sort_by": sort_by
        }

    elif sort_by in ["orders", "revenue"]:
        # Get products with order statistics
        query = (
            select(
                Product.id,
                Product.title,
                Product.price,
                Product.views_count,
                Product.status,
                Product.promotion_views_remaining,
                func.count(Order.id).label("orders_count"),
                func.sum(Order.total_amount).label("total_revenue")
            )
            .select_from(Product)
            .outerjoin(Order, Product.id == Order.product_id)
            .where(Product.seller_id == current_user.id, Product.status == "active")
            .group_by(Product.id)
        )

        if sort_by == "orders":
            query = query.order_by(desc("orders_count"))
        else:  # revenue
            query = query.order_by(desc("total_revenue"))

        query = query.limit(limit)

        result = await db.execute(query)
        rows = result.all()

        return {
            "items": [
                {
                    "id": str(row.id),
                    "title": row.title,
                    "price": float(row.price),
                    "views_count": row.views_count,
                    "orders_count": row.orders_count or 0,
                    "total_revenue": float(row.total_revenue) if row.total_revenue else 0.0,
                    "status": row.status,
                    "is_promoted": (row.promotion_views_remaining or 0) > 0
                }
                for row in rows
            ],
            "sort_by": sort_by
        }

    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid sort_by parameter. Use: views, orders, or revenue"
        )


@router.get("/sales/period")
async def get_sales_by_period(
    period: str = Query("week", description="Period: day, week, month, year"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get sales statistics for a specific period

    Returns orders count and revenue for the selected period
    """
    await verify_seller_access(current_user)

    # Calculate date range
    now = datetime.utcnow()
    if period == "day":
        start_date = now - timedelta(days=1)
    elif period == "week":
        start_date = now - timedelta(weeks=1)
    elif period == "month":
        start_date = now - timedelta(days=30)
    elif period == "year":
        start_date = now - timedelta(days=365)
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid period. Use: day, week, month, or year"
        )

    # Get orders for period
    result = await db.execute(
        select(
            func.count(Order.id),
            func.sum(Order.total_amount)
        )
        .select_from(Order)
        .where(
            Order.seller_id == current_user.id,
            Order.created_at >= start_date,
            Order.status.in_(["completed", "shipped", "pending"])
        )
    )
    orders_count, total_revenue = result.one()

    # Get completed orders for period
    completed_result = await db.execute(
        select(func.count())
        .select_from(Order)
        .where(
            Order.seller_id == current_user.id,
            Order.created_at >= start_date,
            Order.status == "completed"
        )
    )
    completed_orders = completed_result.scalar() or 0

    return {
        "period": period,
        "start_date": start_date,
        "end_date": now,
        "orders": {
            "total": orders_count or 0,
            "completed": completed_orders
        },
        "revenue": float(total_revenue) if total_revenue else 0.0
    }


@router.get("/reviews/stats")
async def get_reviews_statistics(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed review statistics for seller

    Returns rating distribution and recent reviews
    """
    await verify_seller_access(current_user)

    # Get rating distribution
    distribution_result = await db.execute(
        select(Review.rating, func.count(Review.id))
        .select_from(Review)
        .where(Review.seller_id == current_user.id)
        .group_by(Review.rating)
    )
    distribution_rows = distribution_result.all()

    # Create distribution dict (0-10)
    rating_distribution = {str(i): 0 for i in range(11)}
    for rating, count in distribution_rows:
        rating_distribution[str(rating)] = count

    # Get average rating
    avg_result = await db.execute(
        select(func.avg(Review.rating))
        .select_from(Review)
        .where(Review.seller_id == current_user.id)
    )
    avg_rating = avg_result.scalar()

    # Get recent reviews (last 10)
    recent_reviews_result = await db.execute(
        select(Review)
        .where(Review.seller_id == current_user.id)
        .order_by(desc(Review.created_at))
        .limit(10)
    )
    recent_reviews = recent_reviews_result.scalars().all()

    # Get buyer info for each review
    reviews_with_buyer = []
    for review in recent_reviews:
        buyer_result = await db.execute(
            select(User).where(User.id == review.buyer_id)
        )
        buyer = buyer_result.scalar_one_or_none()

        reviews_with_buyer.append({
            "id": str(review.id),
            "rating": review.rating,
            "comment": review.comment,
            "buyer_name": buyer.full_name if buyer else None,
            "created_at": review.created_at
        })

    return {
        "average_rating": float(avg_rating) if avg_rating else 0.0,
        "total_reviews": sum(rating_distribution.values()),
        "rating_distribution": rating_distribution,
        "recent_reviews": reviews_with_buyer
    }


@router.get("/traffic/sources")
async def get_traffic_sources(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get traffic sources statistics

    Note: This is a placeholder. In production, you would track
    actual traffic sources using analytics tools.
    """
    await verify_seller_access(current_user)

    # Get total views
    views_result = await db.execute(
        select(func.sum(Product.views_count))
        .select_from(Product)
        .where(Product.seller_id == current_user.id)
    )
    total_views = views_result.scalar() or 0

    # This is placeholder data
    # In production, implement proper tracking
    return {
        "total_views": int(total_views),
        "sources": {
            "direct": int(total_views * 0.4),
            "search": int(total_views * 0.3),
            "catalog": int(total_views * 0.2),
            "promotions": int(total_views * 0.1)
        },
        "note": "Traffic source tracking is a placeholder. Implement proper analytics for accurate data."
    }
