import time
from datetime import date, timedelta
from typing import Annotated
from cachetools import TTLCache
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from api.auth import User, get_current_user
import db
from fetcher.extra import ExtraFetcher
from fetcher.login import get_session_token
from fetcher.req import verify_session


router = APIRouter()
cache = TTLCache(maxsize=1024, ttl=60 * 5)
_verified_until: dict[int, float] = {}
_VERIFY_TTL = 300  # 5 minutes


def clear_user_cache(user_id: int):
    uid = str(user_id)
    for k in list(cache.keys()):
        parts = k.split("_")
        if len(parts) >= 2 and parts[1] == uid:
            cache.pop(k, None)
    _verified_until.pop(user_id, None)


def _get_session(user_id: int):
    login = db.get_session(user_id)
    if login is None:
        return None
    ses = login["ses"]
    now = time.time()
    if ses and _verified_until.get(user_id, 0) > now:
        return ses
    if ses is None or not verify_session(ses):
        ses = get_session_token(login["username"], login["password"])
        db.set_session(user_id, ses)
    _verified_until[user_id] = now + _VERIFY_TTL
    return ses


def _serve(key: str, user_id: int, fetcher):
    """Cache-first: serve cache without touching session/network if hit."""
    if key in cache:
        return cache[key]
    ses = _get_session(user_id)
    if ses is None:
        return None
    data = fetcher(ExtraFetcher(ses))
    if data is not None:
        cache[key] = data
    return data


@router.get("/absences")
def get_absences(user: Annotated[User, Depends(get_current_user)]):
    data = _serve(f"abs_{user.id}", user.id, lambda f: f.absences())
    if data is None:
        return JSONResponse({"success": False, "message": "No login data or fetch failed"}, status_code=502)
    return data


@router.get("/exams")
def get_exams(user: Annotated[User, Depends(get_current_user)]):
    data = _serve(f"exams_{user.id}", user.id, lambda f: f.exams())
    if data is None:
        return JSONResponse({"success": False}, status_code=502)
    return data


@router.get("/homework")
def get_homework(user: Annotated[User, Depends(get_current_user)]):
    data = _serve(f"hw_{user.id}", user.id, lambda f: f.homework())
    if data is None:
        return JSONResponse({"success": False}, status_code=502)
    return data


@router.get("/meals")
def get_meals(user: Annotated[User, Depends(get_current_user)]):
    data = _serve(f"meals_{user.id}", user.id, lambda f: f.meals())
    if data is None:
        return JSONResponse({"success": False}, status_code=502)
    return data


@router.get("/timetable")
def get_timetable(user: Annotated[User, Depends(get_current_user)], week: str | None = None):
    if week:
        try:
            start = date.fromisoformat(week)
            start = start - timedelta(days=start.weekday())
        except ValueError:
            return JSONResponse({"success": False, "message": "Invalid week"}, status_code=400)
    else:
        today = date.today()
        start = today - timedelta(days=today.weekday())
    end = start + timedelta(days=6)
    data = _serve(
        f"tt_{user.id}_{start.isoformat()}",
        user.id,
        lambda f: f.timetable(start.isoformat(), end.isoformat()),
    )
    if data is None:
        return JSONResponse({"success": False}, status_code=502)
    return data


@router.post("/refresh")
def refresh(user: Annotated[User, Depends(get_current_user)]):
    import threading
    from tasks import check_for_new_grades_sync
    clear_user_cache(user.id)
    db.set_last_grade_fetched(user.id, None)
    threading.Thread(target=check_for_new_grades_sync, daemon=True).start()
    return {"success": True}


@router.get("/stats")
def get_stats(user: Annotated[User, Depends(get_current_user)]):
    grades = db.get_grades(user.id)
    real = [g for g in grades if not str(g.get("type", "")).lower().startswith("zaklju")]
    finals_half = [g for g in grades if g.get("type") == "Zaključena polletna"]
    finals_year = [g for g in grades if g.get("type") == "Zaključena letna"]
    avg = round(sum(g["value"] for g in real) / len(real), 2) if real else None
    subjects = db.get_subjects(user.id)

    by_value = {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    for g in real:
        v = int(g["value"])
        if v in by_value:
            by_value[v] += 1

    return {
        "average": avg,
        "grade_count": len(real),
        "finals_half": len(finals_half),
        "finals_year": len(finals_year),
        "subject_count": len(subjects),
        "by_value": by_value,
    }
