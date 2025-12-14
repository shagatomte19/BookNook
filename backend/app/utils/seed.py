# """
# Data seeding utility to migrate existing JSON data to the database.

# Run this script to populate the database with initial data from the JSON files.
# Usage: python -m app.utils.seed
# """

import json
import os
import uuid
from pathlib import Path

# Add parent directory to path for imports
import sys
sys.path.insert(0, str(Path(__file__).parent.parent.parent))

from app.database import SessionLocal, init_db
from app.models.book import Book, PriceOption
from app.models.author import Author
from app.models.post import Post
from app.models.user import User
from app.models.group import Group
from app.models.review import Review
from app.services.auth import get_password_hash


def load_json_file(filepath: str) -> dict:
    """Load and parse a JSON file."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)


def seed_database():
    """Seed the database with data from JSON files."""
    # Initialize database tables
    init_db()
    
    db = SessionLocal()
    
    try:
        # Find the data files (they should be in the frontend folder)
        project_root = Path(__file__).parent.parent.parent.parent
        frontend_folder = project_root / "backend"
        data_file = frontend_folder / "data.json"
        posts_file = frontend_folder / "posts.json"
        
        print(f"📂 Looking for data files in: {frontend_folder}")
        
        if not data_file.exists():
            print(f"❌ data.json not found at {data_file}")
            return
        
        if not posts_file.exists():
            print(f"❌ posts.json not found at {posts_file}")
            return
        
        # Load data
        print("📖 Loading data.json...")
        data = load_json_file(str(data_file))
        
        print("📖 Loading posts.json...")
        posts_data = load_json_file(str(posts_file))
        
        # Seed Authors
        print("\n👤 Seeding authors...")
        authors = data.get("authors", [])
        for author_data in authors:
            existing = db.query(Author).filter(Author.id == author_data["id"]).first()
            if not existing:
                author = Author(
                    id=author_data["id"],
                    name=author_data["name"],
                    image_url=author_data.get("imageUrl"),
                    bio=author_data.get("bio"),
                    born=author_data.get("born"),
                    died=author_data.get("died"),
                    top_book_ids=author_data.get("topBookIds", []),
                )
                db.add(author)
        db.commit()
        print(f"   ✅ Added {len(authors)} authors")
        
        # Seed Books
        print("\n📚 Seeding books...")
        books = data.get("books", [])
        for book_data in books:
            existing = db.query(Book).filter(Book.id == book_data["id"]).first()
            if not existing:
                book = Book(
                    id=book_data["id"],
                    title=book_data["title"],
                    author=book_data["author"],
                    publisher=book_data.get("publisher"),
                    cover_url=book_data.get("coverUrl"),
                    description=book_data.get("description"),
                    published_year=book_data.get("publishedYear"),
                    genres=book_data.get("genres", []),
                )
                db.add(book)
                db.flush()  # Get the book ID
                
                # Add price options
                for po_data in book_data.get("priceOptions", []):
                    price_option = PriceOption(
                        id=f"po-{uuid.uuid4().hex[:12]}",
                        book_id=book_data["id"],
                        vendor=po_data["vendor"],
                        price=po_data["price"],
                        url=po_data.get("url"),
                        in_stock=po_data.get("inStock", True),
                    )
                    db.add(price_option)
        db.commit()
        print(f"   ✅ Added {len(books)} books with price options")
        
        # Seed Posts
        print("\n📝 Seeding posts...")
        posts = posts_data.get("posts", [])
        for post_data in posts:
            existing = db.query(Post).filter(Post.id == post_data["id"]).first()
            if not existing:
                post = Post(
                    id=post_data["id"],
                    type=post_data["type"],
                    title=post_data["title"],
                    excerpt=post_data.get("excerpt"),
                    content=post_data.get("content"),
                    author=post_data["author"],
                    date=post_data.get("date"),
                    image_url=post_data.get("imageUrl"),
                    tags=post_data.get("tags", []),
                    is_approved=1,
                )
                db.add(post)
        db.commit()
        print(f"   ✅ Added {len(posts)} posts")
        
        # Seed sample users
        print("\n👥 Seeding sample users...")
        sample_users = [
            {
                "id": "u_sarah",
                "email": "sarah@booknook.com",
                "name": "Sarah Jenkins",
                "password": "password123",
                "bio": "Editor turned author. Cozy mystery enthusiast.",
                "avatar_url": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&h=200&q=80",
                "is_admin": False,
            },
            {
                "id": "u_editorial",
                "email": "editorial@booknook.com",
                "name": "BookNook Editorial",
                "password": "password123",
                "bio": "Official updates and curated lists from the BookNook team.",
                "avatar_url": "https://ui-avatars.com/api/?name=BookNook+Editorial&background=138A92&color=fff",
                "is_admin": True,
            },
            {
                "id": "u2",
                "email": "john@booknook.com",
                "name": "John Doe",
                "password": "password123",
                "bio": "Casual reader.",
                "avatar_url": "https://i.pravatar.cc/150?u=u2",
                "is_admin": False,
            },
        ]
        
        for user_data in sample_users:
            existing = db.query(User).filter(User.id == user_data["id"]).first()
            if not existing:
                user = User(
                    id=user_data["id"],
                    email=user_data["email"],
                    name=user_data["name"],
                    hashed_password=get_password_hash(user_data["password"]),
                    bio=user_data["bio"],
                    avatar_url=user_data["avatar_url"],
                    is_admin=user_data["is_admin"],
                    is_active=True,
                    joined_date="Jan 2024",
                    following=[],
                    followers=[],
                )
                db.add(user)
        db.commit()
        print(f"   ✅ Added {len(sample_users)} sample users")
        
        # Seed sample groups
        print("\n🏠 Seeding groups...")
        sample_groups = [
            {
                "id": "g1",
                "name": "Sci-Fi Enthusiasts",
                "description": "A place to discuss time travel, space operas, and the future of humanity.",
                "admin_id": "admin-001",
                "image_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
                "tags": ["Sci-Fi", "Future", "Tech"],
                "members": ["admin-001", "u2", "u_sarah"],
                "pending_members": [],
            },
            {
                "id": "g2",
                "name": "Classic Literature Club",
                "description": "Revisiting the classics from Austen to Dickens.",
                "admin_id": "u_sarah",
                "image_url": "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=800&q=80",
                "tags": ["Classics", "History", "Literature"],
                "members": ["u_sarah", "u2"],
                "pending_members": ["admin-001"],
            },
        ]
        
        for group_data in sample_groups:
            existing = db.query(Group).filter(Group.id == group_data["id"]).first()
            if not existing:
                group = Group(
                    id=group_data["id"],
                    name=group_data["name"],
                    description=group_data["description"],
                    admin_id=group_data["admin_id"],
                    image_url=group_data["image_url"],
                    tags=group_data["tags"],
                    members=group_data["members"],
                    pending_members=group_data["pending_members"],
                )
                db.add(group)
        db.commit()
        print(f"   ✅ Added {len(sample_groups)} groups")
        
        # Seed sample reviews
        print("\n⭐ Seeding sample reviews...")
        sample_reviews = [
            {
                "id": "r1",
                "book_id": "b1",
                "user_id": "u_sarah",
                "user_name": "Sarah Jenkins",
                "rating": 5,
                "content": "Absolutely mind-bending! Thorne outdoes himself with this exploration of temporal mechanics.",
                "date": "Dec 1, 2024",
            },
            {
                "id": "r2",
                "book_id": "b2",
                "user_id": "u2",
                "user_name": "John Doe",
                "rating": 4,
                "content": "A beautiful homage to the noir genre with stunning period detail.",
                "date": "Nov 28, 2024",
            },
        ]
        
        for review_data in sample_reviews:
            existing = db.query(Review).filter(Review.id == review_data["id"]).first()
            if not existing:
                review = Review(
                    id=review_data["id"],
                    book_id=review_data["book_id"],
                    user_id=review_data["user_id"],
                    user_name=review_data["user_name"],
                    rating=review_data["rating"],
                    content=review_data["content"],
                    date=review_data["date"],
                    is_approved=1,
                )
                db.add(review)
        db.commit()
        print(f"   ✅ Added {len(sample_reviews)} reviews")
        
        print("\n🎉 Database seeding complete!")
        print("\n📊 Summary:")
        print(f"   - Authors: {db.query(Author).count()}")
        print(f"   - Books: {db.query(Book).count()}")
        print(f"   - Posts: {db.query(Post).count()}")
        print(f"   - Users: {db.query(User).count()}")
        print(f"   - Groups: {db.query(Group).count()}")
        print(f"   - Reviews: {db.query(Review).count()}")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
