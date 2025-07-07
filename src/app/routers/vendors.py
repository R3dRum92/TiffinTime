from typing import List

from fastapi import APIRouter, Depends, status
from supabase import AsyncClient

from app import schemas
from app.repositories import vendors
from db.supabase import get_db
from utils.auth import user_or_admin_auth

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.get(
    "/",
    response_model=List[schemas.VendorsResponse],
    dependencies=[Depends(user_or_admin_auth)],
    status_code=status.HTTP_200_OK,
)
async def get_all_vendors(client: AsyncClient = Depends(get_db)):
    return await vendors.get_all_vendors(client=client)
