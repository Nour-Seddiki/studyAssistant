from pydantic import BaseModel, Field, EmailStr
from typing import Literal


class CreateUserRequest(BaseModel):
    username: str = Field(min_length=3, max_length=15)
    email: EmailStr
    password: str = Field(min_length=6)
    role: Literal["student", "admin"] = "student"


class Token(BaseModel):
    access_token: str
    token_type: str
