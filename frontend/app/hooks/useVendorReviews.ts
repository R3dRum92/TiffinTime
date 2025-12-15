// app/hooks/useVendorReviews.ts

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface ReviewItem {
    review_id: string;
    food_quality: string;
    delivery_experience: string;
    comment: string | null;
    created_at: string;
    username: string; // Must match the backend flattened structure
}

export const useVendorReviews = (vendorId: string) => {
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const fetchReviews = useCallback(async () => {
        if (!vendorId) {
            setReviews([]);
            return;
        }

        const userAuthToken = localStorage.getItem('token') || ''; 

        if (!userAuthToken) {
             setIsError(true);
             // Use toast here to inform the user (better UX)
             toast.error("Authentication required to view reviews.", { description: "Please log in to see vendor reviews." });
             setReviews([]);
             return;
        }

        setIsLoading(true);
        setIsError(false);

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/reviews/${vendorId}`; 
        
        try {
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userAuthToken}`, 
                },
            });
            
            // Check if status is NOT successful (401, 404, 500, etc.)
            if (!response.ok) {
                const errorData = await response.json();
                
                // If the status is 500, it means the Pydantic flattening failed on the backend.
                if (response.status === 500) {
                     throw new Error("Internal Server Error: Backend data structure mismatch.");
                }
                
                throw new Error(errorData.detail || `Failed to fetch reviews (Status: ${response.status})`);
            }

            const data = await response.json();
            
            // CRITICAL CHECK: Ensure the data structure contains 'username' before setting state
            if (data.length > 0 && data[0].username === undefined) {
                 console.error("API returned review data, but 'username' field is missing or nested. Check FastAPI processing.");
                 // We will still set the data, but log the error (assuming other fields are fine)
            }
            
            setReviews(data);

        } catch (e) {
            console.error("Error fetching vendor reviews:", e);
            setIsError(true);
            toast.error("Failed to load reviews.", {
                description: e instanceof Error ? e.message : "An unknown network error occurred."
            });
            setReviews([]);
        } finally {
            setIsLoading(false);
        }
    }, [vendorId]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    return { data: reviews, isLoading, isError };
};