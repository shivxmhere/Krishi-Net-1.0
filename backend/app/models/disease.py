
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base


class Disease(Base):
    __tablename__ = "diseases"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    name_hindi = Column(String)
    crop = Column(String, nullable=False)
    chemical_treatment = Column(JSON)
    organic_treatment = Column(JSON)
    preventive_measures = Column(JSON)

class Scan(Base):
    __tablename__ = "scans"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id'))
    disease_name = Column(String)
    crop = Column(String)
    image_url = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String) 
    location = Column(JSON)
    scan_date = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
