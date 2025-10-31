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
