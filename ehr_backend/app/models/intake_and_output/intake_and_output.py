from sqlalchemy import Column, String, Text, Integer, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.mysql import BIGINT
from sqlalchemy.orm import relationship
from app.database.base import Base


class IntakeAndOutput(Base):
    __tablename__ = "intake_and_outputs"

    id = Column(BIGINT(unsigned=True), primary_key=True, autoincrement=True)
    patient_id = Column(BIGINT(unsigned=True), ForeignKey("patients.patient_id", ondelete="CASCADE"), nullable=False)

    # ──── ASSESSMENT (Step 1) ────
    # Nurse input fields
    oral_intake = Column(String(255), nullable=True)  # fluid intake via mouth
    iv_intake = Column(String(255), nullable=True)    # IV fluids
    other_intake = Column(String(255), nullable=True) # medications, other routes
    total_intake = Column(Integer, nullable=True)     # total in mL
    urine_output = Column(String(255), nullable=True)
    stool_output = Column(String(255), nullable=True)
    vomitus = Column(String(255), nullable=True)
    other_output = Column(String(255), nullable=True)
    total_output = Column(Integer, nullable=True)     # total in mL
    fluid_balance = Column(Integer, nullable=True)    # total_intake - total_output

    # CDSS auto-generated alerts
    oral_intake_alert = Column(String(255), nullable=True)
    iv_intake_alert = Column(String(255), nullable=True)
    other_intake_alert = Column(String(255), nullable=True)
    total_intake_alert = Column(String(255), nullable=True)
    urine_output_alert = Column(String(255), nullable=True)
    stool_output_alert = Column(String(255), nullable=True)
    vomitus_alert = Column(String(255), nullable=True)
    other_output_alert = Column(String(255), nullable=True)
    total_output_alert = Column(String(255), nullable=True)
    fluid_balance_alert = Column(String(255), nullable=True)

    # ──── DIAGNOSIS (Step 2) ────
    diagnosis = Column(Text, nullable=True)
    diagnosis_alert = Column(Text, nullable=True)

    # ──── PLANNING (Step 3) ────
    planning = Column(Text, nullable=True)
    planning_alert = Column(Text, nullable=True)

    # ──── INTERVENTION (Step 4) ────
    intervention = Column(Text, nullable=True)
    intervention_alert = Column(Text, nullable=True)

    # ──── EVALUATION (Step 5) ────
    evaluation = Column(Text, nullable=True)
    evaluation_alert = Column(Text, nullable=True)

    created_at = Column(TIMESTAMP, nullable=True)
    updated_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    patient = relationship("Patient", back_populates="intake_and_outputs")
