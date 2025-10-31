// app/hooks/useVendorMenu.ts
'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "../utils/auth";

// Get these from environment variables or auth context
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ========== TYPES ==========

export interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    preparationTime: number;
    // image: string;
}

export interface BackendMenuItem {
    id: string;
    vendor_id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    preparation_time: number;
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
    items: MenuItem[];
}



// Transform backend data to frontend format
const transformToFrontend = (items: BackendMenuItem[]): MenuData => {
    return {
        items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            description: item.description,
            preparationTime: item.preparation_time,
        })),
    };
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
        let message = `HTTP ${response.status}`;
        try {
            const err = await response.json();
            message = err.detail || err.message || message;
        } catch { }
        throw new Error(message);
    }

    return response.status === 204 ? null : response.json();
};


// ========== API FUNCTIONS ==========

const fetchVendorMenu = async (): Promise<MenuData> => {
    const url = `${API_BASE_URL}/menu/vendors/`;
    const data = await fetchWithAuth(url);
    return transformToFrontend(data);
};

const addMenuItemApi = async (data: Omit<BackendMenuItem, 'id' | 'vendor_id'>) => {
    return await fetchWithAuth(`${API_BASE_URL}/menu/`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

const updateMenuItemApi = async (data: Partial<BackendMenuItem> & { id: string }) => {
    return await fetchWithAuth(`${API_BASE_URL}/menu/${data.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};


const deleteMenuItemApi = async (id: string): Promise<void> => {
    await fetchWithAuth(`${API_BASE_URL}/menu/${id}`, { method: 'DELETE' });
};

// ========== CUSTOM HOOK ==========


// ========== HOOK ==========

export const useVendorMenu = () => {
    const queryClient = useQueryClient();
    const queryKey = ['vendorMenu']; // ✅ No vendorId needed

    const menuQuery = useQuery({
        queryKey,
        queryFn: fetchVendorMenu,
        staleTime: 60 * 1000,
        retry: 2,
    });

    const addMutation = useMutation({
        mutationFn: addMenuItemApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const updateMutation = useMutation({
        mutationFn: updateMenuItemApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMenuItemApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    return {
        menuData: menuQuery.data?.items || [],
        isLoading: menuQuery.isLoading,
        error: menuQuery.error as Error | null,

        addMenuItem: addMutation.mutateAsync,
        isAdding: addMutation.isPending,

        updateMenuItem: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteMenuItem: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,

        refetch: menuQuery.refetch,
    };
};