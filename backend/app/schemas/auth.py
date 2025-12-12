"""
Authentication Schemas
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class GoogleAuthRequest(BaseModel):
    """Google OAuth token request"""
    token: str
    ref_code: Optional[str] = None  # Referral code (12-digit referral_id of referrer)


class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str


class EmailRegisterRequest(BaseModel):
    """Email registration request"""
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    ref_code: Optional[str] = None  # Реферальный код


class EmailLoginRequest(BaseModel):
    """Email login request"""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """User response"""
    id: str
    email: EmailStr
    full_name: Optional[str] = None
    phone: Optional[str] = None
    referral_id: str
    tariff: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
