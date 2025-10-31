import uuid
from typing import List

from fastapi import HTTPException, status
from supabase import AsyncClient

from app import schemas
from utils.logger import logger


async def get_all_menus(client: AsyncClient) -> List[schemas.MenuResponse]:
    try:
        response = (
            await client.table("menu_items")
            .select(
                "id, vendors(id, name), name, date, img_path, img_bucket, description, price"
            )
            .execute()
        )
    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}",
        )

    _menus = response.data
    menus = []

    for menu in _menus:
        _bucket = menu.get("img_bucket")
        _path = menu.get("img_path")

        if not _bucket or not _path:
            logger.error(f"Path or bucket does not exist")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Path or bucket does not exist",
            )

        try:
            url = await client.storage.from_(_bucket).create_signed_url(
                path=_path,
                expires_in=60,
                options={"transform": {"width": 300, "height": 200}},
            )
        except Exception as e:
            logger.info(f"bucket: {_bucket}")
            logger.info(f"path: {_path}")
            logger.info(f"URL: {url}")
            logger.error(f"Path or bucket does not exist")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Path or bucket does not exist",
            )

        _menu = schemas.MenuResponse(
            id=menu.get("id"),
            name=menu.get("name"),
            vendor_name=menu.get("vendors").get("name"),
            date=menu.get("date"),
            img_url=url.get("signedURL"),
            description=menu.get("description"),
            price=menu.get("price"),
        )

        menus.append(_menu)

    return menus


async def add_menu_item(
    request: schemas.MenuItemAddRequest, vendor_id: uuid.UUID, client: AsyncClient
) -> schemas.MenuItemResponse:
    try:
        item_data = request.model_dump()
        item_data["vendor_id"] = str(vendor_id)

        logger.info(f"Inserting new menu item: {item_data}")

        response = await client.table("menu_items").insert(item_data).execute()

        if response.data and len(response.data) > 0:
            new_item = response.data[0]
            logger.info(f"successfully inserted item with id: {new_item.get("id")}")
            return new_item
        else:
            logger.error("Item was not inserted or data was not returned")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Item was not inserted or data was not returned",
            )

    except Exception as e:
        logger.error(f"An unexpected error occured: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occured: {e}",
        )


async def get_all_menus_by_vendor(
    vendor_id: uuid.UUID, client: AsyncClient
) -> List[schemas.MenuItemResponse]:
    try:
        response = (
            await client.table("menu_items")
            .select("*")
            .eq("vendor_id", str(vendor_id))
            .execute()
        )

        if response.data:
            return [
                schemas.MenuItemResponse.model_validate(item) for item in response.data
            ]
        return []
    except Exception as e:
        logger.error(f"Error fetching menus for vendor {vendor_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch menu items: {str(e)}",
        )


async def get_menu_item_by_id(
    item_id: uuid.UUID, client: AsyncClient
) -> schemas.MenuItemResponse:
    try:
        response = (
            await client.table("menu_items")
            .select("*")
            .eq("id", str(item_id))
            .single()
            .execute()
        )

        if response.data:
            return schemas.MenuItemResponse.model_validate(response.data)

        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found"
        )
    except Exception as e:
        logger.warning(f"Failed to get item {item_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Menu Item not found"
        )


async def update_menu_item(
    item_id: uuid.UUID,
    vendor_id: uuid.UUID,
    request: schemas.MenuItemUpdateRequest,
    client: AsyncClient,
) -> schemas.MenuItemResponse:
    try:
        update_data = request.model_dump(exclude_unset=True)

        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="No fields to update"
            )

        response = (
            await client.table("menu_items")
            .update(update_data)
            .eq("id", str(item_id))
            .eq("vendor_id", str(vendor_id))
            .execute()
        )

        if response.data and len(response.data) > 0:
            updated_item = response.data[0]
            logger.info(f"Successfully updated item {item_id}")
            return schemas.MenuItemResponse.model_validate(updated_item)
        else:
            logger.warning(
                f"Failed update attempt for item {item_id} by vendor_id {vendor_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu item not found or you do not have permission to update it.",
            )
    except Exception as e:
        logger.error(f"Error updating item {item_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update menu item: {str(e)}",
        )


async def delete_menu_item(
    item_id: uuid.UUID, vendor_id: uuid.UUID, client: AsyncClient
) -> None:
    try:
        response = (
            await client.table("menu_items")
            .delete()
            .eq("id", str(item_id))
            .eq("vendor_id", str(vendor_id))
            .execute()
        )

        if response.data and len(response.data) > 0:
            logger.info(f"Successfully deleted item {item_id} by vendor {vendor_id}")
            return None
        else:
            logger.warning(
                f"Failed delete attempt for item {item_id} by vendor {vendor_id}"
            )
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu item not found or you do not have permission to delete it.",
            )
    except Exception as e:
        logger.error(f"Error deleting item {item_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete menu item: {str(e)}",
        )
