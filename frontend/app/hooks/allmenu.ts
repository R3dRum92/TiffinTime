'use client';

import { useQuery } from "@tanstack/react-query";

export interface MenuItem {
    id: string;
    name: string;
    description: string | null;
    price: number;
    image: string;
    vendorName: string;
    category?: string;
    available: boolean;
    preparationTime?: string;
    rating?: number;
}

export interface BackendMenuItem {
    id: string;
    vendor_name: string;
    name: string;
    date: string;
    description: string | null;
    img_url: string;
    price: number; // Fixed: Added missing price field
}

const fetchMenu = async (vendorId?: string): Promise<MenuItem[]> => {
    const url = vendorId 
        ? `${process.env.NEXT_PUBLIC_API_URL}/menu/${vendorId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/menu/`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch menu: ${response.status} ${response.statusText}`);
    }

    const menuItems = await response.json();
    
    // Transform the backend data to frontend format
    return menuItems.map((item: BackendMenuItem) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price, // Fixed: Use actual price from backend
        image: item.img_url,
        vendorName: item.vendor_name,
        category: 'Food', // Default category, update based on your backend
        available: true, // Default availability, update based on your backend
        preparationTime: '10-15 min', // Default time, update based on your backend
        rating: 4.0 // Default rating, update based on your backend
    }));
};

export const useMenu = (vendorId?: string, enabled = true) => {
    return useQuery({
        queryKey: ['menu', vendorId],
        queryFn: () => fetchMenu(vendorId),
        enabled,
        staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
        gcTime: 10 * 60 * 1000, // Cache for 10 minutes
        retry: 3,
        refetchOnWindowFocus: false,
    });
};