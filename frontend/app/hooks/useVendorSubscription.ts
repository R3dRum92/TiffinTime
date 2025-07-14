import { useMutation } from '@tanstack/react-query';

interface SubscribeToVendorPayload {
    vendor_id: string;
    type: string;
}

interface SubscribeToVendorResponse {
    message: string;
}

const subscribeToVendor = async (payload: SubscribeToVendorPayload): Promise<SubscribeToVendorResponse> => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribe/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Failed to subscribe to vendor');
    }

    return response.json();
};

export const useVendorSubscription = () => {
    const mutation = useMutation({
        mutationFn: subscribeToVendor,
        onSuccess: (data) => {
            console.log('Subscription successful:', data.message);
        },
        onError: (error) => {
            console.error('Subscription failed:', error.message);
        }
    });

    const subscribe = async (vendorId: string, type: string) => {
        return mutation.mutateAsync({
            vendor_id: vendorId,
            type: type
        });
    };

    return {
        subscribe,
        isLoading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        data: mutation.data,
        reset: mutation.reset,
        mutate: mutation.mutate,
        mutateAsync: mutation.mutateAsync
    };
};

// Alternative hook if you prefer a more specific function
export const useSubscribeToVendor = () => {
    const mutation = useMutation({
        mutationFn: subscribeToVendor,
    });

    const subscribe = async (vendorId: string, type: string) => {
        return mutation.mutateAsync({
            vendor_id: vendorId,
            type: type
        });
    };

    return {
        subscribe,
        isLoading: mutation.isPending,
        error: mutation.error,
        isSuccess: mutation.isSuccess,
        data: mutation.data,
        reset: mutation.reset
    };
};