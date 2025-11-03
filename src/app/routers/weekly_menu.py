import uuid
from typing import List

from fastapi import APIRouter, Depends, status
from supabase import AsyncClient  # Use supabase_async

from app import schemas
from app.repositories import weekly_menu as repo
from db.supabase import get_db
from utils.auth import get_vendor

router = APIRouter(prefix="/weekly-menu", tags=["Weekly Menu (Vendor)"])


@router.get(
    "/my-menu",
    response_model=List[schemas.WeeklyAvailabilityDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Get your full weekly menu schedule",
)
async def get_my_weekly_menu(
    vendor: schemas.UserBase = Depends(get_vendor),
    client: AsyncClient = Depends(get_db),
) -> List[schemas.WeeklyAvailabilityDetailResponse]:
    """
    Retrieves the vendor's entire weekly menu schedule, showing
    which items are available on which days.
    """
    return await repo.get_vendor_weekly_menu(vendor.id, client)


@router.post(
    "/set-availability",
    response_model=schemas.WeeklyAvailabilityDetailResponse,
    status_code=status.HTTP_200_OK,  # 200 OK since it's an update or create
    summary="Set an item's availability for a day of the week",
)
async def set_item_availability(
    request: schemas.WeeklyAvailabilitySetRequest,
    vendor: schemas.UserBase = Depends(get_vendor),
    client: AsyncClient = Depends(get_db),
) -> schemas.WeeklyAvailabilityDetailResponse:
    """
    Set an item's availability for a specific day of the week.
    - If a rule exists, it's updated (e.g., true -> false).
    - If no rule exists, it's created.

    DayOfWeek mapping: 0=Sunday, 1=Monday, ..., 6=Saturday
    """
    return await repo.set_weekly_availability(request, vendor.id, client)
