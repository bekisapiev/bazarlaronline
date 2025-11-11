"""
User Schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from decimal import Decimal


class UserProfileUpdate(BaseModel):
    """User profile update request"""
    full_name: Optional[str] = None
    phone: Optional[str] = None


class SellerProfileUpdate(BaseModel):
    """Seller profile update request"""
    shop_name: Optional[str] = None
    description: Optional[str] = None
    banner_url: Optional[str] = None
    logo_url: Optional[str] = None
    category_id: Optional[int] = None
    city_id: Optional[int] = None
    seller_type: Optional[str] = None
    market_id: Optional[int] = None
    address: Optional[str] = None
    latitude: Optional[Decimal] = None
    longitude: Optional[Decimal] = None


class SellerProfileResponse(BaseModel):
    """Seller profile response"""
    id: str
    user_id: str
    shop_name: str
    description: Optional[str]
    banner_url: Optional[str]
    logo_url: Optional[str]
    category_id: Optional[int]
    city_id: Optional[int]
    seller_type: Optional[str]
    market_id: Optional[int]
    address: Optional[str]
    rating: Decimal
    reviews_count: int
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserWithProfileResponse(BaseModel):
    """User with optional seller profile response"""
    id: str
    email: EmailStr
    full_name: Optional[str]
    referral_id: str
    tariff: str
    role: str
    created_at: datetime
    seller_profile: Optional[SellerProfileResponse] = None

    class Config:
        from_attributes = True
