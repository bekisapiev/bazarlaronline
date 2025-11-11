"""
Chat Schemas
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


class MessageCreate(BaseModel):
    """Create message request"""
    chat_id: str
    text: str

    class Config:
        json_schema_extra = {
            "example": {
                "chat_id": "123e4567-e89b-12d3-a456-426614174000",
                "text": "Hello! Is this product still available?"
            }
        }


class MessageResponse(BaseModel):
    """Message response"""
    id: str
    chat_id: str
    sender_id: str
    text: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True


class ChatCreateRequest(BaseModel):
    """Create chat request"""
    participant_id: str
    product_id: Optional[str] = None
    initial_message: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "participant_id": "123e4567-e89b-12d3-a456-426614174000",
                "product_id": "123e4567-e89b-12d3-a456-426614174001",
                "initial_message": "Hello! I'm interested in this product."
            }
        }


class ChatResponse(BaseModel):
    """Chat response"""
    id: str
    participant1_id: str
    participant2_id: str
    product_id: Optional[str] = None
    last_message_at: Optional[datetime] = None
    created_at: datetime
    # Additional fields for convenience
    other_participant_id: Optional[str] = None
    other_participant_name: Optional[str] = None
    last_message_text: Optional[str] = None
    unread_count: Optional[int] = 0

    class Config:
        from_attributes = True


class ConversationResponse(BaseModel):
    """Conversation list item"""
    chat_id: str
    other_user_id: str
    other_user_name: Optional[str] = None
    other_user_email: str
    product_id: Optional[str] = None
    product_title: Optional[str] = None
    last_message_text: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int = 0

    class Config:
        from_attributes = True
