"""
Booking Model for Service Appointments
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class Booking(Base):
    """Booking model for service appointments"""
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    service_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    # Customer contact info (required even if not registered)
    customer_name = Column(String(100), nullable=False)
    customer_phone = Column(String(20), nullable=False)

    # Appointment details
    booking_datetime = Column(DateTime, nullable=False, index=True)
    comment = Column(Text, nullable=True)

    # Status
    status = Column(String(20), default="pending", nullable=False)  # pending, confirmed, cancelled, completed

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    service = relationship("Product", foreign_keys=[service_id], backref="bookings")
    seller = relationship("User", foreign_keys=[seller_id], backref="bookings_as_seller")
    buyer = relationship("User", foreign_keys=[buyer_id], backref="bookings_as_buyer")

    # Constraints
    __table_args__ = (
        CheckConstraint("status IN ('pending', 'confirmed', 'cancelled', 'completed')", name='check_booking_status'),
    )

    def __repr__(self):
        return f"<Booking {self.customer_name} - {self.booking_datetime}>"
