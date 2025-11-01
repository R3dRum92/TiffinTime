import re
from datetime import date, timedelta
from typing import List, Optional
from uuid import UUID
from datetime import datetime 


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
    phone_number: str
    confirm_password: str
    role: str

    @field_validator("phone_number")
    def validate_phone_number(cls, v):
        if not BD_PHONE_REGEX.match(v):
            raise ValueError("Invalid phone number format")
        return v

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        allowed = {"student", "vendor"}
        if v not in allowed:
            raise ValueError(f"type must be one of {allowed}")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: str

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        allowed = {"student", "vendor"}
        if v not in allowed:
            raise ValueError(f"type must be one of {allowed}")
        return v


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
    img_url: Optional[str]
    delivery_time: VendorDeliveryTime


class MenuResponse(BaseModel):
    id: UUID
    vendor_id: UUID  # Add this
    vendor_name: str
    name: str
    date: date | None  # Changed from 'date' to 'date | None'
    description: str | None
    img_url: str | None
    price: float
    category: str | None
    preparation_time: int | None


class UserSubscriptionResponse(BaseModel):
    id: UUID
    name: str
    duration: int
    start_date: date


class VendorSubscriptionResponse(BaseModel):
    id: UUID
    name: str
    end_date: date
    start_date: date


BD_PHONE_REGEX = re.compile(r"^(?:\+8801|01)[0-9]{9}$")


class UserDetails(BaseModel):
    id: UUID
    name: str
    phone_number: str
    email: EmailStr
    subscriptions: List[UserSubscriptionResponse]

    @field_validator("phone_number")
    def validate_phone_number(cls, v):
        if not BD_PHONE_REGEX.match(v):
            raise ValueError("Invalid phone number format")
        return v
    

# Add these to your schemas.py file

# class OrderRequest(BaseModel):
#     user_id: UUID
#     vendor_id: UUID
#     menu_id: UUID  # Changed from 'menu' to 'menu_id' for clarity
#     quantity: int
#     unit_price: float
#     pickup: str

#     @field_validator("quantity")
#     @classmethod
#     def validate_quantity(cls, v):
#         if v <= 0:
#             raise ValueError("Quantity must be greater than 0")
#         return v

#     @field_validator("unit_price")
#     @classmethod
#     def validate_unit_price(cls, v):
#         if v <= 0:
#             raise ValueError("Unit price must be greater than 0")
#         return v


# class OrderResponse(BaseModel):
#     id: UUID
#     user_id: UUID
#     vendor_id: UUID
#     menu_id: UUID
#     order_date: datetime
#     quantity: int
#     unit_price: float
#     total_price: float
#     pickup: str


# class OrderCreateResponse(BaseModel):
#     success: bool
#     message: str
#     order_id: UUID

class OrderRequest(BaseModel):
    user_id: UUID
    vendor_id: UUID
    menu_id: UUID
    quantity: int
    unit_price: float
    pickup: str

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v):
        if v <= 0:
            raise ValueError("Quantity must be greater than 0")
        return v

    @field_validator("unit_price")
    @classmethod
    def validate_unit_price(cls, v):
        if v <= 0:
            raise ValueError("Unit price must be greater than 0")
        return v


# Update OrderResponse - add is_delivered field
class OrderResponse(BaseModel):
    id: UUID
    user_id: UUID
    vendor_id: UUID
    menu_id: UUID
    order_date: datetime
    quantity: int
    unit_price: float
    total_price: float
    pickup: str
    is_delivered: bool  # Add this


class OrderCreateResponse(BaseModel):
    success: bool
    message: str
    order_id: UUID


# Add new schema for updating order status
class OrderStatusUpdate(BaseModel):
    is_delivered: bool