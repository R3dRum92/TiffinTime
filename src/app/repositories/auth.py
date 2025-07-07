from fastapi import HTTPException, status
from supabase import AsyncClient

from app import schemas
from app.security import create_access_token, get_password_hash, verify_password


async def register(
    request: schemas.RegistrationRequest, client: AsyncClient
) -> schemas.BaseResponse:
    response = await (
        client.table("users")
        .select("email", "name")
        .eq("email", request.email)
        .execute()
    )

    if response.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    if request.password != request.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match"
        )

    hashed_password = get_password_hash(request.password)

    await client.table("users").insert(
        {"name": request.name, "email": request.email, "password_hash": hashed_password}
    ).execute()

    return schemas.BaseResponse(message="Registration successful")


async def login(request: schemas.LoginRequest, client: AsyncClient):
    response = (
        await client.table("users")
        .select("id", "email", "password_hash")
        .eq("email", request.email)
        .execute()
    )

    user = response.data[0]

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if not verify_password(request.password, user.get("password_hash")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect password"
        )

    token = create_access_token(data={"user_id": str(user.get("id"))})

    return schemas.LoginResponse(token=token)
