from typing import Annotated
from database import SessionLocal
from sqlalchemy.orm import Session
from fastapi import Depends,HTTPException,Path,APIRouter,UploadFile
from models import ChatHistory
from starlette import status
from pydantic import BaseModel,Field
from .auth import get_current_user
from openai import OpenAI
from datetime import datetime
import os
from dotenv import load_dotenv


router = APIRouter(
    prefix='/AiAssistant', 
    tags=['AiAssistant']
)





# Load environment variables from .env
load_dotenv()

# Set OpenAI API key
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
db_dependency = Annotated[Session,Depends(get_db)]
user_dependency = Annotated[dict , Depends(get_current_user)]

class statmentRequest(BaseModel):
    question : str
    text : str 
class QuestionRequest(BaseModel):
    question : str


@router.post('/ai/summary',status_code=status.HTTP_201_CREATED)
async def create_summary(user:user_dependency , db:db_dependency , data:statmentRequest):
    if user is None:
        raise HTTPException(status_code=401 , detail='Authentication failed')
    if len(data.text.strip()) == 0:
        raise HTTPException(status_code=404 , detail='you must enter a text')
    response = client.chat.completions.create( 
        model="gpt-4o-mini", 
        messages=[{"role":"user", "content": f"Summarize this: {data.text}"}],
        temperature=0.5 )
    summary = response.choices[0].message.content
    answer = ChatHistory(
        user_id = user.get("user_id"),
        question = data.question,
        response = summary,
        timestamp = datetime.utcnow()
    )
    db.add(answer)
    db.commit()
    return {
        "summary": summary,
        "message": "Summary generated successfully"
    }

@router.post('/ai/quizes',status_code=status.HTTP_201_CREATED)
async def create_quize(user:user_dependency , db:db_dependency ,data:statmentRequest):
    if user is None:
        raise HTTPException(status_code=401 , detail='Authentication failed')
    if len(data.text.strip()) == 0:
        raise HTTPException(status_code=404 , detail='you must enter a text')
    response = client.chat.completions.create( 
        model="gpt-4o-mini", 
        messages=[{"role":"user", "content": f"Create flashcards (question and answer) from this: {data.text}"}],
        temperature=0.5 )
    answer = response.choices[0].message.content
    answer_model = ChatHistory(
        user_id = user.get("user_id"),
        question = data.text,
        response = answer,
        timestamp = datetime.utcnow()
    )
    db.add(answer_model)
    db.commit()
    return {
        "answer": answer, 
            "message": "Quizes  generated successfully"
            }


@router.post('/ai/questions', status_code=status.HTTP_201_CREATED)
async def answer_questions(user: user_dependency, db: db_dependency, data: QuestionRequest):
    if user is None:
        raise HTTPException(status_code=401, detail='Authentication failed')
    if len(data.question.strip()) == 0:
        raise HTTPException(status_code=400, detail='You must enter a text')

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"Answer this question: {data.question}"}],
        temperature=0.5
    )
    answer = response.choices[0].message.content

    answer_model = ChatHistory(
        user_id=user.get("user_id"),
        question=data.question,
        response=answer,
        timestamp = datetime.utcnow()
    )
    db.add(answer_model)
    db.commit()
    return {"answer": answer, "message": "Answer generated successfully"}



@router.get("/history",status_code=status.HTTP_200_OK)
async def get_history(user:user_dependency ,db:db_dependency):
    if user is None:
        raise HTTPException(status_code=401 , detail='Authentication failed')
    history = db.query(ChatHistory).filter(ChatHistory.user_id == user.get("user_id")).all()
    if history is None:
        raise HTTPException(status_code=404 , detail='history not found')
    return history



@router.delete("/delete_history/{chat_id}",status_code=status.HTTP_202_ACCEPTED)
async def delete_history(user:user_dependency ,db:db_dependency , chat_id : int =Path(gt=0)):
    if user is None:
        raise HTTPException(status_code=401 , detail='Authentication failed')
    history_model = db.query(ChatHistory).filter(ChatHistory.id == chat_id).filter(ChatHistory.user_id == user.get("user_id")).first()
    if history_model is None:
        raise HTTPException(status_code=404 , detail='history not found')
    db.delete(history_model)
    db.commit()