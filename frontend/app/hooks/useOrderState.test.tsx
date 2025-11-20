// app/hooks/useOrderState.test.tsx

// ==========================================================
// 1. TESTING LIBRARY IMPORTS
// ==========================================================
import { renderHook, act } from '@testing-library/react';

// ==========================================================
// 2. SPY VARIABLES THAT ARE SAFE FROM HOISTING
// (Define BEFORE jest.mock AND use getters inside mock)
// ==========================================================
const mockToastError = jest.fn();
const mockToastSuccess = jest.fn();

// ==========================================================
// 3. JEST MOCKS
// ==========================================================

// Mock useOrder BEFORE the hook is imported
jest.mock('./useOrder');

// Mock sonner with safe getters (prevents TDZ)
jest.mock('sonner', () => ({
  toast: {
    get error() {
      return mockToastError;
    },
    get success() {
      return mockToastSuccess;
    },
  },
}));

// ==========================================================
// 4. IMPORT MODULE UNDER TEST
// (AFTER the mocks above)
// ==========================================================
import { useOrderState } from './useOrderState';
import { useCreateOrder } from './useOrder';

// ==========================================================
// 5. MOCK HOOK
// ==========================================================
const mockUseCreateOrder = useCreateOrder as jest.Mock;

// ==========================================================
// 6. FIXTURE DATA
// ==========================================================
const mockFood = {
  id: 'm1',
  name: 'Pizza',
  available: true,
  price: 100,
  vendorId: 'v1',
  image: '/test-pizza.jpg',
  description: 'Delicious pepperoni pizza.',
  vendorName: 'Vendor A',
  rating: 4.5,
  category: 'Fast Food',
  preparationTime: '20 minutes',
};

// ==========================================================
// 7. TESTS
// ==========================================================
describe('useOrderState Integration with API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --------------------------------------------------------

  test('transitions correctly on successful order placement and resets state', async () => {
    const mutateAsyncMock = jest.fn().mockResolvedValue({
      success: true,
      message: 'Order created',
      order_id: 'o123',
    });

    mockUseCreateOrder.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    });

    const { result } = renderHook(() => useOrderState('user1'));

    // Select food
    act(() => {
      result.current.handleFoodClick(mockFood);
    });

    expect(result.current.selectedFood?.name).toBe('Pizza');
    expect(result.current.isDetailsOpen).toBe(true);

    // Place order
    await act(async () => {
      await result.current.handleOrderNow();
    });

    // API call assertion
    expect(mutateAsyncMock).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user1',
        menu_id: 'm1',
        quantity: 1,
        unit_price: 100,
      })
    );

    // State reset assertion
    expect(result.current.selectedFood).toBeNull();
    expect(result.current.isDetailsOpen).toBe(false);
    expect(result.current.quantity).toBe(1);

    // Toast success
    expect(mockToastSuccess).not.toHaveBeenCalled();

  });

  // --------------------------------------------------------

  test('reverts state and shows error on order failure', async () => {
    const errorMessage = 'Network failed';
    const mutateAsyncMock = jest.fn().mockRejectedValue(new Error(errorMessage));

    mockUseCreateOrder.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    });

    const { result } = renderHook(() => useOrderState('user1'));

    // Select food
    act(() => {
      result.current.handleFoodClick(mockFood);
    });

    // Try order
    await act(async () => {
      await result.current.handleOrderNow();
    });

    // State should NOT reset — modal still open
    expect(result.current.selectedFood).not.toBeNull();
    expect(result.current.isDetailsOpen).toBe(true);

    // Toast error
    expect(mockToastError).toHaveBeenCalledWith(
      'Order Failed',
      expect.objectContaining({ description: errorMessage })
    );
  });
});
