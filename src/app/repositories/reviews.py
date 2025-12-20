from uuid import UUID
from typing import List
from supabase import AsyncClient
from app import schemas
from fastapi import HTTPException, status

async def create_review(
    client: AsyncClient, user_id: UUID, review_data: schemas.ReviewCreate
) -> schemas.ReviewResponse:
    try:
        # 1. Prepare data
        data = review_data.model_dump()
        data["user_id"] = str(user_id)
        data["vendor_id"] = str(review_data.vendor_id)
        data["is_replied"] = False # Default value
        
        # 2. Insert into DB
        response = await client.table("review").insert(data).execute()
        
        if not response.data:
            raise Exception("Insert successful but no data returned.")
            
        new_review = response.data[0]
        
        # 3. Fetch username for the response
        user_res = await client.table("users").select("name").eq("id", str(user_id)).single().execute()
        username = user_res.data.get("name") if user_res.data else "Anonymous"

        return schemas.ReviewResponse(
            **new_review,
            username=username
        )

    except Exception as e:
        print(f"Error creating review: {e}") # Simple print for debugging
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit review: {str(e)}"
        )

async def get_reviews_by_vendor(
    client: AsyncClient, vendor_id: UUID
) -> List[schemas.ReviewResponse]:
    try:
        # 1. Fetch reviews + join users table
        # We order by review_id desc (highest ID = newest)
        response = await client.table("review")\
            .select("*, users(name)")\
            .eq("vendor_id", str(vendor_id))\
            .order("review_id", desc=True)\
            .execute()

        if not response.data:
            return []

        cleaned_reviews = []
        for item in response.data:
            # 2. Flatten the user object
            user_info = item.pop("users", None)
            username = user_info.get("name") if user_info else "Anonymous"
            
            # 3. Create schema
            review = schemas.ReviewResponse(
                **item,
                username=username
            )
            cleaned_reviews.append(review)
            
        return cleaned_reviews

    except Exception as e:
        print(f"Error fetching reviews: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve reviews"
        )
    
async def reply_to_review(
    client: AsyncClient, review_id: int, reply_text: str
) -> bool:
    try:
        # Update the specific review
        response = await client.table("review")\
            .update({
                "reply": reply_text, 
                "is_replied": True
            })\
            .eq("review_id", review_id)\
            .execute()
            
        if response.data:
            return True
        return False

    except Exception as e:
        print(f"Error replying to review: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to post reply"
        )