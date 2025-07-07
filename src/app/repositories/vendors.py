from typing import List

from fastapi import HTTPException, status
from supabase import AsyncClient

from app import schemas
from utils.logger import logger


async def get_all_vendors(client: AsyncClient) -> List[schemas.VendorsResponse]:
    try:
        response = await client.table("vendors").select("*").execute()

    except Exception as e:
        pass

    _vendors = response.data
    vendors = []

    for vendor in _vendors:
        _bucket = vendor.get("img_bucket")
        _path = vendor.get("img_path")

        if not _bucket or not _path:
            logger.error(f"Path or bucket does not exist")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Path or bucket does not exist",
            )

        try:
            url = await client.storage.from_(_bucket).create_signed_url(
                path=_path, expires_in=60
            )
            _vendor = schemas.VendorsResponse(
                id=vendor.get("id"),
                name=vendor.get("name"),
                description=vendor.get("description"),
                is_open=vendor.get("isOpen"),
                img_url=url.get("signedURL"),
                delivery_time=vendor.get("deliveryTime"),
            )

            vendors.append(_vendor)

        except Exception as e:
            logger.error(f"Path or bucket does not exist")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Path or bucket does not exist",
            )

    return vendors
