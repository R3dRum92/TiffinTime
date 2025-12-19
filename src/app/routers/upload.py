from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from supabase import AsyncClient
from uuid import uuid4
import os
from utils.logger import logger

from app import schemas
from db.supabase import get_db
from utils.auth import get_vendor

router = APIRouter(prefix="/upload", tags=["upload"])

# Default bucket names
VENDOR_IMAGE_BUCKET = "vendor-images"
MENU_IMAGE_BUCKET = "menu-images"

# Default image paths (these should exist in your Supabase storage)
DEFAULT_VENDOR_IMAGE_PATH = "default/default-vendor.jpg"
DEFAULT_MENU_IMAGE_PATH = "default/default-menu.jpg"


@router.post("/menu-image", status_code=status.HTTP_200_OK)
async def upload_menu_image(
    file: UploadFile = File(...),
    vendor: schemas.UserBase = Depends(get_vendor),
    client: AsyncClient = Depends(get_db),
):
    """
    Upload a menu item image to Supabase storage.
    Returns the bucket name and path for storing in database.
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )

        # Generate unique filename
        file_extension = os.path.splitext(file.filename or 'image.jpg')[1]
        unique_filename = f"{uuid4()}{file_extension}"
        file_path = f"{vendor.id}/{unique_filename}"

        # Read file content
        file_content = await file.read()

        # Upload to Supabase storage
        response = await client.storage.from_(MENU_IMAGE_BUCKET).upload(
            path=file_path,
            file=file_content,
            file_options={"content-type": file.content_type}
        )

        if response:
            logger.info(f"Successfully uploaded menu image: {file_path}")
            return {
                "bucket": MENU_IMAGE_BUCKET,
                "path": file_path,
                "message": "Image uploaded successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload image"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading menu image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )


@router.post("/vendor-image", status_code=status.HTTP_200_OK)
async def upload_vendor_image(
    file: UploadFile = File(...),
    vendor: schemas.UserBase = Depends(get_vendor),
    client: AsyncClient = Depends(get_db),
):
    """
    Upload a vendor profile image to Supabase storage.
    Returns the bucket name and path for storing in database.
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File must be an image"
            )

        # Generate unique filename
        file_extension = os.path.splitext(file.filename or 'image.jpg')[1]
        unique_filename = f"{uuid4()}{file_extension}"
        file_path = f"{vendor.id}/{unique_filename}"

        # Read file content
        file_content = await file.read()

        # Upload to Supabase storage
        response = await client.storage.from_(VENDOR_IMAGE_BUCKET).upload(
            path=file_path,
            file=file_content,
            file_options={"content-type": file.content_type}
        )

        if response:
            logger.info(f"Successfully uploaded vendor image: {file_path}")
            return {
                "bucket": VENDOR_IMAGE_BUCKET,
                "path": file_path,
                "message": "Image uploaded successfully"
            }
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to upload image"
            )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error uploading vendor image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload image: {str(e)}"
        )

