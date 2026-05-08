from pydantic import BaseModel, Field
from datetime import datetime


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    role: str
    is_verified: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6)
