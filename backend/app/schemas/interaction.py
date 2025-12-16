from pydantic import BaseModel
from datetime import datetime
from typing import Optional

# Comment Schemas
class CommentBase(BaseModel):
    content: str
    post_id: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(CommentBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    # We might want to include user info here for display
    user_name: Optional[str] = None
    user_avatar: Optional[str] = None

    class Config:
        orm_mode = True

# Like Schemas
class LikeBase(BaseModel):
    post_id: str

class LikeCreate(LikeBase):
    pass


class LikeResponse(LikeBase):
    id: str
    user_id: str
    created_at: datetime

    class Config:
        orm_mode = True


# Batch Schemas
class BatchLikeRequest(BaseModel):
    """Request schema for batch fetching likes."""
    post_ids: list[str]


class PostLikeInfo(BaseModel):
    """Response schema for like info of a single post."""
    post_id: str
    likes_count: int
    is_liked_by_user: bool
