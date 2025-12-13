"""
Author schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional


class AuthorCreate(BaseModel):
    """Schema for creating an author."""
    name: str = Field(..., min_length=1, max_length=255)
    image_url: Optional[str] = None
    bio: Optional[str] = None
    born: Optional[str] = None
    died: Optional[str] = None
    top_book_ids: list[str] = []


class AuthorUpdate(BaseModel):
    """Schema for updating an author."""
    name: Optional[str] = Field(None, max_length=255)
    image_url: Optional[str] = None
    bio: Optional[str] = None
    born: Optional[str] = None
    died: Optional[str] = None
    top_book_ids: Optional[list[str]] = None


class AuthorResponse(BaseModel):
    """Schema for author response."""
    id: str
    name: str
    image_url: Optional[str] = None
    bio: Optional[str] = None
    born: Optional[str] = None
    died: Optional[str] = None
    top_book_ids: list[str] = []
    
    class Config:
        from_attributes = True
