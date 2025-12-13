"""
Reviews router for book reviews.
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.review import Review
from app.models.book import Book
from app.schemas.review import ReviewCreate, ReviewUpdate, ReviewResponse
from app.services.auth import get_current_user_required
from app.models.user import User

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("", response_model=List[ReviewResponse])
async def get_all_reviews(
    skip: int = 0,
    limit: int = 100,
    book_id: str = None,
    user_id: str = None,
    db: Session = Depends(get_db)
):
    """Get all reviews with optional filtering."""
    query = db.query(Review).filter(Review.is_approved == 1)
    
    if book_id:
        query = query.filter(Review.book_id == book_id)
    if user_id:
        query = query.filter(Review.user_id == user_id)
    
    reviews = query.order_by(Review.created_at.desc()).offset(skip).limit(limit).all()
    return [ReviewResponse.model_validate(r) for r in reviews]


@router.get("/book/{book_id}", response_model=List[ReviewResponse])
async def get_book_reviews(book_id: str, db: Session = Depends(get_db)):
    """Get all reviews for a specific book."""
    reviews = db.query(Review).filter(
        Review.book_id == book_id,
        Review.is_approved == 1
    ).order_by(Review.created_at.desc()).all()
    return [ReviewResponse.model_validate(r) for r in reviews]


@router.get("/user/{user_id}", response_model=List[ReviewResponse])
async def get_user_reviews(user_id: str, db: Session = Depends(get_db)):
    """Get all reviews by a specific user."""
    reviews = db.query(Review).filter(
        Review.user_id == user_id,
        Review.is_approved == 1
    ).order_by(Review.created_at.desc()).all()
    return [ReviewResponse.model_validate(r) for r in reviews]


@router.post("", response_model=ReviewResponse)
async def create_review(
    review_data: ReviewCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Create a new review."""
    # Check if book exists
    book = db.query(Book).filter(Book.id == review_data.book_id).first()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Book not found"
        )
    
    # Check if user already reviewed this book
    existing = db.query(Review).filter(
        Review.book_id == review_data.book_id,
        Review.user_id == current_user.id
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this book"
        )
    
    review_id = f"r-{uuid.uuid4().hex[:12]}"
    
    new_review = Review(
        id=review_id,
        book_id=review_data.book_id,
        user_id=current_user.id,
        user_name=current_user.name,
        rating=review_data.rating,
        content=review_data.content,
        date=datetime.now().strftime("%b %d, %Y"),
        is_approved=1,  # Auto-approve for now
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    return ReviewResponse.model_validate(new_review)


@router.patch("/{review_id}", response_model=ReviewResponse)
async def update_review(
    review_id: str,
    review_data: ReviewUpdate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Update a review (owner only)."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if review.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own reviews"
        )
    
    update_dict = review_data.model_dump(exclude_unset=True)
    
    # Non-admins cannot change approval status
    if "is_approved" in update_dict and not current_user.is_admin:
        del update_dict["is_approved"]
    
    for key, value in update_dict.items():
        setattr(review, key, value)
    
    db.commit()
    db.refresh(review)
    
    return ReviewResponse.model_validate(review)


@router.delete("/{review_id}")
async def delete_review(
    review_id: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Delete a review (owner or admin only)."""
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    if review.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reviews"
        )
    
    db.delete(review)
    db.commit()
    
    return {"message": "Review deleted successfully"}
