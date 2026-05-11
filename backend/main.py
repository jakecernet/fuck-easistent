from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from datetime import datetime
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.gzip import GZipMiddleware
from fastapi import FastAPI

import db
from api import user_router, grades_router, invite_router, info_router
from preferences import Preferences
from tasks import check_for_new_grades, ensure_admin, init_preferences
from spa import SPAStaticFiles

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_preferences()
    db.setup()
    ensure_admin()

    scheduler.add_job(
        check_for_new_grades,
        trigger="interval",
        seconds=Preferences.get_int("check_interval"),
        max_instances=1,
        coalesce=True,
        next_run_time=datetime.now(),
    )
    scheduler.start()

    yield

    scheduler.shutdown()


scheduler = AsyncIOScheduler()
app = FastAPI(lifespan=lifespan)
app.include_router(user_router, prefix="/api")
app.include_router(grades_router, prefix="/api")
app.include_router(invite_router, prefix="/api")
app.include_router(info_router, prefix="/api")
app.mount("/", SPAStaticFiles(directory="static", html=True), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000, compresslevel=5)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
