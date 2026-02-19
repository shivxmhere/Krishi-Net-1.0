"""
Central configuration using Pydantic Settings.
Reads from environment variables or .env file.
"""

from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Optional, Union
import os
import json


class Settings(BaseSettings):
    # ── Project ──
    PROJECT_NAME: str = "Krishi-Net API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # ── Database ──
    DATABASE_URL: str = "sqlite:///./krishi_net.db"

    # ── Security / JWT ──
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION_krishi_net_super_secret_key_2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7

    # ── CORS ──
    # Allow all origins for production ease (Vercel, Mobile, etc.)
    BACKEND_CORS_ORIGINS: Union[List[str], str] = ["*"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, str) and v.startswith("["):
            return json.loads(v)
        return v

    # ── Groq AI ──
    GROQ_API_KEY: Optional[str] = None

    # ── Twilio (SMS OTP) — Optional ──
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_PHONE_NUMBER: Optional[str] = None

    # ── SMTP (Email OTP) ──
    SMTP_SERVER: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_EMAIL: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None

    # ── ML Model ──
    MODEL_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        "saved_models",
        "krishi_net_v2",
    )

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
