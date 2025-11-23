"""
Bazarlar Online - Main FastAPI Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.api.v1 import api_router
from app.database.session import engine
from app.database.base import Base
from app.middleware import (
    RateLimitMiddleware,
    SecurityHeadersMiddleware,
    SecurityLoggerMiddleware,
    ErrorHandlerMiddleware
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Starting Bazarlar Online...")

    # Create database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Create uploads directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    print("✅ Application started successfully")

    yield

    # Shutdown
    print("👋 Shutting down Bazarlar Online...")


# Initialize FastAPI app
app = FastAPI(
    title="Bazarlar Online API",
    description="API для торговой веб-платформы Bazarlar Online",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    lifespan=lifespan
)

# Configure Security Middleware (порядок важен - выполняются в обратном порядке)
# 1. Error Handler - перехватывает все необработанные ошибки
app.add_middleware(ErrorHandlerMiddleware)

# 2. Security Logger - логирует подозрительную активность
app.add_middleware(SecurityLoggerMiddleware)

# 3. Security Headers - добавляет заголовки безопасности
app.add_middleware(SecurityHeadersMiddleware)

# 4. Rate Limiting - ограничивает частоту запросов
app.add_middleware(RateLimitMiddleware)

# 5. CORS - настройка политики CORS (должен быть последним)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files (uploads)
if os.path.exists(settings.UPLOAD_DIR):
    app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API router
app.include_router(api_router, prefix="/api/v1")


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Добро пожаловать в Bazarlar Online API",
        "version": "1.0.0",
        "docs": "/api/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }
