from fastapi import APIRouter, Depends, status
from supabase import AsyncClient

from app import schemas
from app.repositories import user_details
from db.supabase import get_db
from utils.auth import get_current_user

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/", response_model=schemas.UserDetails, status_code=status.HTTP_200_OK)
async def get_user_details(
    user: schemas.UserID = Depends(get_current_user),
    client: AsyncClient = Depends(get_db),
):
    user_id = user.id
    return await user_details.get_user_details(user_id, client)
