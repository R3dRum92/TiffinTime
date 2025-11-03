from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app import test
from app.routers import (
    auth,
    date_specials,
    menu,
    subscription,
    user_details,
    vendors,
    orders,
    weekly_menu,
)
from app.settings import settings

app = FastAPI(
    docs_url=settings.docs_url,
    redoc_url=settings.redoc_url,
    openapi_url=settings.openapi_url,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vendors.router)
app.include_router(auth.router)
app.include_router(test.router)
app.include_router(subscription.router)
app.include_router(menu.router)
app.include_router(user_details.router)
app.include_router(date_specials.router)
app.include_router(weekly_menu.router)


@app.get("/")
async def root():
    return JSONResponse(
        content={"message": "TiffinTime API is up and running"},
        status_code=status.HTTP_200_OK,
    )
app.include_router(order.router)



@app.get("/")
async def root():
    return JSONResponse(
        content={"message": "TiffinTime API is up and running"},
        status_code=status.HTTP_200_OK,
    )
