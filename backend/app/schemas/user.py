"""
User schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional, Any
from datetime import datetime
from uuid import UUID


class UserCreate(BaseModel):
    """Schema for user registration."""
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=6)
    # Optional fields during registration if we wanted, but we keep them for onboarding
    age: Optional[int] = None
    nickname: Optional[str] = None


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    name: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    is_admin: Optional[bool] = None
    is_active: Optional[bool] = None
    # Profile Enhancements
    age: Optional[int] = None
    nickname: Optional[str] = None
    profile_completed: Optional[bool] = None


class UserResponse(BaseModel):
    """Schema for user response."""
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = ""
    is_admin: bool = False
    is_active: bool = True
    joined_date: Optional[str] = None
    
    # Profile Enhancements
    age: Optional[int] = None
    nickname: Optional[str] = None
    profile_completed: bool = False

    following: list[str] = []
    followers: list[str] = []
    created_at: Optional[datetime] = None
    
    # Validators to convert PostgreSQL UUID objects to strings
    @field_validator('id', mode='before')
    @classmethod
    def convert_id_to_str(cls, v: Any) -> str:
        """Convert UUID object to string if needed."""
        if isinstance(v, UUID):
            return str(v)
        return v
    
    @field_validator('following', 'followers', mode='before')
    @classmethod
    def convert_uuid_list_to_str(cls, v: Any) -> list[str]:
        """Convert list of UUID objects to list of strings."""
        if v is None:
            return []
        return [str(item) if isinstance(item, UUID) else item for item in v]
    
    class Config:
        from_attributes = True


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Token payload data."""
    user_id: Optional[str] = None
    email: Optional[str] = None
