"""Small, database-backed community and produce discovery models."""
import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Float, ForeignKey
from app.database import Base


def uid():
    return str(uuid.uuid4())


class CommunityPost(Base):
    __tablename__ = "community_posts"
    id = Column(String, primary_key=True, default=uid)
    author_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(140), nullable=False)
    body = Column(Text, nullable=False)
    category = Column(String(40), nullable=False, default="General")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class CommunityComment(Base):
    __tablename__ = "community_comments"
    id = Column(String, primary_key=True, default=uid)
    post_id = Column(String, ForeignKey("community_posts.id"), nullable=False, index=True)
    author_id = Column(String, ForeignKey("users.id"), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class ProduceListing(Base):
    __tablename__ = "produce_listings"
    id = Column(String, primary_key=True, default=uid)
    seller_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    crop = Column(String(100), nullable=False)
    quantity_kg = Column(Float, nullable=False)
    asking_price_per_kg = Column(Float, nullable=False)
    location = Column(String(150), nullable=False)
    description = Column(Text, default="", nullable=False)
    status = Column(String(20), default="open", nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class BuyerInquiry(Base):
    __tablename__ = "buyer_inquiries"
    id = Column(String, primary_key=True, default=uid)
    listing_id = Column(String, ForeignKey("produce_listings.id"), nullable=False, index=True)
    buyer_id = Column(String, ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
