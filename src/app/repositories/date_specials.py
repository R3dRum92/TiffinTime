import uuid
from datetime import date
from typing import Any, Dict, List

from fastapi import HTTPException, status
from supabase import AsyncClient  # Use supabase_async

from app import schemas
from utils.logger import logger  # Assuming logger is available

# --- Security Helper ---


async def _check_item_owner(
    client: AsyncClient, menu_item_id: uuid.UUID, vendor_id: uuid.UUID
) -> bool:
    """
    Verifies that the menu item belongs to the authenticated vendor.
    This is a critical security check.
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


# --- CREATE ---


async def create_special(
    request: schemas.DateSpecialAddRequest, vendor_id: uuid.UUID, client: AsyncClient
) -> schemas.DateSpecialDetailResponse:
    try:
        # 1. SECURITY: Verify this vendor owns the menu item
        is_owner = await _check_item_owner(client, request.menu_item_id, vendor_id)
        if not is_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not own this menu item.",
            )

        # 2. Check for duplicates
        response = (
            await client.table("date_specials")
            .select("id")
            .eq("menu_item_id", str(request.menu_item_id))
            .eq("available_date", request.available_date.isoformat())
            .execute()
        )
        if response.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This item is already a special on this date.",
            )

        # 3. Create the item
        special_data = request.model_dump()
        # Convert UUID and date to strings for JSON serialization
        special_data["menu_item_id"] = str(special_data["menu_item_id"])
        special_data["available_date"] = special_data["available_date"].isoformat()

        # Add vendor_id (from token) to the data to be inserted
        # Note: This assumes 'date_specials' table has a 'vendor_id' column
        # If not, this line should be removed.
        # special_data["vendor_id"] = str(vendor_id)

        insert_response = (
            await client.table("date_specials").insert(special_data).execute()
        )

        if not insert_response.data or not insert_response.data[0]:
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "Failed to create special (insert failed).",
            )

        new_item_id = insert_response.data[0].get("id")

        # Step 3b: Fetch the newly created item with its join
        response = (
            await client.table("date_specials")
            .select("*, menu_items(*)")
            .eq("id", new_item_id)
            .single()
            .execute()
        )

        if response.data:
            # FIX: Manually add vendor_id before validation
            response.data["vendor_id"] = vendor_id
            return schemas.DateSpecialDetailResponse.model_validate(response.data)
        else:
            raise HTTPException(
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                "Failed to create special (fetch failed).",
            )

    except HTTPException as e:
        raise e  # Re-throw known HTTP exceptions
    except Exception as e:
        logger.error(f"Error creating special: {e}")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(e))


# --- READ (For Authenticated Vendor) ---


async def get_vendor_specials(
    vendor_id: uuid.UUID, client: AsyncClient
) -> List[schemas.DateSpecialDetailResponse]:
    """
    Gets all UPCOMING specials for the authenticated vendor.
    """
    try:
        today = date.today().isoformat()
        response = (
            await client.table("date_specials")
            .select("*, menu_items!inner(*)")  # Use inner join
            .eq("menu_items.vendor_id", str(vendor_id))  # Filter on joined table
            .gte("available_date", today)
            .execute()
        )

        # FIX: Manually add vendor_id to each item before validation
        validated_list = []
        for item in response.data:
            item["vendor_id"] = vendor_id
            validated_list.append(
                schemas.DateSpecialDetailResponse.model_validate(item)
            )
        return validated_list

    except Exception as e:
        logger.error(f"Error getting vendor specials: {e}")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(e))


# --- READ (Public - For a specific date) ---


async def get_specials_for_date(
    query_date: date, client: AsyncClient
) -> List[schemas.DateSpecialDetailResponse]:
    """
    Gets all specials from ALL vendors for a specific date.
    """
    try:
        response = (
            await client.table("date_specials")
            .select("*, menu_items!inner(*)")  # Use inner join
            .eq("available_date", query_date.isoformat())
            .execute()
        )

        # FIX: Manually add vendor_id (from nested object) to each item
        validated_list = []
        for item in response.data:
            if item.get("menu_items") and item["menu_items"].get("vendor_id"):
                item["vendor_id"] = item["menu_items"]["vendor_id"]
                validated_list.append(
                    schemas.DateSpecialDetailResponse.model_validate(item)
                )
        return validated_list

    except Exception as e:
        logger.error(f"Error getting specials for date {query_date}: {e}")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(e))


# --- UPDATE ---


async def update_special(
    special_id: uuid.UUID,
    vendor_id: uuid.UUID,
    request: schemas.DateSpecialUpdateRequest,
    client: AsyncClient,
) -> schemas.DateSpecialDetailResponse:
    try:
        update_data = request.model_dump(exclude_unset=True)
        if not update_data:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "No data to update.")

        # Convert UUIDs/dates if they are in the update data
        if "menu_item_id" in update_data:
            update_data["menu_item_id"] = str(update_data["menu_item_id"])
        if "available_date" in update_data:
            update_data["available_date"] = update_data["available_date"].isoformat()

        # Step 1: Verify owner and get special data in one call
        special_response = (
            await client.table("date_specials")
            .select("id, menu_items!inner(vendor_id)")
            .eq("id", str(special_id))
            .single()
            .execute()
        )

        if not special_response.data:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Special not found.")

        # Check if the nested menu_item's vendor_id matches
        if str(special_response.data.get("menu_items", {}).get("vendor_id")) != str(
            vendor_id
        ):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No permission.")

        # Step 2: Update the item
        update_response = (
            await client.table("date_specials")
            .update(update_data)
            .eq("id", str(special_id))
            .execute()
        )

        if not update_response.data or not update_response.data[0]:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, "Special not found or update failed."
            )

        # Step 3: Fetch the updated item with its join
        response = (
            await client.table("date_specials")
            .select("*, menu_items(*)")
            .eq("id", str(special_id))
            .single()
            .execute()
        )

        if response.data:
            # FIX: Manually add vendor_id before validation
            response.data["vendor_id"] = vendor_id
            return schemas.DateSpecialDetailResponse.model_validate(response.data)
        else:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, "Special not found after update."
            )

    except Exception as e:
        logger.error(f"Error updating special {special_id}: {e}")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(e))


# --- DELETE ---


async def delete_special(
    special_id: uuid.UUID, vendor_id: uuid.UUID, client: AsyncClient
) -> None:
    try:
        # Step 1: Verify owner and get special data in one call
        special_response = (
            await client.table("date_specials")
            .select("id, menu_items!inner(vendor_id)")
            .eq("id", str(special_id))
            .single()
            .execute()
        )

        if not special_response.data:
            raise HTTPException(status.HTTP_404_NOT_FOUND, "Special not found.")

        # Check if the nested menu_item's vendor_id matches
        if str(special_response.data.get("menu_items", {}).get("vendor_id")) != str(
            vendor_id
        ):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "No permission.")

        # Step 2: Delete the item
        response = (
            await client.table("date_specials")
            .delete()
            .eq("id", str(special_id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, "Special not found or delete failed."
            )

        return None

    except Exception as e:
        logger.error(f"Error deleting special {special_id}: {e}")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(e))
