import enum


class Role(enum.Enum):
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
