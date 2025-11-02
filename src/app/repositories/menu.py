# from typing import List

# from fastapi import HTTPException, status
# from supabase import AsyncClient

# from app import schemas
# from utils.logger import logger


# async def get_all_menus(client: AsyncClient) -> List[schemas.MenuResponse]:
#     try:
#         response = (
#             await client.table("menu_items")
#             .select(
#                 "id, vendor_id, vendors!vendor_id(name), name, date, img_path, img_bucket, description, price, category, preparation_time"
#             )
#             .execute()
#         )
#     except Exception as e:
#         logger.error(f"Database query failed: {str(e)}")
#         raise HTTPException(
#             status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             detail=f"Database query failed: {str(e)}",
#         )

#     _menus = response.data

#     if not _menus:
#         return []

#     menus = []

#     for menu in _menus:
#         # Validate required fields
#         menu_id = menu.get("id")
#         menu_name = menu.get("name")
#         menu_price = menu.get("price")

#         if not menu_id or not menu_name or menu_price is None:
#             logger.warning(f"Skipping menu item with missing required fields: {menu}")
#             continue

#         # Handle vendor name safely
#         vendor_data = menu.get("vendors")
#         if not vendor_data or not isinstance(vendor_data, dict):
#             logger.warning(f"Missing vendor data for menu item {menu_id}")
#             vendor_name = "Unknown Vendor"
#         else:
#             vendor_name = vendor_data.get("name", "Unknown Vendor")

#         # Handle image URL
#         img_url = None
#         _bucket = menu.get("img_bucket")
#         _path = menu.get("img_path")

#         if _bucket and _path:
#             try:
#                 url_response = await client.storage.from_(_bucket).create_signed_url(
#                     path=_path,
#                     expires_in=3600,  # 1 hour
#                     options={"transform": {"width": 300, "height": 200}},
#                 )
#                 img_url = url_response.get("signedURL")
#             except Exception as e:
#                 logger.warning(
#                     f"Failed to create signed URL for menu item {menu_id} - "
#                     f"bucket: {_bucket}, path: {_path}, error: {str(e)}"
#                 )
#         else:
#             logger.debug(f"No image data for menu item {menu_id}")

#         try:
#             _menu = schemas.MenuResponse(
#                 id=menu_id,
#                 name=menu_name,
#                 vendor_name=vendor_name,
#                 date=menu.get("date"),  # Can be None now
#                 img_url=img_url,
#                 description=menu.get("description"),
#                 price=menu_price,
#                 category=menu.get("category"),
#                 preparation_time=menu.get("preparation_time"),
#             )
#             menus.append(_menu)
#         except Exception as e:
#             logger.error(f"Failed to create MenuResponse for item {menu_id}: {str(e)}")
#             continue

#     return menus


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
