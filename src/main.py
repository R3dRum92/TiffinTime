import os
from contextlib import asynccontextmanager
from typing import Optional

from dotenv import load_dotenv
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.responses import JSONResponse
from supabase import AsyncClient

from db.supabase import create_supabase
from utils.auth import user_or_admin_auth
from utils.logger import logger
from utils.token import create_access_token

client: Optional[AsyncClient] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global client
    client = await create_supabase()
    yield


APP_MODE: Optional[str] = os.environ.get("APP_MODE")
docs_url = None if APP_MODE == "production" else "/docs"  # disables docs
redoc_url = None if APP_MODE == "production" else "/redoc"  # disables redoc
openapi_url = (
    None if APP_MODE == "production" else "/openapi.json"
)  # disables openapi.json suggested by tobias comment.
app = FastAPI(
    lifespan=lifespan, docs_url=docs_url, redoc_url=redoc_url, openapi_url=openapi_url
)


@app.get("/")
async def root():
    return JSONResponse(
        content={"message": "TiffinTime API is up and running"},
        status_code=status.HTTP_200_OK,
    )


@app.get("/test_db", dependencies=[Depends(user_or_admin_auth)])
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


@app.post("/login")
def login(username: str, password: str):
    if username == "papry" and password == "cpsid":
        access_token = create_access_token(data={"sub": username})
        return {"access_token": access_token, "token_type": "bearer"}
    raise HTTPException(status_code=400, detail="Invalid credentials")
