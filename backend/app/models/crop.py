"""
Crop model for farm management.
"""

from sqlalchemy import Column, String, Float, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base


class Crop(Base):
    __tablename__ = "crops"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    name = Column(String, nullable=False)
    variety = Column(String, nullable=True)
    planting_date = Column(Date, nullable=False)
    area = Column(Float, nullable=False)  # in acres
    expected_harvest_date = Column(Date, nullable=True)
    status = Column(String, default="Healthy")  # Healthy, Needs Attention, Harvest Ready

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User")
