"""
Authors router for CRUD operations.
"""
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.author import Author
from app.schemas.author import AuthorCreate, AuthorUpdate, AuthorResponse
from app.services.auth import get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/authors", tags=["Authors"])


@router.get("", response_model=List[AuthorResponse])
async def get_all_authors(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all authors."""
    authors = db.query(Author).offset(skip).limit(limit).all()
    return [AuthorResponse.model_validate(a) for a in authors]


@router.get("/{author_id}", response_model=AuthorResponse)
async def get_author(author_id: str, db: Session = Depends(get_db)):
    """Get a single author by ID."""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Author not found"
        )
    return AuthorResponse.model_validate(author)


@router.post("", response_model=AuthorResponse)
async def create_author(
    author_data: AuthorCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new author (admin only)."""
    author_id = f"a-{uuid.uuid4().hex[:12]}"
    
    new_author = Author(
        id=author_id,
        name=author_data.name,
        image_url=author_data.image_url,
        bio=author_data.bio,
        born=author_data.born,
        died=author_data.died,
        top_book_ids=author_data.top_book_ids,
    )
    
    db.add(new_author)
    db.commit()
    db.refresh(new_author)
    
    return AuthorResponse.model_validate(new_author)


@router.patch("/{author_id}", response_model=AuthorResponse)
async def update_author(
    author_id: str,
    author_data: AuthorUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update an author (admin only)."""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Author not found"
        )
    
    update_dict = author_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(author, key, value)
    
    db.commit()
    db.refresh(author)
    
    return AuthorResponse.model_validate(author)


@router.delete("/{author_id}")
async def delete_author(
    author_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete an author (admin only)."""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Author not found"
        )
    
    db.delete(author)
    db.commit()
    
    return {"message": "Author deleted successfully"}
