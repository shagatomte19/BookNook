"""
Interaction models (Comments, Likes).
"""
from sqlalchemy import Column, String, ForeignKey, Text, DateTime, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Comment(Base):
    """Comment on a post."""
    
    __tablename__ = "comments"
    
    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(String(50), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", backref="comments")
    post = relationship("Post", backref="comments")
    
    def __repr__(self):
        return f"<Comment {self.id} on Post {self.post_id}>"


class Like(Base):
    """Like on a post."""
    
    __tablename__ = "likes"
    
    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    post_id = Column(String(50), ForeignKey("posts.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", backref="likes")
    post = relationship("Post", backref="likes")
    
    def __repr__(self):
        return f"<Like by {self.user_id} on Post {self.post_id}>"
