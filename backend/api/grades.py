from typing import Annotated
from cachetools import TTLCache
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from api.auth import User, get_current_user
import db
from fetcher.grade import Grade, GradeFetcher
from fetcher.login import get_session_token
from fetcher.req import verify_session

router = APIRouter()
cache = TTLCache(maxsize=1024, ttl=60*60)

class GradeModel(BaseModel):
    id: int
    value: int
    date: str
    subject_id: int
    entered_by: str
    semester: int
    type: str
    subject_name: str
    short_subject_name: str

class SubjectModel(BaseModel):
    id: int
    name: str
    short_name: str

class SummarizedGrade(BaseModel):
    subject_id: int
    grade_id: int
    value: int
    subject: str

@router.get("/subjects")
def get_subjects(user: Annotated[User, Depends(get_current_user)]) -> list[SubjectModel]:
    return db.get_subjects(user.id)


@router.get("/subjects/{subject_id}")
def get_subjects(subject_id: int,user: Annotated[User, Depends(get_current_user)]) -> SubjectModel:
    data = db.get_subjects(user.id,subject_id)
    if len(data) == 1:
        return data[0]
    elif len(data) == 0:
        return JSONResponse({}, status_code=404)

    # Shouldn't be reachable
    return JSONResponse({}, status_code=400)


class GradeResponse(BaseModel):
    id: int
    value: int
    date: str = "yyyy-mm-dd"
    subject_id: int
    entered_by: str
    semester: int = 1
    type: str 


@router.get("/grades")
def get_grades(user: Annotated[User, Depends(get_current_user)]) -> list[GradeResponse]:
    return db.get_grades(user.id)


@router.get("/summarized_grades")
def get_grades(user: Annotated[User, Depends(get_current_user)]) -> list[SummarizedGrade]:
    return db.get_summarized_grades(user.id)


@router.get("/grades/{subject_id}", )
def get_grades_for_subject(subject_id: int, user: Annotated[User, Depends(get_current_user)]) -> list[GradeResponse]:
    return db.get_grades(user.id, subject_id)


@router.get("/grade/{grade_id}")
def get_grade(grade_id: int, user: Annotated[User, Depends(get_current_user)]) -> GradeResponse:
    return db.get_grade(user.id, grade_id)


@router.get("/average/{subject_id}")
def get_average_grade(subject_id: int, user: Annotated[User, Depends(get_current_user)]):

    x = cache.get(f"{subject_id}_{user.id}")
    if x is not None:
        return {"success": True, "average": x, "subject": subject_id}

    login = db.get_session(user.id)

    if login is None:
        return JSONResponse({"success": False, "message": "No login added yet"}, status_code=400)
    ses = login["ses"]
    if login["ses"] is None or verify_session(login["ses"]):
        ses = get_session_token(login["username"], login["password"])
        db.set_session(user.id, ses)

    fetcher = GradeFetcher(ses)
    avg = fetcher.fetch_avg_grade_for_subject(subject_id=subject_id)
    if avg is None:
        return JSONResponse({"success": False}, status_code=400)

    cache[f"{subject_id}_{user.id}"] = avg
    return {"success": True, "average": avg, "subject": subject_id}


@router.post("/grade/", )
def insert_grade(grade: GradeModel, user: Annotated[User, Depends(get_current_user)]):
    res = db.insert_grade(user.id, Grade(id=grade.id, value=grade.value, subject_id=grade.subject_id, type=grade.type,
                                         entered_by=grade.entered_by, semester=grade.semester, date=grade.date,
                                         short_subject=grade.short_subject_name, subject=grade.subject_name))
    return {"success": res, "message": ""}

