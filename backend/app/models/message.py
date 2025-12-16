"""
Direct message model.
"""
from sqlalchemy import Column, String, Text, Boolean, ForeignKey, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Message(Base):
    """Direct message between users."""
    
    __tablename__ = "messages"
    
    id = Column(String(50), primary_key=True, index=True)
    sender_id = Column(String(50), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_id = Column(String(50), ForeignKey("profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    content = Column(Text, nullable=False)
    timestamp = Column(String(100), nullable=True)
    read = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<Message from {self.sender_id} to {self.receiver_id}>"
