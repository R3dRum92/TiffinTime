from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import AsyncClient

from app import schemas
from app.repositories import menu
from db.supabase import get_db
from utils.auth import get_vendor

router = APIRouter(prefix="/menu", tags=["menu"])


@router.get(
    "/",
    response_model=List[schemas.MenuResponse],
    status_code=status.HTTP_200_OK,
)
async def get_all_menus(client: AsyncClient = Depends(get_db)):
    return await menu.get_all_menus(client=client)


@router.post(
    "/", response_model=schemas.MenuItemResponse, status_code=status.HTTP_201_CREATED
)
async def add_menu_item(
    request: schemas.MenuItemAddRequest,
    vendor: schemas.UserBase = Depends(get_vendor),
    client: AsyncClient = Depends(get_db),
) -> schemas.MenuItemResponse:
    vendor_id = vendor.id
    return await menu.add_menu_item(request, vendor_id, client)


@router.get(
    "/vendors/",
    response_model=List[schemas.MenuItemResponse],
    status_code=status.HTTP_200_OK,
    summary="Get all menu items for the authenticated vendor",
)
async def get_my_menu(
    vendor: schemas.UserBase = Depends(get_vendor),
    client: AsyncClient = Depends(get_db),
) -> List[schemas.MenuItemResponse]:
    return await menu.get_all_menus_by_vendor(vendor_id=vendor.id, client=client)


@router.get(
    "/{item_id}",
    response_model=schemas.MenuItemResponse,
    status_code=status.HTTP_200_OK,
    summary="Get a specific menu item by its ID (Public)",
)
async def get_menu_item(
    item_id: UUID, client: AsyncClient = Depends(get_db)
) -> schemas.MenuItemResponse:
    """
    Retrieves a single menu item by its unique ID. This endpoint is public.
    """
    return await menu.get_menu_item_by_id(item_id=item_id, client=client)


@router.put(
    "/{item_id}",
    response_model=schemas.MenuItemResponse,
    status_code=status.HTTP_200_OK,
    summary="Update one of your menu items (Vendor only)",
)
async def update_menu_item(
    item_id: UUID,
    request: schemas.MenuItemUpdateRequest,
    vendor: schemas.UserBase = Depends(get_vendor),
    client: AsyncClient = Depends(get_db),
) -> schemas.MenuItemResponse:
    """
    Updates a menu item. Only the fields provided in the request body
    will be updated. You can only update items that you own.
    """
    return await menu.update_menu_item(
        item_id=item_id, vendor_id=vendor.id, request=request, client=client
    )


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete one of your menu items (Vendor only)",
)
async def delete_menu_item(
    item_id: UUID,
    vendor: schemas.UserBase = Depends(get_vendor),
    client: AsyncClient = Depends(get_db),
):
    """
    Deletes a menu item. You can only delete items that you own.
    """
    await menu.delete_menu_item(item_id=item_id, vendor_id=vendor.id, client=client)
    # A 204 No Content response should have an empty body
    return None
