// app/hooks/useVendorMenu.ts
'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Get these from environment variables or auth context
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ========== TYPES ==========

export interface MenuItem {
    id: number;
    name: string;
    price: number;
    category: string;
    description: string;
    preparationTime: string;
    image: string;
    available: boolean;
}

export interface BackendMenuItem {
    id: number;
    vendor_id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    preparation_time: string;
    img_url: string;
    available: boolean;
    menu_date: string; // 'YYYY-MM-DD'
}

export interface NewMenuItem {
    name: string;
    price: string;
    category: string;
    description: string;
    preparationTime: string;
    image: string;
    available: boolean;
}

export interface MenuData {
    [date: string]: MenuItem[];
}

// ========== HELPER FUNCTIONS ==========

// Get auth token from your auth provider (NextAuth, Supabase, etc.)
const getAuthToken = (): string => {
    // TODO: Replace with your actual auth implementation
    // Example: return session?.accessToken || '';
    // For now, get from localStorage (not recommended for production)
    return localStorage.getItem('authToken') || '';
};

// Get vendor ID from auth context
const getVendorId = (): string => {
    // TODO: Replace with your actual auth implementation
    // Example: return session?.user?.vendorId || '';
    return localStorage.getItem('vendorId') || '';
};

// Transform backend data to frontend format
const transformToFrontend = (items: BackendMenuItem[]): MenuData => {
    const menuData: MenuData = {};

    items.forEach(item => {
        const menuItem: MenuItem = {
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            description: item.description,
            preparationTime: item.preparation_time,
            image: item.img_url,
            available: item.available,
        };

        // Ensure consistent date format
        const dateKey = item.menu_date.includes('T')
            ? item.menu_date.split('T')[0]
            : item.menu_date;

        if (!menuData[dateKey]) {
            menuData[dateKey] = [];
        }
        menuData[dateKey].push(menuItem);
    });

    return menuData;
};

// Enhanced fetch with better error handling
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        // Try to get error details from response
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
            // If parsing fails, use the default message
        }
        throw new Error(errorMessage);
    }

    // Handle empty responses (e.g., 204 No Content)
    if (response.status === 204) {
        return null;
    }

    return response.json();
};

// ========== API FUNCTIONS ==========

const fetchVendorMenu = async (): Promise<MenuData> => {
    const vendorId = getVendorId();
    if (!vendorId) {
        throw new Error('Vendor ID not found. Please log in again.');
    }

    const url = `${API_BASE_URL}/vendor/${vendorId}/menu`;
    const data = await fetchWithAuth(url);

    // Handle different response formats from FastAPI
    const items: BackendMenuItem[] = Array.isArray(data) ? data : data.data || data.items || [];

    return transformToFrontend(items);
};

const addMenuItemApi = async (data: Omit<BackendMenuItem, 'id'>): Promise<BackendMenuItem> => {
    const vendorId = getVendorId();
    if (!vendorId) {
        throw new Error('Vendor ID not found. Please log in again.');
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/menu/item`, {
        method: 'POST',
        body: JSON.stringify({ ...data, vendor_id: vendorId })
    });

    return response;
};

const updateMenuItemApi = async (
    data: Partial<BackendMenuItem> & { id: number }
): Promise<BackendMenuItem> => {
    const { id, ...updateData } = data;

    const response = await fetchWithAuth(`${API_BASE_URL}/menu/item/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
    });

    return response;
};

const deleteMenuItemApi = async (id: number): Promise<void> => {
    await fetchWithAuth(`${API_BASE_URL}/menu/item/${id}`, {
        method: 'DELETE',
    });
};

// ========== CUSTOM HOOK ==========

export const useVendorMenu = () => {
    const queryClient = useQueryClient();
    const vendorId = getVendorId();
    const queryKey = ['vendorMenu', vendorId];

    // Fetch Query
    const menuQuery = useQuery({
        queryKey,
        queryFn: fetchVendorMenu,
        staleTime: 60 * 1000, // 1 minute
        enabled: !!vendorId, // Only run if vendor ID exists
        retry: 2, // Retry failed requests twice
    });

    // Add Mutation
    const addMutation = useMutation({
        mutationFn: addMenuItemApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error: Error) => {
            console.error('Failed to add menu item:', error.message);
        }
    });

    // Update Mutation
    const updateMutation = useMutation({
        mutationFn: updateMenuItemApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error: Error) => {
            console.error('Failed to update menu item:', error.message);
        }
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: deleteMenuItemApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey });
        },
        onError: (error: Error) => {
            console.error('Failed to delete menu item:', error.message);
        }
    });

    // Helper: Add menu item for specific date
    const handleAddMenuItem = (item: Omit<MenuItem, 'id'>, dateStr: string) => {
        const backendPayload: Omit<BackendMenuItem, 'id'> = {
            name: item.name,
            price: item.price,
            category: item.category,
            description: item.description,
            preparation_time: item.preparationTime,
            img_url: item.image,
            available: item.available,
            menu_date: dateStr,
            vendor_id: vendorId,
        };

        return addMutation.mutateAsync(backendPayload);
    };

    // Helper: Toggle availability
    const toggleAvailability = (itemId: number, currentStatus: boolean) => {
        return updateMutation.mutateAsync({
            id: itemId,
            available: !currentStatus
        });
    };

    // Helper: Update menu item
    const handleUpdateMenuItem = (item: Partial<MenuItem> & { id: number }) => {
        const backendPayload: Partial<BackendMenuItem> & { id: number } = {
            id: item.id,
            ...(item.name && { name: item.name }),
            ...(item.price !== undefined && { price: item.price }),
            ...(item.category && { category: item.category }),
            ...(item.description && { description: item.description }),
            ...(item.preparationTime && { preparation_time: item.preparationTime }),
            ...(item.image && { img_url: item.image }),
            ...(item.available !== undefined && { available: item.available }),
        };

        return updateMutation.mutateAsync(backendPayload);
    };

    return {
        // Data & Status
        menuData: menuQuery.data,
        isLoading: menuQuery.isLoading,
        isFetching: menuQuery.isFetching,
        error: menuQuery.error as Error | null,

        // Actions
        addMenuItem: handleAddMenuItem,
        isAdding: addMutation.isPending,

        updateMenuItem: handleUpdateMenuItem,
        isUpdating: updateMutation.isPending,

        deleteMenuItem: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,

        toggleAvailability,

        // Manual refetch
        refetch: menuQuery.refetch,
    };
};