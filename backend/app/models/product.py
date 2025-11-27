"""
Product and Category Models
"""
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Text, Numeric, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class Category(Base):
    """Category model"""
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    parent_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    name = Column(String(100), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    level = Column(Integer, nullable=False)  # 1, 2, 3, or 4
    icon = Column(String(100), nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    # Relationships
    parent = relationship("Category", remote_side=[id], back_populates="children")
    children = relationship("Category", back_populates="parent")
    products = relationship("Product", back_populates="category")

    def __repr__(self):
        return f"<Category {self.name}>"


class Product(Base):
    """Product model - can be either physical product or service"""
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_type = Column(String(20), default="product", nullable=False)  # product or service
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    discount_price = Column(Numeric(10, 2), nullable=True)
    # discount_percent will be calculated as computed column
    # Referral program fields (Business tariff only)
    is_referral_enabled = Column(Boolean, default=False)
    referral_commission_percent = Column(Numeric(5, 2), nullable=True)  # 1-50%
    delivery_type = Column(String(20), nullable=True)  # pickup, paid, free
    delivery_methods = Column(JSONB, nullable=True)  # ['taxi', 'express', 'cargo', etc.]
    characteristics = Column(JSONB, nullable=True)  # [{name: 'Color', value: 'Red'}]
    images = Column(JSONB, nullable=True)  # ['url1', 'url2', ...]
    status = Column(String(20), default="moderation")  # moderation, active, inactive, rejected
    moderation_result = Column(JSONB, nullable=True)

    # New promotion system based on views
    promotion_views_total = Column(Integer, default=0)  # Total purchased promotion views
    promotion_views_remaining = Column(Integer, default=0)  # Remaining promotion views
    promotion_started_at = Column(DateTime, nullable=True)  # When promotion started

    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    seller = relationship("User", back_populates="products")
    category = relationship("Category", back_populates="products")
    favorited_by = relationship("Favorite", back_populates="product", cascade="all, delete-orphan")
    views = relationship("ViewHistory", back_populates="product", cascade="all, delete-orphan")

    # Constraints
    __table_args__ = (
        CheckConstraint('referral_commission_percent IS NULL OR (referral_commission_percent >= 1 AND referral_commission_percent <= 50)', name='check_referral_commission'),
        CheckConstraint("product_type IN ('product', 'service')", name='check_product_type'),
    )

    def __repr__(self):
        return f"<Product {self.title}>"

    @property
    def discount_percent(self):
        """Calculate discount percentage"""
        if self.discount_price and self.price:
            return round((1 - float(self.discount_price) / float(self.price)) * 100)
        return None

    @property
    def referral_commission_amount(self):
        """Calculate referral commission amount in som"""
        if self.is_referral_enabled and self.referral_commission_percent:
            # Use discount price if available, otherwise regular price
            effective_price = self.discount_price if self.discount_price else self.price
            if effective_price:
                from decimal import Decimal
                return (Decimal(str(effective_price)) * Decimal(str(self.referral_commission_percent)) / Decimal('100')).quantize(Decimal('0.01'))
        return None

    @property
    def is_promoted(self):
        """Check if product is currently promoted (has remaining promotion views)"""
        return self.promotion_views_remaining > 0
