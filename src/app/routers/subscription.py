from typing import List
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


@router.get(
    "/token/",
    response_model=List[schemas.VendorSubscriptionResponse],
    status_code=status.HTTP_200_OK,
)
async def get_subscription_by_vendor(
    vendor: schemas.VendorID = Depends(get_current_user),
    client: AsyncClient = Depends(get_db),
):
    vendor_id = vendor.id
    return await subscription.get_subscriptions_by_vendor(
        vendor_id=vendor_id, client=client
    )


@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def cancel_subscription(
    subscription_id: UUID, client: AsyncClient = Depends(get_db)
):
    return await subscription.cancel_subscription(
        subscription_id=subscription_id, client=client
    )
