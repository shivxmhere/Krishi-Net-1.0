"""
Pydantic schemas for Crop management.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import date


class CropCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    variety: Optional[str] = None
    planting_date: date
    area: float = Field(..., gt=0, description="Area in acres")
    expected_harvest_date: Optional[date] = None


class CropUpdate(BaseModel):
    name: Optional[str] = None
    variety: Optional[str] = None
    planting_date: Optional[date] = None
    area: Optional[float] = None
    expected_harvest_date: Optional[date] = None
    status: Optional[str] = None


class CropOut(BaseModel):
    id: str
    name: str
    variety: Optional[str] = None
    planting_date: str
    area: float
    expected_harvest_date: Optional[str] = None
    status: str

    class Config:
        from_attributes = True
