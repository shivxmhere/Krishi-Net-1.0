
import random
import string
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

# Email service
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# SMS service (Twilio)
from twilio.rest import Client

from app.models.otp import OTP
from app.core.config import settings

class OTPService:
    def __init__(self):
        # Twilio setup (for SMS)
        self.twilio_client = Client(
            settings.TWILIO_ACCOUNT_SID,
            settings.TWILIO_AUTH_TOKEN
        )
        self.twilio_phone = settings.TWILIO_PHONE_NUMBER
        
        # Email setup (SMTP/SendGrid)
        self.smtp_server = settings.SMTP_SERVER
        self.smtp_port = settings.SMTP_PORT
        self.smtp_email = settings.SMTP_EMAIL
        self.smtp_password = settings.SMTP_PASSWORD
    
    def generate_otp(self) -> str:
        """Generate 6-digit OTP"""
        return ''.join(random.choices(string.digits, k=6))
    
    async def send_email_otp(
        self,
        email: str,
        purpose: str,
        db: Session,
        user_id: Optional[str] = None
    ) -> dict:
        """Send OTP to email (Gmail)"""
        
        # Check rate limit
        recent_otps = db.query(OTP).filter(
            OTP.email == email,
            OTP.created_at > datetime.utcnow() - timedelta(minutes=10)
        ).count()
        
        if recent_otps >= 3:
            return {
                "success": False,
                "error": "Too many OTP requests. Please wait 10 minutes."
            }
        
        # Generate OTP
        otp_code = self.generate_otp()
        
        # Save to database
        otp_record = OTP(
            user_id=user_id,
            code=otp_code,
            type="email",
            purpose=purpose,
            email=email,
            expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
        db.add(otp_record)
        db.commit()
        
        # Send email
        try:
            self._send_email(email, otp_code, purpose)
            
            return {
                "success": True,
                "message": f"OTP sent to {email}",
                "otp_id": str(otp_record.id),
                "expires_in": 300  # 5 minutes in seconds
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to send email: {str(e)}"
            }
    
    def _send_email(self, email: str, otp_code: str, purpose: str):
        """Send email via SMTP"""
        subject = "Your Krishi OTP Code"
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 30px; border-radius: 10px;">
                <h2 style="color: #22C55E;">🌾 Krishi</h2>
                <p>Your OTP for <strong>{purpose}</strong> is:</p>
                <h1 style="background: #22C55E; color: white; padding: 20px; text-align: center; border-radius: 8px; letter-spacing: 5px;">
                    {otp_code}
                </h1>
                <p style="color: #6B7280; font-size: 14px;">This OTP will expire in 5 minutes.</p>
                <p style="color: #6B7280; font-size: 14px;">If you didn't request this, please ignore this email.</p>
            </div>
        </body>
        </html>
        """
        
        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = self.smtp_email
        msg['To'] = email
        
        html_part = MIMEText(body, 'html')
        msg.attach(html_part)
        
        # Send email
        with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
            server.starttls()
            server.login(self.smtp_email, self.smtp_password)
            server.send_message(msg)
    
    async def send_sms_otp(
        self,
        phone: str,
        purpose: str,
        db: Session,
        user_id: Optional[str] = None
    ) -> dict:
        """Send OTP to phone (SMS via Twilio)"""
        
        # Check rate limit
        recent_otps = db.query(OTP).filter(
            OTP.phone == phone,
            OTP.created_at > datetime.utcnow() - timedelta(minutes=10)
        ).count()
        
        if recent_otps >= 3:
            return {
                "success": False,
                "error": "Too many OTP requests. Please wait 10 minutes."
            }
        
        # Generate OTP
        otp_code = self.generate_otp()
        
        # Save to database
        otp_record = OTP(
            user_id=user_id,
            code=otp_code,
            type="sms",
            purpose=purpose,
            phone=phone,
            expires_at=datetime.utcnow() + timedelta(minutes=5)
        )
        db.add(otp_record)
        db.commit()
        
        # Send SMS
        try:
            message = self.twilio_client.messages.create(
                body=f"Your Krishi OTP is: {otp_code}. Valid for 5 minutes.",
                from_=self.twilio_phone,
                to=phone
            )
            
            return {
                "success": True,
                "message": f"OTP sent to {phone}",
                "otp_id": str(otp_record.id),
                "expires_in": 300
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to send SMS: {str(e)}"
            }
    
    def verify_otp(
        self,
        otp_code: str,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        purpose: str = None,
        db: Session = None
    ) -> dict:
        """Verify OTP code"""
        
        query = db.query(OTP).filter(OTP.code == otp_code)
        
        if email:
            query = query.filter(OTP.email == email)
        if phone:
            query = query.filter(OTP.phone == phone)
        if purpose:
            query = query.filter(OTP.purpose == purpose)
        
        otp_record = query.order_by(OTP.created_at.desc()).first()
        
        if not otp_record:
            return {
                "success": False,
                "error": "Invalid OTP"
            }
        
        # Check if already verified
        if otp_record.is_verified:
            return {
                "success": False,
                "error": "OTP already used"
            }
        
        # Check if expired
        if otp_record.is_expired():
            return {
                "success": False,
                "error": "OTP expired. Please request a new one."
            }
        
        # Check attempts
        if otp_record.attempts >= 3:
            return {
                "success": False,
                "error": "Too many incorrect attempts. Please request a new OTP."
            }
        
        # Increment attempts
        otp_record.attempts += 1
        
        # Verify
        if otp_record.code == otp_code:
            otp_record.is_verified = True
            db.commit()
            
            return {
                "success": True,
                "message": "OTP verified successfully",
                "user_id": str(otp_record.user_id) if otp_record.user_id else None
            }
        else:
            db.commit()
            return {
                "success": False,
                "error": "Incorrect OTP"
            }

otp_service = OTPService()
