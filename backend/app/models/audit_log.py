"""
Audit log model for tracking admin actions.
"""
from sqlalchemy import Column, String, Text, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base


class AuditLog(Base):
    """Audit log for tracking administrative actions."""
    
    __tablename__ = "audit_logs"
    
    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("profiles.id", ondelete="SET NULL"), nullable=True, index=True)
    user_email = Column(String(255), nullable=True)
    action = Column(String(100), nullable=False, index=True)  # 'create', 'update', 'delete', 'login', etc.
    resource_type = Column(String(100), nullable=True)  # 'book', 'user', 'review', etc.
    resource_id = Column(String(50), nullable=True)
    details = Column(JSON, nullable=True)  # Additional context
    ip_address = Column(String(50), nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    def __repr__(self):
        return f"<AuditLog {self.action} by {self.user_email}>"
