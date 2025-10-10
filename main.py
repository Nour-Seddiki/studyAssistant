from database import engine
import models
from fastapi import FastAPI
from routers import auth,ai,admin,user,staudySession

app = FastAPI()


models.Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(admin.router)
app.include_router(user.router)
app.include_router(staudySession.router)
