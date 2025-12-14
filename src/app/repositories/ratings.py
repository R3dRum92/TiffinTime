from uuid import UUID
from fastapi import HTTPException, status
from supabase import AsyncClient
from app import schemas
from utils.logger import logger

async def upsert_rating(
    client: AsyncClient, user_id: UUID, rating_data: schemas.RatingCreate
) -> schemas.UserRatingResponse:
    try:
        # Match the database column names exactly
        data = {
            "user_id": str(user_id),
            "vendor_id": str(rating_data.vendor_id),
            "rating_val": rating_data.rating_val, 
        }
        
        # Supabase handles the composite PK conflict automatically on upsert
        response = await client.table("rating").upsert(data).execute()
        
        if not response.data:
             raise Exception("No data returned from upsert")

        record = response.data[0]
        return schemas.UserRatingResponse(
            vendor_id=record.get("vendor_id"),
            rating_val=record.get("rating_val")
        )

    except Exception as e:
        logger.error(f"Failed to upsert rating: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit rating: {str(e)}",
        )

async def get_vendor_stats(
    client: AsyncClient, vendor_id: UUID
) -> schemas.RatingResponse:
    try:
        # Fetch only the rating_val column
        response = await client.table("rating")\
            .select("rating_val")\
            .eq("vendor_id", str(vendor_id))\
            .execute()
        
        ratings = response.data
        total_count = len(ratings)
        
        if total_count == 0:
            return schemas.RatingResponse(
                vendor_id=vendor_id,
                average_rating=0.0,
                total_ratings=0
            )

        # Calculate average using the correct key
        total_score = sum(r["rating_val"] for r in ratings)
        average = total_score / total_count

        return schemas.RatingResponse(
            vendor_id=vendor_id,
            average_rating=round(average, 1),
            total_ratings=total_count
        )

    except Exception as e:
        logger.error(f"Failed to fetch rating stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve vendor ratings"
        )

async def get_user_rating(
    client: AsyncClient, user_id: UUID, vendor_id: UUID
) -> Optional[schemas.UserRatingResponse]:
    try:
        response = await client.table("rating")\
            .select("rating_val")\
            .eq("user_id", str(user_id))\
            .eq("vendor_id", str(vendor_id))\
            .execute()

        if not response.data:
            return None

        return schemas.UserRatingResponse(
            vendor_id=vendor_id,
            rating_val=response.data[0]["rating_val"]
        )

    except Exception as e:
        logger.error(f"Failed to fetch user rating: {str(e)}")
        return None