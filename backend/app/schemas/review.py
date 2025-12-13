"""
Review schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ReviewCreate(BaseModel):
    """Schema for creating a review."""
    book_id: str
    rating: int = Field(..., ge=1, le=5)
    content: Optional[str] = None


class ReviewUpdate(BaseModel):
    """Schema for updating a review."""
    rating: Optional[int] = Field(None, ge=1, le=5)
    content: Optional[str] = None
    is_approved: Optional[int] = None  # For moderation


class ReviewResponse(BaseModel):
    """Schema for review response."""
    id: str
    book_id: str
    user_id: str
    user_name: str
    rating: int
    content: Optional[str] = None
    date: Optional[str] = None
    is_approved: int = 1
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
