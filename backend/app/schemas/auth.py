"""
Pydantic schemas for authentication request/response validation.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional


# ── Sign Up ──
class SignUpRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str = Field(..., min_length=8, max_length=128)


class SignUpResponse(BaseModel):
    message: str
    user_id: str
    verification_required: bool
    otp_sent: bool
    # Added for direct login (bypass OTP)
    access_token: Optional[str] = None
    token_type: str = "bearer"
    user: Optional["UserOut"] = None


# ── Login (Password) ──
class LoginRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    password: str


class UserOut(BaseModel):
    id: str
    email: Optional[str] = None
    phone: Optional[str] = None
    full_name: str
    is_onboarded: bool

    class Config:
        from_attributes = True


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── OTP ──
class SendOTPRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None


class OTPLoginRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    otp: str = Field(..., min_length=6, max_length=6)


class OTPVerifyRequest(BaseModel):
    email: Optional[str] = None
    phone: Optional[str] = None
    otp: str = Field(..., min_length=6, max_length=6)
