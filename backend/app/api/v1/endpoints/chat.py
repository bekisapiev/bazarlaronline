"""
Chat Endpoints with WebSocket Support
"""
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_, and_, func
from typing import Optional, Dict, List
from uuid import UUID
from datetime import datetime
import json

from app.database.session import get_db
from app.models.chat import Chat, Message
from app.models.user import User
from app.models.product import Product
from app.core.dependencies import get_current_active_user
from app.schemas.chat import (
    ChatCreateRequest,
    ChatResponse,
    MessageCreate,
    MessageResponse,
    ConversationResponse
)

router = APIRouter()

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        # Store active connections: {user_id: websocket}
        self.active_connections: Dict[str, WebSocket] = {}

    async def connect(self, user_id: str, websocket: WebSocket):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]

    async def send_message_to_user(self, user_id: str, message: dict):
        if user_id in self.active_connections:
            try:
                await self.active_connections[user_id].send_json(message)
            except:
                self.disconnect(user_id)

manager = ConnectionManager()


@router.post("/", response_model=ChatResponse)
async def create_or_get_chat(
    chat_request: ChatCreateRequest,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new chat or get existing one between two users

    If chat already exists between the users (and optionally for the same product),
    returns the existing chat. Otherwise creates a new one.
    """
    participant_id = UUID(chat_request.participant_id)

    # Validate participant exists
    participant_result = await db.execute(
        select(User).where(User.id == participant_id)
    )
    participant = participant_result.scalar_one_or_none()
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Participant not found"
        )

    # Check if product exists (if provided)
    product_id = None
    if chat_request.product_id:
        product_id = UUID(chat_request.product_id)
        product_result = await db.execute(
            select(Product).where(Product.id == product_id)
        )
        product = product_result.scalar_one_or_none()
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Product not found"
            )

    # Try to find existing chat
    existing_chat_result = await db.execute(
        select(Chat).where(
            or_(
                and_(
                    Chat.participant1_id == current_user.id,
                    Chat.participant2_id == participant_id
                ),
                and_(
                    Chat.participant1_id == participant_id,
                    Chat.participant2_id == current_user.id
                )
            ),
            Chat.product_id == product_id if product_id else Chat.product_id.is_(None)
        )
    )
    existing_chat = existing_chat_result.scalar_one_or_none()

    if existing_chat:
        return ChatResponse(
            id=str(existing_chat.id),
            participant1_id=str(existing_chat.participant1_id),
            participant2_id=str(existing_chat.participant2_id),
            product_id=str(existing_chat.product_id) if existing_chat.product_id else None,
            last_message_at=existing_chat.last_message_at,
            created_at=existing_chat.created_at
        )

    # Create new chat
    new_chat = Chat(
        participant1_id=current_user.id,
        participant2_id=participant_id,
        product_id=product_id
    )
    db.add(new_chat)
    await db.flush()

    # If initial message provided, create it
    if chat_request.initial_message:
        initial_msg = Message(
            chat_id=new_chat.id,
            sender_id=current_user.id,
            text=chat_request.initial_message
        )
        db.add(initial_msg)
        new_chat.last_message_at = datetime.utcnow()

    await db.commit()
    await db.refresh(new_chat)

    return ChatResponse(
        id=str(new_chat.id),
        participant1_id=str(new_chat.participant1_id),
        participant2_id=str(new_chat.participant2_id),
        product_id=str(new_chat.product_id) if new_chat.product_id else None,
        last_message_at=new_chat.last_message_at,
        created_at=new_chat.created_at
    )


@router.get("/conversations")
async def get_conversations(
    limit: int = Query(50, le=100),
    offset: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get list of chat conversations for current user

    Returns conversations ordered by last_message_at
    """
    # Get chats where user is participant
    result = await db.execute(
        select(Chat)
        .where(
            or_(
                Chat.participant1_id == current_user.id,
                Chat.participant2_id == current_user.id
            )
        )
        .order_by(desc(Chat.last_message_at))
        .limit(limit)
        .offset(offset)
    )
    chats = result.scalars().all()

    conversations = []
    for chat in chats:
        # Determine the other participant
        other_user_id = chat.participant2_id if chat.participant1_id == current_user.id else chat.participant1_id

        # Get other user info
        user_result = await db.execute(
            select(User).where(User.id == other_user_id)
        )
        other_user = user_result.scalar_one_or_none()

        # Get product info if exists
        product_title = None
        if chat.product_id:
            product_result = await db.execute(
                select(Product).where(Product.id == chat.product_id)
            )
            product = product_result.scalar_one_or_none()
            if product:
                product_title = product.title

        # Get last message
        last_msg_result = await db.execute(
            select(Message)
            .where(Message.chat_id == chat.id)
            .order_by(desc(Message.created_at))
            .limit(1)
        )
        last_message = last_msg_result.scalar_one_or_none()

        # Count unread messages
        unread_result = await db.execute(
            select(func.count())
            .select_from(Message)
            .where(
                Message.chat_id == chat.id,
                Message.sender_id != current_user.id,
                Message.is_read == False
            )
        )
        unread_count = unread_result.scalar()

        conversations.append(
            ConversationResponse(
                chat_id=str(chat.id),
                other_user_id=str(other_user_id),
                other_user_name=other_user.full_name if other_user else None,
                other_user_email=other_user.email if other_user else "",
                product_id=str(chat.product_id) if chat.product_id else None,
                product_title=product_title,
                last_message_text=last_message.text if last_message else None,
                last_message_at=chat.last_message_at,
                unread_count=unread_count or 0
            )
        )

    return {
        "items": conversations,
        "total": len(conversations),
        "limit": limit,
        "offset": offset
    }


@router.get("/{chat_id}/messages")
async def get_messages(
    chat_id: UUID,
    limit: int = Query(50, le=100),
    offset: int = 0,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get messages in a chat

    Only participants can view messages
    """
    # Verify user is participant
    chat_result = await db.execute(
        select(Chat).where(Chat.id == chat_id)
    )
    chat = chat_result.scalar_one_or_none()

    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )

    if chat.participant1_id != current_user.id and chat.participant2_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this chat"
        )

    # Get messages
    result = await db.execute(
        select(Message)
        .where(Message.chat_id == chat_id)
        .order_by(desc(Message.created_at))
        .limit(limit)
        .offset(offset)
    )
    messages = result.scalars().all()

    return {
        "items": [
            MessageResponse(
                id=str(m.id),
                chat_id=str(m.chat_id),
                sender_id=str(m.sender_id),
                text=m.text,
                is_read=m.is_read,
                created_at=m.created_at
            )
            for m in reversed(messages)
        ],
        "total": len(messages),
        "limit": limit,
        "offset": offset
    }


@router.post("/messages", response_model=MessageResponse)
async def send_message(
    message_data: MessageCreate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Send a message (REST endpoint)

    Also works with WebSocket for real-time delivery
    """
    chat_id = UUID(message_data.chat_id)

    # Verify chat exists and user is participant
    chat_result = await db.execute(
        select(Chat).where(Chat.id == chat_id)
    )
    chat = chat_result.scalar_one_or_none()

    if not chat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat not found"
        )

    if chat.participant1_id != current_user.id and chat.participant2_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this chat"
        )

    # Create message
    message = Message(
        chat_id=chat_id,
        sender_id=current_user.id,
        text=message_data.text
    )
    db.add(message)

    # Update chat last_message_at
    chat.last_message_at = datetime.utcnow()

    await db.commit()
    await db.refresh(message)

    message_response = MessageResponse(
        id=str(message.id),
        chat_id=str(message.chat_id),
        sender_id=str(message.sender_id),
        text=message.text,
        is_read=message.is_read,
        created_at=message.created_at
    )

    # Send via WebSocket to other participant if connected
    other_user_id = chat.participant2_id if chat.participant1_id == current_user.id else chat.participant1_id
    await manager.send_message_to_user(
        str(other_user_id),
        {
            "type": "new_message",
            "message": {
                "id": str(message.id),
                "chat_id": str(message.chat_id),
                "sender_id": str(message.sender_id),
                "text": message.text,
                "created_at": message.created_at.isoformat()
            }
        }
    )

    return message_response


