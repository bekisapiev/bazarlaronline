"""
Review Model
"""
from sqlalchemy import Column, DateTime, ForeignKey, Text, Integer, CheckConstraint, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class Review(Base):
    """Review model"""
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=False)
    rating = Column(Integer, nullable=False)  # 0-10
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    seller = relationship("User", foreign_keys=[seller_id], back_populates="reviews_received")
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="reviews_given")
    order = relationship("Order", back_populates="review")

    # Constraints
    __table_args__ = (
        CheckConstraint('rating >= 0 AND rating <= 10', name='check_rating'),
        UniqueConstraint('order_id', 'buyer_id', name='unique_review_per_order'),
    )

    def __repr__(self):
        return f"<Review {self.rating}/10>"
