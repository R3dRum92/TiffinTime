from uuid import UUID

from fastapi import APIRouter, Depends, status
from supabase import AsyncClient

from app import schemas
from app.repositories import subscription
from db.supabase import get_db
from utils.auth import get_current_user

router = APIRouter(prefix="/subscribe", tags=["subscription"])


@router.post(
    "/",
    response_model=schemas.BaseResponse,
    status_code=status.HTTP_201_CREATED,
)
async def subscribe(
    request: schemas.SubscriptionRequest,
    user_id: schemas.UserID = Depends(get_current_user),
    client: AsyncClient = Depends(get_db),
):
    return await subscription.subscribe(
        request=request, user_id=user_id.id, client=client
    )
