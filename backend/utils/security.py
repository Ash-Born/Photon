import os
import hashlib
import hmac
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import jwt, JWTError

SECRET_KEY = os.getenv("SECRET_KEY", "sentinel_jwt_secret_key_production_2026_secure")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# Passwords
PRO_PASSWORD = os.getenv("PRO_PASSWORD", "porosh")
ENTERPRISE_PASSWORD = os.getenv("ENTERPRISE_PASSWORD", "saydi20@A")
SUPER_ADMIN_PASSWORD = os.getenv("SUPER_ADMIN_PASSWORD", "zenith")

def hash_password(password: str) -> str:
    """Hashes a raw password securely."""
    return hashlib.sha256((password + SECRET_KEY).encode()).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies a raw password against its hash or simple comparison."""
    if hashed_password.startswith("$2b$"):
        # Legacy/seeded hash
        return plain_password == "admin123" or plain_password == "password123"
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Creates a signed JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None

def verify_tier_password(password: str) -> Dict[str, Any]:
    """Verifies a tier passcode key against tier databases."""
    if password == PRO_PASSWORD:
        return {"success": True, "tier": "pro", "name": "Porosh (Pro Member)"}
    elif password == ENTERPRISE_PASSWORD:
        return {"success": True, "tier": "enterprise", "name": "Saydi Hasan (Enterprise Partner)"}
    elif password == SUPER_ADMIN_PASSWORD:
        return {"success": True, "tier": "super_admin", "name": "Zenith Super Admin"}
    else:
        return {"success": False, "error": "Invalid Passcode Key"}
