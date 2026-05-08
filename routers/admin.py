from typing import Annotated
from database import SessionLocal
from sqlalchemy.orm import Session
from fastapi import Depends,HTTPException,Path,APIRouter
from models import User,StudySession
from starlette import status
from pydantic import BaseModel,Field
from .auth import get_current_user
from openai import OpenAI
import datetime
import os
from dotenv import load_dotenv


router = APIRouter(
    prefix='/admin',
    tags=['admin']
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
db_dependency = Annotated[Session,Depends(get_db)]
user_dependency = Annotated[dict , Depends(get_current_user)]


@router.get("/get_all_users",status_code=status.HTTP_200_OK)
async def get_all_users(user:user_dependency , db:db_dependency):
    if user is None or user.get("user_role") !='admin':
        raise HTTPException(status_code=401 , detail='Authentication failed')
    users_model = db.query(User).all()
    if users_model is None:
        raise HTTPException(status_code=404 , detail='users list not found')
    return users_model


@router.delete("/delete_user/{user_id}",status_code=status.HTTP_202_ACCEPTED)
async def delete_user(user:user_dependency , db:db_dependency , user_id:int = Path(gt=0)):
    if user is None or user.get("user_role") !='admin':
        raise HTTPException(status_code=401 , detail='Authentication failed')
    user_model = db.query(User).filter(User.id == user_id).first()
    if user_model is None:
        raise HTTPException(status_code=404 , detail='user not found')
    db.delete(user_model)
    db.commit()


#================================ studySession ===============================


@router.get("/session",status_code=status.HTTP_200_OK)
async def get_all_sessions(user:user_dependency , db:db_dependency):
    if user is None or user.get("user_role") !='admin':
        raise HTTPException(status_code=401 , detail='Authentication failed')
    session_model = db.query(StudySession).all()
    if session_model is None:
        raise HTTPException(status_code=404 , detail='sessions not found')
    return session_model

@router.get("/session/{session_id}",status_code=status.HTTP_200_OK)
async def get_all_sessions(user:user_dependency , db:db_dependency , session_id:int=Path(gt=0)):
    if user is None or user.get("user_role") !='admin':
        raise HTTPException(status_code=401 , detail='Authentication failed')
    session_model = db.query(StudySession).filter(StudySession.id == session_id).first()
    if session_model is None:
        raise HTTPException(status_code=404 , detail='session not found')
    return session_model

@router.delete("/delete_session/{session_id}",status_code=status.HTTP_202_ACCEPTED)
async def delete_session(user:user_dependency , db:db_dependency , session_id :int = Path(gt=0)):
    if user is None or user.get("user_role") !='admin':
        raise HTTPException(status_code=401 , detail='Authentication failed')
    session_model = db.query(StudySession).filter(StudySession.id == session_id).first()
    if session_model is None:
        raise HTTPException(status_code=404 , detail='session not found')
    db.delete(session_model)
    db.commit()