from uuid import UUID

from pydantic import BaseModel, EmailStr


class BaseResponse(BaseModel):
    message: str


class RegistrationRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    token: str


class VendorDeliveryTime(BaseModel):
    min: int
    max: int


class VendorsResponse(BaseModel):
    id: UUID
    name: str
    description: str | None
    is_open: bool
    img_url: str
    delivery_time: VendorDeliveryTime
