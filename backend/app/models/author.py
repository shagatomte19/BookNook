"""
Author model.
"""
from sqlalchemy import Column, String, Text, JSON
from app.database import Base


class Author(Base):
    """Author profile model."""
    
    __tablename__ = "authors"
    
    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    image_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    born = Column(String(50), nullable=True)
    died = Column(String(50), nullable=True)
    top_book_ids = Column(JSON, default=list)  # Array of book IDs
    
    def __repr__(self):
        return f"<Author {self.name}>"
