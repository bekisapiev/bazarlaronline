"""
Partner/Referral Program Schemas
"""
from pydantic import BaseModel
from decimal import Decimal
from datetime import datetime
from typing import Optional


class ReferralStatsResponse(BaseModel):
    """Referral statistics response"""
    referral_code: str
    total_referrals: int
    total_earnings: Decimal
    referral_balance: Decimal
    pending_earnings: Optional[Decimal] = Decimal(0)

    class Config:
        from_attributes = True


class ReferralHistoryItem(BaseModel):
    """Single referral history item"""
    id: str
    referred_user_id: str
    referred_user_email: Optional[str] = None
    commission_earned: Decimal
    order_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class PartnerLinkResponse(BaseModel):
    """Partner link response"""
    referral_code: str
    referral_link: str
    qr_code_url: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "referral_code": "ABC123DEF456",
                "referral_link": "https://bazarlar.kg/ref/ABC123DEF456",
                "qr_code_url": "https://api.bazarlar.kg/qr/ABC123DEF456.png"
            }
        }
