"""
Diagnostics Model for Medical Imaging
Handles X-ray, Ultrasound, CT/MRI, Echocardiogram records
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from app.database.base import Base


class Diagnostic(Base):
    """
    Main Diagnostics table for storing diagnostic imaging records
    Stores information about individual diagnostic images
    """
    __tablename__ = "diagnostics"

    diagnostic_id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False, index=True)
    image_type = Column(String(100), nullable=False)  # Type of diagnostic image (X-ray, Ultrasound, etc.)
    file_path = Column(String(255), nullable=False)  # Path to stored file
    original_name = Column(String(255), nullable=False)  # Original filename
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<Diagnostic(diagnostic_id={self.diagnostic_id}, patient_id={self.patient_id}, image_type={self.image_type})>"
