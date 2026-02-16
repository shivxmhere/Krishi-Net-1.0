
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.auth import (
    SignUpRequest, SignUpResponse,
    LoginRequest, LoginResponse,
    OTPLoginRequest, OTPVerifyRequest,
    SendOTPRequest
)
from app.services.auth_service import auth_service
from app.services.otp_service import otp_service
from app.core.security import create_access_token

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

# ============================================================
# SIGN UP ENDPOINTS
# ============================================================

@router.post("/signup", response_model=SignUpResponse)
async def signup(request: SignUpRequest, db: Session = Depends(get_db)):
    """
    Sign up new user with email/phone + password
    Sends OTP for verification
    """
    
    # Check if user already exists
    existing_user = db.query(User).filter(
        (User.email == request.email) | (User.phone == request.phone)
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email/phone already exists"
        )
    
    # Validate password strength
    if len(request.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters"
        )
    
    # Create user
    user = await auth_service.create_user(
        email=request.email,
        phone=request.phone,
        password=request.password,
        full_name=request.full_name,
        db=db
    )
    
    # Send verification OTP
    if request.email:
        otp_result = await otp_service.send_email_otp(
            email=request.email,
            purpose="signup",
            db=db,
            user_id=str(user.id)
        )
    else:
        otp_result = await otp_service.send_sms_otp(
            phone=request.phone,
            purpose="signup",
            db=db,
            user_id=str(user.id)
        )
    
    return {
        "message": "Account created successfully. Please verify your email/phone.",
        "user_id": str(user.id),
        "verification_required": True,
        "otp_sent": otp_result["success"]
    }

@router.post("/verify-signup")
async def verify_signup(request: OTPVerifyRequest, db: Session = Depends(get_db)):
    """Verify OTP during sign up"""
    
    # Verify OTP
    result = otp_service.verify_otp(
        otp_code=request.otp,
        email=request.email,
        phone=request.phone,
        purpose="signup",
        db=db
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    # Mark user as verified
    user = db.query(User).filter(
        (User.email == request.email) | (User.phone == request.phone)
    ).first()
    
    if request.email:
        user.email_verified = True
    if request.phone:
        user.phone_verified = True
    
    db.commit()
    
    # Generate access token
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
            "is_onboarded": user.is_onboarded
        }
    }

# ============================================================
# LOGIN ENDPOINTS (PASSWORD + OTP)
# ============================================================

@router.post("/login", response_model=LoginResponse)
async def login_with_password(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """Login with email/phone + password"""
    
    user = await auth_service.authenticate_user(
        email=request.email,
        phone=request.phone,
        password=request.password,
        db=db
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/phone or password"
        )
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Generate token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "is_onboarded": user.is_onboarded
        }
    }

@router.post("/send-otp")
async def send_login_otp(
    request: SendOTPRequest,
    db: Session = Depends(get_db)
):
    """Send OTP for passwordless login"""
    
    # Check if user exists
    user = db.query(User).filter(
        (User.email == request.email) | (User.phone == request.phone)
    ).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No account found with this email/phone"
        )
    
    # Send OTP
    if request.email:
        result = await otp_service.send_email_otp(
            email=request.email,
            purpose="login",
            db=db,
            user_id=str(user.id)
        )
    else:
        result = await otp_service.send_sms_otp(
            phone=request.phone,
            purpose="login",
            db=db,
            user_id=str(user.id)
        )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result["error"]
        )
    
    return {
        "message": f"OTP sent to {request.email or request.phone}",
        "expires_in": result["expires_in"]
    }

@router.post("/login-otp")
async def login_with_otp(
    request: OTPLoginRequest,
    db: Session = Depends(get_db)
):
    """Login with OTP (passwordless)"""
    
    # Verify OTP
    result = otp_service.verify_otp(
        otp_code=request.otp,
        email=request.email,
        phone=request.phone,
        purpose="login",
        db=db
    )
    
    if not result["success"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=result["error"]
        )
    
    # Get user
    user = db.query(User).filter(
        (User.email == request.email) | (User.phone == request.phone)
    ).first()
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.commit()
    
    # Generate token
    access_token = create_access_token(data={"sub": str(user.id)})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user.id),
            "email": user.email,
            "phone": user.phone,
            "full_name": user.full_name,
            "is_onboarded": user.is_onboarded
        }
    }

@router.post("/resend-otp")
async def resend_otp(
    request: SendOTPRequest,
    db: Session = Depends(get_db)
):
    """Resend OTP"""
    return await send_login_otp(request, db)
