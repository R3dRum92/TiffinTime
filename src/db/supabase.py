import os
from typing import Optional

from dotenv import load_dotenv
from supabase import AsyncClient, acreate_client

from utils.logger import logger

load_dotenv()

url: Optional[str] = os.environ.get("SUPABASE_URL")
key: Optional[str] = os.environ.get("SUPABASE_KEY")
service_role: Optional[str] = os.environ.get("SUPABASE_SERVICE_ROLE")


async def create_supabase() -> AsyncClient:
    if url is None or key is None:
        logger.error("SUPABASE_URL or SUPABASE_KEY is not set")
        raise ValueError("SUPABASE_URL or SUPABASE_KEY is not set")

    logger.info("Successfully created connection to Supabase")
    return await acreate_client(supabase_url=url, supabase_key=service_role)
