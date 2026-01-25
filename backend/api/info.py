from typing import Annotated
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from api.auth import User, get_current_user
import db


router = APIRouter()


class ServerInfo(BaseModel):
    last_check: int
    last_full_check: int


@router.get("/info")
async def get_info(user: Annotated[User, Depends(get_current_user)]):
    return db.get_server_info()
