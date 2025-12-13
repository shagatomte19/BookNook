"""
Book and PriceOption models.
"""
from sqlalchemy import Column, String, Integer, Text, JSON, ForeignKey, Float, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class PriceOption(Base):
    """Price option for a book from different vendors."""
    
    __tablename__ = "price_options"
    
    id = Column(String(50), primary_key=True, index=True)
    book_id = Column(String(50), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    vendor = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    url = Column(String(500), nullable=True)
    in_stock = Column(Boolean, default=True)
    
    # Relationship
    book = relationship("Book", back_populates="price_options")


class Book(Base):
    """Book model."""
    
    __tablename__ = "books"
    
    id = Column(String(50), primary_key=True, index=True)
    title = Column(String(500), nullable=False, index=True)
    author = Column(String(255), nullable=False, index=True)
    publisher = Column(String(255), nullable=True)
    cover_url = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    published_year = Column(Integer, nullable=True)
    genres = Column(JSON, default=list)  # Array of genre strings
    
    # Relationships
    price_options = relationship("PriceOption", back_populates="book", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Book {self.title} by {self.author}>"
