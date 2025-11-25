"""
Product Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from sqlalchemy.orm import selectinload
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal

from app.database.session import get_db
from app.models.product import Product, Category
from app.models.user import User
from app.models.wallet import Wallet, Transaction
from app.core.config import settings
from app.core.dependencies import get_current_active_user
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse

router = APIRouter()

# Tariff limits
TARIFF_LIMITS = {
    "free": 10,
    "pro": 100,
    "business": 1000
}

# Promotion packages: views -> price for FREE tariff
# PRO: 1.5x cheaper, BUSINESS: 2x cheaper
PROMOTION_PACKAGES = {
    0: 0,      # Free
    500: 10,   # 500 views - 10 som
    1000: 20,  # 1000 views - 20 som
    1500: 30,
    2000: 40,
    2500: 50,
    3000: 60,
    3500: 70,
    4000: 80,
    4500: 90,
    5000: 100
}

def get_promotion_price(views: int, tariff: str) -> Decimal:
    """Calculate promotion price based on views and tariff"""
    base_price = PROMOTION_PACKAGES.get(views, 0)
    if tariff == "pro":
        return Decimal(base_price) / Decimal("1.5")
    elif tariff == "business":
        return Decimal(base_price) / Decimal("2")
    return Decimal(base_price)


async def get_category_ids_with_children(category_id: int, db: AsyncSession) -> list[int]:
    """
    Get category ID and all its children IDs recursively

    Args:
        category_id: Parent category ID
        db: Database session

    Returns:
        List of category IDs including parent and all descendants
    """
    category_ids = [category_id]

    # Get direct children
    result = await db.execute(
        select(Category).where(Category.parent_id == category_id)
    )
    children = result.scalars().all()

    # Recursively get children of children
    for child in children:
        child_ids = await get_category_ids_with_children(child.id, db)
        category_ids.extend(child_ids)

    return category_ids


@router.get("/")
async def get_products(
    category_id: Optional[int] = Query(None, description="Filter by category"),
    city_id: Optional[int] = Query(None, description="Filter by seller city"),
    seller_type: Optional[str] = Query(None, description="Filter by seller type (market, boutique, shop, etc)"),
    search: Optional[str] = Query(None, description="Search in product titles"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, le=settings.MAX_PAGE_SIZE),
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of products with filters

    Filters:
    - category_id: Filter by product category
    - city_id: Filter by seller city (from seller profile)
    - seller_type: Filter by seller type (market, boutique, shop, office, home, mobile, warehouse)
    - search: Search in product titles
    - min_price/max_price: Filter by price range
    """
    from app.models.user import SellerProfile

    # Base query with join to seller profile for city and seller_type filters
    if city_id or seller_type:
        query = select(Product).join(
            SellerProfile,
            Product.seller_id == SellerProfile.user_id
        ).where(Product.status == "active")
    else:
        query = select(Product).where(Product.status == "active")

    # Apply filters
    if category_id:
        # Get all child categories to include products from subcategories
        category_ids = await get_category_ids_with_children(category_id, db)
        query = query.where(Product.category_id.in_(category_ids))

    if search:
        query = query.where(Product.title.ilike(f"%{search}%"))

    if min_price is not None:
        query = query.where(Product.price >= min_price)

    if max_price is not None:
        query = query.where(Product.price <= max_price)

    # Seller profile filters
    if city_id:
        query = query.where(SellerProfile.city_id == city_id)

    if seller_type:
        query = query.where(SellerProfile.seller_type == seller_type)

    # Order by promotion views remaining (promoted products first), then by created_at
    # Products with promotion_views_remaining > 0 appear first (in random order for fairness)
    # Then regular products sorted by newest first
    # Use COALESCE to handle NULL values safely
    query = query.order_by(
        desc(func.coalesce(Product.promotion_views_remaining, 0)),
        desc(Product.created_at)
    )

    # Count total before pagination
    count_query = select(func.count()).select_from(Product)
    if city_id or seller_type:
        count_query = count_query.join(
            SellerProfile,
            Product.seller_id == SellerProfile.user_id
        )
    count_query = count_query.where(Product.status == "active")

    if category_id:
        # Use same category_ids list for count query
        count_query = count_query.where(Product.category_id.in_(category_ids))
    if search:
        count_query = count_query.where(Product.title.ilike(f"%{search}%"))
    if min_price is not None:
        count_query = count_query.where(Product.price >= min_price)
    if max_price is not None:
        count_query = count_query.where(Product.price <= max_price)
    if city_id:
        count_query = count_query.where(SellerProfile.city_id == city_id)
    if seller_type:
        count_query = count_query.where(SellerProfile.seller_type == seller_type)

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # Pagination
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    products_list = result.scalars().all()

    # Extract all data from products BEFORE any commit/detach
    # This avoids SQLAlchemy lazy loading issues
    products_data = []
    promoted_product_ids = []

    for p in products_list:
        # Access all attributes while object is still attached to session
        promotion_views = p.promotion_views_remaining or 0

        products_data.append({
            "id": str(p.id),
            "seller_id": str(p.seller_id),
            "title": p.title,
            "price": float(p.price),
            "discount_price": float(p.discount_price) if p.discount_price else None,
            "discount_percent": p.discount_percent,
            "images": p.images or [],
            "is_promoted": promotion_views > 0,
            "views_count": p.views_count,
            "promotion_views_remaining": promotion_views,
            "is_referral_enabled": p.is_referral_enabled,
            "referral_commission_percent": float(p.referral_commission_percent) if p.referral_commission_percent else None,
            "referral_commission_amount": float(p.referral_commission_amount) if p.referral_commission_amount else None
        })

        if promotion_views > 0:
            promoted_product_ids.append(p.id)

    # Decrement promotion views for promoted products (they are being shown)
    if promoted_product_ids:
        try:
            from sqlalchemy import update as sql_update
            await db.execute(
                sql_update(Product)
                .where(Product.id.in_(promoted_product_ids))
                .where(func.coalesce(Product.promotion_views_remaining, 0) > 0)
                .values(promotion_views_remaining=func.coalesce(Product.promotion_views_remaining, 1) - 1)
            )
            await db.commit()
        except Exception as e:
            # If decrement fails, just log it and continue (don't block product listing)
            print(f"Warning: Failed to decrement promotion views: {e}")
            await db.rollback()

    return {
        "items": products_data,
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.get("/referral/products")
async def get_referral_products(
    category_id: Optional[int] = Query(None, description="Filter by category"),
    search: Optional[str] = Query(None, description="Search in product titles"),
    min_price: Optional[float] = Query(None, description="Minimum price"),
    max_price: Optional[float] = Query(None, description="Maximum price"),
    sort_by: Optional[str] = Query("commission", description="Sort by: commission, price, created"),
    limit: int = Query(settings.DEFAULT_PAGE_SIZE, le=settings.MAX_PAGE_SIZE),
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of products with enabled referral program

    Products are returned sorted by commission amount by default.
    All users can view and share referral links for these products.
    """
    # Base query - only products with referral enabled
    query = select(Product).where(
        Product.status == "active",
        Product.is_referral_enabled == True
    )

    # Apply filters
    if category_id:
        # Get all child categories to include products from subcategories
        category_ids = await get_category_ids_with_children(category_id, db)
        query = query.where(Product.category_id.in_(category_ids))

    if search:
        query = query.where(Product.title.ilike(f"%{search}%"))

    if min_price is not None:
        query = query.where(Product.price >= min_price)

    if max_price is not None:
        query = query.where(Product.price <= max_price)

    # Apply sorting
    if sort_by == "commission":
        # Sort by commission amount (highest first)
        query = query.order_by(desc(Product.referral_commission_percent))
    elif sort_by == "price":
        query = query.order_by(Product.price)
    else:  # created or default
        query = query.order_by(desc(Product.created_at))

    # Count total before pagination
    count_query = select(func.count()).select_from(Product).where(
        Product.status == "active",
        Product.is_referral_enabled == True
    )

    if category_id:
        # Use same category_ids list for count query
        count_query = count_query.where(Product.category_id.in_(category_ids))
    if search:
        count_query = count_query.where(Product.title.ilike(f"%{search}%"))
    if min_price is not None:
        count_query = count_query.where(Product.price >= min_price)
    if max_price is not None:
        count_query = count_query.where(Product.price <= max_price)

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # Pagination
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    products_list = result.scalars().all()

    return {
        "items": [
            {
                "id": str(p.id),
                "seller_id": str(p.seller_id),
                "title": p.title,
                "price": float(p.price),
                "discount_price": float(p.discount_price) if p.discount_price else None,
                "discount_percent": p.discount_percent,
                "images": p.images or [],
                "is_promoted": getattr(p, 'promotion_views_remaining', 0) > 0,
                "is_referral_enabled": p.is_referral_enabled,
                "referral_commission_percent": float(p.referral_commission_percent) if p.referral_commission_percent else None,
                "referral_commission_amount": float(p.referral_commission_amount) if p.referral_commission_amount else None
            }
            for p in products_list
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.post("/", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new product

    Checks:
    - User tariff limit for number of products
    - Title length (max 100 characters)
    - Partner percent only for Business tariff
    """
    # Check tariff limit
    count_result = await db.execute(
        select(func.count())
        .select_from(Product)
        .where(
            Product.seller_id == current_user.id,
            Product.status.in_(["active", "moderation"])
        )
    )
    current_products_count = count_result.scalar()
    tariff_limit = TARIFF_LIMITS.get(current_user.tariff, 10)

    if current_products_count >= tariff_limit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Product limit reached for {current_user.tariff} tariff ({tariff_limit} products)"
        )

    # Validate title length
    if len(product_data.title) > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Title must be less than 100 characters"
        )

    # Validate referral program (only for Business tariff)
    if product_data.is_referral_enabled:
        if current_user.tariff != "business":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Product referral program is only available for Business tariff"
            )
        if not product_data.referral_commission_percent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Referral commission percent is required when referral program is enabled"
            )
        if product_data.referral_commission_percent < 1 or product_data.referral_commission_percent > 50:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Referral commission percent must be between 1 and 50"
            )

    # Create product
    product = Product(
        seller_id=current_user.id,
        title=product_data.title,
        description=product_data.description,
        category_id=product_data.category_id,
        price=product_data.price,
        discount_price=product_data.discount_price,
        product_type=product_data.product_type or "product",
        delivery_type=product_data.delivery_type,
        delivery_methods=product_data.delivery_methods,
        characteristics=product_data.characteristics,
        images=product_data.images,
        status="moderation",  # Will go through moderation
        is_referral_enabled=product_data.is_referral_enabled if current_user.tariff == "business" else False,
        referral_commission_percent=product_data.referral_commission_percent if (current_user.tariff == "business" and product_data.is_referral_enabled) else None
    )

    db.add(product)
    await db.commit()
    await db.refresh(product)

    return ProductResponse(
        id=str(product.id),
        seller_id=str(product.seller_id),
        title=product.title,
        description=product.description,
        category_id=product.category_id,
        price=product.price,
        discount_price=product.discount_price,
        discount_percent=product.discount_percent,
        delivery_type=product.delivery_type,
        delivery_methods=product.delivery_methods,
        characteristics=product.characteristics,
        images=product.images,
        status=product.status,
        is_promoted=product.is_promoted,
        promotion_views_total=product.promotion_views_total,
        promotion_views_remaining=product.promotion_views_remaining,
        promotion_started_at=product.promotion_started_at,
        views_count=product.views_count,
        created_at=product.created_at,
        updated_at=product.updated_at,
        is_referral_enabled=product.is_referral_enabled,
        referral_commission_percent=product.referral_commission_percent,
        referral_commission_amount=product.referral_commission_amount
    )


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID,
    product_data: ProductUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update product (only owner can update)
    """
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check ownership - convert to string for safe comparison
    if str(product.seller_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own products"
        )

    # Update fields
    if product_data.title is not None:
        if len(product_data.title) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Title must be less than 100 characters"
            )
        product.title = product_data.title

    if product_data.description is not None:
        product.description = product_data.description
    if product_data.category_id is not None:
        product.category_id = product_data.category_id
    if product_data.price is not None:
        product.price = product_data.price
    if product_data.discount_price is not None:
        product.discount_price = product_data.discount_price
    if product_data.product_type is not None:
        if product_data.product_type not in ["product", "service"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Product type must be 'product' or 'service'"
            )
        product.product_type = product_data.product_type
    if product_data.delivery_type is not None:
        product.delivery_type = product_data.delivery_type
    if product_data.delivery_methods is not None:
        product.delivery_methods = product_data.delivery_methods
    if product_data.characteristics is not None:
        product.characteristics = product_data.characteristics
    if product_data.images is not None:
        product.images = product_data.images

    # Referral program fields
    if product_data.is_referral_enabled is not None:
        if product_data.is_referral_enabled and current_user.tariff != "business":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Product referral program is only available for Business tariff"
            )
        product.is_referral_enabled = product_data.is_referral_enabled

    if product_data.referral_commission_percent is not None:
        if product.is_referral_enabled:
            if product_data.referral_commission_percent < 1 or product_data.referral_commission_percent > 50:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Referral commission percent must be between 1 and 50"
                )
            product.referral_commission_percent = product_data.referral_commission_percent
        else:
            product.referral_commission_percent = None

    await db.commit()
    await db.refresh(product)

    return ProductResponse(
        id=str(product.id),
        seller_id=str(product.seller_id),
        title=product.title,
        description=product.description,
        category_id=product.category_id,
        price=product.price,
        discount_price=product.discount_price,
        discount_percent=product.discount_percent,
        delivery_type=product.delivery_type,
        delivery_methods=product.delivery_methods,
        characteristics=product.characteristics,
        images=product.images,
        status=product.status,
        is_promoted=product.is_promoted,
        promotion_views_total=product.promotion_views_total,
        promotion_views_remaining=product.promotion_views_remaining,
        promotion_started_at=product.promotion_started_at,
        views_count=product.views_count,
        created_at=product.created_at,
        updated_at=product.updated_at,
        is_referral_enabled=product.is_referral_enabled,
        referral_commission_percent=product.referral_commission_percent,
        referral_commission_amount=product.referral_commission_amount
    )


@router.delete("/{product_id}")
async def delete_product(
    product_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete product (only owner can delete)
    """
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check ownership - convert to string for safe comparison
    if str(product.seller_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own products"
        )

    await db.delete(product)
    await db.commit()

    return {"message": "Product deleted successfully"}


