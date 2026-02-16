
from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String)
    location = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Disease(Base):
    __tablename__ = "diseases"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    name_hindi = Column(String)
    crop = Column(String, nullable=False)
    chemical_treatment = Column(JSON)
    organic_treatment = Column(JSON)
    preventive_measures = Column(JSON)

class Scan(Base):
    __tablename__ = "scans"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id'))
    disease_id = Column(UUID(as_uuid=True), ForeignKey('diseases.id'))
    image_url = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String) 
    location = Column(JSON)
    scan_date = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User")
    disease = relationship("Disease")
