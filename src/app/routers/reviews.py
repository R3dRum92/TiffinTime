# routers/reviews.py (FINAL, REMOVED created_at)

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List
from supabase import AsyncClient 
from uuid import UUID 

# NOTE: Imports assumed to exist
from db.supabase import get_db 
from utils.auth import get_current_user 

router = APIRouter(
    prefix="/reviews",
    tags=["reviews"],
)

# --- Pydantic Schema for Incoming Review Data (unchanged) ---
class ReviewCreate(BaseModel):
    vendor_id: UUID = Field(..., description="The ID of the vendor being reviewed.")
    food_quality: str = Field(..., description="Rating for food quality.")
    delivery_experience: str = Field(..., description="Rating for delivery experience.")
    comment: Optional[str] = Field(None, description="Optional comment from the user.")

# --- Pydantic Schema for Review Item (FINAL - created_at REMOVED) ---
class ReviewItem(BaseModel):
    review_id: str  
    user_id: str
    vendor_id: str
    
    food_quality: str
    delivery_experience: str
    
    comment: Optional[str] = None
    
    is_replied: bool
    reply: Optional[str] = None
    
    # created_at HAS BEEN REMOVED HERE
    
    # Mapped from the 'name' column in the 'users' table
    username: str = Field(..., description="The name of the reviewer fetched from the users table.") 
    
    class Config:
        extra = "allow" 
        from_attributes = True

# --- POST Endpoint (unchanged) ---
@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_review(
    review: ReviewCreate,
    client: AsyncClient = Depends(get_db),
    auth_user = Depends(get_current_user) 
):
    """
    Submits a new review to the 'Review' table.
    """
    try:
        user_id = str(auth_user.id)
        vendor_id = str(review.vendor_id)
    except AttributeError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID could not be retrieved from authentication token."
        )
    except Exception as e:
         raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal ID conversion error: {e}"
        )
    
    review_data = review.model_dump(exclude_none=True) 
    
    review_data['vendor_id'] = vendor_id
    review_data['user_id'] = user_id 
    review_data['is_replied'] = False
    
    try:
        response = await client.table('review').insert(review_data).execute()

        if response.data:
            new_review = response.data[0]
            return {"message": "Review submitted successfully", "review": new_review}
        
        if hasattr(response, 'error') and response.error:
             print(f"Supabase Error: {response.error}")
             raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database constraint error. Supabase detail: {response.error.get('message', 'Unknown database error')}"
            )
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve review data after insertion."
        )

        
    except HTTPException:
        raise
    except Exception as e:
        print(f"An unexpected error occurred during DB operation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred: {e}"
        )

# --- GET Endpoint (FINAL - created_at handled by removal) ---
@router.get(
    "/{vendor_id}",
    response_model=List[ReviewItem], 
    status_code=status.HTTP_200_OK,
)
async def get_reviews_for_vendor(
    vendor_id: str,
    auth_user = Depends(get_current_user), 
    client: AsyncClient = Depends(get_db),
):
    try:
        # Querying the 'users' table for the 'name' column
        # Note: If Supabase adds 'created_at' automatically on INSERT but it's not a visible column, 
        # this query still works by only requesting 'name'.
        response = await client.table('review').select('*, users(name)').eq('vendor_id', vendor_id).order('review_id', desc=True).execute()

        if response.data:
            
            processed_data = []
            for item in response.data:
                
                # 1. Extract the nested 'users' dictionary
                user_info = item.pop('users', None)
                
                # 2. Map the user's 'name' to the 'username' field
                if user_info and 'name' in user_info:
                    item['username'] = user_info['name']
                else:
                    item['username'] = "Anonymous User"
                
                # 3. Explicitly convert UUIDs to strings
                item['review_id'] = str(item['review_id'])
                item['vendor_id'] = str(item['vendor_id'])
                item['user_id'] = str(item['user_id']) 
                
                # NOTE: If the data still contains a field like 'created_at', it will be silently allowed 
                # because of the 'extra = "allow"' config, but Pydantic won't validate its type.
                
                processed_data.append(item)
            
            return processed_data
        
        return []

    except HTTPException:
        raise
    except Exception as e:
        print(f"FATAL ERROR during response validation: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Response validation failed. Check DB data types or Pydantic schema: {e}"
        )