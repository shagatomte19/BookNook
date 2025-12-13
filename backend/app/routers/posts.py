"""
Posts router for blog/news/spotlight content.
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.post import Post
from app.schemas.post import PostCreate, PostUpdate, PostResponse
from app.services.auth import get_current_user_required, get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/posts", tags=["Posts"])


@router.get("", response_model=List[PostResponse])
async def get_all_posts(
    skip: int = 0,
    limit: int = 50,
    post_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all approved posts with optional filtering."""
    query = db.query(Post).filter(Post.is_approved == 1)
    
    if post_type:
        query = query.filter(Post.type == post_type)
    
    posts = query.order_by(Post.created_at.desc()).offset(skip).limit(limit).all()
    return [PostResponse.model_validate(p) for p in posts]


@router.get("/{post_id}", response_model=PostResponse)
async def get_post(post_id: str, db: Session = Depends(get_db)):
    """Get a single post by ID."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    return PostResponse.model_validate(post)


@router.post("", response_model=PostResponse)
async def create_post(
    post_data: PostCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Create a new post."""
    post_id = f"p-{uuid.uuid4().hex[:12]}"
    
    new_post = Post(
        id=post_id,
        type=post_data.type,
        title=post_data.title,
        excerpt=post_data.excerpt,
        content=post_data.content,
        author=current_user.name,
        date=datetime.now().strftime("%b %d, %Y"),
        image_url=post_data.image_url,
        tags=post_data.tags,
        is_approved=1 if current_user.is_admin else 0,  # Auto-approve admin posts
    )
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    return PostResponse.model_validate(new_post)


@router.patch("/{post_id}", response_model=PostResponse)
async def update_post(
    post_id: str,
    post_data: PostUpdate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Update a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    # Only author or admin can edit
    if post.author != current_user.name and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only edit your own posts"
        )
    
    update_dict = post_data.model_dump(exclude_unset=True)
    
    # Non-admins cannot change approval status
    if "is_approved" in update_dict and not current_user.is_admin:
        del update_dict["is_approved"]
    
    for key, value in update_dict.items():
        setattr(post, key, value)
    
    db.commit()
    db.refresh(post)
    
    return PostResponse.model_validate(post)


@router.delete("/{post_id}")
async def delete_post(
    post_id: str,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a post (admin only)."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    db.delete(post)
    db.commit()
    
    return {"message": "Post deleted successfully"}
