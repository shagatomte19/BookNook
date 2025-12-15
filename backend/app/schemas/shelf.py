from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from app.models.shelf import ShelfType
from app.schemas.book import BookResponse  # Assuming we'll want to return book data

class ShelfItemBase(BaseModel):
    book_id: str

class ShelfItemCreate(ShelfItemBase):
    pass

class ShelfItemResponse(ShelfItemBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    shelf_id: str
    added_at: datetime
    book: Optional[BookResponse] = None

class ShelfBase(BaseModel):
    name: str
    is_public: bool = True

class ShelfCreate(ShelfBase):
    type: ShelfType = ShelfType.CUSTOM

class ShelfUpdate(BaseModel):
    name: Optional[str] = None
    is_public: Optional[bool] = None

class ShelfResponse(ShelfBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    user_id: str
    type: str  # ShelfType
    items: List[ShelfItemResponse] = []
    created_at: datetime

