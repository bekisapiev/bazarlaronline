"""
Authentication Schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class GoogleAuthRequest(BaseModel):
    """Google OAuth token request"""
    token: str


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str


class TelegramAuthRequest(BaseModel):
    """Telegram auth - request verification code"""
    telegram_id: str
    phone: str


class TelegramVerifyRequest(BaseModel):
    """Telegram auth - verify code and login/register"""
    telegram_id: str
    phone: str
    code: str
    telegram_username: Optional[str] = None
    full_name: Optional[str] = None


class UserResponse(BaseModel):
    """User response"""
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    telegram_id: Optional[str] = None
    telegram_username: Optional[str] = None
    referral_id: str
    tariff: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
