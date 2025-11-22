"""
Order Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_, func
from typing import Optional
from uuid import UUID
from decimal import Decimal
from datetime import datetime

from app.database.session import get_db
from app.models.order import Order
from app.models.product import Product
from app.models.user import User
from app.models.wallet import Wallet, Transaction
from app.core.dependencies import get_current_active_user
from app.schemas.order import OrderCreate, OrderStatusUpdate, OrderResponse

router = APIRouter()


@router.post("/", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new order

    Process:
    1. Validate all products exist and belong to seller
    2. Calculate total amount
    3. Process payment (wallet or mbank)
    4. Calculate and distribute partner commission if applicable
    5. Create order and transaction records
    """
    if not order_data.items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order must contain at least one item"
        )

    # Validate seller exists
    seller_result = await db.execute(
        select(User).where(User.id == UUID(order_data.seller_id))
    )
    seller = seller_result.scalar_one_or_none()
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Seller not found"
        )

    # Validate products and calculate total
    total_amount = Decimal(0)
    order_items = []
    partner_percent = Decimal(0)

    for item in order_data.items:
        product_result = await db.execute(
            select(Product).where(Product.id == UUID(item.product_id))
        )
        product = product_result.scalar_one_or_none()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {item.product_id} not found"
            )

        if str(product.seller_id) != order_data.seller_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {item.product_id} does not belong to seller"
            )

        if product.status != "active":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product {product.title} is not available"
            )

        # Use discount price if available, otherwise regular price
        item_price = item.discount_price if item.discount_price else item.price
        total_amount += item_price * item.quantity

        # Store partner percent from product
        if product.partner_percent and product.partner_percent > partner_percent:
            partner_percent = product.partner_percent

        order_items.append({
            "product_id": str(product.id),
            "product_title": product.title,
            "quantity": item.quantity,
            "price": float(item.price),
            "discount_price": float(item.discount_price) if item.discount_price else None
        })

    # Process referral commission
    referral_user_id = None
    referral_commission = Decimal(0)
    platform_commission = Decimal(0)

    if order_data.referral_code and partner_percent > 0:
        # Find referral user by referral_id
        referral_result = await db.execute(
            select(User).where(User.referral_id == order_data.referral_code)
        )
        referral_user = referral_result.scalar_one_or_none()

        if referral_user:
            referral_user_id = referral_user.id
            # Calculate commission: partner gets partner_percent, platform gets rest
            referral_commission = (total_amount * partner_percent) / 100
            platform_commission = total_amount - referral_commission

    # Create order first
    order = Order(
        order_number=Order.generate_order_number(),
        buyer_id=current_user.id,
        seller_id=UUID(order_data.seller_id),
        items=order_items,
        total_amount=total_amount,
        delivery_address=order_data.delivery_address,
        phone_number=order_data.phone_number,
        payment_method=order_data.payment_method,
        status="pending" if order_data.payment_method == "mbank" else "processing",
        referral_id=referral_user_id,
        referral_commission=referral_commission if referral_commission > 0 else None,
        platform_commission=platform_commission if platform_commission > 0 else None,
        # Service booking fields
        is_service=order_data.is_service,
        booking_date=order_data.booking_date,
        booking_time=order_data.booking_time,
        comment=order_data.comment
    )

    db.add(order)
    await db.flush()  # Flush to get order.id

    # Process payment
    if order_data.payment_method == "wallet":
        # Check wallet balance
        wallet_result = await db.execute(
            select(Wallet).where(Wallet.user_id == current_user.id)
        )
        wallet = wallet_result.scalar_one_or_none()

        if not wallet or wallet.main_balance < total_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient balance. Required: {total_amount} KGS"
            )

        # Deduct from buyer's wallet
        wallet.main_balance -= total_amount

        # Create buyer transaction
        buyer_transaction = Transaction(
            user_id=current_user.id,
            type="order_payment",
            amount=total_amount,
            balance_type="main",
            description=f"Оплата заказа {order.order_number}",
            reference_id=order.id,
            status="completed"
        )
        db.add(buyer_transaction)

        # Credit seller's wallet
        seller_wallet_result = await db.execute(
            select(Wallet).where(Wallet.user_id == seller.id)
        )
        seller_wallet = seller_wallet_result.scalar_one_or_none()

        if not seller_wallet:
            seller_wallet = Wallet(user_id=seller.id)
            db.add(seller_wallet)
            await db.flush()

        # Seller gets full amount minus commissions
        seller_amount = total_amount - referral_commission - platform_commission
        seller_wallet.main_balance += seller_amount

        # Create seller transaction
        seller_transaction = Transaction(
            user_id=seller.id,
            type="order_received",
            amount=seller_amount,
            balance_type="main",
            description=f"Получен платеж за заказ {order.order_number}",
            reference_id=order.id,
            status="completed"
        )
        db.add(seller_transaction)

        # If referral commission exists, credit to referral user
        if referral_commission > 0 and referral_user_id:
            referral_wallet_result = await db.execute(
                select(Wallet).where(Wallet.user_id == referral_user_id)
            )
            referral_wallet = referral_wallet_result.scalar_one_or_none()

            if not referral_wallet:
                referral_wallet = Wallet(user_id=referral_user_id)
                db.add(referral_wallet)
                await db.flush()

            # Partner commission goes to referral_balance (can be withdrawn)
            referral_wallet.referral_balance += referral_commission

            # Create referral transaction
            referral_transaction = Transaction(
                user_id=referral_user_id,
                type="referral_commission",
                amount=referral_commission,
                balance_type="referral",
                description=f"Партнерская комиссия от заказа {order.order_number}",
                reference_id=order.id,
                status="completed"
            )
            db.add(referral_transaction)

    await db.commit()
    await db.refresh(order)

    return OrderResponse(
        id=str(order.id),
        order_number=order.order_number,
        buyer_id=str(order.buyer_id),
        seller_id=str(order.seller_id),
        items=order.items,
        total_amount=order.total_amount,
        delivery_address=order.delivery_address,
        phone_number=order.phone_number,
        payment_method=order.payment_method,
        status=order.status,
        referral_id=str(order.referral_id) if order.referral_id else None,
        referral_commission=order.referral_commission,
        platform_commission=order.platform_commission,
        is_service=order.is_service,
        booking_date=order.booking_date,
        booking_time=order.booking_time,
        comment=order.comment,
        created_at=order.created_at,
        updated_at=order.updated_at
    )


