from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from fastapi import FastAPI

import db
from api import user_router, grades_router, invite_router
from tasks import check_for_new_grades, ensure_admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_dotenv()
    db.setup()
    ensure_admin()

    scheduler.add_job(
        check_for_new_grades,
        trigger="interval",
        seconds=60,
        max_instances=1,
        coalesce=True,
    )
    scheduler.start()

    yield

    scheduler.shutdown()


scheduler = AsyncIOScheduler()
app = FastAPI(lifespan=lifespan)

app.include_router(user_router)
app.include_router(grades_router)
app.include_router(invite_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)
