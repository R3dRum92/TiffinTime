// app/hooks/useReviewSubmission.ts

import { useState } from 'react';

// Define the shape of the data to be sent to the backend
// user_id is NOT included here, as it is expected to be derived from the auth token in the backend
interface ReviewPayload {
    vendor_id: string;
    food_quality: string;
    delivery_experience: string;
    comment: string;
}

export const useReviewSubmission = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const submitReview = async (payload: ReviewPayload) => {
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        // Replace with your actual logic to retrieve the user's authentication token (e.g., JWT)
        // This token is required for the backend's `Depends(get_current_user)` to work.
        // NOTE: If you are using next-auth, cookies, or a global context, retrieve the token here.
        const userAuthToken = localStorage.getItem('token') || ''; 

        // This URL should point to your FastAPI endpoint: /api/reviews/
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/reviews/`; 

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // CRUCIAL: Pass the authentication token to allow the backend to identify the user
                    'Authorization': `Bearer ${userAuthToken}`, 
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                // Attempt to get a detailed error message from the FastAPI response
                const errorData = await response.json();
                throw new Error(errorData.detail || `Server error: ${response.statusText}`);
            }

            // Successful submission
            setIsSuccess(true);
            return true;

        } catch (e) {
            setError(e instanceof Error ? e : new Error('An unknown error occurred during review submission.'));
            setIsSuccess(false);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return { submitReview, isLoading, error, isSuccess };
};