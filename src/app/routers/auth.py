from typing import List

from fastapi import APIRouter, Depends, status
from supabase import AsyncClient

from app import schemas
from app.repositories import auth
from db.supabase import get_db

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post(
    "/register",
    response_model=schemas.BaseResponse,
    status_code=status.HTTP_201_CREATED,
)
async def register(
    request: schemas.RegistrationRequest, client: AsyncClient = Depends(get_db)
):
    return await auth.register(request=request, client=client)


@router.post("/login", response_model=schemas.LoginResponse)
async def login(request: schemas.LoginRequest, client: AsyncClient = Depends(get_db)):
    return await auth.login(request=request, client=client)
