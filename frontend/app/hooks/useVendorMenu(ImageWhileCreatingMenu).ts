// app/hooks/useVendorMenu.ts
//eta ami image input neyar jonne banaisi
'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "../utils/auth";

// Get these from environment variables or auth context
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// ========== TYPES ==========

export interface UploadImagePayload {
    itemId: string;
    file: File;
}

export interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    preparationTime: number;
    image: string;  // ✅ img_url থেকে image করো
}


export interface BackendMenuItem {
    id: string;
    vendor_id: string;
    name: string;
    price: number;
    category: string;
    description: string;
    preparation_time: number;
    img_url?: string | null; 
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



const transformToFrontend = (items: BackendMenuItem[]): MenuData => {
    return {
        items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            category: item.category,
            description: item.description,
            preparationTime: item.preparation_time,
            image: item.img_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
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
    console.log('🔥 API_BASE_URL:', API_BASE_URL);
    console.log('🔥 Raw data[0]:', data[0]);
    
    const transformed = transformToFrontend(data);
    
    // ✅ এটাও add করো:
    console.log('🔥 Transformed items[0]:', transformed.items[0]);
    console.log('🔥 Image URL:', transformed.items[0]?.image);
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

const uploadMenuImageApi = async ({ itemId, file }: UploadImagePayload) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/menu/${itemId}/image`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Upload failed');
    }

    return response.json();
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

     const uploadImageMutation = useMutation({
        mutationFn: uploadMenuImageApi,
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
        uploadImage: uploadImageMutation.mutateAsync,  // ADD THIS
        isUploading: uploadImageMutation.isPending,    // ADD THIS
    };
};