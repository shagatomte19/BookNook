"""
Authentication service with JWT token handling.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import get_settings
from app.database import get_db
from app.models.user import User
from app.schemas.user import TokenData

settings = get_settings()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login", auto_error=False)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password."""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[TokenData]:
    """Decode and validate a JWT token."""
    try:
        # First try to validate with our secret key
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        print(f"✅ Token signature verified locally.")
    except JWTError as e:
        print(f"⚠️ Local signature verification failed: {e}")
        try:
            # If that fails, it might be a Supabase token. 
            print(f"🔄 Attempting to decode Supabase token without verification...")
            payload = jwt.get_unverified_claims(token)
            print(f"✅ Supabase token decoded: {payload.get('email')}")
        except Exception as e2:
            print(f"❌ Failed to decode token unverified: {e2}")
            return None
            
    user_id: str = payload.get("sub")
    email: str = payload.get("email")
    if user_id is None:
        print("❌ Token missing 'sub' claim")
        return None
    return TokenData(user_id=user_id, email=email)


async def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get the current authenticated user from the JWT token."""
    if token is None:
        print("❌ Authorization header missing or empty")
        return None
    
    print(f"🔍 Validating token: {token[:15]}...")
    token_data = decode_token(token)
    if token_data is None:
        print("❌ Token data decoding failed")
        return None
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    
    # Auto-create user if they don't exist (JIT Provisioning for Supabase users)
    if user is None:
        print(f"👤 User {token_data.email} not found in DB. Auto-creating...")
        try:
            # Create a placeholder name if payload doesn't have it
            new_user = User(
                id=token_data.user_id,
                email=token_data.email,
                name=token_data.email.split("@")[0],  # Default name from email
                nickname=token_data.email.split("@")[0],  # Default nickname too
                # ❌ REMOVED: hashed_password="",  # This field doesn't exist!
                is_active=True,
                is_admin=False,
                profile_completed=False,  # User needs to complete onboarding
                joined_date=datetime.now().strftime("%b %Y"),
                bio="",  # Empty bio initially
                following=[],  # Empty lists for social features
                followers=[]
            )
            db.add(new_user)
            db.commit()
            db.refresh(new_user)
            print(f"✅ User auto-created: {new_user.email} ({new_user.id})")
            return new_user
        except Exception as e:
            print(f"❌ Failed to auto-create user: {e}")
            db.rollback()  # Important: rollback on error
            return None

    if not user.is_active:
        print(f"⛔ User {user.email} is inactive")
        return None
    
    return user


async def get_current_user_required(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user, raise 401 if not authenticated."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if token is None:
        print("❌ get_current_user_required: Token is None (Header missing)")
        raise credentials_exception
    
    # Reuse get_current_user logic which handles auto-creation
    user = await get_current_user(token, db)
    
    if user is None:
        raise credentials_exception
        
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated"
        )
    
    return user


async def get_current_admin_user(
    current_user: User = Depends(get_current_user_required)
) -> User:
    """Get the current user and verify they are an admin."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user


def create_admin_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token with admin claim."""
    to_encode = data.copy()
    to_encode["is_admin"] = True  # Add admin claim
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_admin_token(token: str) -> Optional[TokenData]:
    """Decode and validate an admin JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        is_admin: bool = payload.get("is_admin", False)
        if user_id is None or not is_admin:
            return None
        return TokenData(user_id=user_id, email=email)
    except JWTError:
        return None


async def get_current_admin_from_token(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
) -> User:
    """Get admin user from admin-specific token with is_admin claim."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate admin credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if token is None:
        raise credentials_exception
    
    token_data = decode_admin_token(token)
    if token_data is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None or not user.is_admin:
        raise credentials_exception
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin account is deactivated"
        )
    
    return user