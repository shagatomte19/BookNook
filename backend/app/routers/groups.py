"""
Groups router for book clubs and group posts.
"""
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.group import Group, GroupPost
from app.schemas.group import (
    GroupCreate, GroupUpdate, GroupResponse,
    GroupPostCreate, GroupPostResponse
)
from app.services.auth import get_current_user_required
from app.models.user import User

router = APIRouter(prefix="/groups", tags=["Groups"])


@router.get("", response_model=List[GroupResponse])
async def get_all_groups(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Get all groups."""
    groups = db.query(Group).offset(skip).limit(limit).all()
    return [GroupResponse.model_validate(g) for g in groups]


@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(group_id: str, db: Session = Depends(get_db)):
    """Get a single group by ID."""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    return GroupResponse.model_validate(group)


@router.post("", response_model=GroupResponse)
async def create_group(
    group_data: GroupCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Create a new group."""
    group_id = f"g-{uuid.uuid4().hex[:12]}"
    
    new_group = Group(
        id=group_id,
        name=group_data.name,
        description=group_data.description,
        admin_id=current_user.id,
        image_url=group_data.image_url,
        tags=group_data.tags,
        members=[current_user.id],  # Creator is first member
        pending_members=[],
    )
    
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    
    return GroupResponse.model_validate(new_group)


@router.post("/{group_id}/join")
async def join_group(
    group_id: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Request to join a group."""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    members = list(group.members or [])
    pending = list(group.pending_members or [])
    
    if current_user.id in members:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already a member"
        )
    
    if current_user.id in pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Already pending approval"
        )
    
    pending.append(current_user.id)
    group.pending_members = pending
    db.commit()
    
    return {"message": "Join request submitted"}


@router.post("/{group_id}/accept/{user_id}")
async def accept_member(
    group_id: str,
    user_id: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Accept a pending member (admin only)."""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    if group.admin_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group admin can accept members"
        )
    
    pending = list(group.pending_members or [])
    members = list(group.members or [])
    
    if user_id not in pending:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not in pending list"
        )
    
    pending.remove(user_id)
    members.append(user_id)
    group.pending_members = pending
    group.members = members
    db.commit()
    
    return {"message": "Member accepted"}


@router.post("/{group_id}/reject/{user_id}")
async def reject_member(
    group_id: str,
    user_id: str,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Reject a pending member (admin only)."""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    if group.admin_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only group admin can reject members"
        )
    
    pending = list(group.pending_members or [])
    
    if user_id not in pending:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not in pending list"
        )
    
    pending.remove(user_id)
    group.pending_members = pending
    db.commit()
    
    return {"message": "Member rejected"}


# Group Posts
@router.get("/{group_id}/posts", response_model=List[GroupPostResponse])
async def get_group_posts(group_id: str, db: Session = Depends(get_db)):
    """Get all posts in a group."""
    posts = db.query(GroupPost).filter(
        GroupPost.group_id == group_id
    ).order_by(GroupPost.created_at.desc()).all()
    return [GroupPostResponse.model_validate(p) for p in posts]


@router.post("/{group_id}/posts", response_model=GroupPostResponse)
async def create_group_post(
    group_id: str,
    post_data: GroupPostCreate,
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)
):
    """Create a post in a group."""
    group = db.query(Group).filter(Group.id == group_id).first()
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    
    members = list(group.members or [])
    if current_user.id not in members:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Must be a member to post"
        )
    
    post_id = f"gp-{uuid.uuid4().hex[:12]}"
    
    new_post = GroupPost(
        id=post_id,
        group_id=group_id,
        user_id=current_user.id,
        user_name=current_user.name,
        user_avatar=current_user.avatar_url,
        content=post_data.content,
        date=datetime.now().strftime("%b %d, %Y"),
        likes=0,
    )
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    
    return GroupPostResponse.model_validate(new_post)
