"""
Group and GroupPost models.
"""
from sqlalchemy import Column, String, Text, JSON, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Group(Base):
    """Book club/reading group model."""
    
    __tablename__ = "groups"
    
    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    admin_id = Column(String(50), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True)
    image_url = Column(String(500), nullable=True)
    tags = Column(JSON, default=list)  # Array of tag strings
    members = Column(JSON, default=list)  # Array of user IDs
    pending_members = Column(JSON, default=list)  # Array of user IDs awaiting approval
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<Group {self.name}>"


class GroupPost(Base):
    """Post within a group."""
    
    __tablename__ = "group_posts"
    
    id = Column(String(50), primary_key=True, index=True)
    group_id = Column(String(50), ForeignKey("groups.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(50), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False)
    user_name = Column(String(255), nullable=False)
    user_avatar = Column(String(500), nullable=True)
    content = Column(Text, nullable=True)
    date = Column(String(100), nullable=True)
    likes = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<GroupPost {self.id} in Group {self.group_id}>"
