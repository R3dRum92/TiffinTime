from uuid import UUID
from fastapi import APIRouter, Depends, status, HTTPException
from supabase import AsyncClient

from app import schemas
from app.repositories import ratings as rating_repo
from db.supabase import get_db
from utils.auth import get_current_user

router = APIRouter(prefix="/ratings", tags=["ratings"])

@router.post(
    "/",
    response_model=schemas.UserRatingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def rate_vendor(
    rating: schemas.RatingCreate,
    current_user = Depends(get_current_user), 
    client: AsyncClient = Depends(get_db),
):
    return await rating_repo.upsert_rating(
        client=client, 
        user_id=current_user.id, 
        rating_data=rating
    )

@router.get(
    "/{vendor_id}/stats",
    response_model=schemas.RatingResponse,
)
async def get_vendor_rating_stats(
    vendor_id: UUID,
    client: AsyncClient = Depends(get_db),
):
    return await rating_repo.get_vendor_stats(client=client, vendor_id=vendor_id)

@router.get(
    "/{vendor_id}/me",
    response_model=schemas.UserRatingResponse,
)
async def get_my_rating(
    vendor_id: UUID,
    current_user = Depends(get_current_user),
    client: AsyncClient = Depends(get_db),
):
    rating = await rating_repo.get_user_rating(
        client=client, 
        user_id=current_user.id, 
        vendor_id=vendor_id
    )
    
    if not rating:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="You have not rated this vendor yet"
        )
        
    return rating