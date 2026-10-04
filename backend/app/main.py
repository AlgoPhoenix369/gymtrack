from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.config import FRONTEND_DIR
from app.database import Base, SessionLocal, engine
from app.routers import admin, plan
from app.seed import seed_database


# On startup, create the tables and seed them if the database is empty.
@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        seed_database(db)
    yield


app = FastAPI(title="GymTrack API", lifespan=lifespan)
app.include_router(plan.router)
app.include_router(admin.router)

# Serve the frontend from the same server. Mounted last so /api and /docs take priority.
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=FRONTEND_DIR, html=True), name="frontend")