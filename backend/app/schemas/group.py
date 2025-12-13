"""
Group and GroupPost schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class GroupCreate(BaseModel):
    """Schema for creating a group."""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    image_url: Optional[str] = None
    tags: list[str] = []


class GroupUpdate(BaseModel):
    """Schema for updating a group."""
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[list[str]] = None


class GroupResponse(BaseModel):
    """Schema for group response."""
    id: str
    name: str
    description: Optional[str] = None
    admin_id: Optional[str] = None
    image_url: Optional[str] = None
    tags: list[str] = []
    members: list[str] = []
    pending_members: list[str] = []
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class GroupPostCreate(BaseModel):
    """Schema for creating a group post."""
    group_id: str
    content: str


class GroupPostResponse(BaseModel):
    """Schema for group post response."""
    id: str
    group_id: str
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    content: Optional[str] = None
    date: Optional[str] = None
    likes: int = 0
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
