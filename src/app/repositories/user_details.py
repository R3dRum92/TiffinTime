from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException, status
from supabase import AsyncClient

from app import schemas
from utils.logger import logger


async def get_user_details(user_id: UUID, client: AsyncClient):
    try:
        response = (
            await client.table("subscription")
            .select("id, vendors(name), starts_from, ends_at")
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

    try:
        response = (
            await client.table("users")
            .select("id, name, phone_number, email")
            .eq("id", user_id)
            .execute()
        )
    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}",
        )

    if not response.data:
        logger.error(f"User not found")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User not found",
        )

    _user = response.data[0]

    return schemas.UserDetails(
        id=_user.get("id"),
        name=_user.get("name"),
        phone_number=_user.get("phone_number"),
        email=_user.get("email"),
        subscriptions=subscriptions,
    )
