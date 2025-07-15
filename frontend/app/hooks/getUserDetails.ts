import { useQuery } from '@tanstack/react-query';

// Type definitions based on your API response
interface UserSubscription {
    id: string;
    name: string;
    duration: number;
    start_date: string;
}

interface UserResponse {
    id: string;
    name: string;
    phone_number: string;
    email: string;
    subscriptions: UserSubscription[];
}

// Fetching function
export const fetchUser = async (): Promise<UserResponse> => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
};

// React Query hook for user data
export const useUser = () => {
    return useQuery<UserResponse, Error>({
        queryKey: ['user'],
        queryFn: fetchUser,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    });
};

// Hook specifically for user subscriptions
export const useUserSubscriptions = () => {
    const { data, isLoading, error, refetch } = useUser();

    return {
        data: data?.subscriptions || [],
        isLoading,
        error,
        refetch,
    };
};

// Utility function to transform API data to match your current component structure
export const transformSubscriptionData = (apiData: UserSubscription[]) => {
    return apiData.map((subscription) => ({
        id: subscription.id,
        vendor: subscription.name,
        price: 0, // You'll need to get this from another endpoint or include in API
        duration: `${subscription.duration} days`,
        startDate: subscription.start_date,
        endDate: calculateEndDate(subscription.start_date, subscription.duration),
        status: 'Active', // You might want to calculate this based on dates
        mealsLeft: 0, // You'll need to get this from another endpoint or include in API
    }));
};

// Helper function to calculate end date
const calculateEndDate = (startDate: string, duration: number): string => {
    const start = new Date(startDate);
    const end = new Date(start.getTime() + duration * 24 * 60 * 60 * 1000);
    return end.toISOString().split('T')[0];
};

// Usage example for your component
export const useTransformedUserSubscriptions = () => {
    const { data, isLoading, error, refetch } = useUserSubscriptions();
    const transformedData = data ? transformSubscriptionData(data) : [];

    return {
        subscriptions: transformedData,
        isLoading,
        error,
        refetch,
    };
};

// Bonus: Hook to get user info without subscriptions
export const useUserInfo = () => {
    const { data, isLoading, error, refetch } = useUser();

    return {
        user: data ? {
            id: data.id,
            name: data.name,
            phone_number: data.phone_number,
            email: data.email,
        } : null,
        isLoading,
        error,
        refetch,
    };
};