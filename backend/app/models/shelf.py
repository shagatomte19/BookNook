"""
Book Shelf models.
"""
from sqlalchemy import Column, String, ForeignKey, Boolean, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base


class ShelfType(str, enum.Enum):
    WANT_TO_READ = "want_to_read"
    CURRENTLY_READING = "currently_reading"
    READ = "read"
    CUSTOM = "custom"


class Shelf(Base):
    """User book shelf model."""
    
    __tablename__ = "shelves"
    
    id = Column(String(50), primary_key=True, index=True)
    user_id = Column(String(50), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    type = Column(String(50), default=ShelfType.CUSTOM)
    is_public = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", backref="shelves")
    items = relationship("ShelfItem", back_populates="shelf", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Shelf {self.name} ({self.type})>"


class ShelfItem(Base):
    """Book item in a shelf."""
    
    __tablename__ = "shelf_items"
    
    id = Column(String(50), primary_key=True, index=True)
    shelf_id = Column(String(50), ForeignKey("shelves.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(String(50), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    
    added_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    shelf = relationship("Shelf", back_populates="items")
    # Assuming book relationship doesn't need to be bi-directional strictly, 
    # but good to have access to book details
    book = relationship("Book") 
    
    def __repr__(self):
        return f"<ShelfItem Book {self.book_id} in Shelf {self.shelf_id}>"
