"""
Application Configuration
"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings"""

    # Application
    ENVIRONMENT: str = "development"
    API_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:123456@localhost:5432/bazarlar_claude"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 525600  # 1 год (365 дней * 24 часа * 60 минут)
    REFRESH_TOKEN_EXPIRE_DAYS: int = 365

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:3000/auth/callback"

    # Google Cloud Vision
    GOOGLE_CLOUD_PROJECT_ID: str = ""
    GOOGLE_APPLICATION_CREDENTIALS: str = ""

    # MBank Payment
    MBANK_MERCHANT_ID: str = ""
    MBANK_API_KEY: str = ""
    MBANK_API_URL: str = "https://api.mbank.kg"

    # File Upload
    MAX_FILE_SIZE: int = 10485760  # 10MB
    UPLOAD_DIR: str = "./uploads"
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/png", "image/webp"]

    # Pagination
    DEFAULT_PAGE_SIZE: int = 30
    MAX_PAGE_SIZE: int = 100

    # Referral System
    REFERRAL_CASHBACK_PERCENT: int = 10
    MIN_WITHDRAWAL_AMOUNT: int = 3000

    # Tariff Prices (KGS)
    FREE_PROMOTION_PRICE: int = 20
    PRO_PROMOTION_PRICE: int = 15
    BUSINESS_PROMOTION_PRICE: int = 10
    PRO_MONTHLY_PRICE: int = 500
    BUSINESS_MONTHLY_PRICE: int = 2000

    # Partner Commission Distribution
    PARTNER_COMMISSION_PERCENT: int = 40
    PLATFORM_COMMISSION_PERCENT: int = 60

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
        "https://bazarlar.online",
        "https://www.bazarlar.online"
    ]

    class Config:
        env_file = "../.env"  # .env файл в корне проекта (на уровень выше backend/)
        case_sensitive = True
        extra = "ignore"  # Игнорировать дополнительные поля из .env


settings = Settings()
