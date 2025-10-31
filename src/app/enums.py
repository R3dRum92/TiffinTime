import enum


class Role(enum.Enum):
    STUDENT = "student"
    VENDOR = "vendor"


class MenuCategory(str, enum.Enum):
    RICE = "rice"
    CURRY = "curry"
    SNACKS = "snacks"
    DRINKS = "drinks"
    DESSERTS = "desserts"
