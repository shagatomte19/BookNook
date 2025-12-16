"""
User model for authentication and profiles.
"""
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer, TypeDecorator
from sqlalchemy.dialects.postgresql import ARRAY, UUID as PG_UUID
from sqlalchemy.sql import func
from uuid import UUID as PyUUID
from app.database import Base


class StringUUID(TypeDecorator):
    """A UUID type that ensures values are always returned as strings."""
    impl = PG_UUID(as_uuid=False)
    cache_ok = True
    
    def process_result_value(self, value, dialect):
        """Convert UUID to string when reading from database."""
        if value is None:
            return None
        if isinstance(value, PyUUID):
            return str(value)
        return str(value) if value else None
    
    def process_bind_param(self, value, dialect):
        """Ensure value is string when writing to database."""
        if value is None:
            return None
        if isinstance(value, PyUUID):
            return str(value)
        return str(value) if value else None


class User(Base):
    """User account model - maps to Supabase 'profiles' table."""
    
    __tablename__ = "profiles"  # Match Supabase schema
    
    # id is uuid type in Supabase, using StringUUID to ensure string representation
    id = Column(StringUUID(), primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    name = Column(String(255), nullable=False)
    # Note: hashed_password removed - Supabase handles auth via auth.users table
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True, default="")
    is_admin = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    joined_date = Column(String(50), nullable=True)
    
    # Profile Enhancements
    age = Column(Integer, nullable=True)
    nickname = Column(String(100), nullable=True)
    profile_completed = Column(Boolean, default=False)
    
    # Social features - ARRAY of UUIDs to match Supabase uuid[] schema
    # Using StringUUID type to match the database column type and get string output
    following = Column(ARRAY(StringUUID()), default=[])
    followers = Column(ARRAY(StringUUID()), default=[])
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def __repr__(self):
        return f"<User {self.name} ({self.email})>"

