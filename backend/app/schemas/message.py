"""
Message schemas for request/response validation.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MessageCreate(BaseModel):
    """Schema for creating a message."""
    receiver_id: str
    content: str


class MessageResponse(BaseModel):
    """Schema for message response."""
    id: str
    sender_id: str
    receiver_id: str
    content: str
    timestamp: Optional[str] = None
    read: bool = False
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
