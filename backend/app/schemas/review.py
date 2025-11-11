"""
Review Schemas
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class ReviewCreate(BaseModel):
    """Create review request"""
    order_id: str
    rating: int = Field(..., ge=0, le=10, description="Rating from 0 to 10")
    comment: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "order_id": "123e4567-e89b-12d3-a456-426614174000",
                "rating": 8,
                "comment": "Отличный товар, быстрая доставка!"
            }
        }


class ReviewResponse(BaseModel):
    """Review response"""
    id: str
    seller_id: str
    buyer_id: str
    order_id: str
    rating: int
    comment: Optional[str] = None
    created_at: datetime
    # Additional fields for convenience
    buyer_name: Optional[str] = None
    order_number: Optional[str] = None

    class Config:
        from_attributes = True


class SellerRatingResponse(BaseModel):
    """Seller rating statistics"""
    seller_id: str
    average_rating: float
    total_reviews: int
    rating_distribution: dict  # {0: count, 1: count, ...}

    class Config:
        json_schema_extra = {
            "example": {
                "seller_id": "123e4567-e89b-12d3-a456-426614174000",
                "average_rating": 8.5,
                "total_reviews": 42,
                "rating_distribution": {
                    "10": 15,
                    "9": 12,
                    "8": 8,
                    "7": 4,
                    "6": 2,
                    "5": 1,
                    "4": 0,
                    "3": 0,
                    "2": 0,
                    "1": 0,
                    "0": 0
                }
            }
        }
