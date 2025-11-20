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
    """Review model - can be for orders (products) or bookings (services)"""
    __tablename__ = "reviews"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Either order_id (for products) OR booking_id (for services) must be set
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=True)
    booking_id = Column(UUID(as_uuid=True), ForeignKey("bookings.id"), nullable=True)

    rating = Column(Integer, nullable=False)  # 0-10
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    seller = relationship("User", foreign_keys=[seller_id], back_populates="reviews_received")
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="reviews_given")
    order = relationship("Order", back_populates="review")
    booking = relationship("Booking", back_populates="review")

    # Constraints
    __table_args__ = (
        CheckConstraint('rating >= 0 AND rating <= 10', name='check_rating'),
        CheckConstraint('(order_id IS NOT NULL AND booking_id IS NULL) OR (order_id IS NULL AND booking_id IS NOT NULL)', name='check_order_or_booking'),
        UniqueConstraint('order_id', 'buyer_id', name='unique_review_per_order'),
        UniqueConstraint('booking_id', 'buyer_id', name='unique_review_per_booking'),
    )

    def __repr__(self):
        return f"<Review {self.rating}/10>"
