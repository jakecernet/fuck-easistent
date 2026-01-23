from typing import Annotated
from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from api.auth import User, get_current_user
import db
import random as rnd

CHARS = "abcdefghijklmnoprstuvzABCDEFGHIJKLMNOPRSTUVZXYZxyz1234567890"

router = APIRouter()


def generate_code():
    return "".join([rnd.choice(CHARS) for _ in range(8)])


def generate_invite():
    code = generate_code()
    if db.insert_invite(code):
        return code
    return None


def use_invite(code: str):
    return db.invite_code_exists(code) and db.remove_invite_code(code)


class InviteCodeResponse(BaseModel):
    code: str
    success: bool


class InviteCodeModel(BaseModel):
    code_id: int
    code: str


class InviteCodeDeleteRequest(BaseModel):
    code: str


@router.post("/create_invite")
async def create_invite_route(
    user: Annotated[User, Depends(get_current_user)],
) -> InviteCodeResponse:
    if (
        user.username != "admin"
    ):  # OK, since there will be an admin user created when app is first launched and it wont be able to be deleted
        return JSONResponse(
            {"success": False, "message": "You are not an admin you idiot"},
            status_code=400,
        )

    code = generate_invite()


    return {"success": code is not None, "code": code}


@router.post("/delete_invite")
async def delete_invite_route(
    code: InviteCodeDeleteRequest, user: Annotated[User, Depends(get_current_user)]
):
    if (
        user.username != "admin"
    ):  # OK, since there will be an admin user created when app is first launched and it wont be able to be deleted
        return JSONResponse(
            {"success": False, "message": "You are not an admin you idiot"},
            status_code=400,
        )

    res = db.remove_invite_code(code.code)

    return {"success": res}


@router.get("/invites")
async def list_invites_route(
    user: Annotated[User, Depends(get_current_user)],
) -> list[InviteCodeModel]:
    if (
        user.username != "admin"
    ):  # OK, since there will be an admin user created when app is first launched and it wont be able to be deleted
        return JSONResponse(
            {"success": False, "message": "You are not an admin you idiot"},
            status_code=400,
        )

    return db.list_invites()
