"""
Database initialization — creates all tables on startup.
"""

from app.database import engine, Base

# Import all models so they are registered with Base.metadata
from app.models import User, OTP, Disease, Scan, Crop  # noqa: F401


async def init_db():
    """Create all database tables if they don't exist."""
    print("📦 Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables ready")
