import re
from datetime import date, datetime, timedelta
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from app import enums


class BaseResponse(BaseModel):
    message: str


class UserID(BaseModel):
    id: UUID


class VendorID(BaseModel):
    id: UUID


class UserBase(BaseModel):
    id: UUID
    role: enums.Role


class MenuItemBase(BaseModel):
    name: str
    price: float
    category: enums.MenuCategory
    description: Optional[str] = None
    preparation_time: int  # In minutes


class MenuItemAddRequest(MenuItemBase):
    pass


class MenuItemUpdateRequest(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    category: Optional[enums.MenuCategory] = None
    description: Optional[str] = None
    preparation_time: Optional[int] = None


class MenuItemResponse(MenuItemBase):
    id: UUID
    vendor_id: UUID

    model_config = ConfigDict(from_attributes=True)


class DateSpecialBase(BaseModel):
    available_date: date
    available_stock: Optional[int] = Field(None, gt=0, description="Available quantity")
    special_price: Optional[float] = Field(
        None, gt=0, description="Optional special price"
    )


class DateSpecialAddRequest(DateSpecialBase):
    menu_item_id: UUID


class DateSpecialUpdateRequest(BaseModel):
    # Only these fields are updatable
    available_stock: Optional[int] = Field(None, gt=0)
    special_price: Optional[float] = Field(None, gt=0)


class DateSpecialResponse(DateSpecialBase):
    id: UUID
    vendor_id: UUID
    menu_item_id: UUID

    model_config = ConfigDict(from_attributes=True)


class DateSpecialDetailResponse(BaseModel):
    """
    Response for a special, nesting the menu item details.
    'id' here is the id from the 'date_specials' table.
    """

    special_id: UUID  # Renamed to avoid clash with menu_item.id
    available_date: date
    special_price: Optional[float] = None
    available_stock: Optional[int] = None

    # This field is required by your repository functions
    vendor_id: UUID

    # Nested menu item data
    menu_items: MenuItemBase

    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    # Custom validator to flatten the Supabase join response
    @classmethod
    def model_validate(cls, data: dict, **kwargs):
        if "menu_items" in data:
            menu_item_data = data.pop("menu_items")
            data["menu_items"] = MenuItemBase.model_validate(menu_item_data)

        # Rename 'id' from date_specials to 'special_id'
        if "id" in data:
            data["special_id"] = data.pop("id")

        return super().model_validate(data, **kwargs)


class WeeklyAvailabilityBase(BaseModel):
    menu_item_id: UUID
    day_of_week: enums.DayOfWeek = Field(
        ..., description="Day of week (0=Sun, 1=Mon, ...)"
    )
    is_available: bool = Field(
        ..., description="Set to true for available, false for not"
    )


class WeeklyAvailabilitySetRequest(WeeklyAvailabilityBase):
    pass


class WeeklyAvailabilityResponse(WeeklyAvailabilityBase):
    id: UUID
    vendor_id: UUID  # This will be populated by the repo

    model_config = ConfigDict(from_attributes=True)


class WeeklyAvailabilityDetailResponse(BaseModel):
    """
    Response for a weekly rule, nesting item details.
    'id' here is the id from the 'weekly_availability' table.
    """

    id: UUID
    day_of_week: enums.DayOfWeek
    is_available: bool

    # This field is required by your repository functions
    vendor_id: UUID

    # Nested menu item data
    menu_items: MenuItemBase

    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)

    # Custom validator to flatten the Supabase join response
    @classmethod
    def model_validate(cls, data: dict, **kwargs):
        if "menu_items" in data:
            menu_item_data = data.pop("menu_items")
            data["menu_items"] = MenuItemBase.model_validate(menu_item_data)

        return super().model_validate(data, **kwargs)  # Forward reference


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


class VendorDetailsResponse(BaseModel):
    id: UUID
    name: str
    email: EmailStr
    phone_number: str
    description: str | None
    is_open: bool
