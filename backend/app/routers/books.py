"""
Books router for CRUD operations.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.book import Book, PriceOption
from app.schemas.book import BookCreate, BookUpdate, BookResponse
from app.services.auth import get_current_user_required, get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/books", tags=["Books"])


@router.get("", response_model=List[BookResponse])
async def get_all_books(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    genre: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all books with optional filtering."""
    query = db.query(Book)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Book.title.ilike(search_term)) | 
            (Book.author.ilike(search_term))
        )
    
    if genre:
        # Filter books that contain the genre in their genres array
        query = query.filter(Book.genres.contains([genre]))
    
    books = query.offset(skip).limit(limit).all()
    return [BookResponse.model_validate(b) for b in books]


@router.get("/{book_id}", response_model=BookResponse)
async def get_book(book_id: str, db: Session = Depends(get_db)):
    """Get a single book by ID."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    return BookResponse.model_validate(book)


@router.post("", response_model=BookResponse)
async def create_book(
    book_data: BookCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new book (admin only)."""
    book_id = f"b-{uuid.uuid4().hex[:12]}"
    
    new_book = Book(
        id=book_id,
        title=book_data.title,
        author=book_data.author,
        publisher=book_data.publisher,
        cover_url=book_data.cover_url or "https://via.placeholder.com/300x450?text=No+Cover",
        description=book_data.description,
        published_year=book_data.published_year,
        genres=book_data.genres,
    )
    
    db.add(new_book)
    db.flush()  # Get the book ID before adding price options
    
    # Add price options
    for i, po in enumerate(book_data.price_options):
        price_option = PriceOption(
            id=f"po-{uuid.uuid4().hex[:12]}",
            book_id=book_id,
            vendor=po.vendor,
            price=po.price,
            url=po.url,
            in_stock=po.in_stock,
        )
        db.add(price_option)
    
    db.commit()
    db.refresh(new_book)
    
    return BookResponse.model_validate(new_book)


@router.patch("/{book_id}", response_model=BookResponse)
async def update_book(
    book_id: str,
    book_data: BookUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a book (admin only)."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    update_dict = book_data.model_dump(exclude_unset=True, exclude={"price_options"})
    for key, value in update_dict.items():
        setattr(book, key, value)
    
    # Update price options if provided
    if book_data.price_options is not None:
        # Delete existing price options
        db.query(PriceOption).filter(PriceOption.book_id == book_id).delete()
        
        # Add new price options
        for po in book_data.price_options:
            price_option = PriceOption(
                id=f"po-{uuid.uuid4().hex[:12]}",
                book_id=book_id,
                vendor=po.vendor,
                price=po.price,
                url=po.url,
                in_stock=po.in_stock,
            )
            db.add(price_option)
    
    db.commit()
    db.refresh(book)
    
    return BookResponse.model_validate(book)


@router.delete("/{book_id}")
async def delete_book(
    book_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a book (admin only)."""
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    db.delete(book)
    db.commit()
    
    return {"message": "Book deleted successfully"}
