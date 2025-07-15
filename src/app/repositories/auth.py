from fastapi import HTTPException, status
from supabase import AsyncClient

from app import schemas
from app.security import create_access_token, get_password_hash, verify_password


async def register(
    request: schemas.RegistrationRequest, client: AsyncClient
) -> schemas.BaseResponse:
    if request.role == "student":
        response = await (
            client.table("users")
            .select("email", "name")
            .eq("email", request.email)
            .execute()
        )

        if response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered",
            )

        if request.password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match"
            )

        hashed_password = get_password_hash(request.password)

        await client.table("users").insert(
            {
                "name": request.name,
                "email": request.email,
                "phone_number": request.phone_number,
                "password_hash": hashed_password,
            }
        ).execute()

    elif request.role == "vendor":
        response = await (
            client.table("vendors")
            .select("*")
            .or_(f"email.eq.{request.email},name.eq.{request.name}")
            .execute()
        )

        if response.data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Vendor already registered",
            )

        if request.password != request.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match"
            )

        hashed_password = get_password_hash(request.password)

        await client.table("vendors").insert(
            {
                "name": request.name,
                "email": request.email,
                "phone_number": request.phone_number,
                "password_hash": hashed_password,
            }
        ).execute()

    return schemas.BaseResponse(message="Registration successful")


async def login(
    request: schemas.LoginRequest, client: AsyncClient
) -> schemas.LoginResponse:
    if request.role == "student":
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

        token = create_access_token(
            data={"user_id": str(user.get("id")), "role": "student"}
        )

        return schemas.LoginResponse(success=True, token=token)
    else:
        response = (
            await client.table("vendors")
            .select("id", "email", "password_hash")
            .eq("email", request.email)
            .execute()
        )

        vendor = response.data[0]
        if not vendor:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Vendor not found"
            )

        token = create_access_token(
            data={"vendor_id": str(vendor.get("id")), "role": "vendor"}
        )

        return schemas.LoginResponse(success=True, token=token)
