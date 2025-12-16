"""
Database configuration and session management.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import get_settings

settings = get_settings()

# Create SQLAlchemy engine
# Use different connection args for SQLite vs PostgreSQL
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}  # Only needed for SQLite

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,  # Verify connections before using
)

# Log which database we're connected to
db_type = "PostgreSQL (Supabase)" if "postgresql" in settings.DATABASE_URL else "SQLite"
print(f"🔌 Database: {db_type}")

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    from app.models import user, book, author, review, post, group, message
    
    # Skip table creation for Supabase - tables are managed via Supabase Dashboard
    if "postgresql" in settings.DATABASE_URL or "supabase" in settings.DATABASE_URL:
        print("📦 Using Supabase - skipping table creation (tables managed externally)")
        return
    
    # Only create tables for SQLite (local development)
    Base.metadata.create_all(bind=engine)
