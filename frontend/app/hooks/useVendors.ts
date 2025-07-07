'use client';

import { useQuery } from "@tanstack/react-query";

export interface Vendor {
    id: string;
    name: string;
    description: string;
    image: string;
    deliveryTime: string;
    isOpen: boolean;
}

interface BackendVendor {
    id: string;
    name: string;
    img_url: string;
    description: string | null;
    deliveryTime: {
        min: number;
        max: number;
    };
    isOpen: boolean;
}

const fetchVendors = async (): Promise<Vendor[]> => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/get_vendors`, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    return result.data.map((vendor: BackendVendor) => ({
        id: vendor.id,
        name: vendor.name,
        image: vendor.img_url,
        description: vendor.description || 'No description available',
        deliveryTime: `${vendor.deliveryTime.min}-${vendor.deliveryTime.max} mins`,
        isOpen: vendor.isOpen,
    }));
};

export const useVendors = () => {
    return useQuery({
        queryKey: ['vendors'],
        queryFn: fetchVendors,
        staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Cache for 10 minutes
        retry: 3,
        refetchOnWindowFocus: false, // Don't refetch on window focus
    });
};



