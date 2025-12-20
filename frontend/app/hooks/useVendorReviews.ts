// app/hooks/useVendorReviews.ts
import { useState, useEffect, useCallback } from 'react';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from 'sonner';

interface ReviewItem {
    review_id: number; // Changed to number based on int8
    food_quality: string;
    delivery_experience: string;
    comment: string | null;
    username: string;
    is_replied: boolean; // Added based on DB schema
    reply: string | null;
}

const fetchReviews = async (vendorId: string): Promise<ReviewItem[]> => {
    // Return empty array if no ID yet
    if (!vendorId) return [];

    // Note: I removed the Auth Token requirement here so the count loads for everyone.
    // If you need it private, add the header back.
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${vendorId}`, {
        headers: { 'Content-Type': 'application/json' }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch reviews');
    }

    return res.json();
};

const postReply = async ({ reviewId, replyText }: { reviewId: number; replyText: string }) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${reviewId}/reply`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}` // Add token if your backend requires it
        },
        body: JSON.stringify({ reply_text: replyText })
    });

    if (!res.ok) throw new Error('Failed to post reply');
    return res.json();
};

export const useVendorReviews = (vendorId: string) => {
    const queryClient = useQueryClient();

    // 1. Fetching
    const query = useQuery({
        queryKey: ['vendor-reviews', vendorId],
        queryFn: () => fetchReviews(vendorId),
        enabled: !!vendorId,
    });

    // 2. Replying Mutation
    const replyMutation = useMutation({
        mutationFn: postReply,
        onSuccess: () => {
            toast.success("Reply posted successfully");
            // Refresh the list immediately
            queryClient.invalidateQueries({ queryKey: ['vendor-reviews', vendorId] });
        },
        onError: () => {
            toast.error("Failed to post reply");
        }
    });

    return { ...query, replyToReview: replyMutation.mutate, isReplying: replyMutation.isPending };
};