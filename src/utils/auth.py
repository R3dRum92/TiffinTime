import uuid
from typing import Any, Dict, Optional, Union

from fastapi import Depends, HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import AsyncClient

from app import enums, schemas
from db.supabase import get_db
from utils.logger import logger
from utils.token import API_KEY, verify_access_token

security = HTTPBearer()


# --- Token Payload Verification ---


async def get_payload_from_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> Dict[str, Any]:
    """
    Primary dependency to get and verify a token payload.
    Most other auth dependencies can depend on this.
    """
    if credentials.scheme.lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication scheme",
        )

    token = credentials.credentials
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )
    return payload


# --- Helper Functions (Not Dependencies) ---
# These functions do the actual database query. They are called by
# the dependencies and are passed the 'db' client.


async def get_student_by_id(id: uuid.UUID, db: AsyncClient) -> schemas.UserBase:
    """
    Helper function to fetch a student from the 'users' table.
    """
    try:
        # 1. Use the passed-in 'db' client
        # 2. Filter by ID using .eq()
        response = await db.table("users").select("id").eq("id", str(id)).execute()
        result_data = response.data

        # 3. Check if list is empty
        if not result_data:
            # 4. Use 404 NOT_FOUND
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student (user) not found",
            )

        # 5. Get the first item from the list
        user = result_data[0]
        return schemas.UserBase(id=user.get("id"), role=enums.Role.STUDENT)

    except Exception as e:
        logger.error(f"Error fetching student by ID {id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while fetching the user.",
        )


async def get_vendor_by_id(id: uuid.UUID, db: AsyncClient) -> schemas.UserBase:
    """
    Helper function to fetch a vendor from the 'vendors' table.
    """
    try:
        # 1. Use the passed-in 'db' client
        # 2. Filter by ID using .eq()
        response = await db.table("vendors").select("id").eq("id", str(id)).execute()
        result_data = response.data

        # 3. Check if list is empty
        if not result_data:
            # 4. Use 404 NOT_FOUND
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Vendor not found",
            )

        # 5. Get the first item from the list
        vendor = result_data[0]
        return schemas.UserBase(id=vendor.get("id"), role=enums.Role.VENDOR)

    except Exception as e:
        logger.error(f"Error fetching vendor by ID {id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="A database error occurred while fetching the vendor.",
        )


# --- Actual FastAPI Dependencies ---


async def get_current_user(
    payload: Dict[str, Any] = Depends(get_payload_from_token),
) -> Union[schemas.UserID, schemas.VendorID]:
    """
    Gets the basic ID of the current user (student or vendor)
    from the token payload without a database lookup.
    """
    user_id = payload.get("user_id")
    vendor_id = payload.get("vendor_id")

    if user_id is None and vendor_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: missing user_id or vendor_id",
        )
    if user_id:
        return schemas.UserID(id=user_id)
    else:
        return schemas.VendorID(id=vendor_id)


async def get_student(
    payload: Dict[str, Any] = Depends(get_payload_from_token),
    db: AsyncClient = Depends(get_db),
) -> schemas.UserBase:
    """
    Dependency to get the full student object.
    Ensures the token is for a student and the student exists in the DB.
    """
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Token does not belong to a student.",
        )

    # Call the helper function and pass the db client
    student = await get_student_by_id(user_id, db)
    return student


async def get_vendor(
    payload: Dict[str, Any] = Depends(get_payload_from_token),
    db: AsyncClient = Depends(get_db),
) -> schemas.UserBase:
    """
    Dependency to get the full vendor object.
    Ensures the token is for a vendor and the vendor exists in the DB.
    """
    vendor_id = payload.get("vendor_id")
    if vendor_id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Token does not belong to a vendor.",
        )

    # Call the helper function and pass the db client
    vendor = await get_vendor_by_id(vendor_id, db)
    return vendor


async def admin_auth(credentials: HTTPAuthorizationCredentials = Security(security)):
    """
    Dependency to check for the static admin API key.
    """
    api_key = credentials.credentials
    if api_key == API_KEY:
        return {"role": "admin"}
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid Admin API Key"
        )


async def user_or_admin_auth(
    credentials: HTTPAuthorizationCredentials = Security(security),
    db: AsyncClient = Depends(get_db),
):
    """
    Dependency that allows access for EITHER a valid user/vendor
    OR a valid admin.
    """
    errors = []

    try:
        # Manually create dependencies for this special case
        payload = await get_payload_from_token(credentials)

        # Check if user or vendor and return their DB object
        if payload.get("user_id"):
            return await get_student_by_id(payload.get("user_id"), db)
        elif payload.get("vendor_id"):
            return await get_vendor_by_id(payload.get("vendor_id"), db)

    except HTTPException as e:
        errors.append(f"User auth failed: {e.detail}")

    try:
        return await admin_auth(credentials)
    except HTTPException as e:
        errors.append(f"Admin auth failed: {e.detail}")

    # If both failed
    raise HTTPException(status_code=401, detail=f"Unauthorized: {errors}")


async def get_user_from_token(
    payload: Dict[str, Any] = Depends(get_payload_from_token),
) -> schemas.UserID:
    user_id = payload.get("user_id")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not a user token"
        )
    return schemas.UserID(id=user_id)
