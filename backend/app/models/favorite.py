"""
Favorite and ViewHistory Models
"""
from sqlalchemy import Column, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class Favorite(Base):
    """Favorite products model"""
    __tablename__ = "favorites"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="favorites")
    product = relationship("Product", back_populates="favorited_by")

    # Unique constraint: user can favorite a product only once
    __table_args__ = (
        UniqueConstraint('user_id', 'product_id', name='unique_user_product_favorite'),
    )

    def __repr__(self):
        return f"<Favorite user={self.user_id} product={self.product_id}>"


class ViewHistory(Base):
    """Product view history model"""
    __tablename__ = "view_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    viewed_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="view_history")
    product = relationship("Product", back_populates="views")

    def __repr__(self):
        return f"<ViewHistory user={self.user_id} product={self.product_id}>"
