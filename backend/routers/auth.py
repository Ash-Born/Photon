from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
from backend.models import UserRegisterRequest, UserLoginRequest, VerifyTierRequest, ApiResponse
from backend.database import get_db_connection
from backend.utils.security import hash_password, verify_password, create_access_token, verify_tier_password

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register")
def register_user(req: UserRegisterRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check existing user
    cursor.execute("SELECT id FROM users WHERE email = ? OR username = ?", (req.email, req.username))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="User with this email or username already exists")

    pwd_hash = hash_password(req.password)
    cursor.execute("""
        INSERT INTO users (email, username, full_name, password_hash, tier, status)
        VALUES (?, ?, ?, ?, ?, 'active')
    """, (req.email, req.username, req.full_name or req.username, pwd_hash, req.tier or "lite"))
    
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    token = create_access_token({"sub": req.username, "user_id": user_id, "tier": req.tier or "lite"})

    return ApiResponse(
        success=True,
        message="User registered successfully",
        data={
            "token": token,
            "user": {
                "id": user_id,
                "email": req.email,
                "username": req.username,
                "tier": req.tier or "lite"
            }
        }
    )

@router.post("/login")
def login_user(req: UserLoginRequest):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, email, username, password_hash, tier, status FROM users WHERE username = ? OR email = ?", (req.username, req.username))
    user = cursor.fetchone()

    if not user or not verify_password(req.password, user["password_hash"]):
        conn.close()
        raise HTTPException(status_code=401, detail="Invalid username or password")

    if user["status"] != "active":
        conn.close()
        raise HTTPException(status_code=403, detail="Account is suspended")

    user_id = user["id"]
    token = create_access_token({"sub": user["username"], "user_id": user_id, "tier": user["tier"]})

    # Update last login
    cursor.execute("UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?", (user_id,))
    conn.commit()
    conn.close()

    return ApiResponse(
        success=True,
        message="Login successful",
        data={
            "token": token,
            "user": {
                "id": user_id,
                "email": user["email"],
                "username": user["username"],
                "tier": user["tier"]
            }
        }
    )

@router.post("/verify-tier")
def verify_tier_key(req: VerifyTierRequest):
    result = verify_tier_password(req.password)
    if not result.get("success"):
        raise HTTPException(status_code=401, detail=result.get("error", "Invalid passcode"))

    return ApiResponse(
        success=True,
        message="Tier verified successfully",
        data=result
    )

@router.post("/logout")
def logout_user():
    return ApiResponse(
        success=True,
        message="Logged out successfully"
    )
