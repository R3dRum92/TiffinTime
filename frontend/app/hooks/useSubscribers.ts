'use client';

import { useQuery } from '@tanstack/react-query';

export interface Subscriber {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
}

export const fetchSubscribers = async (): Promise<Subscriber[]> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribe/token/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            // You can add auth headers here if needed
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch subscribers: ${response.status}`);
    }

    const data = await response.json();
    // Ensure it returns an array; if the API returns an object, wrap it in an array
    return Array.isArray(data) ? data : [data];
};

export const useSubscribers = () => {
    return useQuery({
        queryKey: ['subscribers'],
        queryFn: fetchSubscribers,
    });
};
