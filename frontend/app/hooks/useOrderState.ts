// app/hooks/useOrderState.ts

import { useState, useEffect, useCallback, useRef } from 'react';
import { OrderContext, createOrderContext } from '@/app/utils/OrderState';
import { MenuItem } from '@/app/hooks/allmenu';
import { useCreateOrder, OrderRequest } from '@/app/hooks/useOrder';
import { toast } from 'sonner';

/**
 * Hook to manage order state using the State pattern
 * Replicates the exact behavior of the original code
 */
export function useOrderState(userId: string | null) {
  // Create order context (persists across renders)
  const contextRef = useRef<OrderContext>(createOrderContext());
  const context = contextRef.current;
  
  // Local state for UI synchronization
  const [selectedFood, setSelectedFood] = useState<MenuItem | null>(null);
  const [quantity, setQuantityState] = useState(1);
  const [pickupPoint, setPickupPointState] = useState('Main Campus Cafeteria');
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Order mutation from your existing hook
  const createOrderMutation = useCreateOrder();

  // Set up context on mount
  useEffect(() => {
    if (userId) {
      context.setUserId(userId);
    }

    // Sync modal state with context
    context.setOnModalChange((isOpen: boolean | ((prevState: boolean) => boolean)) => {
      setIsDetailsOpen(isOpen);
    });

    // Handle order success
    context.setOnOrderSuccess(() => {
      // Reset UI state
      setSelectedFood(null);
      setQuantityState(1);
      setPickupPointState('Main Campus Cafeteria');
      setIsDetailsOpen(false);
    });

    // Handle order error
    context.setOnOrderError((error) => {
      toast.error('Order Failed', {
        description: error,
      });
    });

    // Handle order submission
    context.setOnOrderSubmit(async (orderData: OrderRequest) => {
      await createOrderMutation.mutateAsync(orderData);
    });

    // Handle add to cart
    context.setOnAddToCart((food, qty) => {
      toast.success('Added to Cart', {
        description: `${qty}x ${food.name} added to your cart`,
      });
    });
  }, [userId, context, createOrderMutation]);

  // Action: Handle food click (opens modal)
  const handleFoodClick = useCallback((food: MenuItem) => {
    context.selectFood(food);
    setSelectedFood(food);
    setQuantityState(1);
  }, [context]);

  // Action: Update quantity
  const handleQuantityChange = useCallback((newQuantity: number) => {
    context.updateQuantity(newQuantity);
    setQuantityState(context.getQuantity());
  }, [context]);

  // Action: Select pickup point
  const handlePickupPointChange = useCallback((point: string) => {
    context.selectPickupPoint(point);
    setPickupPointState(point);
  }, [context]);

  // Action: Add to cart
  const handleAddToCart = useCallback(() => {
    context.addToCart();
  }, [context]);

  // Action: Place order
  const handleOrderNow = useCallback(async () => {
    await context.placeOrder();
  }, [context]);

  // Action: Close modal
  const handleCloseModal = useCallback((open: boolean) => {
    if (!open) {
      context.closeModal();
      setSelectedFood(null);
      setQuantityState(1);
      setPickupPointState('Main Campus Cafeteria');
    }
  }, [context]);

  // Calculate total price
  const totalPrice = selectedFood ? (selectedFood.price * quantity) : 0;

  // Get state info
  const canModifyOrder = context.getState().canModifyOrder();
  const isProcessing = context.getStateName() === 'PROCESSING';

  return {
    // State data
    selectedFood,
    quantity,
    pickupPoint,
    isDetailsOpen,
    totalPrice,
    
    // State flags
    canModifyOrder,
    isProcessing: isProcessing || createOrderMutation.isPending,
    
    // Actions (exact same interface as original)
    handleFoodClick,
    setQuantity: handleQuantityChange,
    setPickupPoint: handlePickupPointChange,
    handleAddToCart,
    handleOrderNow,
    setIsDetailsOpen: handleCloseModal,
  };
}