@router.put("/messages/{message_id}/read")
async def mark_message_read(
    message_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Mark message as read

    Only the recipient can mark a message as read
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

    # Verify user is recipient (not sender)
    if message.sender_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot mark your own message as read"
        )

    message.is_read = True
    await db.commit()

    return {"status": "success", "message_id": str(message_id)}


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    """
    WebSocket endpoint for real-time chat

    Connect with: ws://host/api/v1/chat/ws?token=<jwt_token>

    Messages format:
    - Send: {"type": "message", "chat_id": "...", "text": "..."}
    - Receive: {"type": "new_message", "message": {...}}
    """
    # Authenticate user from token
    from app.core.security import verify_token

    token_data = verify_token(token)
    if not token_data:
        await websocket.close(code=4001, reason="Invalid token")
        return

    user_id = token_data.get("sub")
    if not user_id:
        await websocket.close(code=4001, reason="Invalid token")
        return

    # Verify user exists
    user_result = await db.execute(
        select(User).where(User.id == UUID(user_id))
    )
    user = user_result.scalar_one_or_none()
    if not user:
        await websocket.close(code=4001, reason="User not found")
        return

    # Connect
    await manager.connect(user_id, websocket)

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()

            if data.get("type") == "message":
                # Handle sending message
                chat_id = UUID(data.get("chat_id"))
                text = data.get("text")

                # Verify chat and permissions
                chat_result = await db.execute(
                    select(Chat).where(Chat.id == chat_id)
                )
                chat = chat_result.scalar_one_or_none()

                if chat and (chat.participant1_id == user.id or chat.participant2_id == user.id):
                    # Create message
                    message = Message(
                        chat_id=chat_id,
                        sender_id=user.id,
                        text=text
                    )
                    db.add(message)
                    chat.last_message_at = datetime.utcnow()
                    await db.commit()
                    await db.refresh(message)

                    # Send to other participant
                    other_user_id = chat.participant2_id if chat.participant1_id == user.id else chat.participant1_id
                    await manager.send_message_to_user(
                        str(other_user_id),
                        {
                            "type": "new_message",
                            "message": {
                                "id": str(message.id),
                                "chat_id": str(message.chat_id),
                                "sender_id": str(message.sender_id),
                                "text": message.text,
                                "created_at": message.created_at.isoformat()
                            }
                        }
                    )

                    # Confirm to sender
                    await websocket.send_json({
                        "type": "message_sent",
                        "message_id": str(message.id)
                    })

    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        manager.disconnect(user_id)
        print(f"WebSocket error: {e}")
