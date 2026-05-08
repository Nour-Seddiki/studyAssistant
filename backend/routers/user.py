from fastapi import APIRouter, HTTPException
from starlette import status
import bcrypt

from models import User
from dependencies import db_dependency, user_dependency
from schemas.user import UserOut, PasswordChange


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/me", response_model=UserOut, status_code=status.HTTP_200_OK)
async def get_current_user_info(user: user_dependency, db: db_dependency):
    user_model = db.query(User).filter(User.id == user["user_id"]).first()
    if not user_model:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user_model


@router.put("/password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(user: user_dependency, db: db_dependency, data: PasswordChange):
    user_model = db.query(User).filter(User.id == user["user_id"]).first()
    if not user_model or not verify_password(data.current_password, user_model.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    user_model.hashed_password = hash_password(data.new_password)
    db.commit()

