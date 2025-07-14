from typing import List

from fastapi import HTTPException, status
from supabase import AsyncClient

from app import schemas
from utils.logger import logger


async def get_all_menus(client: AsyncClient) -> List[schemas.MenuResponse]:
    try:
        response = (
            await client.table("menus")
            .select(
                "id, vendors(id, name), name, date, img_path, img_bucket, description"
            )
            .execute()
        )
    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}",
        )

    _menus = response.data
    menus = []

    for menu in _menus:
        _bucket = menu.get("img_bucket")
        _path = menu.get("img_path")

        if not _bucket or not _path:
            logger.error(f"Path or bucket does not exist")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Path or bucket does not exist",
            )

        try:
            url = await client.storage.from_(_bucket).create_signed_url(
                path=_path,
                expires_in=60,
                options={"transform": {"width": 300, "height": 200}},
            )
        except Exception as e:
            logger.info(f"bucket: {_bucket}")
            logger.info(f"path: {_path}")
            logger.info(f"URL: {url}")
            logger.error(f"Path or bucket does not exist")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Path or bucket does not exist",
            )

        _menu = schemas.MenuResponse(
            id=menu.get("id"),
            name=menu.get("name"),
            vendor_name=menu.get("vendors").get("name"),
            date=menu.get("date"),
            img_url=url.get("signedURL"),
            description=menu.get("description"),
        )

        menus.append(_menu)

    return menus
