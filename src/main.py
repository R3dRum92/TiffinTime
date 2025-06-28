from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, status
from fastapi.responses import JSONResponse
from supabase import AsyncClient
from typing import Optional
from contextlib import asynccontextmanager
from db.supabase import create_supabase
from utils.logger import logger

client: Optional[AsyncClient] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    client = await create_supabase()
    yield


app = FastAPI(lifespan=lifespan)


@app.get("/")
async def root():
    return JSONResponse(
        content={"message": "TiffinTime API is up and running"},
        status_code=status.HTTP_200_OK,
    )


@app.get("/test_db")
async def test_db():
    try:
        response = await client.rpc("get_server_time").execute()

        return JSONResponse(
            content={"data": response.data},
            status_code=status.HTTP_200_OK,
        )
    except Exception as e:
        logger.error(f"Database query failed: {e}")
        return JSONResponse(
            content={"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
