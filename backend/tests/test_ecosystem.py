"""Database-backed module tests using an isolated in-memory SQLite database."""
from sqlalchemy import create_engine
from sqlalchemy.orm import Session
from sqlalchemy.pool import StaticPool
from fastapi import HTTPException
import pytest

from app.database import Base
from app.models.user import User
from app.models import ecosystem as models
from app.api.endpoints import ecosystem as api


@pytest.fixture
def session():
    engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(engine)
    with Session(engine) as db:
        yield db
    engine.dispose()


@pytest.fixture
def users(session):
    seller = User(full_name="Seller One", email="seller@example.invalid")
    buyer = User(full_name="Buyer Two", email="buyer@example.invalid")
    session.add_all([seller, buyer])
    session.commit()
    session.refresh(seller)
    session.refresh(buyer)
    return seller, buyer


def test_community_post_replies_and_ownership(session, users):
    seller, buyer = users
    post = api.create_post(api.PostInput(title="How to identify leaf spots?", body="I see dark spots on my tomato plants."), session, seller)
    assert post["author"] == "Seller One"
    comment = api.create_comment(post["id"], api.CommentInput(body="Share a clear field image."), session, buyer)
    assert comment["author"] == "Buyer Two"
    assert len(api.comments(post["id"], session, seller)) == 1
    with pytest.raises(HTTPException) as err:
        api.delete_post(post["id"], session, buyer)
    assert err.value.status_code == 404
    api.delete_post(post["id"], session, seller)
    assert api.posts(session, seller) == []


def test_listing_and_buyer_inquiry(session, users):
    seller, buyer = users
    listing = api.create_listing(
        api.ListingInput(crop="Tomato", quantity_kg=200, asking_price_per_kg=18, location="Patna, Bihar"),
        session, seller,
    )
    assert len(api.listings(session, buyer)) == 1
    with pytest.raises(HTTPException):
        api.inquire(listing["id"], api.InquiryInput(message="I would like 50 kg."), session, seller)
    api.inquire(listing["id"], api.InquiryInput(message="I would like 50 kg."), session, buyer)
    inbox = api.seller_inquiries(session, seller)
    assert len(inbox) == 1
    assert inbox[0]["buyer"] == "Buyer Two"
    with pytest.raises(HTTPException):
        api.close_listing(listing["id"], session, buyer)
    api.close_listing(listing["id"], session, seller)
    assert api.listings(session, buyer) == []
