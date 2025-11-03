// 'use client';

// import { useQuery } from "@tanstack/react-query";

// export interface MenuItem {
//     id: string;
//     name: string;
//     description: string | null;
//     price: number;
//     image: string;
//     vendorName: string;
//     vendorId: string; // <--- FIX 1: ADD THIS REQUIRED FIELD
//     category?: string;
//     available: boolean;
//     preparationTime?: string;
//     rating?: number;
// }

// export interface BackendMenuItem {
//     id: string;
//     vendor_name: string;
//     vendor_id: string; // <--- FIX 2: ADD THIS FIELD
//     name: string;
//     date: string;
//     description: string | null;
//     img_url: string;
//     price: number; // Fixed: Added missing price field
// }

// const fetchMenu = async (vendorId?: string): Promise<MenuItem[]> => {
//     const url = vendorId 
//         ? `${process.env.NEXT_PUBLIC_API_URL}/menu/${vendorId}`
//         : `${process.env.NEXT_PUBLIC_API_URL}/menu/`;
    
//     const response = await fetch(url, {
//         headers: {
//             'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
//             'Content-Type': 'application/json'
//         }
//     });

//     if (!response.ok) {
//         throw new Error(`Failed to fetch menu: ${response.status} ${response.statusText}`);
//     }

//     const menuItems = await response.json();
    
//     // Transform the backend data to frontend format
//     return menuItems.map((item: BackendMenuItem) => ({
//         id: item.id,
//         name: item.name,
//         description: item.description,
//         price: item.price, // Fixed: Use actual price from backend
//         image: item.img_url,
//         vendorName: item.vendor_name,
//         vendorId: item.vendor_id,
//         category: 'Food', // Default category, update based on your backend
//         available: true, // Default availability, update based on your backend
//         preparationTime: '10-15 min', // Default time, update based on your backend
//         rating: 4.0 // Default rating, update based on your backend
//     }));
// };

// export const useMenu = (vendorId?: string, enabled = true) => {
//     return useQuery({
//         queryKey: ['menu', vendorId],
//         queryFn: () => fetchMenu(vendorId),
//         enabled,
//         staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
//         gcTime: 10 * 60 * 1000, // Cache for 10 minutes
//         retry: 3,
//         refetchOnWindowFocus: false,
//     });
// };


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