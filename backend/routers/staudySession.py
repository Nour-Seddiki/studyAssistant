from fastapi import APIRouter, HTTPException, Path
from starlette import status
from typing import List

from models import StudySession
from dependencies import db_dependency, user_dependency
from schemas.study_session import SessionCreate, SessionOut

router = APIRouter(prefix="/sessions", tags=["Study Sessions"])


@router.post("/", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
async def create_session(user: user_dependency, db: db_dependency, data: SessionCreate):
    session = StudySession(**data.model_dump(), user_id=user["user_id"])
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


@router.get("/", response_model=List[SessionOut], status_code=status.HTTP_200_OK)
async def get_my_sessions(user: user_dependency, db: db_dependency):
    return db.query(StudySession).filter(StudySession.user_id == user["user_id"]).order_by(StudySession.created_at.desc()).all()


@router.get("/{session_id}", response_model=SessionOut, status_code=status.HTTP_200_OK)
async def get_session(user: user_dependency, db: db_dependency, session_id: int = Path(gt=0)):
    session = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == user["user_id"],
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return session


@router.put("/{session_id}", response_model=SessionOut, status_code=status.HTTP_200_OK)
async def update_session(user: user_dependency, db: db_dependency, data: SessionCreate, session_id: int = Path(gt=0)):
    session = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == user["user_id"],
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    for key, value in data.model_dump().items():
        setattr(session, key, value)
    db.commit()
    db.refresh(session)
    return session


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(user: user_dependency, db: db_dependency, session_id: int = Path(gt=0)):
    session = db.query(StudySession).filter(
        StudySession.id == session_id,
        StudySession.user_id == user["user_id"],
    ).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    db.delete(session)
    db.commit()






    
