"""
Users router for user profile and social features.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.user import User
from app.schemas.user import UserResponse, UserUpdate
from app.services.auth import get_current_user_required, get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

from app.utils.nickname_generator import generate_random_nickname

@router.get("/generate_nickname", response_model=str)
async def get_random_nickname(db: Session = Depends(get_db)):
    """Generate a random unique nickname."""
    # Simple retry logic to ensure uniqueness could be added here if critical
    # For now just return a random one
    return generate_random_nickname()

@router.get("", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all users (public profiles)."""
    users = db.query(User).filter(User.is_active == True).offset(skip).limit(limit).all()
    return [UserResponse.model_validate(u) for u in users]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: Session = Depends(get_db)):
    """Get a user's public profile by ID."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return UserResponse.model_validate(user)


@router.patch("/me", response_model=UserResponse)
async def update_my_profile(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Update the current user's profile."""
    update_dict = update_data.model_dump(exclude_unset=True)
    
    # Don't allow non-admins to change admin status
    if "is_admin" in update_dict and not current_user.is_admin:
        del update_dict["is_admin"]
    
    for key, value in update_dict.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    
    return UserResponse.model_validate(current_user)


@router.post("/{user_id}/follow", response_model=UserResponse)
async def follow_user(
    user_id: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Follow another user."""
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot follow yourself"
        )
    
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update following list
    following = list(current_user.following or [])
    if user_id not in following:
        following.append(user_id)
        current_user.following = following
        
        # Update target's followers
        followers = list(target_user.followers or [])
        if current_user.id not in followers:
            followers.append(current_user.id)
            target_user.followers = followers
        
        db.commit()
        db.refresh(current_user)
    
    return UserResponse.model_validate(current_user)


@router.post("/{user_id}/unfollow", response_model=UserResponse)
async def unfollow_user(
    user_id: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Unfollow a user."""
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update following list
    following = list(current_user.following or [])
    if user_id in following:
        following.remove(user_id)
        current_user.following = following
        
        # Update target's followers
        followers = list(target_user.followers or [])
        if current_user.id in followers:
            followers.remove(current_user.id)
            target_user.followers = followers
        
        db.commit()
        db.refresh(current_user)
    
    return UserResponse.model_validate(current_user)
