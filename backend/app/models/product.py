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
    level = Column(Integer, nullable=False)  # 1, 2, or 3
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
    """Product model"""
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    discount_price = Column(Numeric(10, 2), nullable=True)
    # discount_percent will be calculated as computed column
    partner_percent = Column(Numeric(5, 2), default=0)
    delivery_type = Column(String(20), nullable=True)  # pickup, paid, free
    delivery_methods = Column(JSONB, nullable=True)  # ['taxi', 'express', 'cargo', etc.]
    characteristics = Column(JSONB, nullable=True)  # [{name: 'Color', value: 'Red'}]
    images = Column(JSONB, nullable=True)  # ['url1', 'url2', ...]
    status = Column(String(20), default="moderation")  # moderation, active, inactive, rejected
    moderation_result = Column(JSONB, nullable=True)
    is_promoted = Column(Boolean, default=False)
    promoted_at = Column(DateTime, nullable=True)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    seller = relationship("User", back_populates="products")
    category = relationship("Category", back_populates="products")
    auto_promotions = relationship("AutoPromotion", back_populates="product")
    favorited_by = relationship("Favorite", back_populates="product", cascade="all, delete-orphan")
    views = relationship("ViewHistory", back_populates="product", cascade="all, delete-orphan")

    # Constraints
    __table_args__ = (
        CheckConstraint('partner_percent >= 0 AND partner_percent <= 100', name='check_partner_percent'),
    )

    def __repr__(self):
        return f"<Product {self.title}>"

    @property
    def discount_percent(self):
        """Calculate discount percentage"""
        if self.discount_price and self.price:
            return round((1 - float(self.discount_price) / float(self.price)) * 100)
        return None
