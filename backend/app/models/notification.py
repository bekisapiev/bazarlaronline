"""
Notification Model
"""
from sqlalchemy import Column, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class Notification(Base):
    """Notification model"""
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    # Notification details
    type = Column(String(50), nullable=False)  # order, review, moderation, system, wallet
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSONB, nullable=True)  # Additional data (order_id, product_id, etc.)

    # Status
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification {self.type} for user {self.user_id}>"
