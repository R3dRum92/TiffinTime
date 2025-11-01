'use client';

import { useQuery } from '@tanstack/react-query';

// Type definitions based on your vendor API response
interface VendorDetailsResponse {
    id: string;
    name: string;
    description: string | null;
    is_open: boolean;
    img_url: string;
    delivery_time: {
        min: number;
        max: number;
    };
}

// Fetching function
export const fetchVendorDetails = async (): Promise<VendorDetailsResponse> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/token/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch vendor data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
};

// React Query hook for vendor data
export const useVendorDetails = () => {
    return useQuery<VendorDetailsResponse, Error>({
        queryKey: ['vendorDetails'],
        queryFn: fetchVendorDetails,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

// Hook specifically for vendor info
export const useVendorInfo = () => {
    const { data, isLoading, error, refetch } = useVendorDetails();

    return {
        vendor: data ? {
            id: data.id,
            name: data.name,
            description: data.description,
            is_open: data.is_open,
            img_url: data.img_url,
            delivery_time: data.delivery_time,
        } : null,
        isLoading,
        error,
        refetch,
    };
};