"""
Order Schemas
"""
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import List, Optional, Dict
from uuid import UUID


class OrderItem(BaseModel):
    """Single order item"""
    product_id: str
    quantity: int
    price: Decimal
    discount_price: Optional[Decimal] = None
    product_referrer_id: Optional[str] = None  # User ID who shared the product referral link

    class Config:
        json_schema_extra = {
            "example": {
                "product_id": "123e4567-e89b-12d3-a456-426614174000",
                "quantity": 2,
                "price": 1500.00,
                "discount_price": 1200.00,
                "product_referrer_id": "123e4567-e89b-12d3-a456-426614174002"
            }
        }


class OrderCreate(BaseModel):
    """Create order request"""
    seller_id: str
    items: List[OrderItem]
    delivery_address: Optional[str] = None
    phone_number: str
    payment_method: str = "wallet"  # wallet or mbank

    class Config:
        json_schema_extra = {
            "example": {
                "seller_id": "123e4567-e89b-12d3-a456-426614174000",
                "items": [
                    {
                        "product_id": "123e4567-e89b-12d3-a456-426614174001",
                        "quantity": 2,
                        "price": 1500.00,
                        "discount_price": 1200.00
                    }
                ],
                "delivery_address": "г. Бишкек, ул. Чуй 123",
                "phone_number": "+996555123456",
                "payment_method": "wallet"
            }
        }


class OrderStatusUpdate(BaseModel):
    """Update order status"""
    status: str  # pending, processing, completed, cancelled

    class Config:
        json_schema_extra = {
            "example": {
                "status": "processing"
            }
        }


class OrderResponse(BaseModel):
    """Order response"""
    id: str
    order_number: str
    buyer_id: str
    seller_id: str
    items: List[Dict]
    total_amount: Decimal
    delivery_address: Optional[str] = None
    phone_number: Optional[str] = None
    payment_method: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OrderListItem(BaseModel):
    """Order list item with additional info for display"""
    id: str
    order_number: str
    buyer_id: str
    seller_id: str
    seller_name: str  # For display
    product_title: str  # First product title or "Multiple items"
    total_price: Decimal  # Alias for total_amount
    status: str
    created_at: datetime
    items_count: int  # Number of items in order

    class Config:
        from_attributes = True
