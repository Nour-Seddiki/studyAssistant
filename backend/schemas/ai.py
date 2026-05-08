from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class SummaryRequest(BaseModel):
    question: str
    text: str


class QuestionRequest(BaseModel):
    question: str


class ChatHistoryOut(BaseModel):
    id: int
    question: str
    response: str
    timestamp: datetime

    model_config = {"from_attributes": True}
