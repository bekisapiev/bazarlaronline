"""
Auto Promotion Model
"""
from sqlalchemy import Column, DateTime, ForeignKey, Integer, Boolean, CheckConstraint, Time, Date
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class AutoPromotion(Base):
    """Auto Promotion model"""
    __tablename__ = "auto_promotions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    frequency_minutes = Column(Integer, nullable=False)  # minimum 30 minutes
    end_date = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)
    last_promoted_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    product = relationship("Product", back_populates="auto_promotions")

    # Constraints
    __table_args__ = (
        CheckConstraint('frequency_minutes >= 30', name='check_frequency_minutes'),
    )

    def __repr__(self):
        return f"<AutoPromotion product_id={self.product_id} frequency={self.frequency_minutes}>"
