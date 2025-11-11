"""
User and Seller Profile Models
"""
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Integer, ForeignKey, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
import secrets
import string

from app.database.base import Base


def generate_referral_id():
    """Generate unique referral ID"""
    return ''.join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(12))


class User(Base):
    """User model"""
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    google_id = Column(String(255), unique=True, nullable=True, index=True)
    referral_id = Column(String(20), unique=True, nullable=False, default=generate_referral_id, index=True)
    referred_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    full_name = Column(String(255), nullable=True)
    phone = Column(String(20), nullable=True)
    role = Column(String(50), default="user")  # user, moderator, admin, cashier
    tariff = Column(String(20), default="free")  # free, pro, business
    tariff_expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_banned = Column(Boolean, default=False)
    ban_reason = Column(Text, nullable=True)

    # Relationships
    seller_profile = relationship("SellerProfile", back_populates="user", uselist=False)
    products = relationship("Product", back_populates="seller")
    wallet = relationship("Wallet", back_populates="user", uselist=False)
    transactions = relationship("Transaction", back_populates="user")
    orders_as_buyer = relationship("Order", foreign_keys="Order.buyer_id", back_populates="buyer")
    orders_as_seller = relationship("Order", foreign_keys="Order.seller_id", back_populates="seller")
    sent_messages = relationship("Message", foreign_keys="Message.sender_id", back_populates="sender")
    reviews_given = relationship("Review", foreign_keys="Review.buyer_id", back_populates="buyer")
    reviews_received = relationship("Review", foreign_keys="Review.seller_id", back_populates="seller")
    withdrawal_requests = relationship("WithdrawalRequest", back_populates="user")
    referrer = relationship("User", remote_side=[id], foreign_keys=[referred_by])
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    view_history = relationship("ViewHistory", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User {self.email}>"


class SellerProfile(Base):
    """Seller Profile model"""
    __tablename__ = "seller_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    shop_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    banner_url = Column(String(500), nullable=True)
    logo_url = Column(String(500), nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=True)
    seller_type = Column(String(50), nullable=True)  # market, boutique, shop, office, home, mobile, warehouse
    market_id = Column(Integer, ForeignKey("markets.id"), nullable=True)
    address = Column(Text, nullable=True)
    latitude = Column(Numeric(10, 8), nullable=True)
    longitude = Column(Numeric(11, 8), nullable=True)
    rating = Column(Numeric(3, 2), default=0)
    reviews_count = Column(Integer, default=0)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="seller_profile")
    category = relationship("Category")
    city = relationship("City")
    market = relationship("Market")

    def __repr__(self):
        return f"<SellerProfile {self.shop_name}>"
