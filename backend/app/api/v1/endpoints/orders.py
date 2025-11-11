"""
Order Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.database.session import get_db
from app.models.order import Order

router = APIRouter()


@router.get("/")
async def get_orders(
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of orders for current user
    """
    # TODO: Implement with authentication
    return {
        "message": "Get orders - not implemented yet"
    }


@router.get("/{order_id}")
async def get_order_by_id(
    order_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Get order details by ID
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

    return {
        "id": str(order.id),
        "order_number": order.order_number,
        "total_amount": float(order.total_amount),
        "status": order.status,
        "items": order.items,
        "created_at": order.created_at
    }


@router.post("/")
async def create_order(
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new order
    """
    # TODO: Implement order creation
    return {
        "message": "Create order - not implemented yet"
    }


@router.put("/{order_id}/status")
async def update_order_status(
    order_id: UUID,
    status: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Update order status
    """
    # TODO: Implement order status update
    return {
        "message": "Update order status - not implemented yet"
    }
