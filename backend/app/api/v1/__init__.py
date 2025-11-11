"""
API v1 Router
"""
from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, products, orders, wallet, chat, seller_profile, tariff, partners, reviews, admin, locations, upload, categories, analytics

api_router = APIRouter()

# Include routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(seller_profile.router, prefix="/seller-profile", tags=["Seller Profile"])
api_router.include_router(products.router, prefix="/products", tags=["Products"])
api_router.include_router(orders.router, prefix="/orders", tags=["Orders"])
api_router.include_router(wallet.router, prefix="/wallet", tags=["Wallet"])
api_router.include_router(tariff.router, prefix="/tariff", tags=["Tariff"])
api_router.include_router(partners.router, prefix="/partners", tags=["Partner Program"])
api_router.include_router(reviews.router, prefix="/reviews", tags=["Reviews"])
api_router.include_router(chat.router, prefix="/chat", tags=["Chat"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(locations.router, prefix="/locations", tags=["Locations"])
api_router.include_router(upload.router, prefix="/upload", tags=["Upload"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
