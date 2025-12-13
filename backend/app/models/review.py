"""
Review model.
"""
from sqlalchemy import Column, String, Integer, Text, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Review(Base):
    """Book review model."""
    
    __tablename__ = "reviews"
    
    id = Column(String(50), primary_key=True, index=True)
    book_id = Column(String(50), ForeignKey("books.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    user_name = Column(String(255), nullable=False)
    rating = Column(Integer, nullable=False)  # 1-5
    content = Column(Text, nullable=True)
    date = Column(String(100), nullable=True)
    
    # Moderation
    is_approved = Column(Integer, default=1)  # 1=approved, 0=pending, -1=rejected
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<Review {self.id} for Book {self.book_id}>"
