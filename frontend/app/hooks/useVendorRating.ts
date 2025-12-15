'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getAuthToken } from "@/app/utils/auth"; // Imports your fixed utility

// Types
interface RatingStatsResponse {
    vendor_id: string;
    average_rating: number;
    total_ratings: number;
}

interface UserRatingResponse {
    vendor_id: string;
    rating_val: number;
}

// API

const fetchStats = async (vendorId: string): Promise<RatingStatsResponse> => {
    // Public endpoint: No token needed
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ratings/${vendorId}/stats`, {
        headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) throw new Error('Failed to fetch stats');
    return res.json();
};

const fetchUserRating = async (vendorId: string): Promise<UserRatingResponse | null> => {
    const token = getAuthToken();
    if (!token) return null; // User not logged in, just return null (don't error)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ratings/${vendorId}/me`, {
        headers: {
            'Authorization': `Bearer ${token}`, // Sends the correct token
            'Content-Type': 'application/json'
        }
    });

    if (res.status === 404) return null; // User hasn't rated yet
    if (!res.ok) throw new Error('Failed to fetch user rating');
    return res.json();
};

const postRating = async ({ vendorId, rating }: { vendorId: string; rating: number }) => {
    const token = getAuthToken();

    if (!token) {
        throw new Error("You must be logged in to rate.");
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ratings/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`, // Secure endpoint requires token
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ vendor_id: vendorId, rating_val: rating })
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.detail || 'Failed to submit rating';
        throw new Error(errorMessage);
    }

    return res.json();
};

// Hook

export const useVendorRatings = (vendorId: string) => {
    const queryClient = useQueryClient();

    const statsQuery = useQuery({
        queryKey: ['rating-stats', vendorId],
        queryFn: () => fetchStats(vendorId),
    });

    const userRatingQuery = useQuery({
        queryKey: ['user-rating', vendorId],
        queryFn: () => fetchUserRating(vendorId),
        retry: false,
    });

    const mutation = useMutation({
        mutationFn: postRating,
        onSuccess: () => {
            toast.success("Rating submitted!");
            // Refresh the data immediately
            queryClient.invalidateQueries({ queryKey: ['rating-stats', vendorId] });
            queryClient.invalidateQueries({ queryKey: ['user-rating', vendorId] });
        },
        onError: (error: Error) => {
            console.error("Rating Error:", error);
            // Show the specific error message (e.g., "Please log in")
            toast.error(error.message);
        }
    });

    return {
        average: statsQuery.data?.average_rating || 0,
        count: statsQuery.data?.total_ratings || 0,
        userRating: userRatingQuery.data?.rating_val || null,
        isLoading: statsQuery.isLoading,
        submitRating: (rating: number) => mutation.mutate({ vendorId, rating }),
        isSubmitting: mutation.isPending
    };
};