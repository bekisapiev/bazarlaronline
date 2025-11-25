"""
Product Schemas
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from decimal import Decimal
from datetime import datetime


class ProductCreate(BaseModel):
    """Product creation request"""
    title: str
    description: Optional[str] = None
    category_id: Optional[int] = None
    price: Decimal
    discount_price: Optional[Decimal] = None
    product_type: Optional[str] = "product"  # "product" or "service"
    delivery_type: Optional[str] = "pickup"
    delivery_methods: Optional[List[str]] = None
    characteristics: Optional[List[Dict[str, str]]] = None
    images: Optional[List[str]] = None
    # Referral program fields (Business tariff only)
    is_referral_enabled: Optional[bool] = False
    referral_commission_percent: Optional[Decimal] = None

    class Config:
        json_schema_extra = {
            "example": {
                "title": "iPhone 15 Pro",
                "description": "Новый iPhone 15 Pro, 256GB",
                "category_id": 1,
                "price": 120000,
                "discount_price": 110000,
                "delivery_type": "paid",
                "delivery_methods": ["taxi", "express"],
                "characteristics": [
                    {"name": "Цвет", "value": "Черный"},
                    {"name": "Память", "value": "256GB"}
                ],
                "images": ["url1", "url2"]
            }
        }


class ProductUpdate(BaseModel):
    """Product update request"""
    title: Optional[str] = None
    description: Optional[str] = None
    category_id: Optional[int] = None
    price: Optional[Decimal] = None
    discount_price: Optional[Decimal] = None
    product_type: Optional[str] = None  # "product" or "service"
    delivery_type: Optional[str] = None
    delivery_methods: Optional[List[str]] = None
    characteristics: Optional[List[Dict[str, str]]] = None
    images: Optional[List[str]] = None
    status: Optional[str] = None
    # Referral program fields (Business tariff only)
    is_referral_enabled: Optional[bool] = None
    referral_commission_percent: Optional[Decimal] = None


class ProductResponse(BaseModel):
    """Product response"""
    id: str
    seller_id: str
    title: str
    description: Optional[str]
    category_id: Optional[int]
    price: Decimal
    discount_price: Optional[Decimal]
    discount_percent: Optional[int]
    delivery_type: Optional[str]
    delivery_methods: Optional[List[str]]
    characteristics: Optional[List[Dict[str, str]]]
    images: Optional[List[str]]
    status: str
    is_promoted: bool
    promotion_views_total: Optional[int] = 0
    promotion_views_remaining: Optional[int] = 0
    promotion_started_at: Optional[datetime] = None
    views_count: int
    created_at: datetime
    updated_at: datetime
    # Referral program fields
    is_referral_enabled: bool
    referral_commission_percent: Optional[Decimal]
    referral_commission_amount: Optional[Decimal]

    class Config:
        from_attributes = True


class ProductListResponse(BaseModel):
    """Product list item response"""
    id: str
    title: str
    price: Decimal
    discount_price: Optional[Decimal]
    discount_percent: Optional[int]
    images: Optional[List[str]]
    is_promoted: bool
    seller: Dict[str, Any]
    # Referral program fields
    is_referral_enabled: bool
    referral_commission_percent: Optional[Decimal]
    referral_commission_amount: Optional[Decimal]

    class Config:
        from_attributes = True


class CategoryResponse(BaseModel):
    """Category response"""
    id: int
    parent_id: Optional[int]
    name: str
    slug: str
    level: int
    icon: Optional[str]
    sort_order: int
    is_active: bool

    class Config:
        from_attributes = True
