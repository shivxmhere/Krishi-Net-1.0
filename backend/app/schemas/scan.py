"""
Pydantic schemas for Scan history.
"""

from pydantic import BaseModel
from typing import Optional, List


class ScanOut(BaseModel):
    id: str
    disease_name: Optional[str] = None
    crop: Optional[str] = None
    confidence: float
    severity: Optional[str] = None
    image_url: str
    scan_date: str

    class Config:
        from_attributes = True
