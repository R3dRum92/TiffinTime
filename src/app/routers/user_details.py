from fastapi import APIRouter, Depends, status
from supabase import AsyncClient
from uuid import UUID


from app import schemas
from app.repositories import user_details, vendors
from db.supabase import get_db
from utils.auth import get_current_user, get_vendor

router = APIRouter(prefix="/user", tags=["User"])


@router.get("/", response_model=schemas.UserDetails, status_code=status.HTTP_200_OK)
async def get_user_details(
    user: schemas.UserID = Depends(get_current_user),
    client: AsyncClient = Depends(get_db),
):
    user_id = user.id
    return await user_details.get_user_details(user_id, client)


@router.get(
    "/vendor/", response_model=schemas.VendorsResponse, status_code=status.HTTP_200_OK
)
async def get_vendor_details(
    vendor: schemas.UserBase = Depends(get_vendor),
    client: AsyncClient = Depends(get_db),
) -> schemas.VendorsResponse:
    return await vendors.get_vendor_by_id(vendor_id=vendor.id, client=client)


@router.get("/{user_id}", response_model=schemas.UserDetails, status_code=status.HTTP_200_OK)
async def get_user_by_id(
    user_id: UUID,
    client: AsyncClient = Depends(get_db),
):
    """Get any user's details by their user_id"""
    return await user_details.get_user_details(user_id, client)