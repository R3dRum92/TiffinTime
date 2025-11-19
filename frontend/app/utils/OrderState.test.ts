// app/utils/OrderState.test.ts

import { createOrderContext, IdleState } from './OrderState';

// Assuming you have a basic MenuItem structure
const mockAvailableFood = { 
  id: 'f1', 
  name: 'Burger', 
  available: true, 
  price: 10, 
  vendorId: 'v1',
  // Include all mandatory properties from your MenuItem interface
  image: '/test-image.jpg',
  description: 'Test food item',
  vendorName: 'Test Vendor',
  // Add optional ones if needed for the test scenario
  rating: 4.5, 
  preparationTime: '10 min',
  category: 'Snacks',
};

describe('OrderContext State Transitions', () => {
  // ... rest of your tests ...
});

describe('OrderContext State Transitions', () => {
  let context: ReturnType<typeof createOrderContext>;

  beforeEach(() => {
    // Start with a fresh context for each test
    context = createOrderContext(); 
  });

  test('Starts in IDLE state with default values', () => {
    expect(context.getStateName()).toBe('IDLE');
    expect(context.getSelectedFood()).toBeNull();
    expect(context.getQuantity()).toBe(1);
    expect(context.getModalOpen()).toBe(false);
  });

  test('Transitions from IDLE to CONFIGURING upon selecting an available food item', () => {
    context.selectFood(mockAvailableFood);

    // 1. Assert State Change
    expect(context.getStateName()).toBe('CONFIGURING');
    
    // 2. Assert Data Update
    expect(context.getSelectedFood()).toEqual(mockAvailableFood);
    
    // 3. Assert UI Sync
    expect(context.getModalOpen()).toBe(true);
  });
  
  test('Returns to IDLE state when closing modal from CONFIGURING', () => {
    // First, transition to CONFIGURING
    context.selectFood(mockAvailableFood);
    
    // Action: Close Modal
    context.closeModal();

    // Assert the reset and transition
    expect(context.getStateName()).toBe('IDLE');
    expect(context.getSelectedFood()).toBeNull();
    expect(context.getModalOpen()).toBe(false);
  });

  // TODO: Add tests for ConfiguringState, ProcessingState, etc.
});