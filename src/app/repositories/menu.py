import uuid
from datetime import date
from typing import List

from fastapi import HTTPException, status
from supabase import AsyncClient

from app import schemas
from utils.logger import logger


async def get_all_menus(client: AsyncClient) -> List[schemas.MenuResponse]:
    """
    Gets all available date specials for TODAY.

    This function now queries the `date_specials` table and joins
    with `menu_items` and `vendors` to get all necessary details.
    """
    try:
        today = date.today().isoformat()

        # Query date_specials and join menu_items and vendors
        # This gets specials for today, along with their item and vendor details
        response = (
            await client.table("date_specials")
            .select(
                """
                *,
                menu_items!inner(
                    *,
                    vendors!inner(name)
                )
                """
            )
            .eq("available_date", today)
            .execute()
        )

    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}",
        )

    _specials = response.data

    if not _specials:
        return []

    menus = []

    for special in _specials:
        # Data is nested, so we must extract it
        menu_item_data = special.get("menu_items")
        if not menu_item_data or not isinstance(menu_item_data, dict):
            logger.warning(
                f"Skipping special with missing menu item data: {special.get('id')}"
            )
            continue

        vendor_data = menu_item_data.get("vendors")
        if not vendor_data or not isinstance(vendor_data, dict):
            logger.warning(
                f"Missing vendor data for menu item {menu_item_data.get('id')}"
            )
            vendor_name = "Unknown Vendor"
        else:
            vendor_name = vendor_data.get("name", "Unknown Vendor")

        # Validate required fields from the menu item
        menu_id = menu_item_data.get("id")
        menu_name = menu_item_data.get("name")
        vendor_id = menu_item_data.get("vendor_id")

        # Prioritize special price, fall back to regular price
        special_price = special.get("special_price")
        menu_price = (
            special_price if special_price is not None else menu_item_data.get("price")
        )

        if not menu_id or not menu_name or menu_price is None or not vendor_id:
            logger.warning(f"Skipping special with missing required fields: {special}")
            continue

        # Handle image URL from the menu item data
        img_url = None
        _bucket = menu_item_data.get("img_bucket")
        _path = menu_item_data.get("img_path")

        if _bucket and _path:
            try:
                # Note: This is an await call inside a loop.
                # For high performance, consider batching these or restructuring.
                url_response = await client.storage.from_(_bucket).create_signed_url(
                    path=_path,
                    expires_in=3600,  # 1 hour
                    options={"transform": {"width": 300, "height": 200}},
                )
                img_url = url_response.get("signedURL")
            except Exception as e:
                logger.warning(
                    f"Failed to create signed URL for menu item {menu_id} - "
                    f"bucket: {_bucket}, path: {_path}, error: {str(e)}"
                )
        else:
            logger.debug(f"No image data for menu item {menu_id}")

        try:
            # Populate the MenuResponse schema
            _menu = schemas.MenuResponse(
                id=menu_id,
                vendor_id=vendor_id,
                name=menu_name,
                vendor_name=vendor_name,
                date=special.get("available_date"),  # Use the special's date
                img_url=img_url,
                description=menu_item_data.get("description"),
                price=menu_price,  # Use the determined price
                category=menu_item_data.get("category"),
                preparation_time=menu_item_data.get("preparation_time"),
            )
            menus.append(_menu)
        except Exception as e:
            logger.error(f"Failed to create MenuResponse for item {menu_id}: {str(e)}")
            continue

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
