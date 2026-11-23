"""Safety regression tests for the Krishi-Net 3.0 foundation."""
import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.api.endpoints.market import market_status


def test_market_status_is_not_falsely_live():
    status = market_status()
    assert status["live_prices_available"] is False
    assert status["source"] is None


def test_production_rejects_unsafe_signing_key():
    with pytest.raises(ValidationError):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="CHANGE_ME_IN_PRODUCTION",
            DATABASE_URL="postgresql://user:password@localhost/krishi",
            BACKEND_CORS_ORIGINS=["https://krishi-net.example"],
        )


def test_production_rejects_wildcard_cors():
    with pytest.raises(ValidationError):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="a" * 48,
            DATABASE_URL="postgresql://user:password@localhost/krishi",
            BACKEND_CORS_ORIGINS=["*"],
        )


def test_production_rejects_ephemeral_sqlite():
    with pytest.raises(ValidationError):
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="a" * 48,
            DATABASE_URL="sqlite:///./database.db",
            BACKEND_CORS_ORIGINS=["https://krishi-net.example"],
        )
