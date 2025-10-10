from fastapi import APIRouter,Depends,HTTPException
from pydantic import BaseModel,Field,EmailStr
from models import User
from passlib.context import CryptContext  
from typing import Annotated
from database import SessionLocal
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm ,OAuth2PasswordBearer
from jose import jwt,JWTError
import secrets
from datetime import datetime, timezone, timedelta
from starlette import status
 


SECRET_KEY = secrets.token_hex(32)

ALGORITHM = 'HS256'
oauth2_bearer = OAuth2PasswordBearer(tokenUrl="/auth/token")

bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated = 'auto')

router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
db_dependency = Annotated[Session,Depends(get_db)]

def Authentication_user(username:str , password:str , db):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not bcrypt_context.verify(password , user.hashed_password):
        return False
    return user



def create_access_token(username:str,user_id:int , user_role:str ,expired_delta:timedelta):
    encode = {'sub':username , 'user_id':user_id , 'user_role':user_role}
    expires = datetime.now(timezone.utc)  + expired_delta
    encode.update({'exp':expires})
    return jwt.encode(encode , SECRET_KEY , algorithm=ALGORITHM)



    



async def get_current_user(token:Annotated[str,Depends(oauth2_bearer)]):
  try:
    payload = jwt.decode(token,SECRET_KEY,algorithms=[ALGORITHM])
    username : str = payload.get('sub')
    user_id : int = payload.get('user_id')
    user_role : str = payload.get('user_role')
    if username is None or user_id is None or user_role is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='could not validate user')
    return {'username':username , 'user_id':user_id , 'user_role':user_role}
  except JWTError:
      raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
  
class Token(BaseModel):
    access_token : str
    token_type : str

class CreateUserRequest(BaseModel):
    username : str = Field(min_length=3 , max_length=15)
    email : EmailStr = Field(min_length=3 , max_length=30)
    password : str
    role : str = Field(min_length=3 , max_length=10)



@router.post("/",status_code=status.HTTP_201_CREATED)
async def create_user(user:CreateUserRequest , db :db_dependency):
    newUser = User(
       username = user.username,
       email = user.email,
       hashed_password = bcrypt_context.hash(user.password),
       role = user.role
    )
    if (user.email.endswith("@gmail.com") or  user.email.endswith("@estin.dz")):
        newUser.is_verified = True
    else:
        newUser.is_verified = False
        raise HTTPException(status_code=422 , detail="invalid email")
    db.add(newUser)
    db.commit()
    

@router.post("/token",response_model=Token)
async def login_access(form_data:Annotated[OAuth2PasswordRequestForm,Depends()],db:db_dependency):
    user = Authentication_user(form_data.username,form_data.password,db)
    if not user:
        raise HTTPException(status_code=401 , detail='Authentication failed')
    token = create_access_token(user.username , user.id ,user.role, timedelta(minutes=20))
    return {'access_token': token , 'token_type':'bearer'}