@router.get("/promotion/packages")
async def get_promotion_packages(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get available promotion packages with pricing for current user's tariff
    """
    packages = []
    for views, base_price in PROMOTION_PACKAGES.items():
        price = get_promotion_price(views, current_user.tariff)
        packages.append({
            "views": views,
            "price": float(price),
            "price_per_view": float(price / views) if views > 0 else 0
        })

    return {
        "tariff": current_user.tariff,
        "packages": packages
    }


@router.post("/{product_id}/promote")
async def promote_product(
    product_id: UUID,
    views: int,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Promote product by purchasing promotion views

    Available packages:
    - 0 views: 0 som (free)
    - 500 views: 10 som (FREE) / 6.67 som (PRO) / 5 som (BUSINESS)
    - 1000 views: 20 som (FREE) / 13.33 som (PRO) / 10 som (BUSINESS)
    - 1500 views: 30 som (FREE) / 20 som (PRO) / 15 som (BUSINESS)
    - ... up to 5000 views

    Promoted products appear higher in search results.
    One view is deducted each time the product is shown in search/listing.
    """
    # Validate views package
    if views not in PROMOTION_PACKAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid views package. Available: {list(PROMOTION_PACKAGES.keys())}"
        )

    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Check ownership
    if str(product.seller_id) != str(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only promote your own products"
        )

    # Calculate price based on tariff
    promotion_price = get_promotion_price(views, current_user.tariff)

    # Skip wallet operations if free package
    if views == 0:
        return {
            "message": "Free package selected",
            "product_id": str(product.id),
            "views_added": 0,
            "amount_paid": 0
        }

    # Get wallet
    wallet_result = await db.execute(
        select(Wallet).where(Wallet.user_id == current_user.id)
    )
    wallet = wallet_result.scalar_one_or_none()

    if not wallet or wallet.main_balance < promotion_price:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Insufficient balance. Required: {float(promotion_price)} KGS"
        )

    # Deduct from wallet
    wallet.main_balance -= promotion_price

    # Update product promotion stats
    product.promotion_views_total += views
    product.promotion_views_remaining += views
    if not product.promotion_started_at:
        product.promotion_started_at = datetime.utcnow()

    # Create transaction
    transaction = Transaction(
        user_id=current_user.id,
        type="promotion",
        amount=promotion_price,
        balance_type="main",
        description=f"Продвижение товара '{product.title}' ({views} просмотров)",
        reference_id=product.id,
        status="completed"
    )
    db.add(transaction)

    await db.commit()

    return {
        "message": "Product promotion purchased successfully",
        "product_id": str(product.id),
        "views_added": views,
        "views_remaining": product.promotion_views_remaining,
        "amount_paid": float(promotion_price)
    }


