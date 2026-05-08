from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from routers import auth, ai, admin, user, staudySession

app = FastAPI(
    title="Study Assistant API",
    description="AI-powered study assistant backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(admin.router)
app.include_router(user.router)
app.include_router(staudySession.router)
