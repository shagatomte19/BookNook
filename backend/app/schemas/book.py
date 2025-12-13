"""
Book schemas for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional


class PriceOptionCreate(BaseModel):
    """Schema for creating a price option."""
    vendor: str = Field(..., max_length=255)
    price: float = Field(..., ge=0)
    url: Optional[str] = None
    in_stock: bool = True


class PriceOptionResponse(BaseModel):
    """Schema for price option response."""
    id: str
    vendor: str
    price: float
    url: Optional[str] = None
    in_stock: bool = True
    
    class Config:
        from_attributes = True


class BookCreate(BaseModel):
    """Schema for creating a book."""
    title: str = Field(..., min_length=1, max_length=500)
    author: str = Field(..., min_length=1, max_length=255)
    publisher: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None
    published_year: Optional[int] = None
    genres: list[str] = []
    price_options: list[PriceOptionCreate] = []


class BookUpdate(BaseModel):
    """Schema for updating a book."""
    title: Optional[str] = Field(None, max_length=500)
    author: Optional[str] = Field(None, max_length=255)
    publisher: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None
    published_year: Optional[int] = None
    genres: Optional[list[str]] = None
    price_options: Optional[list[PriceOptionCreate]] = None


class BookResponse(BaseModel):
    """Schema for book response."""
    id: str
    title: str
    author: str
    publisher: Optional[str] = None
    cover_url: Optional[str] = None
    description: Optional[str] = None
    published_year: Optional[int] = None
    genres: list[str] = []
    price_options: list[PriceOptionResponse] = []
    
    class Config:
        from_attributes = True
