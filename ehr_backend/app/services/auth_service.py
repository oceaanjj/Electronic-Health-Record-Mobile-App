from sqlalchemy.orm import Session
from app.models.user import User
from app.core.security import verify_password, create_access_token


# Logic checker for login
def authenticate_user(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email).first()

    if not user:
        return None

    if not user.is_active:
        return None

    if not verify_password(password, user.password):
        return None

    token_data = {
        "user_id": user.id,
        "role": user.role
    }

    access_token = create_access_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "full_name": user.full_name
    }
