from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Any, Dict
from datetime import datetime

# Auth Models
class UserRegisterRequest(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)
    full_name: Optional[str] = None
    tier: Optional[str] = "lite"

class UserLoginRequest(BaseModel):
    username: str
    password: str

class VerifyTierRequest(BaseModel):
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

# Scan Models
class UrlScanRequest(BaseModel):
    url: str
    user_id: Optional[int] = None

class FakeNewsScanRequest(BaseModel):
    text: str
    source_url: Optional[str] = None
    user_id: Optional[int] = None

class MalwareFileScanRequest(BaseModel):
    filename: str
    file_size: Optional[int] = 0
    file_hash: Optional[str] = None
    user_id: Optional[int] = None

# Admin & Blocklist Models
class BlocklistAddRequest(BaseModel):
    domain: str
    threat_type: str = "suspicious"
    severity: int = 80
    source: Optional[str] = "manual"
    reason: Optional[str] = "Admin block"

class FeatureToggleRequest(BaseModel):
    key: str
    value: Any

class UpdateTierRequest(BaseModel):
    user_id: int
    tier: str

# Standard API Response wrapper
class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[Any] = None
