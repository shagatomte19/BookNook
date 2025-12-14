"""
BookNook API - FastAPI Application Entry Point

A modern API backend for the BookNook book lovers' social platform.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.config import get_settings
from app.database import init_db, SessionLocal
from app.routers import auth, users, books, authors, reviews, posts, groups, messages, admin

settings = get_settings()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API backend for BookNook - A social platform for book lovers",
    docs_url="/docs",
    redoc_url="/redoc",
)

FRONTEND_URL = os.getenv("FRONTEND_URL", "")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",  # Vite dev server
        "https://book-nook-deploy.vercel.app",  # Your Vercel URL
        FRONTEND_URL,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(books.router)
app.include_router(authors.router)
app.include_router(reviews.router)
app.include_router(posts.router)
app.include_router(groups.router)
app.include_router(messages.router)
app.include_router(admin.router)


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup."""
    init_db()
    
    # Create default admin user if not exists
    from app.models.user import User
    from app.services.auth import get_password_hash
    from datetime import datetime
    
    db = SessionLocal()
    try:
        admin = db.query(User).filter(User.email == settings.DEFAULT_ADMIN_EMAIL).first()
        if not admin:
            admin_user = User(
                id="admin-001",
                email=settings.DEFAULT_ADMIN_EMAIL,
                name="Admin",
                hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
                avatar_url="https://ui-avatars.com/api/?name=Admin&background=dc2626&color=fff",
                bio="BookNook System Administrator",
                is_admin=True,
                is_active=True,
                joined_date=datetime.now().strftime("%b %Y"),
                following=[],
                followers=[],
            )
            db.add(admin_user)
            db.commit()
            print(f"✅ Default admin user created: {settings.DEFAULT_ADMIN_EMAIL}")
        
        # Auto-seed database if empty (only in production on Render)
        if os.getenv("RENDER"):  # Render sets this environment variable
            from app.models.book import Book
            
            book_count = db.query(Book).count()
            
            if book_count == 0:
                print("🌱 Database is empty, auto-seeding...")
                try:
                    from app.utils.seed import seed_database
                    seed_database()
                    print("✅ Database auto-seeded successfully!")
                except Exception as e:
                    print(f"❌ Auto-seed failed: {e}")
                    
    finally:
        db.close()


@app.get("/")
async def root():
    """Root endpoint returning API info."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/admin/seed")
async def manual_seed():
    """
    Manual seed endpoint - Seeds the database with sample data.
    ⚠️ Remove this endpoint in production after initial setup!
    """
    try:
        from app.utils.seed import seed_database
        from app.models.book import Book
        
        db = SessionLocal()
        try:
            # Check if already seeded
            book_count = db.query(Book).count()
            
            if book_count > 0:
                return {
                    "status": "info",
                    "message": f"Database already has {book_count} books. Skipping seed.",
                    "hint": "Delete the database to reseed or modify seed script to force reseed."
                }
            
            # Run seed
            seed_database()
            
            # Verify
            new_count = db.query(Book).count()
            
            return {
                "status": "success",
                "message": "Database seeded successfully! 🌱",
                "books_added": new_count
            }
        finally:
            db.close()
            
    except ImportError as e:
        return {
            "status": "error",
            "message": f"Seed module not found: {e}",
            "hint": "Make sure app/utils/seed.py exists"
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Seed failed: {str(e)}",
            "type": type(e).__name__
        }