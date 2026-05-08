from fastapi import APIRouter, HTTPException, Path
from starlette import status
from typing import List

from models import User, StudySession
from dependencies import db_dependency, user_dependency
from schemas.user import UserOut
from schemas.study_session import SessionOut

router = APIRouter(prefix="/admin", tags=["Admin"])


def require_admin(user: dict):
    if user.get("user_role") != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")


@router.get("/users", response_model=List[UserOut], status_code=status.HTTP_200_OK)
async def get_all_users(user: user_dependency, db: db_dependency):
    require_admin(user)
    return db.query(User).all()


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user: user_dependency, db: db_dependency, user_id: int = Path(gt=0)):
    require_admin(user)
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    db.delete(target)
    db.commit()


@router.get("/sessions", response_model=List[SessionOut], status_code=status.HTTP_200_OK)
async def get_all_sessions(user: user_dependency, db: db_dependency):
    require_admin(user)
    return db.query(StudySession).all()


@router.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_session(user: user_dependency, db: db_dependency, session_id: int = Path(gt=0)):
    require_admin(user)
    session = db.query(StudySession).filter(StudySession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    db.delete(session)
    db.commit()
    db.commit()