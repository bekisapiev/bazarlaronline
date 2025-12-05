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
    0: 0,       # Free
    500: 10,    # 500 views - 10 som
    1000: 20,   # 1000 views - 20 som
    2000: 40,   # 2000 views - 40 som
    3000: 60,   # 3000 views - 60 som
    4000: 80,   # 4000 views - 80 som
    5000: 100   # 5000 views - 100 som
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
    seller_id: Optional[UUID] = Query(None, description="Filter by seller ID"),
    seller_type: Optional[str] = Query(None, description="Filter by seller type (market, boutique, shop, etc)"),
    product_type: Optional[str] = Query(None, description="Filter by product type (product or service)"),
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
    - seller_id: Filter by seller user ID
    - seller_type: Filter by seller type (market, boutique, shop, office, home, mobile, warehouse)
    - product_type: Filter by product type (product or service)
    - search: Search in product titles
    - min_price/max_price: Filter by price range
    """
    from app.models.user import SellerProfile
    from sqlalchemy.orm import joinedload

    # LEFT JOIN with SellerProfile to include products from users without profile
    # Select both Product and SellerProfile (SellerProfile can be None)
    # Use joinedload to eagerly load city and market relationships
    query = select(Product, SellerProfile).outerjoin(
        SellerProfile,
        Product.seller_id == SellerProfile.user_id
    ).options(
        joinedload(SellerProfile.city),
        joinedload(SellerProfile.market)
    ).where(Product.status == "active")

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

    # Seller filters
    if seller_id:
        query = query.where(Product.seller_id == seller_id)

    if city_id:
        query = query.where(SellerProfile.city_id == city_id)

    if seller_type:
        query = query.where(SellerProfile.seller_type == seller_type)

    # Product type filter (product or service)
    if product_type:
        query = query.where(Product.product_type == product_type)

    # Order by promotion views remaining (promoted products first), then by created_at
    # Products with promotion_views_remaining > 0 appear first (in random order for fairness)
    # Then regular products sorted by newest first
    # Use COALESCE to handle NULL values safely
    query = query.order_by(
        desc(func.coalesce(Product.promotion_views_remaining, 0)),
        desc(Product.created_at)
    )

    # Count total before pagination - LEFT JOIN with SellerProfile
    count_query = select(func.count()).select_from(Product).outerjoin(
        SellerProfile,
        Product.seller_id == SellerProfile.user_id
    ).where(Product.status == "active")

    if category_id:
        # Use same category_ids list for count query
        count_query = count_query.where(Product.category_id.in_(category_ids))
    if search:
        count_query = count_query.where(Product.title.ilike(f"%{search}%"))
    if min_price is not None:
        count_query = count_query.where(Product.price >= min_price)
    if max_price is not None:
        count_query = count_query.where(Product.price <= max_price)
    if seller_id:
        count_query = count_query.where(Product.seller_id == seller_id)
    if city_id:
        count_query = count_query.where(SellerProfile.city_id == city_id)
    if seller_type:
        count_query = count_query.where(SellerProfile.seller_type == seller_type)
    if product_type:
        count_query = count_query.where(Product.product_type == product_type)

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # Pagination
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    products_with_sellers = result.all()  # Returns list of (Product, SellerProfile) tuples

    # Extract all data from products BEFORE any commit/detach
    # This avoids SQLAlchemy lazy loading issues
    products_data = []
    promoted_product_ids = []
    promoted_products_duplicates = {}  # Track how many times to show each promoted product

    for p, seller_profile in products_with_sellers:
        # Access all attributes while objects are still attached to session
        promotion_views = p.promotion_views_remaining or 0

        # Get city and market names (handle None seller_profile)
        city_name = None
        market_name = None
        if seller_profile:
            city_name = seller_profile.city.name if seller_profile.city else None
            market_name = seller_profile.market.name if seller_profile.market else None

        product_dict = {
            "id": str(p.id),
            "seller_id": str(p.seller_id),
            "product_type": p.product_type,
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
            "referral_commission_amount": float(p.referral_commission_amount) if p.referral_commission_amount else None,
            # Seller information (can be None if no profile exists)
            "seller": {
                "shop_name": seller_profile.shop_name if seller_profile else None,
                "seller_type": seller_profile.seller_type if seller_profile else None,
                "city_id": seller_profile.city_id if seller_profile else None,
                "city_name": city_name,
                "market_id": seller_profile.market_id if seller_profile else None,
                "market_name": market_name,
            }
        }

        products_data.append(product_dict)

        # For promoted products, add multiple appearances to consume views faster
        if promotion_views > 0:
            promoted_product_ids.append(p.id)
            # Calculate how many additional times to show this product (2-4 extra times)
            # More views remaining = more duplicates
            if promotion_views >= 100:
                extra_appearances = 4  # Show 5 times total (1 original + 4 duplicates)
            elif promotion_views >= 50:
                extra_appearances = 3  # Show 4 times total
            elif promotion_views >= 20:
                extra_appearances = 2  # Show 3 times total
            else:
                extra_appearances = 1  # Show 2 times total

            promoted_products_duplicates[p.id] = {
                "product_dict": product_dict,
                "extra_appearances": extra_appearances
            }

    # Insert duplicate promoted products at different positions
    # This helps promoted products gain views faster
    import random
    if promoted_products_duplicates:
        # Calculate positions to insert duplicates (spread them evenly)
        list_length = len(products_data)
        for product_id, duplicate_info in promoted_products_duplicates.items():
            extra_count = duplicate_info["extra_appearances"]
            product_dict = duplicate_info["product_dict"]

            # Insert duplicates at different positions
            # Spread them throughout the list for better visibility
            if list_length > 0:
                for i in range(extra_count):
                    # Calculate position: spread duplicates evenly
                    # Position = (i+1) * (list_length / (extra_count + 1))
                    insert_position = min(
                        int((i + 1) * (list_length / (extra_count + 1.5))),
                        len(products_data)
                    )
                    products_data.insert(insert_position, product_dict.copy())

    # Decrement promotion views for promoted products (they are being shown)
    # Each product is decremented by the number of times it appears in the result
    if promoted_products_duplicates:
        try:
            from sqlalchemy import update as sql_update
            # Update each promoted product individually based on how many times it appears
            for product_id, duplicate_info in promoted_products_duplicates.items():
                # Total appearances = 1 (original) + extra_appearances
                total_appearances = 1 + duplicate_info["extra_appearances"]

                await db.execute(
                    sql_update(Product)
                    .where(Product.id == product_id)
                    .where(func.coalesce(Product.promotion_views_remaining, 0) > 0)
                    .values(
                        promotion_views_remaining=func.greatest(
                            func.coalesce(Product.promotion_views_remaining, 0) - total_appearances,
                            0
                        )
                    )
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

    Only products from Business tariff users with commission >= 1% are shown.
    All users can view and share referral links for these products.
    """
    # Base query - only products with referral enabled, commission >= 1%, and seller has Business tariff
    query = select(Product).join(
        User, Product.seller_id == User.id
    ).where(
        Product.status == "active",
        Product.is_referral_enabled == True,
        Product.referral_commission_percent >= 1,
        User.tariff == "business"
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
    count_query = select(func.count()).select_from(Product).join(
        User, Product.seller_id == User.id
    ).where(
        Product.status == "active",
        Product.is_referral_enabled == True,
        Product.referral_commission_percent >= 1,
        User.tariff == "business"
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

        # Stock quantity is required for referral program
        if product_data.is_referral_enabled and product_data.product_type == "product" and not product_data.stock_quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Stock quantity is required when referral program is enabled for products"
            )

        # Check wallet balance for referral commission reserve
        if product_data.is_referral_enabled and product_data.product_type == "product" and product_data.stock_quantity:
            # Get wallet
            wallet_result = await db.execute(
                select(Wallet).where(Wallet.user_id == current_user.id)
            )
            wallet = wallet_result.scalar_one_or_none()

            if not wallet:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Wallet not found. Please contact support."
                )

            # Calculate total commission that needs to be reserved
            effective_price = product_data.discount_price if product_data.discount_price else product_data.price
            total_commission = (
                Decimal(str(product_data.stock_quantity)) *
                Decimal(str(effective_price)) *
                Decimal(str(product_data.referral_commission_percent)) /
                Decimal('100')
            )

            if wallet.main_balance < total_commission:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient balance for referral program. Required: {float(total_commission):.2f} KGS, Available: {float(wallet.main_balance):.2f} KGS"
                )

    # Create product
    product = Product(
        seller_id=current_user.id,
        title=product_data.title,
        description=product_data.description,
        category_id=product_data.category_id,
        price=product_data.price,
        discount_price=product_data.discount_price,
        stock_quantity=product_data.stock_quantity,
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
        stock_quantity=product.stock_quantity,
        purchase_price=product.purchase_price,
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
    if product_data.stock_quantity is not None:
        product.stock_quantity = product_data.stock_quantity
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

        # Check if enabling referral program
        if product_data.is_referral_enabled and not product.is_referral_enabled:
            # Stock quantity is required for products
            stock_qty = product_data.stock_quantity if product_data.stock_quantity is not None else product.stock_quantity
            if product.product_type == "product" and not stock_qty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Stock quantity is required when enabling referral program for products"
                )

            # Check wallet balance
            if product.product_type == "product" and stock_qty:
                # Get wallet
                wallet_result = await db.execute(
                    select(Wallet).where(Wallet.user_id == current_user.id)
                )
                wallet = wallet_result.scalar_one_or_none()

                if not wallet:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Wallet not found. Please contact support."
                    )

                # Calculate total commission
                effective_price = (
                    product_data.discount_price if product_data.discount_price is not None
                    else (product.discount_price if product.discount_price else product.price)
                )
                commission_percent = (
                    product_data.referral_commission_percent if product_data.referral_commission_percent is not None
                    else product.referral_commission_percent
                )

                if not commission_percent:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Referral commission percent is required when enabling referral program"
                    )

                total_commission = (
                    Decimal(str(stock_qty)) *
                    Decimal(str(effective_price)) *
                    Decimal(str(commission_percent)) /
                    Decimal('100')
                )

                if wallet.main_balance < total_commission:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"Insufficient balance for referral program. Required: {float(total_commission):.2f} KGS, Available: {float(wallet.main_balance):.2f} KGS"
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
        stock_quantity=product.stock_quantity,
        purchase_price=product.purchase_price,
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
    - 2000 views: 40 som (FREE) / 26.67 som (PRO) / 20 som (BUSINESS)
    - 3000 views: 60 som (FREE) / 40 som (PRO) / 30 som (BUSINESS)
    - 4000 views: 80 som (FREE) / 53.33 som (PRO) / 40 som (BUSINESS)
    - 5000 views: 100 som (FREE) / 66.67 som (PRO) / 50 som (BUSINESS)

    Promoted products appear multiple times on the main page to gain views faster:
    - Products with 100+ views remaining: shown 5 times per page load
    - Products with 50-99 views: shown 4 times per page load
    - Products with 20-49 views: shown 3 times per page load
    - Products with 1-19 views: shown 2 times per page load

    Views are deducted based on the number of appearances.
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
                stock_quantity=p.stock_quantity,
                purchase_price=p.purchase_price,
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
    Get product details by ID with full seller and category information
    """
    from app.models.user import User, SellerProfile
    from app.models.product import Category
    from sqlalchemy.orm import joinedload

    # Get product with seller info (LEFT JOIN for SellerProfile as it may not exist yet)
    result = await db.execute(
        select(Product, User).join(
            User, Product.seller_id == User.id
        ).options(
            joinedload(Product.category)
        ).where(Product.id == product_id)
    )
    row = result.first()

    if not row:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )

    product, user = row

    # Get seller profile separately (may not exist for new users)
    seller_profile_result = await db.execute(
        select(SellerProfile).options(
            joinedload(SellerProfile.city),
            joinedload(SellerProfile.market)
        ).where(SellerProfile.user_id == user.id)
    )
    seller_profile = seller_profile_result.scalar_one_or_none()

    # Get city and market names if seller profile exists
    city_name = None
    market_name = None
    if seller_profile:
        city_name = seller_profile.city.name if seller_profile.city else None
        market_name = seller_profile.market.name if seller_profile.market else None

    # Get category hierarchy BEFORE commit (while still in session)
    category_hierarchy = []
    if product.category_id:
        category = product.category
        category_hierarchy = []
        while category:
            category_hierarchy.insert(0, {
                "id": category.id,
                "name": category.name,
                "slug": category.slug
            })
            if category.parent_id:
                parent_result = await db.execute(
                    select(Category).where(Category.id == category.parent_id)
                )
                category = parent_result.scalar_one_or_none()
            else:
                category = None

    # Increment views
    product.views_count += 1
    await db.commit()

    return {
        "id": str(product.id),
        "seller_id": str(product.seller_id),
        "product_type": product.product_type,
        "title": product.title,
        "description": product.description,
        "price": float(product.price),
        "discount_price": float(product.discount_price) if product.discount_price else None,
        "discount_percent": product.discount_percent,
        "stock_quantity": product.stock_quantity,
        "images": product.images or [],
        "characteristics": product.characteristics or [],
        "delivery_type": product.delivery_type,
        "delivery_methods": product.delivery_methods,
        "views_count": product.views_count,
        "created_at": product.created_at,
        "status": product.status,
        "category_id": product.category_id,
        "promotion_views_remaining": product.promotion_views_remaining or 0,
        "promotion_views_total": product.promotion_views_total or 0,
        "is_promoted": product.is_promoted if product.is_promoted is not None else False,
        "is_referral_enabled": product.is_referral_enabled or False,
        "referral_commission_percent": float(product.referral_commission_percent) if product.referral_commission_percent else None,
        "referral_commission_amount": float(product.referral_commission_amount) if product.referral_commission_amount else None,
        # Category hierarchy
        "category": category_hierarchy,
        # Seller information
        "seller": {
            "id": str(user.id),
            "full_name": user.full_name,
            "avatar": user.avatar,
            "tariff": user.tariff,
            "shop_name": seller_profile.shop_name if seller_profile else None,
            "seller_type": seller_profile.seller_type if seller_profile else None,
            "city_id": seller_profile.city_id if seller_profile else None,
            "city_name": city_name,
            "market_id": seller_profile.market_id if seller_profile else None,
            "market_name": market_name,
            "address": seller_profile.address if seller_profile else None,
            "latitude": float(seller_profile.latitude) if (seller_profile and seller_profile.latitude) else None,
            "longitude": float(seller_profile.longitude) if (seller_profile and seller_profile.longitude) else None,
            "logo_url": seller_profile.logo_url if seller_profile else None,
            "rating": float(seller_profile.rating) if seller_profile else 0.0,
            "reviews_count": seller_profile.reviews_count if seller_profile else 0,
        }
    }


@router.get("/warehouse/statistics")
async def get_warehouse_statistics(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get warehouse statistics for Business tariff sellers
    
    Returns inventory and financial statistics including:
    - Total stock quantity and purchase cost
    - Revenue and projected revenue
    - Partner commissions
    - Profit calculations
    """
    # Only for Business tariff
    if current_user.tariff != "business":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Warehouse statistics are only available for Business tariff"
        )
    
    from app.models.order import Order
    from app.schemas.warehouse import WarehouseStatistics

    # Get all seller's products
    result = await db.execute(
        select(Product)
        .where(Product.seller_id == current_user.id)
        .where(Product.product_type == "product")  # Only products, not services
    )
    products = result.scalars().all()

    # Create a map of products for quick lookup
    product_map = {str(p.id): p for p in products}

    # Calculate warehouse statistics
    total_products_count = len(products)  # Количество позиций товаров
    total_stock_quantity = 0
    total_purchase_cost = Decimal('0')
    projected_revenue = Decimal('0')
    total_partner_commission = Decimal('0')  # Potential commission on stock

    for product in products:
        quantity = product.stock_quantity or 0
        purchase_price = product.purchase_price or Decimal('0')
        sale_price = product.discount_price or product.price

        total_stock_quantity += quantity
        total_purchase_cost += purchase_price * quantity
        projected_revenue += sale_price * quantity

        # Calculate potential partner commission
        if product.is_referral_enabled and product.referral_commission_percent:
            commission_per_item = sale_price * (product.referral_commission_percent / Decimal('100'))
            total_partner_commission += commission_per_item * quantity

    # Get sales statistics from completed orders
    result = await db.execute(
        select(Order)
        .where(Order.seller_id == current_user.id)
        .where(Order.status == "completed")
    )
    orders = result.scalars().all()

    total_revenue = Decimal('0')
    total_items_sold = 0
    paid_partner_commission = Decimal('0')
    cost_of_sold_goods = Decimal('0')

    # Process each order
    for order in orders:
        # items is a JSONB field containing array of {product_id, quantity, price, discount_price, ...}
        if not order.items:
            continue

        for item in order.items:
            product_id = item.get('product_id')
            if not product_id or product_id not in product_map:
                continue

            product = product_map[product_id]
            quantity_sold = item.get('quantity', 0)
            item_price = Decimal(str(item.get('discount_price') or item.get('price', 0)))

            total_items_sold += quantity_sold
            total_revenue += item_price * quantity_sold

            # Calculate cost of sold goods
            purchase_price = product.purchase_price or Decimal('0')
            cost_of_sold_goods += purchase_price * quantity_sold

            # Calculate actually paid partner commission
            # Partner gets 45% of the commission if there was a referrer
            if item.get('referrer_id'):
                if product.is_referral_enabled and product.referral_commission_percent:
                    commission_per_item = item_price * (product.referral_commission_percent / Decimal('100'))
                    partner_share = commission_per_item * Decimal('0.45')  # Partner gets 45%
                    paid_partner_commission += partner_share * quantity_sold

    # Calculate profit
    profit = total_revenue - cost_of_sold_goods - paid_partner_commission

    # Projected profit = projected_revenue - total_purchase_cost - total_partner_commission
    projected_profit = projected_revenue - total_purchase_cost - total_partner_commission
    
    return WarehouseStatistics(
        total_products_count=total_products_count,
        total_stock_quantity=total_stock_quantity,
        total_purchase_cost=total_purchase_cost,
        total_revenue=total_revenue,
        projected_revenue=projected_revenue,
        total_items_sold=total_items_sold,
        total_partner_commission=total_partner_commission,
        paid_partner_commission=paid_partner_commission,
        profit=profit,
        projected_profit=projected_profit
    )
