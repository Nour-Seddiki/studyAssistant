from pydantic import BaseModel
from datetime import datetime


class SessionCreate(BaseModel):
    subject: str
    starting_time: datetime
    ending_time: datetime
    duration: float
    note: str
    is_complete: bool = False


class SessionOut(BaseModel):
    id: int
    subject: str
    starting_time: datetime
    ending_time: datetime
    duration: float
    note: str
    is_complete: bool
    created_at: datetime

    model_config = {"from_attributes": True}