@router.get("/my-products")
async def get_my_products(
    status_filter: Optional[str] = Query(None, description="active, inactive, moderation"),
    limit: int = Query(30, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get current user's products
    """
    query = select(Product).where(Product.seller_id == current_user.id)

    if status_filter:
        query = query.where(Product.status == status_filter)

    query = query.order_by(desc(Product.created_at)).limit(limit).offset(offset)

    result = await db.execute(query)
    products_list = result.scalars().all()

    # Count total
    count_result = await db.execute(
        select(func.count())
        .select_from(Product)
        .where(Product.seller_id == current_user.id)
    )
    total = count_result.scalar()

    return {
        "items": [
            ProductResponse(
                id=str(p.id),
                seller_id=str(p.seller_id),
                title=p.title,
                description=p.description,
                category_id=p.category_id,
                price=p.price,
                discount_price=p.discount_price,
                discount_percent=p.discount_percent,
                delivery_type=p.delivery_type,
                delivery_methods=p.delivery_methods,
                characteristics=p.characteristics,
                images=p.images,
                status=p.status,
                is_promoted=getattr(p, 'promotion_views_remaining', 0) > 0,
                promotion_views_total=getattr(p, 'promotion_views_total', 0),
                promotion_views_remaining=getattr(p, 'promotion_views_remaining', 0),
                promotion_started_at=getattr(p, 'promotion_started_at', None),
                views_count=p.views_count,
                created_at=p.created_at,
                updated_at=p.updated_at,
                is_referral_enabled=p.is_referral_enabled,
                referral_commission_percent=p.referral_commission_percent,
                referral_commission_amount=p.referral_commission_amount
            )
            for p in products_list
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
        "tariff_limit": TARIFF_LIMITS.get(current_user.tariff, 10)
    }


@router.get("/categories/")
async def get_categories(
    parent_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get product categories
    """
    query = select(Category).where(Category.is_active == True)

    if parent_id is not None:
        query = query.where(Category.parent_id == parent_id)
    else:
        query = query.where(Category.parent_id == None)

    query = query.order_by(Category.sort_order, Category.name)

    result = await db.execute(query)
    categories = result.scalars().all()

    return {
        "items": [
            {
                "id": c.id,
                "name": c.name,
                "slug": c.slug,
                "level": c.level,
                "icon": c.icon
            }
            for c in categories
        ]
    }


@router.get("/{product_id}")
async def get_product_by_id(
    product_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get product details by ID
    """
    result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = result.scalar_one_or_none()

    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    # Increment views
    product.views_count += 1
    await db.commit()

    return {
        "id": str(product.id),
        "title": product.title,
        "description": product.description,
        "price": float(product.price),
        "discount_price": float(product.discount_price) if product.discount_price else None,
        "discount_percent": product.discount_percent,
        "images": product.images or [],
        "characteristics": product.characteristics or [],
        "delivery_type": product.delivery_type,
        "delivery_methods": product.delivery_methods,
        "views_count": product.views_count,
        "created_at": product.created_at,
        "is_referral_enabled": product.is_referral_enabled,
        "referral_commission_percent": float(product.referral_commission_percent) if product.referral_commission_percent else None,
        "referral_commission_amount": float(product.referral_commission_amount) if product.referral_commission_amount else None
    }
