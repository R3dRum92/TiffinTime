//allmenu.ts

'use client';

import { useQuery } from "@tanstack/react-query";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface MenuItem {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  description: string | null;
  image: string;
  price: number;
  category: string | null;
  preparationTime: string | null;
  rating: number | null;
  available: boolean;
  date?: string | null;
}

export interface BackendMenuItem {
  id: string;
  vendor_id: string;  // Add this
  vendor_name: string;
  name: string;
  date: string | null;
  description: string | null;
  img_url: string | null;
  price: number;
  category: string | null;
  preparation_time: number | null;  // Add this
}

export const useMenu = () => {
  return useQuery({
    queryKey: ['menu'],
    queryFn: async (): Promise<MenuItem[]> => {
      const response = await fetch(`${API_BASE_URL}/menu/`, {
        headers: {
          'Content-Type': 'application/json',
          // Add authorization if needed
          // 'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch menu');
      }

      const data: BackendMenuItem[] = await response.json();
      
      // Map the response to include all fields
      return data.map((item: BackendMenuItem) => ({
        id: item.id,
        vendorId: item.vendor_id, // Map vendor_id from backend
        vendorName: item.vendor_name,
        name: item.name,
        description: item.description,
        image: item.img_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        price: item.price,
        category: item.category,
        preparationTime: item.preparation_time ? `${item.preparation_time} min` : null,
        rating: 4.5, // Default rating - you can add this to backend later
        available: item.price > 0, // Assuming items with price > 0 are available
        date: item.date,
      }));
    },
  });
};

// Optional: Hook to fetch menu for a specific vendor
export const useVendorMenu = (vendorId: string | null) => {
  return useQuery({
    queryKey: ['menu', 'vendor', vendorId],
    queryFn: async (): Promise<MenuItem[]> => {
      if (!vendorId) throw new Error('Vendor ID is required');
      
      const response = await fetch(`${API_BASE_URL}/menu/vendor/${vendorId}`, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch vendor menu');
      }

      const data: BackendMenuItem[] = await response.json();
      
      return data.map((item: BackendMenuItem) => ({
        id: item.id,
        vendorId: item.vendor_id,
        vendorName: item.vendor_name,
        name: item.name,
        description: item.description,
        image: item.img_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
        price: item.price,
        category: item.category,
        preparationTime: item.preparation_time ? `${item.preparation_time} min` : null,
        rating: 4.5,
        available: item.price > 0,
        date: item.date,
      }));
    },
    enabled: !!vendorId,
  });
};