@router.get("/")
async def get_orders(
    role: Optional[str] = Query(None, description="buyer or seller"),
    status_filter: Optional[str] = Query(None, description="pending, processing, completed, cancelled"),
    limit: int = Query(30, le=100),
    offset: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of orders for current user

    Can filter by role (as buyer or seller) and by status
    """
    # Build query based on role
    if role == "buyer":
        query = select(Order).where(Order.buyer_id == current_user.id)
    elif role == "seller":
        query = select(Order).where(Order.seller_id == current_user.id)
    else:
        # Get all orders where user is buyer or seller
        query = select(Order).where(
            or_(
                Order.buyer_id == current_user.id,
                Order.seller_id == current_user.id
            )
        )

    # Apply status filter
    if status_filter:
        query = query.where(Order.status == status_filter)

    # Order by created_at desc
    query = query.order_by(desc(Order.created_at)).limit(limit).offset(offset)

    result = await db.execute(query)
    orders = result.scalars().all()

    # Count total
    count_query = select(func.count()).select_from(Order)
    if role == "buyer":
        count_query = count_query.where(Order.buyer_id == current_user.id)
    elif role == "seller":
        count_query = count_query.where(Order.seller_id == current_user.id)
    else:
        count_query = count_query.where(
            or_(
                Order.buyer_id == current_user.id,
                Order.seller_id == current_user.id
            )
        )

    if status_filter:
        count_query = count_query.where(Order.status == status_filter)

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    return {
        "items": [
            OrderResponse(
                id=str(o.id),
                order_number=o.order_number,
                buyer_id=str(o.buyer_id),
                seller_id=str(o.seller_id),
                items=o.items,
                total_amount=o.total_amount,
                delivery_address=o.delivery_address,
                phone_number=o.phone_number,
                payment_method=o.payment_method,
                status=o.status,
                referral_id=str(o.referral_id) if o.referral_id else None,
                referral_commission=o.referral_commission,
                platform_commission=o.platform_commission,
                is_service=o.is_service,
                booking_date=o.booking_date,
                booking_time=o.booking_time,
                comment=o.comment,
                created_at=o.created_at,
                updated_at=o.updated_at
            )
            for o in orders
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order_by_id(
    order_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get order details by ID

    Only buyer or seller can view the order
    """
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Check permission - only buyer or seller can view
    if order.buyer_id != current_user.id and order.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this order"
        )

    return OrderResponse(
        id=str(order.id),
        order_number=order.order_number,
        buyer_id=str(order.buyer_id),
        seller_id=str(order.seller_id),
        items=order.items,
        total_amount=order.total_amount,
        delivery_address=order.delivery_address,
        phone_number=order.phone_number,
        payment_method=order.payment_method,
        status=order.status,
        referral_id=str(order.referral_id) if order.referral_id else None,
        referral_commission=order.referral_commission,
        platform_commission=order.platform_commission,
        is_service=order.is_service,
        booking_date=order.booking_date,
        booking_time=order.booking_time,
        comment=order.comment,
        created_at=order.created_at,
        updated_at=order.updated_at
    )


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: UUID,
    status_data: OrderStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update order status

    Only seller can update order status
    Valid statuses: pending, processing, completed, cancelled
    """
    valid_statuses = ["pending", "processing", "completed", "cancelled"]
    if status_data.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}"
        )

    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    order = result.scalar_one_or_none()

    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )

    # Only seller can update status
    if order.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only seller can update order status"
        )

    # Update status
    order.status = status_data.status
    order.updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(order)

    return OrderResponse(
        id=str(order.id),
        order_number=order.order_number,
        buyer_id=str(order.buyer_id),
        seller_id=str(order.seller_id),
        items=order.items,
        total_amount=order.total_amount,
        delivery_address=order.delivery_address,
        phone_number=order.phone_number,
        payment_method=order.payment_method,
        status=order.status,
        referral_id=str(order.referral_id) if order.referral_id else None,
        referral_commission=order.referral_commission,
        platform_commission=order.platform_commission,
        is_service=order.is_service,
        booking_date=order.booking_date,
        booking_time=order.booking_time,
        comment=order.comment,
        created_at=order.created_at,
        updated_at=order.updated_at
    )
