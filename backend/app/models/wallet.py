"""
Wallet, Transaction and Withdrawal Models
"""
from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database.base import Base


class Wallet(Base):
    """Wallet model"""
    __tablename__ = "wallets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    main_balance = Column(Numeric(10, 2), default=0)
    referral_balance = Column(Numeric(10, 2), default=0)
    currency = Column(String(3), default="KGS")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="wallet")

    def __repr__(self):
        return f"<Wallet user_id={self.user_id} main={self.main_balance} referral={self.referral_balance}>"


class Transaction(Base):
    """Transaction model"""
    __tablename__ = "transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(String(50), nullable=False)  # topup, withdrawal, purchase, referral, promotion
    amount = Column(Numeric(10, 2), nullable=False)
    balance_type = Column(String(20), nullable=True)  # main, referral
    description = Column(Text, nullable=True)
    reference_id = Column(UUID(as_uuid=True), nullable=True)  # link to order/withdrawal/etc
    status = Column(String(20), default="completed")  # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", back_populates="transactions")

    def __repr__(self):
        return f"<Transaction {self.type} {self.amount} {self.currency}>"


class WithdrawalRequest(Base):
    """Withdrawal Request model"""
    __tablename__ = "withdrawal_requests"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    method = Column(String(20), default="mbank")
    mbank_phone = Column(String(20), nullable=True)  # Номер телефона MBank
    account_number = Column(String(50), nullable=True)
    account_name = Column(String(255), nullable=True)
    balance_type = Column(String(20), default="referral")  # main, referral
    status = Column(String(20), default="pending")  # pending, processing, approved, rejected
    processed_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    processed_at = Column(DateTime, nullable=True)
    rejection_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="withdrawal_requests")
    processor = relationship("User", foreign_keys=[processed_by])

    def __repr__(self):
        return f"<WithdrawalRequest {self.amount} {self.status}>"


class ReferralEarning(Base):
    """Referral Earning model - tracks referral bonuses"""
    __tablename__ = "referral_earnings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    referrer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)  # Кто получает бонус
    referee_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # Кто пополнил
    transaction_id = Column(UUID(as_uuid=True), ForeignKey("transactions.id"), nullable=True)  # Транзакция пополнения
    topup_amount = Column(Numeric(10, 2), nullable=False)  # Сумма пополнения реферала
    earning_amount = Column(Numeric(10, 2), nullable=False)  # Начисленный бонус (20%)
    status = Column(String(20), default="completed")  # pending, completed, failed
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    referrer = relationship("User", foreign_keys=[referrer_id])
    referee = relationship("User", foreign_keys=[referee_id])

    def __repr__(self):
        return f"<ReferralEarning referrer={self.referrer_id} amount={self.earning_amount}>"


class ProductReferralPurchase(Base):
    """Product Referral Purchase model - tracks purchases made via product referral links"""
    __tablename__ = "product_referral_purchases"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    referrer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False, index=True)  # Кто поделился ссылкой
    buyer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)  # Кто купил
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)  # Товар
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id"), nullable=True)  # Заказ
    commission_percent = Column(Numeric(5, 2), nullable=False)  # Процент комиссии на момент покупки
    commission_amount = Column(Numeric(10, 2), nullable=False)  # Сумма комиссии
    product_price = Column(Numeric(10, 2), nullable=False)  # Цена товара на момент покупки
    status = Column(String(20), default="pending")  # pending, completed, cancelled
    completed_at = Column(DateTime, nullable=True)  # Когда заказ подтвержден
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    referrer = relationship("User", foreign_keys=[referrer_id])
    buyer = relationship("User", foreign_keys=[buyer_id])
    product = relationship("Product")

    def __repr__(self):
        return f"<ProductReferralPurchase referrer={self.referrer_id} amount={self.commission_amount} status={self.status}>"
