import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface OrderRequest {
  user_id: string;
  vendor_id: string;
  menu_id: string;
  quantity: number;
  unit_price: number;
  pickup: string;
}

export interface OrderResponse {
  id: string;
  user_id: string;
  vendor_id: string;
  menu_id: string;
  order_date: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  pickup: string;
  is_delivered: boolean;
}

export interface OrderCreateResponse {
  success: boolean;
  message: string;
  order_id: string;
}

export interface OrderStatusUpdate {
  is_delivered: boolean;
}

// Create order mutation
export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderData: OrderRequest): Promise<OrderCreateResponse> => {
      const response = await fetch(`${API_BASE_URL}/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create order');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch user orders
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
      
      toast.success('Order Placed Successfully!', {
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast.error('Order Failed', {
        description: error.message || 'Failed to place order. Please try again.',
      });
    },
  });
};

// Get user orders query
export const useUserOrders = (userId: string | null) => {
  return useQuery({
    queryKey: ['userOrders', userId],
    queryFn: async (): Promise<OrderResponse[]> => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`, {
        headers: {
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch orders');
      }

      return response.json();
    },
    enabled: !!userId, // Only run query if userId exists
  });
};

// Get vendor orders query
export const useVendorOrders = (vendorId: string | null, delivered?: boolean) => {
  return useQuery({
    queryKey: ['vendorOrders', vendorId, delivered],
    queryFn: async (): Promise<OrderResponse[]> => {
      if (!vendorId) {
        throw new Error('Vendor ID is required');
      }

      let url = `${API_BASE_URL}/orders/vendor/${vendorId}`;
      if (delivered !== undefined) {
        url += `?delivered=${delivered}`;
      }

      const response = await fetch(url, {
        headers: {
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch vendor orders');
      }

      return response.json();
    },
    enabled: !!vendorId,
  });
};

// Update order status mutation
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      statusUpdate 
    }: { 
      orderId: string; 
      statusUpdate: OrderStatusUpdate 
    }): Promise<{ message: string }> => {
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(statusUpdate),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update order status');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch orders
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
      queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
      
      toast.success('Order Status Updated', {
        description: data.message,
      });
    },
    onError: (error: Error) => {
      toast.error('Update Failed', {
        description: error.message || 'Failed to update order status.',
      });
    },
  });
};