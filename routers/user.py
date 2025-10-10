from typing import Annotated
from database import SessionLocal
from sqlalchemy.orm import Session
from fastapi import Depends,HTTPException,Path,APIRouter
from models import User
from starlette import status
from pydantic import BaseModel,Field
from .auth import get_current_user , bcrypt_context




router = APIRouter(
    prefix='/user',
    tags=['user']
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
db_dependency = Annotated[Session,Depends(get_db)]
user_dependency = Annotated[dict , Depends(get_current_user)]



class userVerification(BaseModel):
    current_password : str
    new_password : str


@router.put("/change_password",status_code=status.HTTP_202_ACCEPTED)
async def change_password(user:user_dependency , db:db_dependency , data:userVerification):
    if user is None:
        raise HTTPException(status_code=401 , detail= "Authenticationn failed")
    user_model = db.query(User).filter(User.id == user.get("user_id")).first()
    if user_model is None:
        raise HTTPException(status_code=404 , detail= "user not found")
    if not bcrypt_context.verify(data.current_password , user_model.hashed_password):
        raise HTTPException(status_code=401, detail= "invalid password")
    user_model.hashed_password = bcrypt_context.hash(data.new_password)
    db.add(user_model)
    db.commit()

@router.get("/user",status_code=status.HTTP_200_OK)
async def get_user_info(user:user_dependency , db:db_dependency):
    if user is None:
        raise HTTPException(status_code=401 , detail= "Authenticationn failed")
    user_model = db.query(User).filter(User.id == user.get("user_id")).first()
    if user_model is None:
        raise HTTPException(status_code=404 , detail= "user not found")
    returned_user = [
        {
           "username": user_model.username,
            "email": user_model.email,
            "role":user_model.role,
        }
    ]
    return returned_user


