'use client'
import { useQuery } from "@tanstack/react-query";

interface VendorResponse {
    id: string;
    name: string;
    description: string;
    is_open: boolean;
    img_url: string;
    delivery_time: {
        min: number;
        max: number;
    };
}

interface VendorError {
    message: string;
    status?: number;
}

const fetchVendor = async (vendorId: string): Promise<VendorResponse> => {
    const token = localStorage.getItem('token');

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/${vendorId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch vendor: ${response.status}`);
    }

    return response.json();
};

export const useVendor = (vendorId: string) => {
    return useQuery<VendorResponse, VendorError>({
        queryKey: ['vendor', vendorId],
        queryFn: () => fetchVendor(vendorId),
        enabled: !!vendorId, // Only run query when vendorId is available
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        retry: (failureCount, error) => {
            // Don't retry on 404 errors
            if (error.message.includes('404')) return false;
            return failureCount < 3;
        },
    });
};