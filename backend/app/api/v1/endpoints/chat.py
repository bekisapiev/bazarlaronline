"""
Chat Endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.database.session import get_db
from app.models.chat import Chat, Message

router = APIRouter()


@router.get("/conversations")
async def get_conversations(
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of chat conversations for current user
    """
    # TODO: Implement with authentication
    return {
        "message": "Get conversations - not implemented yet"
    }


@router.get("/{chat_id}/messages")
async def get_messages(
    chat_id: UUID,
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """
    Get messages in a chat
    """
    result = await db.execute(
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
        .offset(offset)
    )
    messages = result.scalars().all()

    return {
        "items": [
            {
                "id": str(m.id),
                "sender_id": str(m.sender_id),
                "text": m.text,
                "is_read": m.is_read,
                "created_at": m.created_at
            }
            for m in reversed(messages)
        ]
    }


@router.post("/send")
async def send_message(
    db: AsyncSession = Depends(get_db)
):
    """
    Send a message
    """
    # TODO: Implement message sending with WebSocket
    return {
        "message": "Send message - not implemented yet"
    }


@router.put("/{message_id}/read")
async def mark_message_read(
    message_id: UUID,
    db: AsyncSession = Depends(get_db)
):
    """
    Mark message as read
    """
    result = await db.execute(
        select(Message).where(Message.id == message_id)
    )
    message = result.scalar_one_or_none()

    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )

    message.is_read = True
    await db.commit()

    return {"status": "success"}
