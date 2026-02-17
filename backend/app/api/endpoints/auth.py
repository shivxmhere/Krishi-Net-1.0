"""
Authentication endpoints: signup, login (password + OTP), verify, resend.
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    SignUpRequest, SignUpResponse,
    LoginRequest, LoginResponse,
    OTPLoginRequest, OTPVerifyRequest,
    SendOTPRequest,
)
from app.services.auth_service import auth_service
from app.services.otp_service import otp_service
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


# ============================================================
# SIGN UP
# ============================================================

@router.post("/signup", response_model=SignUpResponse)
async def signup(request: SignUpRequest, db: Session = Depends(get_db)):
    """Sign up new user with email/phone + password. Sends OTP for verification."""

    existing = db.query(User).filter(
        (User.email == request.email) | (User.phone == request.phone)
    ).first()

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email/phone already exists",
        )

    user = await auth_service.create_user(
        email=request.email,
        phone=request.phone,
        password=request.password,
        full_name=request.full_name,
        db=db,
    )

    # Auto-verify for now (Bypass OTP)
    user.email_verified = True
    user.phone_verified = True
    db.commit()

    # Create access token immediately
    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "message": "Account created successfully.",
        "user_id": str(user.id),
        "verification_required": False,  # Changed to False
        "otp_sent": False,
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "is_onboarded": user.is_onboarded,
        },
    }


@router.post("/verify-signup")
async def verify_signup(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Verify OTP during sign up."""

    result = otp_service.verify_otp(
        otp_code=request.otp,
        email=request.email,
        phone=request.phone,
        purpose="signup",
        db=db,
    )

    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])

    user = db.query(User).filter(
        (User.email == request.email) | (User.phone == request.phone)
    ).first()

    if request.email:
        user.email_verified = True
    if request.phone:
        user.phone_verified = True
    db.commit()

    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "message": "Verification successful",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "is_onboarded": user.is_onboarded,
        },
    }


# ============================================================
# LOGIN — PASSWORD
# ============================================================

@router.post("/login", response_model=LoginResponse)
async def login_with_password(request: LoginRequest, db: Session = Depends(get_db)):
    """Login with email/phone + password."""

    user = await auth_service.authenticate_user(
        email=request.email,
        phone=request.phone,
        password=request.password,
        db=db,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/phone or password",
        )

    user.last_login = datetime.utcnow()
    db.commit()

    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "is_onboarded": user.is_onboarded,
        },
    }


# ============================================================
# LOGIN — OTP (Passwordless)
# ============================================================

@router.post("/send-otp")
async def send_login_otp(request: SendOTPRequest, db: Session = Depends(get_db)):
    """Send OTP for passwordless login."""

    user = db.query(User).filter(
        (User.email == request.email) | (User.phone == request.phone)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email/phone",
        )

    if request.email:
        result = await otp_service.send_email_otp(
            email=request.email, purpose="login", db=db, user_id=str(user.id),
        )
    else:
        result = await otp_service.send_sms_otp(
            phone=request.phone, purpose="login", db=db, user_id=str(user.id),
        )

    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=result["error"],
        )

    return {"message": f"OTP sent to {request.email or request.phone}", "expires_in": result["expires_in"]}


@router.post("/login-otp")
async def login_with_otp(request: OTPLoginRequest, db: Session = Depends(get_db)):
    """Login with OTP (passwordless)."""

    result = otp_service.verify_otp(
        otp_code=request.otp,
        email=request.email,
        phone=request.phone,
        purpose="login",
        db=db,
    )

    if not result["success"]:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=result["error"])

    user = db.query(User).filter(
        (User.email == request.email) | (User.phone == request.phone)
    ).first()

    user.last_login = datetime.utcnow()
    db.commit()

    access_token = create_access_token(data={"sub": str(user.id)})

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "is_onboarded": user.is_onboarded,
        },
    }


@router.post("/resend-otp")
async def resend_otp(request: SendOTPRequest, db: Session = Depends(get_db)):
    """Resend OTP — delegates to send_login_otp."""
    return await send_login_otp(request, db)
