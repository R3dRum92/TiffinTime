import re
from datetime import date, datetime, timedelta
from typing import List, Optional
from uuid import UUID

from pydantic import (
    UUID4,
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    field_validator,
    model_validator,
)

from app import enums

BD_PHONE_REGEX = re.compile(r"^(?:\+8801|01)[0-9]{9}$")


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
    img_bucket: Optional[str] = None
    img_path: Optional[str] = None


class MenuItemUpdateRequest(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = None
    category: Optional[enums.MenuCategory] = None
    description: Optional[str] = None
    preparation_time: Optional[int] = None
    img_bucket: Optional[str] = None
    img_path: Optional[str] = None


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

    special_id: UUID = Field(alias="id")  # Renamed to avoid clash with menu_item.id
    available_date: date
    special_price: Optional[float] = None
    available_stock: Optional[int] = None

    # This field is required by your repository functions
    vendor_id: UUID

    # Nested menu item data
    menu_items: MenuItemBase

    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)


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
    menu_items: MenuItemResponse

    model_config = ConfigDict(from_attributes=True, arbitrary_types_allowed=True)


class SubscriptionRequest(BaseModel):
    type: enums.SubscriptionType

    @property
    def type_timedelta(self) -> timedelta:
        if self.type == enums.SubscriptionType.WEEKLY:
            return timedelta(weeks=1)
        elif self.type == enums.SubscriptionType.MONTHLY:
            return timedelta(days=30)


class SubscriptionCreateResponse(BaseResponse):
    id: UUID


class RegistrationRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    phone_number: str
    confirm_password: str
    role: enums.UserRole

    @field_validator("phone_number")
    def validate_phone_number(cls, v):
        if not BD_PHONE_REGEX.match(v):
            raise ValueError("Invalid phone number format")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str
    role: enums.UserRole


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
    is_open: Optional[bool] = True
    img_url: Optional[str] = None
    delivery_time: Optional[VendorDeliveryTime] = None


class MenuResponse(BaseModel):
    id: UUID
    vendor_id: UUID  # Add this
    vendor_name: str
    name: str
    date: date | None  # Changed from 'date' to 'date | None'
    description: str | None
    img_url: str | None
    price: float
    category: enums.MenuCategory | None
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


class OrderRequest(BaseModel):
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


class PaymentInitiationRequest(BaseModel):
    order_ids: Optional[List[UUID]] = None
    subscription_id: Optional[UUID] = None
    total_amount: float
    tran_id: str
    cus_add1: str
    cus_city: str
    num_of_item: int
    product_name: str
    product_category: str

    @model_validator(mode="after")
    def check_payload_contains_items(self) -> "PaymentInitiationRequest":
        order_ids = self.order_ids
        subscription_id = self.subscription_id

        if not order_ids and not subscription_id:
            raise ValueError(
                "Payment request must contain either order_ids or a subscription_id"
            )

        return self


class PaymentBase(BaseModel):
    user_id: UUID
    amount: float
    status: enums.PaymentStatus = enums.PaymentStatus.PENDING


class PaymentCreate(PaymentBase):
    transaction_id: str


class Payment(PaymentBase):
    id: UUID
    transaction_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RatingCreate(BaseModel):
    vendor_id: UUID4
    # Changed to float to match float8, allowing half-stars if you want (e.g. 4.5)
    rating_val: float = Field(
        ..., ge=1, le=5, description="Rating must be between 1 and 5"
    )


class RatingResponse(BaseModel):
    vendor_id: UUID4
    average_rating: float
    total_ratings: int


class UserRatingResponse(BaseModel):
    vendor_id: UUID4
    rating_val: float

class ReviewCreate(BaseModel):
    vendor_id: UUID
    food_quality: str = Field(..., description="e.g. Good, Bad")
    delivery_experience: str = Field(..., description="e.g. Fast, Slow")
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    review_id: int   # changed from UUID to int based on your screenshot
    user_id: UUID
    vendor_id: UUID
    food_quality: str
    delivery_experience: str
    comment: Optional[str]
    username: str  # Flattened field for the frontend

    is_replied: bool
    reply: Optional[str] = None
    
    class Config:
        from_attributes = True

class ReviewReply(BaseModel):
    reply_text: str