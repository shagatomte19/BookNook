import sys
import os
import requests
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add backend to path
sys.path.append(os.getcwd())

from app.database import Base
from app.models.user import User

# Database Connection
DATABASE_URL = "sqlite:///./booknook.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)
db = SessionLocal()

print("--- Checking Database Users ---")
try:
    users = db.query(User).all()
    count = len(users)
    print(f"Total Users: {count}")
    for user in users:
        print(f"User: {user.email} (ID: {user.id}, Admin: {user.is_admin})")
except Exception as e:
    print(f"Error querying database: {e}")
finally:
    db.close()

print("\n--- Testing Login API ---")
try:
    # Try default admin credentials
    API_URL = "http://localhost:8000/auth/login"
    payload = {
        "email": "admin@booknook.com",
        "password": "admin" 
    }
    # Note: Password might be different, checking config next tool call to be sure, 
    # but guessing 'admin' or 'secret' or checking config file.
    # main.py used settings.DEFAULT_ADMIN_PASSWORD
    
    # We will fetch settings in the script if possible, or just print the attempt.
    from app.config import get_settings
    settings = get_settings()
    print(f"Attempting login for: {settings.DEFAULT_ADMIN_EMAIL}")
    print(f"Using configured password from settings.")
    
    payload["password"] = settings.DEFAULT_ADMIN_PASSWORD
    
    response = requests.post(API_URL, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")

except Exception as e:
    print(f"Error testing API: {e}")
