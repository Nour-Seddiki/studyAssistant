# Studdy-Assistant

An AI-powered study assistant built with **FastAPI** + **React**, featuring smart summarization, quiz generation, Q&A, and session tracking.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI, SQLAlchemy, PostgreSQL, Alembic |
| Auth | JWT (python-jose), bcrypt |
| AI | OpenAI GPT-4o-mini |
| Frontend | React 18, Vite, Tailwind CSS |
| HTTP | Axios, React Router DOM |

---

## Features

- **Auth** — Register / Login with JWT tokens, email restriction (`@gmail.com` / `@estin.dz`)
- **AI Assistant** — Ask questions, summarize text, generate flashcard quizzes (GPT-4o-mini)
- **Study Sessions** — Create, edit, delete, and track study sessions with subjects and durations
- **History** — Full chat history with search and expandable AI responses
- **Profile** — View account info, change password
- **Admin** — Manage all users and sessions (admin role only)

---

## Project Structure

```
studyAssistant/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # SQLAlchemy engine & session
│   ├── models.py            # ORM models (users, sessions, chat_history)
│   ├── dependencies.py      # Centralized auth & DB dependencies
│   ├── schemas/             # Pydantic schemas
│   │   ├── auth.py
│   │   ├── user.py
│   │   ├── ai.py
│   │   └── study_session.py
│   ├── routers/
│   │   ├── auth.py          # POST /auth/ (register), POST /auth/token (login)
│   │   ├── ai.py            # POST /ai/summary|quizzes|questions, GET /ai/history
│   │   ├── user.py          # GET /user/me, PUT /user/password
│   │   ├── staudySession.py # CRUD /sessions/
│   │   └── admin.py         # GET|DELETE /admin/users|sessions
│   ├── alembic/             # DB migrations
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── pages/           # Login, Register, Dashboard, Chat, Sessions, History, Profile, Admin
    │   ├── components/      # Layout, ProtectedRoute
    │   ├── contexts/        # AuthContext
    │   └── lib/api.js       # Axios instance with JWT interceptor
    └── index.html
```

---

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL

### Backend

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:
```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/<dbname>
SECRET_KEY=<your-secret-key>
OPENAI_API_KEY=<your-openai-key>
```

```bash
python3 -m uvicorn main:app --reload --port 8000
```

API docs available at [http://localhost:8000/docs](http://localhost:8000/docs)

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at [http://localhost:5173](http://localhost:5173)

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SECRET_KEY` | JWT signing secret |
| `OPENAI_API_KEY` | OpenAI API key for GPT-4o-mini |

---

## License

MIT
