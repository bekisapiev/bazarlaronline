"""
Review Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, cast
from sqlalchemy.dialects.postgresql import JSONB
from typing import Optional
from uuid import UUID
from decimal import Decimal

from app.database.session import get_db
from app.models.review import Review
from app.models.order import Order
from app.models.user import User, SellerProfile
from app.core.dependencies import get_current_active_user
from app.schemas.review import ReviewCreate, ReviewResponse, SellerRatingResponse

router = APIRouter()


@router.post("/", response_model=ReviewResponse)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a review for a completed order

    Requirements:
    - Order must exist and be completed
    - User must be the buyer
    - Only one review per order
    """
    order_id = UUID(review_data.order_id)

    # Get order
    order_result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = order_result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Verify user is the buyer
    if order.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only review orders you purchased"
        )

    # Verify order is completed
    if order.status != "completed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only review completed orders"
        )

    # Check if review already exists
    existing_review_result = await db.execute(
        select(Review).where(
            Review.order_id == order_id,
            Review.buyer_id == current_user.id
        )
    )
    existing_review = existing_review_result.scalar_one_or_none()

    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this order"
        )

    # Create review
    review = Review(
        seller_id=order.seller_id,
        buyer_id=current_user.id,
        order_id=order_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    db.add(review)

    # Update seller profile rating
    seller_profile_result = await db.execute(
        select(SellerProfile).where(SellerProfile.user_id == order.seller_id)
    )
    seller_profile = seller_profile_result.scalar_one_or_none()

    if seller_profile:
        # Recalculate average rating
        all_reviews_result = await db.execute(
            select(func.avg(Review.rating), func.count(Review.id))
            .select_from(Review)
            .where(Review.seller_id == order.seller_id)
        )
        avg_rating, review_count = all_reviews_result.one()

        # Include new review in calculation
        if avg_rating:
            new_avg = (float(avg_rating) * review_count + review_data.rating) / (review_count + 1)
        else:
            new_avg = float(review_data.rating)

        seller_profile.rating = Decimal(str(round(new_avg, 2)))
        seller_profile.reviews_count = (review_count or 0) + 1

    await db.commit()
    await db.refresh(review)

    return ReviewResponse(
        id=str(review.id),
        seller_id=str(review.seller_id),
        buyer_id=str(review.buyer_id),
        order_id=str(review.order_id),
        rating=review.rating,
        comment=review.comment,
        created_at=review.created_at,
        buyer_name=current_user.full_name,
        order_number=order.order_number
    )


@router.get("/product/{product_id}")
async def get_product_reviews(
    product_id: UUID,
    limit: int = Query(30, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Get reviews for a specific product

    Returns reviews from orders containing this product
    """
    from app.models.product import Product
    from sqlalchemy.orm import selectinload

    # Verify product exists
    product_result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = product_result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Get reviews for orders containing this product
    # Use JSONB contains operator to check if product_id exists in items array
    product_filter = cast([{"product_id": str(product_id)}], JSONB)

    result = await db.execute(
        select(Review)
        .join(Order, Review.order_id == Order.id)
        .options(
            selectinload(Review.buyer),
            selectinload(Review.order)
        )
        .where(Order.items.op('@>')(product_filter))
        .order_by(desc(Review.created_at))
        .limit(limit)
        .offset(offset)
    )
    reviews = result.scalars().all()

    # Build response with loaded relationships
    reviews_with_info = [
        ReviewResponse(
            id=str(review.id),
            seller_id=str(review.seller_id),
            buyer_id=str(review.buyer_id),
            order_id=str(review.order_id),
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at,
            buyer_name=review.buyer.full_name if review.buyer else None,
            order_number=review.order.order_number if review.order else None
        )
        for review in reviews
    ]

    # Count total
    count_result = await db.execute(
        select(func.count())
        .select_from(Review)
        .join(Order, Review.order_id == Order.id)
        .where(Order.items.op('@>')(product_filter))
    )
    total = count_result.scalar()

    return {
        "items": reviews_with_info,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.get("/seller/{seller_id}")
async def get_seller_reviews(
    seller_id: UUID,
    limit: int = Query(30, le=100),
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Get reviews for a specific seller
    """
    # Verify seller exists
    seller_result = await db.execute(
        select(User).where(User.id == seller_id)
    )
    seller = seller_result.scalar_one_or_none()

    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found"
        )

    # Get reviews with buyer and order info using JOINs to avoid N+1 queries
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Review)
        .options(
            selectinload(Review.buyer),
            selectinload(Review.order)
        )
        .where(Review.seller_id == seller_id)
        .order_by(desc(Review.created_at))
        .limit(limit)
        .offset(offset)
    )
    reviews = result.scalars().all()

    # Build response with loaded relationships
    reviews_with_info = [
        ReviewResponse(
            id=str(review.id),
            seller_id=str(review.seller_id),
            buyer_id=str(review.buyer_id),
            order_id=str(review.order_id),
            rating=review.rating,
            comment=review.comment,
            created_at=review.created_at,
            buyer_name=review.buyer.full_name if review.buyer else None,
            order_number=review.order.order_number if review.order else None
        )
        for review in reviews
    ]

    # Count total
    count_result = await db.execute(
        select(func.count())
        .select_from(Review)
        .where(Review.seller_id == seller_id)
    )
    total = count_result.scalar()

    return {
        "items": reviews_with_info,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.get("/seller/{seller_id}/rating", response_model=SellerRatingResponse)
async def get_seller_rating(
    seller_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get seller rating statistics

    Returns average rating, total reviews, and rating distribution
    """
    # Verify seller exists
    seller_result = await db.execute(
        select(User).where(User.id == seller_id)
    )
    seller = seller_result.scalar_one_or_none()

    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found"
        )

    # Get average rating and count
    stats_result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .select_from(Review)
        .where(Review.seller_id == seller_id)
    )
    avg_rating, total_reviews = stats_result.one()

    # Get rating distribution
    distribution_result = await db.execute(
        select(Review.rating, func.count(Review.id))
        .select_from(Review)
        .where(Review.seller_id == seller_id)
        .group_by(Review.rating)
    )
    distribution_rows = distribution_result.all()

    # Create distribution dict (0-10)
    rating_distribution = {str(i): 0 for i in range(11)}
    for rating, count in distribution_rows:
        rating_distribution[str(rating)] = count

    return SellerRatingResponse(
        seller_id=str(seller_id),
        average_rating=float(avg_rating) if avg_rating else 0.0,
        total_reviews=total_reviews or 0,
        rating_distribution=rating_distribution
    )


@router.get("/my-reviews")
async def get_my_reviews(
    limit: int = Query(30, le=100),
    offset: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get reviews written by current user
    """
    # Get reviews with seller and order info using selectinload to avoid N+1 queries
    from sqlalchemy.orm import selectinload

    result = await db.execute(
        select(Review)
        .options(
            selectinload(Review.seller),
            selectinload(Review.order)
        )
        .where(Review.buyer_id == current_user.id)
        .order_by(desc(Review.created_at))
        .limit(limit)
        .offset(offset)
    )
    reviews = result.scalars().all()

    # Build response with loaded relationships
    reviews_with_info = [
        {
            "id": str(review.id),
            "seller_id": str(review.seller_id),
            "seller_name": review.seller.full_name if review.seller else None,
            "order_id": str(review.order_id),
            "order_number": review.order.order_number if review.order else None,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at
        }
        for review in reviews
    ]

    # Count total
    count_result = await db.execute(
        select(func.count())
        .select_from(Review)
        .where(Review.buyer_id == current_user.id)
    )
    total = count_result.scalar()

    return {
        "items": reviews_with_info,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.delete("/{review_id}")
async def delete_review(
    review_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete own review (only author can delete)
    """
    result = await db.execute(
        select(Review).where(Review.id == review_id)
    )
    review = result.scalar_one_or_none()

    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )

    # Only author can delete
    if review.buyer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reviews"
        )

    # Update seller profile rating
    seller_profile_result = await db.execute(
        select(SellerProfile).where(SellerProfile.user_id == review.seller_id)
    )
    seller_profile = seller_profile_result.scalar_one_or_none()

    if seller_profile and seller_profile.reviews_count > 0:
        # Recalculate average rating without this review
        all_reviews_result = await db.execute(
            select(func.avg(Review.rating), func.count(Review.id))
            .select_from(Review)
            .where(
                Review.seller_id == review.seller_id,
                Review.id != review.id
            )
        )
        avg_rating, review_count = all_reviews_result.one()

        seller_profile.rating = Decimal(str(round(float(avg_rating), 2))) if avg_rating else Decimal(0)
        seller_profile.reviews_count = review_count or 0

    await db.delete(review)
    await db.commit()

    return {"message": "Review deleted successfully"}
