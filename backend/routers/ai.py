from fastapi import APIRouter, HTTPException
from starlette import status
from typing import List
from openai import OpenAI
from datetime import datetime, timezone
from dotenv import load_dotenv
import os

from models import ChatHistory
from dependencies import db_dependency, user_dependency
from schemas.ai import SummaryRequest, QuestionRequest, ChatHistoryOut

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

router = APIRouter(prefix="/ai", tags=["AI Assistant"])


@router.post("/summary", status_code=status.HTTP_201_CREATED)
async def create_summary(user: user_dependency, db: db_dependency, data: SummaryRequest):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"Summarize this clearly and concisely:\n{data.text}"}],
        temperature=0.5,
    )
    summary = response.choices[0].message.content
    db.add(ChatHistory(
        user_id=user["user_id"],
        question=data.question,
        response=summary,
        timestamp=datetime.now(timezone.utc),
    ))
    db.commit()
    return {"summary": summary}


@router.post("/quizzes", status_code=status.HTTP_201_CREATED)
async def create_quiz(user: user_dependency, db: db_dependency, data: SummaryRequest):
    if not data.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"Create flashcards (question and answer pairs) from this text:\n{data.text}"}],
        temperature=0.5,
    )
    answer = response.choices[0].message.content
    db.add(ChatHistory(
        user_id=user["user_id"],
        question=data.question,
        response=answer,
        timestamp=datetime.now(timezone.utc),
    ))
    db.commit()
    return {"quizzes": answer}


@router.post("/questions", status_code=status.HTTP_201_CREATED)
async def answer_question(user: user_dependency, db: db_dependency, data: QuestionRequest):
    if not data.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": f"Answer this question thoroughly: {data.question}"}],
        temperature=0.5,
    )
    answer = response.choices[0].message.content
    db.add(ChatHistory(
        user_id=user["user_id"],
        question=data.question,
        response=answer,
        timestamp=datetime.now(timezone.utc),
    ))
    db.commit()
    return {"answer": answer}


@router.get("/history", response_model=List[ChatHistoryOut], status_code=status.HTTP_200_OK)
async def get_history(user: user_dependency, db: db_dependency):
    return (
        db.query(ChatHistory)
        .filter(ChatHistory.user_id == user["user_id"])
        .order_by(ChatHistory.timestamp.desc())
        .all()
    )
