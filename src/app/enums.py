import enum


class Role(str, enum.Enum):
    STUDENT = "student"
    VENDOR = "vendor"


class MenuCategory(str, enum.Enum):
    RICE = "Rice"
    CURRY = "Curry"
    SNACKS = "Snacks"
    DRINKS = "Drinks"
    DESSERTS = "Desserts"


class DayOfWeek(int, enum.Enum):
    SUNDAY = 0
    MONDAY = 1
    TUESDAY = 2
    WEDNESDAY = 3
    THURSDAY = 4
    FRIDAY = 5
    SATURDAY = 6


class SubscriptionType(str, enum.Enum):
    WEEKLY = "weekly"
    MONTHLY = "monthly"


class UserRole(str, enum.Enum):
    STUDENT = "student"
    VENDOR = "vendor"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"
