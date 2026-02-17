"""
Auth service: user creation, authentication, password management.
"""

from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session

from app.models.user import User
from app.core.security import hash_password, verify_password


class AuthService:
    async def create_user(
        self,
        email: Optional[str],
        phone: Optional[str],
        password: str,
        full_name: str,
        db: Session,
    ) -> User:
        """Create a new user with hashed password."""
        user = User(
            email=email,
            phone=phone,
            hashed_password=hash_password(password),
            full_name=full_name,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    async def authenticate_user(
        self,
        email: Optional[str],
        phone: Optional[str],
        password: str,
        db: Session,
    ) -> Optional[User]:
        """Authenticate user by email/phone and password. Returns User or None."""
        query = db.query(User)
        if email:
            query = query.filter(User.email == email)
        elif phone:
            query = query.filter(User.phone == phone)
        else:
            return None

        user = query.first()
        if not user:
            return None
        if not user.hashed_password:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    def get_user_by_id(self, user_id: str, db: Session) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()


auth_service = AuthService()
