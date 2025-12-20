from contextlib import asynccontextmanager

from fastapi import FastAPI, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from supabase import AsyncClient, create_client

from app import test
from app.routers import (
    auth,
    date_specials,
    menu,
    order,
    payment,
    ratings,
    reviews,
    subscription,
    upload,
    user_details,
    vendors,
    weekly_menu,
)
from app.settings import settings
from db.supabase import create_supabase


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.supabase_client = await create_supabase()
    yield


app = FastAPI(
    docs_url=settings.docs_url,
    redoc_url=settings.redoc_url,
    openapi_url=settings.openapi_url,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.CLIENT_ORIGIN_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(vendors.router)
app.include_router(auth.router)
# app.include_router(test.router)
app.include_router(subscription.router)
app.include_router(menu.router)
app.include_router(user_details.router)
app.include_router(date_specials.router)
app.include_router(weekly_menu.router)
app.include_router(order.router)
app.include_router(payment.router)
app.include_router(reviews.router)
app.include_router(ratings.router)
app.include_router(upload.router)


@app.get("/")
async def root():
    return JSONResponse(
        content={"message": "TiffinTime API is up and running"},
        status_code=status.HTTP_200_OK,
    )


@app.get("/")
async def root():
    return JSONResponse(
        content={"message": "TiffinTime API is up and running"},
        status_code=status.HTTP_200_OK,
    )
