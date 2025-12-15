from http.client import HTTPException
from uuid import UUID
from typing import List
from fastapi import APIRouter, Depends, status
from supabase import AsyncClient

from app import schemas
from app.repositories import reviews as review_repo
from db.supabase import get_db
from utils.auth import get_current_user

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.post(
    "/",
    response_model=schemas.ReviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_review(
    review: schemas.ReviewCreate,
    current_user = Depends(get_current_user), 
    client: AsyncClient = Depends(get_db),
):
    return await review_repo.create_review(
        client=client, 
        user_id=current_user.id, 
        review_data=review
    )

@router.get(
    "/{vendor_id}",
    response_model=List[schemas.ReviewResponse],
)
async def get_vendor_reviews(
    vendor_id: UUID,
    client: AsyncClient = Depends(get_db),
    # Removed auth dependency here so frontend can load reviews freely
):
    return await review_repo.get_reviews_by_vendor(
        client=client, 
        vendor_id=vendor_id
    )

@router.patch("/{review_id}/reply", status_code=status.HTTP_200_OK)
async def reply_review(
    review_id: int,
    reply_data: schemas.ReviewReply,
    client: AsyncClient = Depends(get_db),
    # Assuming you want to ensure only the vendor owner can reply, 
    # you might add vendor validation logic here in a real app
):
    success = await review_repo.reply_to_review(
        client=client,
        review_id=review_id,
        reply_text=reply_data.reply_text
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Review not found or update failed")
        
    return {"message": "Reply posted successfully"}