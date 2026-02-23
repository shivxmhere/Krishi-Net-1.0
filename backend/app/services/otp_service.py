"""
OTP generation, sending (Email/SMS), and verification.
Twilio and SMTP are OPTIONAL — if not configured, OTP is logged to console.
"""

import random
import string
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session

from app.models.otp import OTP
from app.core.config import settings


class OTPService:
    def __init__(self):
        self._twilio_client = None
        self._twilio_ready = False
        self._smtp_ready = False

        # ── Twilio (optional) ──
        if settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN:
            try:
                from twilio.rest import Client
                self._twilio_client = Client(
                    settings.TWILIO_ACCOUNT_SID,
                    settings.TWILIO_AUTH_TOKEN,
                )
                self._twilio_ready = True
                print("✅ Twilio SMS client initialized")
            except ImportError:
                print("⚠️  Twilio package not installed — SMS OTP disabled")
            except Exception as e:
                print(f"⚠️  Twilio not available: {e}")

        # ── SMTP (optional) ──
        if settings.SMTP_EMAIL and settings.SMTP_PASSWORD:
            self._smtp_ready = True
            print("✅ SMTP email configured")
        else:
            print("⚠️  SMTP not configured — OTPs will be logged to console")

    def generate_otp(self) -> str:
        """Generate 6-digit OTP."""
        return ''.join(random.choices(string.digits, k=6))

    # ──────────────────── EMAIL OTP ────────────────────
    async def send_email_otp(
        self,
        email: str,
        purpose: str,
        db: Session,
        user_id: Optional[str] = None,
    ) -> dict:
        """Send OTP to email. Falls back to console logging if SMTP not configured."""

        # Rate limit
        recent = db.query(OTP).filter(
            OTP.email == email,
            OTP.created_at > datetime.utcnow() - timedelta(minutes=10),
        ).count()

        if recent >= 3:
            return {"success": False, "error": "Too many OTP requests. Wait 10 minutes."}

        otp_code = self.generate_otp()

        otp_record = OTP(
            user_id=user_id,
            code=otp_code,
            type="email",
            purpose=purpose,
            email=email,
            expires_at=datetime.utcnow() + timedelta(minutes=5),
        )
        db.add(otp_record)
        db.commit()
        db.refresh(otp_record)

        if self._smtp_ready:
            try:
                self._send_email(email, otp_code, purpose)
            except Exception as e:
                print(f"⚠️  Email send failed: {e}")
        else:
            # ── Demo mode — print to console ──
            print(f"📨 [DEMO OTP] Email to {email}: {otp_code}  (purpose: {purpose})")

        return {
            "success": True,
            "message": f"OTP sent to {email}",
            "otp_id": str(otp_record.id),
            "expires_in": 300,
        }

    def _send_email(self, email: str, otp_code: str, purpose: str):
        """Actual SMTP send — only called if SMTP is configured."""
        import smtplib
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart

        body = f"""
        <html><body style="font-family:Arial,sans-serif;padding:20px;">
        <div style="max-width:600px;margin:0 auto;background:#f9fafb;padding:30px;border-radius:10px;">
            <h2 style="color:#22C55E;">🌾 Krishi-Net</h2>
            <p>Your OTP for <strong>{purpose}</strong> is:</p>
            <h1 style="background:#22C55E;color:white;padding:20px;text-align:center;border-radius:8px;letter-spacing:5px;">{otp_code}</h1>
            <p style="color:#6B7280;font-size:14px;">Expires in 5 minutes.</p>
        </div>
        </body></html>
        """

        msg = MIMEMultipart("alternative")
        msg["Subject"] = "Your Krishi OTP Code"
        msg["From"] = settings.SMTP_EMAIL
        msg["To"] = email
        msg.attach(MIMEText(body, "html"))

        with smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_EMAIL, settings.SMTP_PASSWORD)
            server.send_message(msg)

    # ──────────────────── SMS OTP ────────────────────
    async def send_sms_otp(
        self,
        phone: str,
        purpose: str,
        db: Session,
        user_id: Optional[str] = None,
    ) -> dict:
        """Send OTP via SMS. Falls back to console logging if Twilio not configured."""

        recent = db.query(OTP).filter(
            OTP.phone == phone,
            OTP.created_at > datetime.utcnow() - timedelta(minutes=10),
        ).count()

        if recent >= 3:
            return {"success": False, "error": "Too many OTP requests. Wait 10 minutes."}

        otp_code = self.generate_otp()

        otp_record = OTP(
            user_id=user_id,
            code=otp_code,
            type="sms",
            purpose=purpose,
            phone=phone,
            expires_at=datetime.utcnow() + timedelta(minutes=5),
        )
        db.add(otp_record)
        db.commit()
        db.refresh(otp_record)

        if self._twilio_ready:
            try:
                self._twilio_client.messages.create(
                    body=f"Your Krishi OTP is: {otp_code}. Valid for 5 minutes.",
                    from_=settings.TWILIO_PHONE_NUMBER,
                    to=phone,
                )
            except Exception as e:
                print(f"⚠️  SMS send failed: {e}")
        else:
            print(f"📱 [DEMO OTP] SMS to {phone}: {otp_code}  (purpose: {purpose})")

        return {
            "success": True,
            "message": f"OTP sent to {phone}",
            "otp_id": str(otp_record.id),
            "expires_in": 300,
        }

    # ──────────────────── VERIFY ────────────────────
    def verify_otp(
        self,
        otp_code: str,
        email: Optional[str] = None,
        phone: Optional[str] = None,
        purpose: Optional[str] = None,
        db: Session = None,
    ) -> dict:
        """Verify an OTP code."""
        query = db.query(OTP).filter(OTP.code == otp_code)

        if email:
            query = query.filter(OTP.email == email)
        if phone:
            query = query.filter(OTP.phone == phone)
        if purpose:
            query = query.filter(OTP.purpose == purpose)

        otp_record = query.order_by(OTP.created_at.desc()).first()

        if not otp_record:
            return {"success": False, "error": "Invalid OTP"}
        if otp_record.is_verified:
            return {"success": False, "error": "OTP already used"}
        if otp_record.is_expired():
            return {"success": False, "error": "OTP expired. Request a new one."}
        if otp_record.attempts >= 3:
            return {"success": False, "error": "Too many attempts. Request a new OTP."}

        otp_record.attempts += 1

        if otp_record.code == otp_code:
            otp_record.is_verified = True
            db.commit()
            return {
                "success": True,
                "message": "OTP verified successfully",
                "user_id": str(otp_record.user_id) if otp_record.user_id else None,
            }
        else:
            db.commit()
            return {"success": False, "error": "Incorrect OTP"}


otp_service = OTPService()
