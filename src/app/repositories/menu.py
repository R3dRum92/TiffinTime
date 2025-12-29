import uuid
from datetime import date
from typing import Dict, List

from fastapi import HTTPException, UploadFile, status
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
        today_date = date.today()
        today_iso = today_date.isoformat()
        today_weekday = (today_date.weekday() + 1) % 7

        specials_resp = (
            await client.table("date_specials")
            .select("*, menu_items!inner(*, vendors!inner(name))")
            .eq("available_date", today_iso)
            .execute()
        )

        weekly_resp = (
            await client.table("weekly_availability")
            .select("*, menu_items!inner(*, vendors!inner(name))")
            .eq("day_of_week", today_weekday)
            .eq("is_available", True)
            .execute()
        )

    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}",
        )

    merged_items: Dict[str, dict] = {}

    for item in weekly_resp.data:
        m_item = item.get("menu_items")
        if m_item:
            merged_items[m_item["id"]] = {
                "special_price": None,
                "menu_data": m_item,
                "date_source": today_iso,
            }

    for special in specials_resp.data:
        m_item = special.get("menu_items")
        if m_item:
            merged_items[m_item["id"]] = {
                "special_price": special.get("special_price"),
                "menu_data": m_item,
                "date_source": special.get("available_date"),
            }

    if not merged_items:
        return []

    final_menus = []

    for item_id, data in merged_items.items():
        m_data = data["menu_data"]
        v_data = m_data.get("vendors", {})

        # Price Logic: Special Price -> Regular Price
        price = (
            data["special_price"]
            if data["special_price"] is not None
            else m_data.get("price")
        )

        # Image Handling
        img_url = None
        bucket = m_data.get("img_bucket")
        path = m_data.get("img_path")

        if bucket and path:
            try:
                url_resp = await client.storage.from_(bucket).create_signed_url(
                    path=path,
                    expires_in=3600,
                    options={"transform": {"width": 300, "height": 200}},
                )
                img_url = url_resp.get("signedURL")
            except Exception as e:
                logger.warning(f"Signed URL failed for {item_id}: {e}")

        try:
            final_menus.append(
                schemas.MenuResponse(
                    id=item_id,
                    vendor_id=m_data.get("vendor_id"),
                    name=m_data.get("name"),
                    vendor_name=v_data.get("name", "Unknown Vendor"),
                    date=data["date_source"],
                    img_url=img_url,
                    description=m_data.get("description"),
                    price=price,
                    category=m_data.get("category"),
                    preparation_time=m_data.get("preparation_time"),
                )
            )
        except Exception as e:
            logger.error(f"Schema mapping failed for {item_id}: {e}")

    return final_menus


async def add_menu_item(
    request: schemas.MenuItemBase, vendor_id: uuid.UUID, client: AsyncClient
) -> schemas.MenuItemResponse:
    try:
        item_data = request.model_dump()
        item_data["vendor_id"] = str(vendor_id)

        # CHANGED: Set default image with bucket "menus"
        if not item_data.get("img_bucket") or not item_data.get("img_path"):
            item_data["img_bucket"] = "menus"
            item_data["img_path"] = "menus/default-menu.jpg"

        logger.info(f"Inserting new menu item: {item_data}")
        response = await client.table("menu_items").insert(item_data).execute()

        if response.data and len(response.data) > 0:
            new_item = response.data[0]
            logger.info(f"successfully inserted item with id: {new_item.get("id")}")
            return schemas.MenuItemResponse.model_validate(new_item)
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
            detail=f"An unexpected error occured: {e}",
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

        if not response.data:
            return []

        items = []
        for item in response.data:
            # Generate signed URL for image
            img_url = None
            if item.get("img_bucket") and item.get("img_path"):
                try:
                    url_response = await client.storage.from_(
                        item["img_bucket"]
                    ).create_signed_url(
                        path=item["img_path"],
                        expires_in=3600,
                    )
                    img_url = url_response.get("signedURL")
                except Exception as e:
                    logger.warning(
                        f"Failed to create signed URL for {item.get('id')}: {e}"
                    )

            # Create a new dict with img_url
            item_with_url = {**item, "img_url": img_url}
            items.append(schemas.MenuItemResponse.model_validate(item_with_url))

        return items

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


async def upload_menu_image(
    item_id: uuid.UUID, vendor_id: uuid.UUID, file: UploadFile, client: AsyncClient
):
    """Upload image for a menu item."""

    # Validate file type
    allowed_types = ["image/jpeg", "image/jpg", "image/png"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, JPEG, and PNG images are allowed",
        )

    # Verify item exists and belongs to vendor
    try:
        item = (
            await client.table("menu_items")
            .select("*")
            .eq("id", str(item_id))
            .eq("vendor_id", str(vendor_id))
            .single()
            .execute()
        )

        if not item.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Menu item not found or unauthorized",
            )
    except Exception as e:
        logger.error(f"Error verifying item: {e}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found"
        )

    # Get file extension
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["jpg", "jpeg", "png"]:
        ext = "jpg"

    # CHANGED: Bucket is "menus", Path is "menus/{item_id}.{ext}"
    bucket_name = "menus"
    img_path = f"menus/{item_id}.{ext}"

    try:
        # Read file content
        file_content = await file.read()

        # Delete old image if exists
        old_path = item.data.get("img_path")
        if old_path and old_path.startswith("menus/"):
            try:
                await client.storage.from_(bucket_name).remove([old_path])
                logger.info(f"Deleted old image: {old_path}")
            except Exception as e:
                logger.warning(f"Could not delete old image: {e}")

        # Upload new image
        upload_response = await client.storage.from_(bucket_name).upload(
            path=img_path,
            file=file_content,
            file_options={"content-type": file.content_type, "upsert": "true"},
        )

        logger.info(f"Uploaded image to: {img_path}")

        # Update database
        update_response = (
            await client.table("menu_items")
            .update({"img_bucket": bucket_name, "img_path": img_path})
            .eq("id", str(item_id))
            .execute()
        )

        logger.info(f"Updated database for item {item_id}")

        return {
            "message": "Image uploaded successfully",
            "img_path": img_path,
            "img_bucket": bucket_name,
        }

    except Exception as e:
        logger.error(f"Failed to upload image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}",
        )


async def get_vendor_menu_with_availability(
    vendor_id: uuid.UUID, client: AsyncClient
) -> List[schemas.MenuItemResponse]:
    from datetime import date, datetime

    today = date.today().isoformat()
    # ✅ Change: weekday() returns 0-6 (Monday=0, Sunday=6)
    day_of_week = datetime.today().weekday()  # Returns: 0-6
    # If your DB uses Sunday=0, convert it:
    # day_of_week = (datetime.today().weekday() + 1) % 7

    # Get all items
    all_items = await get_all_menus_by_vendor(vendor_id=vendor_id, client=client)

    # Check date_specials
    specials = (
        await client.table("date_specials")
        .select("menu_item_id")
        .eq("available_date", today)
        .execute()
    )
    special_ids = {item["menu_item_id"] for item in (specials.data or [])}

    # ✅ Check weekly_availability with integer
    weekly = (
        await client.table("weekly_availability")
        .select("menu_item_id")
        .eq("day_of_week", day_of_week)
        .eq("is_available", True)
        .execute()
    )
    weekly_ids = {item["menu_item_id"] for item in (weekly.data or [])}

    # Combine
    available_ids = special_ids | weekly_ids

    # Add availability
    result = []
    for item in all_items:
        item_dict = item.model_dump()
        item_dict["available_today"] = str(item_dict["id"]) in available_ids
        result.append(schemas.MenuItemResponse(**item_dict))

    return result
