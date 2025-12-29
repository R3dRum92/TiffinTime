'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "@/app/utils/auth"; // Changed import path
import { MenuItem } from "./useVendorMenu(ImageWhileCreatingMenu)"; // Assuming MenuItem is exported

// ========== CONFIG ==========
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const queryKey = ['vendorSpecials'];

// ========== TYPES ==========
export enum DayOfWeek {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THURSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6,
}

// Backend shape for a date special (includes nested menu item)
export interface BackendDateSpecial {
    id: string;
    vendor_id: string;
    menu_item_id: string;
    available_date: string; // ISO date string "YYYY-MM-DD"
    special_price: number | null;
    quantity: number | null;
    menu_items: { // This is the nested object from your Supabase join
        id: string;
        vendor_id: string;
        name: string;
        price: number;
        category: string;
        description: string;
        preparation_time: number;
    };
}

// Frontend shape (flattened)
export interface DateSpecial extends MenuItem {
    special_id: string; // The ID of the date_specials entry
    available_date: string;
    special_price: number | null;
    quantity: number | null;
}

// Payload for creating a new special
export interface NewDateSpecialPayload {
    menu_item_id: string;
    available_date: string; // ISO "YYYY-MM-DD"
    special_price?: number | null;
    quantity?: number | null;
}

// Payload for updating a special
export interface UpdateDateSpecialPayload {
    id: string; // The special_id
    special_price?: number | null;
    quantity?: number | null;
}


// ========== FETCH UTILITY ==========
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found.");

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

// Transforms backend data to our flat frontend type
const transformToFrontend = (specials: BackendDateSpecial[]): DateSpecial[] => {
    return specials.map(s => ({
        // Spread the nested menu_item fields
        ...s.menu_items,
        preparationTime: s.menu_items.preparation_time, // Handle snake_case

        // Add the special-specific fields
        special_id: s.id,
        available_date: s.available_date,
        special_price: s.special_price,
        quantity: s.quantity,
    }));
};

const fetchVendorSpecials = async (): Promise<DateSpecial[]> => {
    const url = `${API_BASE_URL}/specials/my-specials`;
    const data: BackendDateSpecial[] = await fetchWithAuth(url);
    return transformToFrontend(data || []);
};

const addDateSpecialApi = async (payload: NewDateSpecialPayload) => {
    return await fetchWithAuth(`${API_BASE_URL}/specials/`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

const updateDateSpecialApi = async (payload: UpdateDateSpecialPayload) => {
    const { id, ...body } = payload;
    return await fetchWithAuth(`${API_BASE_URL}/specials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(body),
    });
};

const deleteDateSpecialApi = async (id: string): Promise<void> => {
    await fetchWithAuth(`${API_BASE_URL}/specials/${id}`, { method: 'DELETE' });
};

// ========== HOOK ==========

export const useVendorSpecials = () => {
    const queryClient = useQueryClient();

    const specialsQuery = useQuery({
        queryKey,
        queryFn: fetchVendorSpecials,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const addMutation = useMutation({
        mutationFn: addDateSpecialApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const updateMutation = useMutation({
        mutationFn: updateDateSpecialApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDateSpecialApi,
        onSuccess: () => queryClient.invalidateQueries({ queryKey }),
    });

    return {
        allSpecials: specialsQuery.data || [],
        isLoading: specialsQuery.isLoading,
        error: specialsQuery.error as Error | null,

        addSpecial: addMutation.mutateAsync,
        isAdding: addMutation.isPending,

        updateSpecial: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,

        deleteSpecial: deleteMutation.mutateAsync,
        isDeleting: deleteMutation.isPending,
    };
};

