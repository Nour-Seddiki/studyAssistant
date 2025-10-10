from sqlalchemy import Column, Integer, String, Boolean,ForeignKey,DateTime,Text,FLOAT
from database import Base
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"
    id = Column(Integer,primary_key= True , index = True)
    username = Column(String , unique= True)
    email = Column(String , unique= True)
    hashed_password = Column(String)
    role = Column(String)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    is_verified = Column(Boolean,default= False)


class ChatHistory(Base):
    __tablename__ = 'chatHistory'
    id = Column(Integer , primary_key=True , index=True)
    user_id = Column(Integer , ForeignKey("users.id"))
    question = Column(String(255))
    response = Column(Text)
    timestamp = Column(DateTime, default=datetime.now(timezone.utc), onupdate=datetime.utcnow)

class StudySession(Base):
    __tablename__ = 'studySession'
    id = Column(Integer , primary_key= True , index = True)
    user_id = Column(Integer , ForeignKey("users.id"))
    subject = Column(String)
    starting_time = Column(DateTime)
    ending_time = Column(DateTime)
    duration = Column(FLOAT)
    note = Column(Text)
    created_at = Column(DateTime, default=datetime.now(timezone.utc))
    is_complete = Column(Boolean ,default= False)