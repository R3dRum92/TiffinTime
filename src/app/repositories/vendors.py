from typing import List
from uuid import UUID

from fastapi import HTTPException, status
from supabase import AsyncClient

from app import schemas
from utils.logger import logger

IMG_WIDTH: int = 300
IMG_HEIGHT: int = 200


async def get_all_vendors(client: AsyncClient) -> List[schemas.VendorsResponse]:
    try:
        response = await client.table("vendors").select("*").execute()
    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}",
        )

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
                path=_path,
                expires_in=60,
                options={"transform": {"width": IMG_WIDTH, "height": IMG_HEIGHT}},
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


async def get_vendor_by_id(
    vendor_id: UUID, client: AsyncClient
) -> schemas.VendorsResponse:
    try:
        response = (
            await client.table("vendors").select("*").eq("id", vendor_id).execute()
        )
    except Exception as e:
        logger.error(f"Database query failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}",
        )

    _vendor = response.data[0]
    _bucket = _vendor.get("img_bucket")
    _path = _vendor.get("img_path")

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
            options={"transform": {"width": IMG_WIDTH, "height": IMG_HEIGHT}},
        )
        _vendor = schemas.VendorsResponse(
            id=_vendor.get("id"),
            name=_vendor.get("name"),
            description=_vendor.get("description"),
            is_open=_vendor.get("isOpen"),
            img_url=url.get("signedURL"),
            delivery_time=_vendor.get("deliveryTime"),
        )
    except Exception as e:
        logger.error(f"Path or bucket does not exist")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Path or bucket does not exist",
        )

    return _vendor
