"""
Medical History Models
Contains 5 sub-components: PresentIllness, PastMedicalSurgical, Allergies, Vaccination, DevelopmentalHistory
All are linked to a patient and serve as historical/reference data (no ADPIE workflow)
"""

from sqlalchemy import Column, BigInteger, Integer, Text, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from app.database.base import Base


class PresentIllness(Base):
    __tablename__ = "present_illness"

    medical_id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    
    # Data fields
    condition_name = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    medication = Column(Text, nullable=True)
    dosage = Column(Text, nullable=True)
    side_effect = Column(Text, nullable=True)
    comment = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    patient = relationship("Patient")


class PastMedicalSurgical(Base):
    __tablename__ = "past_medical_surgical"

    medical_id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    
    # Data fields
    condition_name = Column(Text, nullable=True)
    description = Column(Text, nullable=True)
    medication = Column(Text, nullable=True)
    dosage = Column(Text, nullable=True)
    side_effect = Column(Text, nullable=True)
    comment = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    patient = relationship("Patient")


class Allergies(Base):
    __tablename__ = "allergies"

    medical_id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    
    # Data fields
    condition_name = Column(Text, nullable=True)  # Allergy type (e.g., "Penicillin", "Shellfish", "Latex")
    description = Column(Text, nullable=True)      # Reaction description
    medication = Column(Text, nullable=True)       # Medications affected by allergy
    dosage = Column(Text, nullable=True)
    side_effect = Column(Text, nullable=True)      # Allergic reaction type (rash, anaphylaxis, etc.)
    comment = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    patient = relationship("Patient")


class Vaccination(Base):
    __tablename__ = "vaccination"

    medical_id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    
    # Data fields
    condition_name = Column(Text, nullable=True)  # Vaccine name (e.g., "COVID-19", "MMR", "Polio")
    description = Column(Text, nullable=True)      # Vaccination details
    medication = Column(Text, nullable=True)       # Vaccine product name/batch
    dosage = Column(Text, nullable=True)           # Dose information
    side_effect = Column(Text, nullable=True)      # Any adverse reactions
    comment = Column(Text, nullable=True)          # Notes on vaccination
    
    # Metadata
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    patient = relationship("Patient")


class DevelopmentalHistory(Base):
    __tablename__ = "developmental_history"

    development_id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)
    
    # Developmental milestones (primarily for pediatric patients)
    gross_motor = Column(Text, nullable=True)      # e.g., "Sits at 6 months", "Walks at 12 months"
    fine_motor = Column(Text, nullable=True)       # e.g., "Pincer grasp at 9 months"
    language = Column(Text, nullable=True)         # e.g., "First words at 12 months"
    cognitive = Column(Text, nullable=True)        # e.g., "Object permanence at 8 months"
    social = Column(Text, nullable=True)           # e.g., "Smiles at 6 weeks", "Stranger anxiety at 8 months"
    
    # Metadata
    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    patient = relationship("Patient")
