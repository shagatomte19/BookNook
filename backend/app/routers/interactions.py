"""
Interactions router for Comments and Likes.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.models.interaction import Comment, Like
from app.models.post import Post
from app.schemas.interaction import CommentCreate, CommentResponse, LikeResponse
from app.services.auth import get_current_user_required
import uuid

router = APIRouter(prefix="/posts", tags=["Interactions"])


# --- Comments ---

@router.get("/{post_id}/comments", response_model=List[CommentResponse])
async def get_comments(post_id: str, db: Session = Depends(get_db)):
    """Get all comments for a post."""
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.asc()).all()
    
    # Enrich with user details (could be done via join, but this is simple)
    response_comments = []
    for comment in comments:
        c_resp = CommentResponse.model_validate(comment)
        c_resp.user_name = comment.user.name if comment.user else "Unknown"
        c_resp.user_avatar = comment.user.avatar_url if comment.user else None
        response_comments.append(c_resp)
        
    return response_comments


@router.post("/{post_id}/comments", response_model=CommentResponse)
async def create_comment(
    post_id: str,
    comment_data: CommentCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Add a comment to a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    new_comment = Comment(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        post_id=post_id,
        content=comment_data.content
    )
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    
    c_resp = CommentResponse.model_validate(new_comment)
    c_resp.user_name = current_user.name
    c_resp.user_avatar = current_user.avatar_url
    return c_resp


@router.delete("/comments/{comment_id}")
async def delete_comment(
    comment_id: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Delete a comment."""
    comment = db.query(Comment).filter(Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    if comment.user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db.delete(comment)
    db.commit()
    return {"message": "Comment deleted"}


# --- Likes ---

@router.post("/{post_id}/like", response_model=LikeResponse)
async def toggle_like(
    post_id: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Toggle like on a post."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    existing_like = db.query(Like).filter(
        Like.post_id == post_id,
        Like.user_id == current_user.id
    ).first()
    
    if existing_like:
        # Unlike
        db.delete(existing_like)
        db.commit()
        return LikeResponse(id="", user_id=current_user.id, post_id=post_id, created_at=None) # Special response for unliked? Or handle in FE
    else:
        # Like
        new_like = Like(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            post_id=post_id
        )
        db.add(new_like)
        db.commit()
        db.refresh(new_like)
        return LikeResponse.model_validate(new_like)

@router.get("/{post_id}/likes", response_model=List[LikeResponse])
async def get_likes(post_id: str, db: Session = Depends(get_db)):
    """Get all likes for a post."""
    likes = db.query(Like).filter(Like.post_id == post_id).all()
    return [LikeResponse.model_validate(like) for like in likes]
