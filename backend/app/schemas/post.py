"""
Post schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class PostCreate(BaseModel):
    """Schema for creating a post."""
    type: Literal["blog", "news", "spotlight"]
    title: str = Field(..., min_length=1, max_length=500)
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    tags: list[str] = []


class PostUpdate(BaseModel):
    """Schema for updating a post."""
    type: Optional[Literal["blog", "news", "spotlight"]] = None
    title: Optional[str] = Field(None, max_length=500)
    excerpt: Optional[str] = None
    content: Optional[str] = None
    image_url: Optional[str] = None
    tags: Optional[list[str]] = None
    is_approved: Optional[int] = None  # For moderation


class PostResponse(BaseModel):
    """Schema for post response."""
    id: str
    type: str
    title: str
    excerpt: Optional[str] = None
    content: Optional[str] = None
    author: str
    date: Optional[str] = None
    image_url: Optional[str] = None
    tags: list[str] = []
    is_approved: int = 1
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
