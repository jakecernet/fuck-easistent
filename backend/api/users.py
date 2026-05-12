from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, Form, HTTPException, Response
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel
from starlette import status
from api.auth import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    Token,
    User,
    authenticate_user,
    create_access_token,
    create_user,
    get_current_user,
)
import db


router = APIRouter()


class EasistentLoginModel(BaseModel):
    username: str
    password: str


@router.post("/create-user")
async def create_account(
    username: Annotated[str, Form()],
    password: Annotated[str, Form()],
):
    if create_user(username, password):
        return JSONResponse(
            content={"success": True, "message": "Ok"}, status_code=201
        )  # Created

    return JSONResponse(
        content={"success": False, "message": "User with this name already exists"},
        status_code=400,
    )


@router.post("/delete_user")
async def delete_account(user: Annotated[User, Depends(get_current_user)]):
    return JSONResponse(content={"success": db.delete_user(user.id)})


@router.post("/add-login-data")
def insert_grade(
    login: EasistentLoginModel, user: Annotated[User, Depends(get_current_user)]
):
    prev = db.get_session(user.id)
    different_account = prev is None or prev.get("username") != login.username

    if different_account:
        db.clear_data_keep_login(user.id)
        from api.extra import clear_user_cache as clear_extra_cache
        from api.grades import clear_user_cache as clear_grades_cache
        clear_extra_cache(user.id)
        clear_grades_cache(user.id)

    res = db.insert_login_info(user.id, login.username, login.password)

    if res:
        import threading
        from tasks import check_for_new_grades_sync
        threading.Thread(target=check_for_new_grades_sync, daemon=True).start()

    return {"success": res, "cleared": different_account}


@router.post("/login")
async def login_for_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], response: Response
) -> Token:
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "id": user.id}, expires_delta=access_token_expires
    )
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,  # JS cannot read it
        secure=True,  # HTTPS only (set False for local dev)
        samesite="lax",  # protects against CSRF
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    return Token(access_token=access_token, token_type="bearer")

@router.get("/user")
def insert_grade(
    user: Annotated[User, Depends(get_current_user)]
):
    return user

