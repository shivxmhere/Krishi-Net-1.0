"""Authenticated community and produce marketplace MVP endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.ecosystem import CommunityPost, CommunityComment, ProduceListing, BuyerInquiry

router = APIRouter(tags=["Community & Marketplace"])


class PostInput(BaseModel):
    title: str = Field(min_length=5, max_length=140)
    body: str = Field(min_length=10, max_length=4000)
    category: str = Field(default="General", max_length=40)


class CommentInput(BaseModel):
    body: str = Field(min_length=2, max_length=2000)


class ListingInput(BaseModel):
    crop: str = Field(min_length=2, max_length=100)
    quantity_kg: float = Field(gt=0, le=10000000)
    asking_price_per_kg: float = Field(ge=0, le=1000000)
    location: str = Field(min_length=2, max_length=150)
    description: str = Field(default="", max_length=2000)


class InquiryInput(BaseModel):
    message: str = Field(min_length=5, max_length=1000)


def serialize_post(db, post):
    author = db.get(User, post.author_id)
    return dict(id=post.id, title=post.title, body=post.body,
                category=post.category, author=author.full_name if author else "Member",
                author_id=post.author_id, created_at=post.created_at.isoformat())


def serialize_comment(db, comment):
    author = db.get(User, comment.author_id)
    return dict(id=comment.id, post_id=comment.post_id, body=comment.body,
                author=author.full_name if author else "Member",
                created_at=comment.created_at.isoformat())


def serialize_listing(db, listing):
    seller = db.get(User, listing.seller_id)
    return dict(id=listing.id, crop=listing.crop, quantity_kg=listing.quantity_kg,
                asking_price_per_kg=listing.asking_price_per_kg,
                location=listing.location, description=listing.description,
                status=listing.status, seller=seller.full_name if seller else "Member",
                seller_id=listing.seller_id, created_at=listing.created_at.isoformat())


@router.get("/community/posts")
def posts(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(CommunityPost).order_by(CommunityPost.created_at.desc()).limit(100).all()
    return [serialize_post(db, p) for p in rows]


@router.post("/community/posts", status_code=201)
def create_post(data: PostInput, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    post = CommunityPost(author_id=user.id, **data.model_dump())
    db.add(post)
    db.commit()
    db.refresh(post)
    return serialize_post(db, post)


@router.delete("/community/posts/{post_id}", status_code=204)
def delete_post(post_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    post = db.get(CommunityPost, post_id)
    if not post or post.author_id != user.id:
        raise HTTPException(status_code=404, detail="Post not found")
    db.query(CommunityComment).filter(CommunityComment.post_id == post_id).delete()
    db.delete(post)
    db.commit()


@router.get("/community/posts/{post_id}/comments")
def comments(post_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not db.get(CommunityPost, post_id):
        raise HTTPException(status_code=404, detail="Post not found")
    rows = db.query(CommunityComment).filter(CommunityComment.post_id == post_id).order_by(CommunityComment.created_at.asc()).limit(100).all()
    return [serialize_comment(db, x) for x in rows]


@router.post("/community/posts/{post_id}/comments", status_code=201)
def create_comment(post_id: str, data: CommentInput, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if not db.get(CommunityPost, post_id):
        raise HTTPException(status_code=404, detail="Post not found")
    comment = CommunityComment(post_id=post_id, author_id=user.id, body=data.body)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return serialize_comment(db, comment)


@router.get("/marketplace/listings")
def listings(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = db.query(ProduceListing).filter(ProduceListing.status == "open").order_by(ProduceListing.created_at.desc()).limit(100).all()
    return [serialize_listing(db, x) for x in rows]


@router.post("/marketplace/listings", status_code=201)
def create_listing(data: ListingInput, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    listing = ProduceListing(seller_id=user.id, **data.model_dump())
    db.add(listing)
    db.commit()
    db.refresh(listing)
    return serialize_listing(db, listing)


@router.delete("/marketplace/listings/{listing_id}", status_code=204)
def close_listing(listing_id: str, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    listing = db.get(ProduceListing, listing_id)
    if not listing or listing.seller_id != user.id:
        raise HTTPException(status_code=404, detail="Listing not found")
    listing.status = "closed"
    db.commit()


@router.post("/marketplace/listings/{listing_id}/inquiries", status_code=201)
def inquire(listing_id: str, data: InquiryInput, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    listing = db.get(ProduceListing, listing_id)
    if not listing or listing.status != "open":
        raise HTTPException(status_code=404, detail="Listing unavailable")
    if listing.seller_id == user.id:
        raise HTTPException(status_code=400, detail="You cannot enquire about your own listing")
    inquiry = BuyerInquiry(listing_id=listing_id, buyer_id=user.id, message=data.message)
    db.add(inquiry)
    db.commit()
    return {"id": inquiry.id, "message": "Enquiry recorded for the seller"}


@router.get("/marketplace/my-inquiries")
def seller_inquiries(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    rows = (db.query(BuyerInquiry, ProduceListing, User)
            .join(ProduceListing, ProduceListing.id == BuyerInquiry.listing_id)
            .join(User, User.id == BuyerInquiry.buyer_id)
            .filter(ProduceListing.seller_id == user.id)
            .order_by(BuyerInquiry.created_at.desc()).limit(100).all())
    return [dict(id=i.id, crop=l.crop, buyer=b.full_name, message=i.message,
                 created_at=i.created_at.isoformat()) for i, l, b in rows]
