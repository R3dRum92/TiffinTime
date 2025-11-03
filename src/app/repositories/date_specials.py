import uuid
from datetime import date
from typing import Any, Dict, List

from fastapi import HTTPException, status
from supabase import AsyncClient  # Or supabase_async

from app import schemas
from utils.logger import logger

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


# --- CREATE (Fixed) ---


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
            .eq("menu_item_id", str(request.menu_item_id))  # Use str() here for safety
            .eq("available_date", request.available_date.isoformat())
            .execute()
        )
        if response.data:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This item is already a special on this date.",
            )

        # 3. Create the item (in 2 steps for reliability)
        special_data = request.model_dump()
        special_data["vendor_id"] = str(vendor_id)
        special_data["available_date"] = special_data["available_date"].isoformat()

        # ---
        # THE FIX IS HERE:
        # Convert the menu_item_id (which is a UUID) to a string
        # ---
        special_data["menu_item_id"] = str(special_data["menu_item_id"])

        # Step 3a: Insert the data
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
            .select("*, menu_items(*)")
            .eq("menu_items.vendor_id", str(vendor_id))
            .gte("available_date", today)
            .execute()
        )

        return [
            schemas.DateSpecialDetailResponse.model_validate(item)
            for item in response.data
        ]
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
            .select("*, menu_items(*)")
            .eq("available_date", query_date.isoformat())
            .execute()
        )

        return [
            schemas.DateSpecialDetailResponse.model_validate(item)
            for item in response.data
        ]
    except Exception as e:
        logger.error(f"Error getting specials for date {query_date}: {e}")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(e))


# --- UPDATE (Fixed) ---


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

        # ---
        # ADDED FIX 1: Check if date is being updated and convert it
        # ---
        if "available_date" in update_data and isinstance(
            update_data["available_date"], date
        ):
            update_data["available_date"] = update_data["available_date"].isoformat()

        # ---
        # ADDED FIX 2: Check if menu_item_id is being updated and convert it
        # ---
        if "menu_item_id" in update_data and isinstance(
            update_data["menu_item_id"], uuid.UUID
        ):
            update_data["menu_item_id"] = str(update_data["menu_item_id"])

        # Step 1: Update the item
        # .eq("vendor_id", ...) ensures a vendor can only update THEIR special
        update_response = (
            await client.table("date_specials")
            .update(update_data)
            .eq("id", str(special_id))
            .eq("vendor_id", str(vendor_id))
            .execute()
        )

        if not update_response.data or not update_response.data[0]:
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, "Special not found or no permission."
            )

        # Step 2: Fetch the updated item with its join
        response = (
            await client.table("date_specials")
            .select("*, menu_items(*)")
            .eq("id", str(special_id))
            .single()
            .execute()
        )

        if response.data:
            return schemas.DateSpecialDetailResponse.model_validate(response.data)
        else:
            # This should not happen if update succeeded, but good to check
            raise HTTPException(
                status.HTTP_404_NOT_FOUND, "Special not found after update."
            )

    except Exception as e:
        logger.error(f"Error updating special {special_id}: {e}")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(e))


# --- DELETE ---


async def delete_special(
    special_id: uuid.UUID, vendor_id: uuid.UUID, client: AsyncClient
) -> Dict[str, str]:
    try:
        # .eq("vendor_id", ...) ensures a vendor can only delete THEIR special
        response = (
            await client.table("date_specials")
            .delete()
            .eq("id", str(special_id))
            .eq("vendor_id", str(vendor_id))
            .execute()
        )

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Special not found or no permission.",
            )

        return {"message": "Special deleted successfully"}

    except Exception as e:
        logger.error(f"Error deleting special {special_id}: {e}")
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, str(e))
