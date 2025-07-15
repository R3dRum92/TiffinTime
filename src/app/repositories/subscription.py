from datetime import datetime, timedelta, timezone
from typing import List
from uuid import UUID

from fastapi import HTTPException, status
from supabase import AsyncClient

from app import schemas
from utils.logger import logger


async def subscribe(
    request: schemas.SubscriptionRequest, user_id: UUID, client: AsyncClient
):
    try:
        response = await client.table("users").select("*").eq("id", user_id).execute()
    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}",
        )

    _user = response.data[0]

    if not _user:
        logger.error(f"User with id: {user_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with id: {user_id} not found",
        )

    try:
        response = (
            await client.table("vendors")
            .select("*")
            .eq("id", request.vendor_id)
            .execute()
        )
    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}",
        )

    _vendor = response.data[0]

    if not _vendor:
        logger.error(f"Vendor with id: {request.vendor_id} not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Vendor with id: {request.vendor_id} not found",
        )

    _now = datetime.now(timezone.utc)
    _ed = request.type_timedelta
    _end = _now + _ed

    await client.table("subscription").insert(
        {
            "user_id": str(user_id),
            "vendor_id": str(request.vendor_id),
            "starts_from": str(_now),
            "ends_at": str(_end),
        }
    ).execute()

    return schemas.BaseResponse(message="Subscription successful")


async def get_user_subscriptions(
    user_id: UUID, client: AsyncClient
) -> List[schemas.UserSubscriptionResponse]:
    try:
        response = (
            await client.table("subscription")
            .select("id, users(id, name), vendors(id, name), starts_from, ends_at")
            .eq("user_id", user_id)
            .execute()
        )

    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}",
        )

    _subscriptions = response.data
    subscriptions = []

    for subscription in _subscriptions:
        ends = datetime.fromisoformat(subscription.get("ends_at"))
        now = datetime.now(timezone.utc)

        days_remaining = max(0, (ends - now).days)

        _subscription = schemas.UserSubscriptionResponse(
            id=subscription.get("id"),
            name=subscription.get("vendors").get("name"),
            duration=days_remaining,
            start_date=datetime.fromisoformat(subscription.get("starts_from")).date(),
        )

        subscriptions.append(_subscription)

    return subscriptions
