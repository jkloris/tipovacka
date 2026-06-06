from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect

from app.config import settings
from app.database import Base, SessionLocal, engine
from app.routers import admin, auth, matches, players, setting, tickets
from app.seed import ensure_test_match, seed_database


def _needs_schema_reset() -> bool:
    inspector = inspect(engine)
    tables = set(inspector.get_table_names())
    if "predictions" not in tables:
        return True
    if "matches" not in tables:
        return True
    cols = {c["name"] for c in inspector.get_columns("matches")}
    if "match_number" not in cols or "kickoff_at" not in cols:
        return True
    if "tickets" not in tables:
        return True
    ticket_cols = {c["name"] for c in inspector.get_columns("tickets")}
    if "users" not in tables:
        return True
    cols = {c["name"] for c in inspector.get_columns("users")}
    if "is_admin" not in cols:
        return True
    if "setting" not in tables:
        return True
    return "user_id" not in ticket_cols or "matches_json" in ticket_cols


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if settings.database_url.startswith("sqlite"):
        db_path = settings.database_url.replace("sqlite:///", "")
        Path(db_path).parent.mkdir(parents=True, exist_ok=True)

    if _needs_schema_reset():
        Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
        # ensure_test_match(db)
    finally:
        db.close()
    yield


app = FastAPI(title="Tipovačka API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api = FastAPI()
api.include_router(auth.router)
api.include_router(matches.router)
api.include_router(players.router)
api.include_router(setting.router)
api.include_router(tickets.router)
api.include_router(admin.router)

app.mount("/api", api)
