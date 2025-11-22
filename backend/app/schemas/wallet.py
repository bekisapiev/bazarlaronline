"""
Wallet Schemas
"""
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional


class WalletResponse(BaseModel):
    """Wallet balance response"""
    id: str
    user_id: str
    main_balance: Decimal
    referral_balance: Decimal
    currency: str

    class Config:
        from_attributes = True


class TopUpRequest(BaseModel):
    """Top up wallet request"""
    amount: Decimal

    class Config:
        json_schema_extra = {
            "example": {
                "amount": 1000.00
            }
        }


class WithdrawalRequest(BaseModel):
    """Withdrawal request"""
    amount: Decimal
    method: str = "mbank"
    mbank_phone: Optional[str] = None  # Номер телефона MBank
    account_number: Optional[str] = None
    account_name: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "amount": 1000.00,
                "method": "mbank",
                "mbank_phone": "+996555123456"
            }
        }


class WithdrawalResponse(BaseModel):
    """Withdrawal response"""
    id: str
    user_id: str
    amount: Decimal
    method: str
    account_number: str
    account_name: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    """Transaction response"""
    id: str
    user_id: str
    type: str
    amount: Decimal
    balance_type: Optional[str]
    description: Optional[str]
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class TariffUpgradeRequest(BaseModel):
    """Tariff upgrade request"""
    tariff: str  # 'pro' or 'business'
    duration_months: int = 1

    class Config:
        json_schema_extra = {
            "example": {
                "tariff": "pro",
                "duration_months": 1
            }
        }
