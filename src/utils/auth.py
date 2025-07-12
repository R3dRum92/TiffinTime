from fastapi import HTTPException, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from supabase import AsyncClient

from app import schemas
from utils.token import API_KEY, verify_access_token

security = HTTPBearer()


async def get_user_from_token(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> schemas.UserID:
    token = credentials.credentials
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token"
        )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Security(security),
) -> schemas.UserID:
    token = credentials.credentials
    payload = verify_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("user_id")

    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
        )

    return schemas.UserID(id=user_id)


async def admin_auth(credentials: HTTPAuthorizationCredentials = Security(security)):
    api_key = credentials.credentials
    if api_key == API_KEY:
        return {"role": "admin"}
    else:
        raise HTTPException(status_code=401, detail="Unauthorized")


async def user_or_admin_auth(
    credentials: HTTPAuthorizationCredentials = Security(security),
):
    errors = []

    try:
        return await get_current_user(credentials)
    except HTTPException as e:
        errors.append(str(e.detail))

    try:
        return await admin_auth(credentials)
    except HTTPException as e:
        errors.append(str(e.detail))

    raise HTTPException(status_code=401, detail=f"Unauthorized: {errors}")
