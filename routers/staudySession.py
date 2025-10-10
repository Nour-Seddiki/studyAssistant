from typing import Annotated
from database import SessionLocal
from sqlalchemy.orm import Session
from fastapi import Depends,HTTPException,Path,APIRouter
from models import User,StudySession
from starlette import status
from pydantic import BaseModel,Field
from .auth import get_current_user
from datetime import datetime  

router = APIRouter(
    prefix='/studySession',
    tags=['studySession']
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
db_dependency = Annotated[Session,Depends(get_db)]
user_dependency = Annotated[dict , Depends(get_current_user)]

class studySessionRequest(BaseModel):
    subject : str
    starting_time : datetime
    ending_time : datetime
    duration : float
    note : str 
    is_complete : bool 


@router.post("/session",status_code=status.HTTP_201_CREATED)
async def create_session(user:user_dependency , db:db_dependency , data:studySessionRequest):
    if user is None:
        raise HTTPException(status_code=401 , detail="Authentication failed")
    new_session = StudySession(**data.dict() , user_id = user.get("user_id"))
    db.add(new_session)
    db.commit()

@router.get("/session",status_code=status.HTTP_200_OK)
async def get_user_session(user:user_dependency , db:db_dependency):
    if user is None:
        raise HTTPException(status_code=401 , detail="Authentication failed")
    session_model = db.query(StudySession).filter(StudySession.user_id == user.get("user_id")).all()
    if session_model is None :
        raise HTTPException(status_code=404 , detail="sessions not found")
    sessions_to_user = [
        {
            "subject": session.subject,
            "starting_time":session.starting_time,
            "ending_time":session.ending_time,
            "duration":session.duration,
            "note":session.note,
            "is_complete":session.is_complete 
        }
    for session in session_model
    ]
    return sessions_to_user


@router.get("/session/{session_id}",status_code=status.HTTP_200_OK)
async def get_user_session_by_id(user:user_dependency , db:db_dependency , session_id : int = Path(gt=0)):
    if user is None:
        raise HTTPException(status_code=401 , detail="Authentication failed")
    session_model = db.query(StudySession).filter(StudySession.user_id == user.get("user_id")).filter(StudySession.id == session_id).first()
    if session_model is None:
        raise HTTPException(status_code=404 , detail="session not found")
    session_for_user = [
        {
            "subject": session_model.subject,
            "starting_time":session_model.starting_time,
            "ending_time":session_model.ending_time,
            "duration":session_model.duration,
            "note":session_model.note,
            "is_complete":session_model.is_complete,
        }
    ]
    return session_for_user

@router.put("/session/{session_id}",status_code=status.HTTP_202_ACCEPTED)
async def update_session(user: user_dependency , db:db_dependency , updated_session : studySessionRequest,session_id:int = Path(gt=0)):
    if user is None:
        raise HTTPException(status_code=401 , detail="Authentication failed")
    session_model = db.query(StudySession).filter(StudySession.id == session_id).filter(StudySession.user_id == user.get("user_id")).first()
    if session_model is None:
        raise HTTPException(status_code=404 , detail="session not found")
    session_model.subject = updated_session.subject
    session_model.starting_time = updated_session.starting_time
    session_model.ending_time = updated_session.ending_time
    session_model.duration = updated_session.duration
    session_model.note = updated_session.note
    session_model.is_complete = updated_session.is_complete
    db.add(session_model)
    db.commit()

@router.delete("/delete_session/{session_id}",status_code=status.HTTP_202_ACCEPTED)
async def delete_session(user:user_dependency , db:db_dependency , session_id:int=Path(gt=0)):
    if user is None:
        raise HTTPException(status_code=401 , detail="Authentication failed")
    session_model = db.query(StudySession).filter(StudySession.id == session_id).filter(StudySession.user_id == user.get("user_id")).first()
    if session_model is None:
        raise HTTPException(status_code=404 , detail="session not found")
    db.delete(session_model)
    db.commit()






    
