from sqlalchemy import Column, Integer, String, Boolean
from app.database.base import Base


# A table for nurse and doctors
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)

    role = Column(String(20), nullable=False)  # nurse or doctor

    is_active = Column(Boolean, default=True)
