from supabase import AsyncClient, acreate_client

from app.settings import settings
from utils.logger import logger


async def create_supabase() -> AsyncClient:
    if settings.SUPABASE_URL is None or settings.SUPABASE_SERVICE_ROLE is None:
        logger.error("SUPABASE_URL or SUPABASE_SERVICE_ROLE is not set")
        raise ValueError("SUPABASE_URL or SUPABASE_SERVICE_ROLE is not set")

    logger.info("Successfully created connection to Supabase")
    return await acreate_client(
        supabase_url=settings.SUPABASE_URL, supabase_key=settings.SUPABASE_SERVICE_ROLE
    )


async def get_db():
    client = await create_supabase()
    try:
        yield client
    finally:
        pass
