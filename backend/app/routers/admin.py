"""
Admin router for private administrative endpoints.
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.book import Book
from app.models.author import Author
from app.models.review import Review
from app.models.post import Post
from app.models.group import Group
from app.models.message import Message
from app.models.audit_log import AuditLog
from app.schemas.user import UserResponse, UserUpdate
from app.schemas.review import ReviewResponse
from app.schemas.post import PostResponse
from app.services.auth import get_current_admin_from_token

router = APIRouter(prefix="/admin", tags=["Admin"])


# Response schemas for admin endpoints
class DashboardStats(BaseModel):
    total_books: int
    total_authors: int
    total_users: int
    total_reviews: int
    total_posts: int
    total_groups: int
    average_rating: float
    pending_reviews: int
    pending_posts: int
    active_users: int


class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str]
    user_email: Optional[str]
    action: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    details: Optional[dict]
    ip_address: Optional[str]
    created_at: Optional[datetime]
    
    class Config:
        from_attributes = True


class ContentModerationItem(BaseModel):
    id: str
    type: str  # 'review' or 'post'
    title: Optional[str] = None
    content: Optional[str] = None
    author_name: str
    created_at: Optional[datetime] = None
    status: int  # 0=pending, 1=approved, -1=rejected


# Helper function to log admin actions
def log_admin_action(
    db: Session,
    user: User,
    action: str,
    resource_type: str = None,
    resource_id: str = None,
    details: dict = None
):
    """Log an administrative action."""
    log_entry = AuditLog(
        id=f"log-{uuid.uuid4().hex[:12]}",
        user_id=user.id,
        user_email=user.email,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
    )
    db.add(log_entry)
    db.commit()


# Dashboard
@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_admin_from_token),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics."""
    total_books = db.query(func.count(Book.id)).scalar() or 0
    total_authors = db.query(func.count(Author.id)).scalar() or 0
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_reviews = db.query(func.count(Review.id)).scalar() or 0
    total_posts = db.query(func.count(Post.id)).scalar() or 0
    total_groups = db.query(func.count(Group.id)).scalar() or 0
    
    # Calculate average rating
    avg_rating = db.query(func.avg(Review.rating)).filter(Review.is_approved == 1).scalar()
    average_rating = round(float(avg_rating), 1) if avg_rating else 0.0
    
    # Pending content
    pending_reviews = db.query(func.count(Review.id)).filter(Review.is_approved == 0).scalar() or 0
    pending_posts = db.query(func.count(Post.id)).filter(Post.is_approved == 0).scalar() or 0
    
    # Active users
    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar() or 0
    
    return DashboardStats(
        total_books=total_books,
        total_authors=total_authors,
        total_users=total_users,
        total_reviews=total_reviews,
        total_posts=total_posts,
        total_groups=total_groups,
        average_rating=average_rating,
        pending_reviews=pending_reviews,
        pending_posts=pending_posts,
        active_users=active_users,
    )


# User Management
@router.get("/users", response_model=List[UserResponse])
async def get_all_users_admin(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    is_admin: Optional[bool] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_admin_from_token),
    db: Session = Depends(get_db)
):
    """Get all users with filtering options."""
    query = db.query(User)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.name.ilike(search_term)) | 
            (User.email.ilike(search_term))
        )
    
    if is_admin is not None:
        query = query.filter(User.is_admin == is_admin)
    
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.offset(skip).limit(limit).all()
    return [UserResponse.model_validate(u) for u in users]


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user_admin(
    user_id: str,
    update_data: UserUpdate,
    current_user: User = Depends(get_current_admin_from_token),
    db: Session = Depends(get_db)
):
    """Update a user's profile (admin)."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Prevent admin from removing their own admin status
    if user_id == current_user.id and update_data.is_admin == False:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot remove your own admin status"
        )
    
    update_dict = update_data.model_dump(exclude_unset=True)
    old_values = {k: getattr(user, k) for k in update_dict.keys()}
    
    for key, value in update_dict.items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    
    # Log the action
    log_admin_action(
        db, current_user, "update_user",
        resource_type="user", resource_id=user_id,
        details={"old_values": old_values, "new_values": update_dict}
    )
    
    return UserResponse.model_validate(user)


@router.delete("/users/{user_id}")
async def delete_user_admin(
    user_id: str,
    current_user: User = Depends(get_current_admin_from_token),
    db: Session = Depends(get_db)
):
    """Delete a user account (admin)."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user_email = user.email
    db.delete(user)
    db.commit()
    
    # Log the action
    log_admin_action(
        db, current_user, "delete_user",
        resource_type="user", resource_id=user_id,
        details={"deleted_email": user_email}
    )
    
    return {"message": "User deleted successfully"}


