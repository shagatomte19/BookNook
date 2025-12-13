"""
Post model for blog posts, news, and spotlights.
"""
from sqlalchemy import Column, String, Text, JSON, Integer, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Post(Base):
    """Blog/News/Spotlight post model."""
    
    __tablename__ = "posts"
    
    id = Column(String(50), primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # 'blog', 'news', 'spotlight'
    title = Column(String(500), nullable=False, index=True)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=True)
    author = Column(String(255), nullable=False)
    date = Column(String(100), nullable=True)
    image_url = Column(String(500), nullable=True)
    tags = Column(JSON, default=list)  # Array of tag strings
    
    # Moderation
    is_approved = Column(Integer, default=1)  # 1=approved, 0=pending, -1=rejected
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<Post {self.title}>"
