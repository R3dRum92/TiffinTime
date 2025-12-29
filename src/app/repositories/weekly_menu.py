import uuid
from typing import List, Optional

from fastapi import HTTPException, status
from supabase import AsyncClient

from app import schemas
from utils.logger import logger

# --- Security Helper ---
# (Copied from date_specials repo for use here)


async def _check_item_owner(
    client: AsyncClient, menu_item_id: uuid.UUID, vendor_id: uuid.UUID
) -> bool:
    """
    Verifies that the menu item belongs to the authenticated vendor.
    """
    try:
        response = (
            await client.table("menu_items")
            .select("id")
            .eq("id", str(menu_item_id))
            .eq("vendor_id", str(vendor_id))
            .single()
            .execute()
        )
        return response.data is not None
    except Exception:
        return False


# --- REPOSITORY FUNCTIONS ---


async def get_vendor_weekly_menu(
    vendor_id: uuid.UUID, client: AsyncClient
) -> List[schemas.WeeklyAvailabilityDetailResponse]:
    """
    Gets the full weekly availability schedule for a vendor,
    joining with menu_items to get item details.
    """
    try:
        # We must query 'weekly_availability' but filter by 'vendor_id'
        # which is in 'menu_items'.
        response = (
            await client.table("weekly_availability")
            .select(
                """
                *,
                menu_items!inner(*)
                """
            )
            .eq("menu_items.vendor_id", str(vendor_id))
            .execute()
        )

        # Manually add vendor_id to each item for schema validation
        result_list = []
        for item in response.data:
            item["vendor_id"] = vendor_id
            result_list.append(
                schemas.WeeklyAvailabilityDetailResponse.model_validate(item)
            )
        return result_list

    except Exception as e:
        logger.error(f"Error getting weekly menu for vendor {vendor_id}: {e}")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(e))


async def set_weekly_availability(
    request: schemas.WeeklyAvailabilitySetRequest,
    vendor_id: uuid.UUID,
    client: AsyncClient,
) -> Optional[schemas.WeeklyAvailabilityDetailResponse]:
    """
    Sets the availability for an item on a specific day of the week.
    This uses 'upsert' to create the rule if it doesn't exist
    or update it if it does.
    """
    try:
        # 1. SECURITY: Verify this vendor owns the menu item
        is_owner = await _check_item_owner(client, request.menu_item_id, vendor_id)
        if not is_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not own this menu item.",
            )
        if not request.is_available:
        # If the vendor unchecked it, DELETE the entry
            response = await client.table("weekly_availability")\
                .delete()\
                .eq("menu_item_id", str(request.menu_item_id))\
                .eq("day_of_week", request.day_of_week.value)\
                .execute()
            return None # Return None since the record is gone
        else:
            # 2. Prepare data for upsert
            upsert_data = {
                "menu_item_id": str(request.menu_item_id),
                "day_of_week": request.day_of_week.value,  # Use the int value
                "is_available": request.is_available,
            }

            # 3. Perform the 'upsert'
            # 'on_conflict' tells Supabase which columns to check for a duplicate.
            upsert_response = (
                await client.table("weekly_availability")
                .upsert(
                    upsert_data,
                    on_conflict="menu_item_id, day_of_week",
                )
                .execute()
            )

            if not upsert_response.data or not upsert_response.data[0]:
                raise HTTPException(
                    status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "Failed to set availability (upsert failed).",
                )

            upserted_row_id = upsert_response.data[0].get("id")

            # 4. Fetch the newly created/updated item with join (Step 2 of 2)
            fetch_response = (
                await client.table("weekly_availability")
                .select("*, menu_items(*)")  # Fetch with join
                .eq("id", upserted_row_id)  # Use the ID from the upsert response
                .single()
                .execute()
            )

            if not fetch_response.data:
                raise HTTPException(
                    status.HTTP_500_INTERNAL_SERVER_ERROR,
                    "Failed to set availability (fetch failed).",
                )

            # 5. Return the full response
            result_data = fetch_response.data
            result_data["vendor_id"] = vendor_id  # Add for schema
            return schemas.WeeklyAvailabilityDetailResponse.model_validate(result_data)

    except HTTPException as e:
        raise e  # Re-throw known HTTP exceptions
    except Exception as e:
        logger.error(f"Error setting weekly availability: {e}")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(e))