@router.post("/users/{user_id}/toggle-admin", response_model=UserResponse)
async def toggle_user_admin_status(
    user_id: str,
    current_user: User = Depends(get_current_admin_from_token),
    db: Session = Depends(get_db)
):
    """Toggle a user's admin status."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify your own admin status"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_admin = not user.is_admin
    db.commit()
    db.refresh(user)
    
    # Log the action
    log_admin_action(
        db, current_user, "toggle_admin",
        resource_type="user", resource_id=user_id,
        details={"new_admin_status": user.is_admin}
    )
    
    return UserResponse.model_validate(user)


@router.post("/users/{user_id}/toggle-active", response_model=UserResponse)
async def toggle_user_active_status(
    user_id: str,
    current_user: User = Depends(get_current_admin_from_token),
    db: Session = Depends(get_db)
):
    """Toggle a user's active status (ban/unban)."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot deactivate your own account"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = not user.is_active
    db.commit()
    db.refresh(user)
    
    # Log the action
    log_admin_action(
        db, current_user, "toggle_active",
        resource_type="user", resource_id=user_id,
        details={"new_active_status": user.is_active}
    )
    
    return UserResponse.model_validate(user)


# Content Moderation
@router.get("/content/pending", response_model=List[ContentModerationItem])
async def get_pending_content(
    current_user: User = Depends(get_current_admin_from_token),
    db: Session = Depends(get_db)
):
    """Get all pending content for moderation."""
    items = []
    
    # Pending reviews
    pending_reviews = db.query(Review).filter(Review.is_approved == 0).all()
    for review in pending_reviews:
        items.append(ContentModerationItem(
            id=review.id,
            type="review",
            title=f"Review for book {review.book_id}",
            content=review.content,
            author_name=review.user_name,
            created_at=review.created_at,
            status=review.is_approved,
        ))
    
    # Pending posts
    pending_posts = db.query(Post).filter(Post.is_approved == 0).all()
    for post in pending_posts:
        items.append(ContentModerationItem(
            id=post.id,
            type="post",
            title=post.title,
            content=post.excerpt or post.content[:200] if post.content else None,
            author_name=post.author,
            created_at=post.created_at,
            status=post.is_approved,
        ))
    
    return items


@router.post("/content/{content_type}/{content_id}/approve")
async def approve_content(
    content_type: str,
    content_id: str,
    current_user: User = Depends(get_current_admin_from_token),
    db: Session = Depends(get_db)
):
    """Approve pending content."""
    if content_type == "review":
        content = db.query(Review).filter(Review.id == content_id).first()
    elif content_type == "post":
        content = db.query(Post).filter(Post.id == content_id).first()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid content type"
        )
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    content.is_approved = 1
    db.commit()
    
    # Log the action
    log_admin_action(
        db, current_user, "approve_content",
        resource_type=content_type, resource_id=content_id
    )
    
    return {"message": f"{content_type.capitalize()} approved successfully"}


@router.post("/content/{content_type}/{content_id}/reject")
async def reject_content(
    content_type: str,
    content_id: str,
    current_user: User = Depends(get_current_admin_from_token),
    db: Session = Depends(get_db)
):
    """Reject pending content."""
    if content_type == "review":
        content = db.query(Review).filter(Review.id == content_id).first()
    elif content_type == "post":
        content = db.query(Post).filter(Post.id == content_id).first()
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid content type"
        )
    
    if not content:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content not found"
        )
    
    content.is_approved = -1
    db.commit()
    
    # Log the action
    log_admin_action(
        db, current_user, "reject_content",
        resource_type=content_type, resource_id=content_id
    )
    
    return {"message": f"{content_type.capitalize()} rejected successfully"}


# Audit Logs
@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    action: Optional[str] = None,
    resource_type: Optional[str] = None,
    current_user: User = Depends(get_current_admin_from_token),
    db: Session = Depends(get_db)
):
    """Get audit logs with optional filtering."""
    query = db.query(AuditLog)
    
    if action:
        query = query.filter(AuditLog.action == action)
    
    if resource_type:
        query = query.filter(AuditLog.resource_type == resource_type)
    
    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return [AuditLogResponse.model_validate(log) for log in logs]
