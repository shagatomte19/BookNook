"""
Shelves router for book collections.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.shelf import Shelf, ShelfItem, ShelfType
from app.models.book import Book
from app.schemas.shelf import ShelfCreate, ShelfResponse, ShelfUpdate, ShelfItemCreate, ShelfItemResponse
from app.services.auth import get_current_user_required, get_current_user
import uuid

router = APIRouter(prefix="/shelves", tags=["Shelves"])


@router.get("/user/{user_id}", response_model=List[ShelfResponse])
async def get_user_shelves(user_id: str, db: Session = Depends(get_db)):
    """Get shelves for a user."""
    shelves = db.query(Shelf).filter(Shelf.user_id == user_id).all()
    # Pydantic will handle the items relationship
    return [ShelfResponse.model_validate(s) for s in shelves]


@router.post("", response_model=ShelfResponse)
async def create_shelf(
    shelf_data: ShelfCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Create a new custom shelf."""
    new_shelf = Shelf(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        name=shelf_data.name,
        type=ShelfType.CUSTOM,
        is_public=shelf_data.is_public
    )
    db.add(new_shelf)
    db.commit()
    db.refresh(new_shelf)
    return ShelfResponse.model_validate(new_shelf)


@router.post("/{shelf_id}/books", response_model=ShelfItemResponse)
async def add_book_to_shelf(
    shelf_id: str,
    item_data: ShelfItemCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Add a book to a shelf."""
    shelf = db.query(Shelf).filter(Shelf.id == shelf_id).first()
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found")
        
    if shelf.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    # Check if book exists
    book = db.query(Book).filter(Book.id == item_data.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
        
    # Check if already in shelf
    existing = db.query(ShelfItem).filter(
        ShelfItem.shelf_id == shelf_id,
        ShelfItem.book_id == item_data.book_id
    ).first()
    
    if existing:
        return ShelfItemResponse.model_validate(existing) # Idempotent-ish
        
    new_item = ShelfItem(
        id=str(uuid.uuid4()),
        shelf_id=shelf_id,
        book_id=item_data.book_id
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return ShelfItemResponse.model_validate(new_item)


@router.delete("/{shelf_id}/books/{book_id}")
async def remove_book_from_shelf(
    shelf_id: str,
    book_id: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Remove a book from a shelf."""
    shelf = db.query(Shelf).filter(Shelf.id == shelf_id).first()
    if not shelf:
        raise HTTPException(status_code=404, detail="Shelf not found")
        
    if shelf.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    item = db.query(ShelfItem).filter(
        ShelfItem.shelf_id == shelf_id,
        ShelfItem.book_id == book_id
    ).first()
    
    if item:
        db.delete(item)
        db.commit()
        
    return {"message": "Book removed from shelf"}
