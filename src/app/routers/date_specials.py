import uuid
from datetime import date
from typing import List

from fastapi import APIRouter, Depends, status
from supabase import AsyncClient

from app import schemas
from app.repositories import date_specials as repo
from db.supabase import get_db
from utils.auth import get_vendor

router = APIRouter(prefix="/specials", tags=["Date Specials"])


@router.post(
    "/",
    response_model=schemas.DateSpecialDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add a menu item as a special for a specific date (Vendor only)",
)
async def add_date_special(
    request: schemas.DateSpecialAddRequest,
    vendor: schemas.UserBase = Depends(get_vendor),
    client: AsyncClient = Depends(get_db),
) -> schemas.DateSpecialDetailResponse:
    """
    Create a new "date special". This links one of your existing
    menu items to a specific date, with an optional quantity and special price.
    """
    return await repo.create_special(request, vendor.id, client)


@router.get(
    "/my-specials",
    response_model=List[schemas.DateSpecialDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all your upcoming specials (Vendor only)",
)
async def get_my_specials(
    vendor: schemas.UserBase = Depends(get_vendor),
    client: AsyncClient = Depends(get_db),
) -> List[schemas.DateSpecialDetailResponse]:
    """
    Retrieves a list of all upcoming (today and future) specials
    for the authenticated vendor.
    """
    return await repo.get_vendor_specials(vendor.id, client)


@router.get(
    "/today",
    response_model=List[schemas.DateSpecialDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all specials for today (Public)",
)
async def get_today_specials(
    client: AsyncClient = Depends(get_db),
) -> List[schemas.DateSpecialDetailResponse]:
    """
    Retrieves all specials from all vendors for the current date.
    """
    return await repo.get_specials_for_date(date.today(), client)


@router.get(
    "/by-date/{query_date}",
    response_model=List[schemas.DateSpecialDetailResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all specials for a specific date (Public)",
)
async def get_specials_by_date(
    query_date: date, client: AsyncClient = Depends(get_db)
) -> List[schemas.DateSpecialDetailResponse]:
    """
    Retrieves all specials from all vendors for a specific date (YYYY-MM-DD).
    """
    return await repo.get_specials_for_date(query_date, client)


@router.put(
    "/{special_id}",
    response_model=schemas.DateSpecialDetailResponse,
    status_code=status.HTTP_200_OK,
    summary="Update the quantity or price of a special (Vendor only)",
)
async def update_date_special(
    special_id: uuid.UUID,
    request: schemas.DateSpecialUpdateRequest,
    vendor: schemas.UserBase = Depends(get_vendor),
    client: AsyncClient = Depends(get_db),
) -> schemas.DateSpecialDetailResponse:
    """
    Update the quantity or special price of one of your date specials.
    You cannot change the item or the date.
    """
    return await repo.update_special(special_id, vendor.id, request, client)


@router.delete(
    "/{special_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a special (Vendor only)",
)
async def delete_date_special(
    special_id: uuid.UUID,
    vendor: schemas.UserBase = Depends(get_vendor),
    client: AsyncClient = Depends(get_db),
):
    """
    Removes a special. You can only delete your own specials.
    """
    await repo.delete_special(special_id, vendor.id, client)
    return None  # 204 response has no body
