"""
Coupon Model
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import enum

from app.database.base import Base


class CouponType(str, enum.Enum):
    """Coupon type enum"""
    PERCENTAGE = "percentage"  # Discount in percentage
    FIXED = "fixed"  # Fixed amount discount


class Coupon(Base):
    """Coupon/Promo code model"""
    __tablename__ = "coupons"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    code = Column(String(50), unique=True, nullable=False, index=True)

    # Coupon details
    type = Column(SQLEnum(CouponType), nullable=False)
    value = Column(Integer, nullable=False)  # Percentage or fixed amount in KGS

    # Usage limits
    max_uses = Column(Integer, nullable=True)  # Null = unlimited
    used_count = Column(Integer, default=0)
    max_uses_per_user = Column(Integer, default=1)
    min_order_amount = Column(Integer, nullable=True)  # Minimum order amount to use coupon

    # Validity
    valid_from = Column(DateTime, nullable=False, default=datetime.utcnow)
    valid_until = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)

    # Seller restriction (null = platform-wide coupon)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)

    # Creator (admin or seller)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Metadata
    description = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    seller = relationship("User", foreign_keys=[seller_id], backref="coupons_created")
    creator = relationship("User", foreign_keys=[created_by])
    usage_records = relationship("CouponUsage", back_populates="coupon", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Coupon {self.code}>"

    def is_valid(self) -> bool:
        """Check if coupon is currently valid"""
        now = datetime.utcnow()
        return (
            self.is_active and
            self.valid_from <= now <= self.valid_until and
            (self.max_uses is None or self.used_count < self.max_uses)
        )


class CouponUsage(Base):
    """Coupon usage tracking"""
    __tablename__ = "coupon_usage"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coupon_id = Column(UUID(as_uuid=True), ForeignKey("coupons.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)

    discount_amount = Column(Integer, nullable=False)  # Actual discount applied in KGS
    used_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    coupon = relationship("Coupon", back_populates="usage_records")
    user = relationship("User", backref="coupon_usages")
    order = relationship("Order", backref="coupon_used")

    def __repr__(self):
        return f"<CouponUsage {self.coupon_id} by {self.user_id}>"
