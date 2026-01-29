from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.db import get_db
from app.services.auth_service import authenticate_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    result = authenticate_user(db, email, password)

    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return result
