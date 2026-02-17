"""
Crop management endpoints (CRUD).
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.crop import Crop
from app.models.user import User
from app.core.security import get_current_user
from app.schemas.crops import CropCreate, CropUpdate, CropOut

router = APIRouter(prefix="/crops", tags=["Farm Management"])


@router.get("/", response_model=List[CropOut])
async def list_crops(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all crops for the current user."""
    crops = db.query(Crop).filter(Crop.user_id == current_user.id).all()
    return [
        CropOut(
            id=str(c.id),
            name=c.name,
            variety=c.variety,
            planting_date=str(c.planting_date),
            area=c.area,
            expected_harvest_date=str(c.expected_harvest_date) if c.expected_harvest_date else None,
            status=c.status,
        )
        for c in crops
    ]


@router.post("/", response_model=CropOut, status_code=status.HTTP_201_CREATED)
async def create_crop(
    crop_data: CropCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Add a new crop to the user's farm."""
    crop = Crop(
        user_id=current_user.id,
        name=crop_data.name,
        variety=crop_data.variety,
        planting_date=crop_data.planting_date,
        area=crop_data.area,
        expected_harvest_date=crop_data.expected_harvest_date,
    )
    db.add(crop)
    db.commit()
    db.refresh(crop)

    return CropOut(
        id=str(crop.id),
        name=crop.name,
        variety=crop.variety,
        planting_date=str(crop.planting_date),
        area=crop.area,
        expected_harvest_date=str(crop.expected_harvest_date) if crop.expected_harvest_date else None,
        status=crop.status,
    )


@router.put("/{crop_id}", response_model=CropOut)
async def update_crop(
    crop_id: str,
    crop_data: CropUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update an existing crop."""
    crop = db.query(Crop).filter(Crop.id == crop_id, Crop.user_id == current_user.id).first()

    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")

    update_data = crop_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(crop, key, value)

    db.commit()
    db.refresh(crop)

    return CropOut(
        id=str(crop.id),
        name=crop.name,
        variety=crop.variety,
        planting_date=str(crop.planting_date),
        area=crop.area,
        expected_harvest_date=str(crop.expected_harvest_date) if crop.expected_harvest_date else None,
        status=crop.status,
    )


@router.delete("/{crop_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_crop(
    crop_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Delete a crop."""
    crop = db.query(Crop).filter(Crop.id == crop_id, Crop.user_id == current_user.id).first()

    if not crop:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Crop not found")

    db.delete(crop)
    db.commit()
