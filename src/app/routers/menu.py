from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from supabase import AsyncClient

from app import schemas
from app.repositories import menu
from db.supabase import get_db

router = APIRouter(prefix="/menu", tags=["menu"])


@router.get(
    "/",
    response_model=List[schemas.MenuResponse],
    status_code=status.HTTP_200_OK,
)
async def get_all_menus(client: AsyncClient = Depends(get_db)):
    return await menu.get_all_menus(client=client)
