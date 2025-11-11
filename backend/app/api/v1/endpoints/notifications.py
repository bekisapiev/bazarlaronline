"""
Notification Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func, and_
from typing import Optional
from uuid import UUID
from datetime import datetime

from app.database.session import get_db
from app.models.notification import Notification
from app.models.user import User
from app.core.dependencies import get_current_active_user
from pydantic import BaseModel, Field

router = APIRouter()


# Schemas
class NotificationCreate(BaseModel):
    """Notification creation schema (internal use)"""
    user_id: str
    type: str = Field(..., description="Type: order, review, moderation, system, wallet")
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)
    data: Optional[dict] = None


class NotificationResponse(BaseModel):
    """Notification response schema"""
    id: str
    type: str
    title: str
    message: str
    data: Optional[dict]
    is_read: bool
    read_at: Optional[datetime]
    created_at: datetime


# Helper function to create notification
async def create_notification(
    db: AsyncSession,
    user_id: UUID,
    type: str,
    title: str,
    message: str,
    data: Optional[dict] = None
):
    """
    Helper function to create a notification

    This can be called from other endpoints when events occur
    """
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        data=data
    )
    db.add(notification)
    await db.commit()
    await db.refresh(notification)
    return notification


@router.get("/")
async def get_notifications(
    limit: int = Query(30, le=100),
    offset: int = 0,
    type: Optional[str] = Query(None, description="Filter by type"),
    is_read: Optional[bool] = Query(None, description="Filter by read status"),
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user notifications with filters

    Returns paginated list of notifications for current user
    """
    query = select(Notification).where(Notification.user_id == current_user.id)

    # Apply filters
    if type:
        query = query.where(Notification.type == type)

    if is_read is not None:
        query = query.where(Notification.is_read == is_read)

    # Order by created_at desc (newest first)
    query = query.order_by(desc(Notification.created_at))

    # Count total
    count_query = select(func.count()).select_from(Notification).where(
        Notification.user_id == current_user.id
    )
    if type:
        count_query = count_query.where(Notification.type == type)
    if is_read is not None:
        count_query = count_query.where(Notification.is_read == is_read)

    count_result = await db.execute(count_query)
    total = count_result.scalar()

    # Pagination
    query = query.limit(limit).offset(offset)

    result = await db.execute(query)
    notifications = result.scalars().all()

    return {
        "items": [
            NotificationResponse(
                id=str(n.id),
                type=n.type,
                title=n.title,
                message=n.message,
                data=n.data,
                is_read=n.is_read,
                read_at=n.read_at,
                created_at=n.created_at
            )
            for n in notifications
        ],
        "total": total,
        "limit": limit,
        "offset": offset,
        "has_more": (offset + limit) < total
    }


@router.get("/unread/count")
async def get_unread_count(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get count of unread notifications for current user

    Useful for badge display in UI
    """
    result = await db.execute(
        select(func.count())
        .select_from(Notification)
        .where(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    )
    count = result.scalar()

    return {
        "unread_count": count or 0
    }


@router.get("/{notification_id}")
async def get_notification(
    notification_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get specific notification by ID
    """
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalar_one_or_none()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    return NotificationResponse(
        id=str(notification.id),
        type=notification.type,
        title=notification.title,
        message=notification.message,
        data=notification.data,
        is_read=notification.is_read,
        read_at=notification.read_at,
        created_at=notification.created_at
    )


@router.put("/{notification_id}/read")
async def mark_as_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark notification as read
    """
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalar_one_or_none()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        await db.commit()

    return {
        "message": "Notification marked as read",
        "notification_id": str(notification_id)
    }


@router.put("/read-all")
async def mark_all_as_read(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark all notifications as read for current user
    """
    result = await db.execute(
        select(Notification).where(
            Notification.user_id == current_user.id,
            Notification.is_read == False
        )
    )
    notifications = result.scalars().all()

    count = 0
    for notification in notifications:
        notification.is_read = True
        notification.read_at = datetime.utcnow()
        count += 1

    await db.commit()

    return {
        "message": f"Marked {count} notifications as read",
        "count": count
    }


@router.delete("/{notification_id}")
async def delete_notification(
    notification_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete notification
    """
    result = await db.execute(
        select(Notification).where(
            Notification.id == notification_id,
            Notification.user_id == current_user.id
        )
    )
    notification = result.scalar_one_or_none()

    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )

    await db.delete(notification)
    await db.commit()

    return {
        "message": "Notification deleted successfully",
        "notification_id": str(notification_id)
    }


@router.delete("/")
async def delete_all_notifications(
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete all notifications for current user
    """
    result = await db.execute(
        select(Notification).where(Notification.user_id == current_user.id)
    )
    notifications = result.scalars().all()

    count = len(notifications)
    for notification in notifications:
        await db.delete(notification)

    await db.commit()

    return {
        "message": f"Deleted {count} notifications",
        "count": count
    }
