from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from supabase import AsyncClient

from db.supabase import get_db
from utils.auth import user_or_admin_auth
from utils.logger import logger

router = APIRouter(prefix="/test", tags=["test"])


@router.get("/test_db")
async def test_db(client: AsyncClient = Depends(get_db)):
    try:
        # response = await client.rpc("get_server_time").execute()

        response = (
            await client.table("users")
            .select("id, name, phone_number, email")
            .eq("id", "2f39e84c-3b6b-4c74-83f4-79aa6ad651c5")
            .execute()
        )

        return JSONResponse(
            content={"data": response.data},
            status_code=status.HTTP_200_OK,
        )
    except Exception as e:
        logger.error(f"Database query failed: {e}")
        return JSONResponse(
            content={"error": str(e)}, status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
