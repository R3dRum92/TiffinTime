'use client';

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAuthToken } from "../utils/auth";
import { MenuItem } from "./useVendorMenu"; // Assuming MenuItem is exported
import { DayOfWeek } from "./useVendorSpecials"; // Re-use DayOfWeek enum

// ========== CONFIG ==========
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const queryKey = ['vendorWeeklyMenu'];

// ========== TYPES ==========

// Backend shape for weekly availability (includes nested menu item)
export interface BackendWeeklyAvailability {
    id: string; // The ID of the weekly_availability entry
    vendor_id: string;
    menu_item_id: string;
    day_of_week: DayOfWeek; // 0-6
    is_available: boolean;
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
export interface WeeklyAvailability extends MenuItem {
    rule_id: string; // The ID of the weekly_availability entry
    menu_item_id: string; // The vital link to menuData
    day_of_week: DayOfWeek;
    is_available: boolean;
}

// Payload for setting availability (the upsert endpoint)
export interface SetWeeklyAvailabilityPayload {
    menu_item_id: string;
    day_of_week: DayOfWeek;
    is_available: boolean;
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
const transformToFrontend = (rules: BackendWeeklyAvailability[]): WeeklyAvailability[] => {
    return rules.map(rule => ({
        // Spread the nested menu_item fields
        ...rule.menu_items,
        preparationTime: rule.menu_items.preparation_time, // Handle snake_case

        // rule.menu_items.id is the UUID of the food
        // rule.id is the UUID of the weekly rule
        id: rule.menu_items.id,
        menu_item_id: rule.menu_items.id,

        // Add the rule-specific fields
        rule_id: rule.id,
        day_of_week: Number(rule.day_of_week),
        is_available: rule.is_available,
    }));
};

const fetchWeeklyMenu = async (): Promise<WeeklyAvailability[]> => {
    const url = `${API_BASE_URL}/weekly-menu/my-menu`;
    const data: BackendWeeklyAvailability[] = await fetchWithAuth(url);
    return transformToFrontend(data || []);
};

const setWeeklyAvailabilityApi = async (payload: SetWeeklyAvailabilityPayload) => {
    return await fetchWithAuth(`${API_BASE_URL}/weekly-menu/set-availability`, {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

// ========== HOOK ==========

export const useVendorWeeklyMenu = () => {
    const queryClient = useQueryClient();

    const weeklyMenuQuery = useQuery({
        queryKey,
        queryFn: fetchWeeklyMenu,
        //staleTime: 5 * 60 * 1000, // 5 minutes
        staleTime: 0, // Always fetch fresh data
    });

    const setAvailabilityMutation = useMutation({
        mutationFn: setWeeklyAvailabilityApi,
        // Optimistically update the cache to make the UI feel instant
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vendorWeeklyMenu'] });
        },
    });
    //     onMutate: async (newRule: SetWeeklyAvailabilityPayload) => {
    //         await queryClient.cancelQueries({ queryKey });
    //         const previousMenu = queryClient.getQueryData<WeeklyAvailability[]>(queryKey);

    //         queryClient.setQueryData<WeeklyAvailability[]>(queryKey, (old) => {
    //             if (!old) return [];

    //             // Find if a rule already exists for this item/day
    //             const existingRuleIndex = old.findIndex(
    //                 r => r.id === newRule.menu_item_id && r.day_of_week === newRule.day_of_week
    //             );

    //             if (existingRuleIndex > -1) {
    //                 // Update existing rule
    //                 const updatedMenu = [...old];
    //                 updatedMenu[existingRuleIndex] = {
    //                     ...updatedMenu[existingRuleIndex],
    //                     is_available: newRule.is_available,
    //                 };
    //                 return updatedMenu;
    //             } else {
    //                 // This path is less likely if `useVendorMenu` provides all items,
    //                 // but it's good practice.
    //                 // We can't fully create a new 'WeeklyAvailability' item
    //                 // without all the menu item details, so we'll just refetch.
    //                 // For this reason, a simple invalidation is safer.
    //                 return old;
    //             }
    //         });

    //         return { previousMenu };
    //     },
    //     // Refetch on success or error to ensure consistency
    //     onSettled: () => {
    //         queryClient.invalidateQueries({ queryKey });
    //     },
    // });

    return {
        weeklyMenuRules: weeklyMenuQuery.data || [],
        isLoading: weeklyMenuQuery.isLoading,
        //error: weeklyMenuQuery.error as Error | null,

        setAvailability: setAvailabilityMutation.mutateAsync,
        isSetting: setAvailabilityMutation.isPending,
    };
};
