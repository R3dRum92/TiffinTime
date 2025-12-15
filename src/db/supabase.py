from fastapi import Request
from supabase import AsyncClient, acreate_client

from app.settings import settings
from utils.logger import logger


async def create_supabase() -> AsyncClient:
    logger.info("Successfully created connection to Supabase")
    return await acreate_client(
        supabase_url=settings.SUPABASE_URL,
        supabase_key=settings.SUPABASE_SERVICE_ROLE,
    )


def get_db(request: Request) -> AsyncClient:
    return request.app.state.supabase_client
