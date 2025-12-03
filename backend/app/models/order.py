"""
Order Model
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class Order(Base):
    """Order model"""
    __tablename__ = "orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_number = Column(String(30), unique=True, nullable=False, index=True)
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    items = Column(JSONB, nullable=False)  # [{product_id, quantity, price, discount_price}]
    total_amount = Column(Numeric(10, 2), nullable=False)
    delivery_address = Column(Text, nullable=True)
    phone_number = Column(String(20), nullable=True)
    payment_method = Column(String(20), nullable=True)  # wallet, mbank
    notes = Column(Text, nullable=True)  # Additional notes from buyer
    status = Column(String(20), default="pending")  # pending, processing, completed, cancelled
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    buyer = relationship("User", foreign_keys=[buyer_id], back_populates="orders_as_buyer")
    seller = relationship("User", foreign_keys=[seller_id], back_populates="orders_as_seller")
    review = relationship("Review", back_populates="order", uselist=False)

    def __repr__(self):
        return f"<Order {self.order_number}>"

    @staticmethod
    def generate_order_number():
        """Generate unique order number"""
        from datetime import datetime
        now = datetime.now()
        return f"ORD-{now.strftime('%Y%m%d')}-{uuid.uuid4().hex[:8].upper()}"
