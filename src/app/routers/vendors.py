from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from supabase import AsyncClient

from app import schemas
from app.repositories import vendors
from db.supabase import get_db
from utils.auth import get_current_user, user_or_admin_auth

router = APIRouter(prefix="/vendors", tags=["vendors"])


@router.get(
    "/",
    response_model=List[schemas.VendorsResponse],
    dependencies=[Depends(user_or_admin_auth)],
    status_code=status.HTTP_200_OK,
)
async def get_all_vendors(client: AsyncClient = Depends(get_db)):
    return await vendors.get_all_vendors(client=client)


@router.get(
    "/{vendor_id}",
    response_model=schemas.VendorsResponse,
    dependencies=[Depends(user_or_admin_auth)],
    status_code=status.HTTP_200_OK,
)
async def get_vendor_by_id(vendor_id: UUID, client: AsyncClient = Depends(get_db)):
    return await vendors.get_vendor_by_id(vendor_id=vendor_id, client=client)


@router.get(
    "/token/", response_model=schemas.VendorsResponse, status_code=status.HTTP_200_OK
)
async def get_vendor_by_token(
    request: schemas.VendorID = Depends(get_current_user),
    client: AsyncClient = Depends(get_db),
):
    vendor_id = request.id
    return await vendors.get_vendor_by_id(vendor_id=vendor_id, client=client)
