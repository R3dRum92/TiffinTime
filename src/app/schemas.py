from datetime import date, timedelta
from uuid import UUID

from pydantic import BaseModel, EmailStr, field_validator


class BaseResponse(BaseModel):
    message: str


class UserID(BaseModel):
    id: UUID


class VendorID(BaseModel):
    id: UUID


class SubscriptionRequest(BaseModel):
    vendor_id: UUID
    type: str

    @field_validator("type")
    @classmethod
    def validate_type(cls, v):
        allowed = {"weekly", "monthly"}
        if v not in allowed:
            raise ValueError(f"type must be one of {allowed}")
        return v

    @property
    def type_timedelta(self) -> timedelta:
        if self.type == "weekly":
            return timedelta(weeks=1)
        elif self.type == "monthly":
            return timedelta(days=30)
        else:
            raise ValueError(f"Unsupported subscription type: {self.type}")


class RegistrationRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    confirm_password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: str


class LoginResponse(BaseModel):
    success: bool
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


class MenuResponse(BaseModel):
    id: UUID
    vendor_name: str
    name: str
    date: date
    description: str | None
    img_url: str
    price: float

class UserSubscriptionResponse(BaseModel):
    id: UUID
    name: str
    duration: int
    start_date: date
    
