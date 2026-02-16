
from sqlalchemy import Column, String, DateTime, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime, timedelta
from app.database import Base

class OTP(Base):
    __tablename__ = "otps"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=True)  # Null for sign up OTPs
    
    # OTP details
    code = Column(String(6), nullable=False)
    type = Column(String, nullable=False)  # "email" or "sms"
    purpose = Column(String, nullable=False)  # "signup", "login", "forgot_password"
    
    # Contact info
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    # Status
    is_verified = Column(Boolean, default=False)
    attempts = Column(Integer, default=0)
    
    # Expiry
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def is_expired(self):
        return datetime.utcnow() > self.expires_at
    
    def is_valid(self):
        return not self.is_expired() and not self.is_verified and self.attempts < 3
