// app/utils/orderState.ts

import { MenuItem } from '@/app/hooks/allmenu';
import { OrderRequest } from '@/app/hooks/useOrder';

/**
 * Order State Interface
 * All concrete states must implement these methods
 */
export interface OrderState {
  getStateName(): string;
  
  // User actions
  selectFood(context: OrderContext, food: MenuItem): void;
  updateQuantity(context: OrderContext, quantity: number): void;
  selectPickupPoint(context: OrderContext, pickupPoint: string): void;
  addToCart(context: OrderContext): void;
  placeOrder(context: OrderContext): Promise<void>;
  closeModal(context: OrderContext): void;
  
  // State validations
  canModifyOrder(): boolean;
  canPlaceOrder(): boolean;
}

/**
 * Order Context
 * Maintains current state and order data
 */
export class OrderContext {
  private state: OrderState;
  private selectedFood: MenuItem | null = null;
  private quantity: number = 1;
  private pickupPoint: string = 'Main Campus Cafeteria';
  private userId: string | null = null;
  private isModalOpen: boolean = false;
  
  // Callbacks for UI updates
  private onStateChange?: (stateName: string) => void;
  private onModalChange?: (isOpen: boolean) => void;
  private onOrderSuccess?: () => void;
  private onOrderError?: (error: string) => void;
  private onOrderSubmit?: (orderData: OrderRequest) => Promise<void>;
  private onAddToCart?: (food: MenuItem, quantity: number) => void;

  constructor(initialState: OrderState) {
    this.state = initialState;
  }

  // State management
  setState(state: OrderState): void {
    console.log(`State transition: ${this.state.getStateName()} -> ${state.getStateName()}`);
    this.state = state;
    this.onStateChange?.(state.getStateName());
  }

  getState(): OrderState {
    return this.state;
  }

  getStateName(): string {
    return this.state.getStateName();
  }

  // Delegate actions to current state
  selectFood(food: MenuItem): void {
    this.state.selectFood(this, food);
  }

  updateQuantity(quantity: number): void {
    this.state.updateQuantity(this, quantity);
  }

  selectPickupPoint(pickupPoint: string): void {
    this.state.selectPickupPoint(this, pickupPoint);
  }

  addToCart(): void {
    this.state.addToCart(this);
  }

  async placeOrder(): Promise<void> {
    await this.state.placeOrder(this);
  }

  closeModal(): void {
    this.state.closeModal(this);
  }

  // Getters and setters for order data
  setSelectedFood(food: MenuItem | null): void {
    this.selectedFood = food;
  }

  getSelectedFood(): MenuItem | null {
    return this.selectedFood;
  }

  setQuantity(quantity: number): void {
    this.quantity = Math.max(1, quantity);
  }

  getQuantity(): number {
    return this.quantity;
  }

  setPickupPoint(point: string): void {
    this.pickupPoint = point;
  }

  getPickupPoint(): string {
    return this.pickupPoint;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  getUserId(): string | null {
    return this.userId;
  }

  setModalOpen(isOpen: boolean): void {
    this.isModalOpen = isOpen;
    this.onModalChange?.(isOpen);
  }

  getModalOpen(): boolean {
    return this.isModalOpen;
  }

  getTotalPrice(): number {
    return this.selectedFood ? this.selectedFood.price * this.quantity : 0;
  }

  // Callback setters
  setOnStateChange(callback: (stateName: string) => void): void {
    this.onStateChange = callback;
  }

  setOnModalChange(callback: (isOpen: boolean) => void): void {
    this.onModalChange = callback;
  }

  setOnOrderSuccess(callback: () => void): void {
    this.onOrderSuccess = callback;
  }

  setOnOrderError(callback: (error: string) => void): void {
    this.onOrderError = callback;
  }

  setOnOrderSubmit(callback: (orderData: OrderRequest) => Promise<void>): void {
    this.onOrderSubmit = callback;
  }

  setOnAddToCart(callback: (food: MenuItem, quantity: number) => void): void {
    this.onAddToCart = callback;
  }

  // Utility methods for callbacks
  notifyOrderSuccess(): void {
    this.onOrderSuccess?.();
  }

  notifyOrderError(error: string): void {
    this.onOrderError?.(error);
  }

  notifyAddToCart(): void {
    if (this.selectedFood) {
      this.onAddToCart?.(this.selectedFood, this.quantity);
    }
  }

  async submitOrder(): Promise<void> {
    if (!this.onOrderSubmit) {
      throw new Error('Order submit callback not set');
    }
    
    if (!this.selectedFood || !this.userId) {
      throw new Error('Missing required order data');
    }

    if (!this.selectedFood.vendorId) {
      throw new Error('Missing vendor information');
    }

    const orderData: OrderRequest = {
      user_id: this.userId,
      vendor_id: this.selectedFood.vendorId,
      menu_id: this.selectedFood.id,
      quantity: this.quantity,
      unit_price: this.selectedFood.price,
      pickup: this.pickupPoint,
    };

    await this.onOrderSubmit(orderData);
  }

  // Reset order
  reset(): void {
    this.selectedFood = null;
    this.quantity = 1;
    this.isModalOpen = false;
  }
}

/**
 * Concrete State: Idle State
 * No food is selected, modal is closed
 */
export class IdleState implements OrderState {
  getStateName(): string {
    return 'IDLE';
  }

  selectFood(context: OrderContext, food: MenuItem): void {
    if (!food.available) {
      context.notifyOrderError('This item is currently unavailable');
      return;
    }
    
    context.setSelectedFood(food);
    context.setQuantity(1);
    context.setModalOpen(true);
    context.setState(new ConfiguringState());
  }

  updateQuantity(): void {
    // No-op
  }

  selectPickupPoint(): void {
    // No-op
  }

  addToCart(): void {
    // No-op
  }

  async placeOrder(): Promise<void> {
    // No-op
  }

  closeModal(): void {
    // No-op: Already closed
  }

  canModifyOrder(): boolean {
    return false;
  }

  canPlaceOrder(): boolean {
    return false;
  }
}

/**
 * Concrete State: Configuring State
 * User is selecting quantity and pickup point
 */
export class ConfiguringState implements OrderState {
  getStateName(): string {
    return 'CONFIGURING';
  }

  selectFood(context: OrderContext, food: MenuItem): void {
    // Allow changing food while configuring
    if (!food.available) {
      context.notifyOrderError('This item is currently unavailable');
      return;
    }
    
    context.setSelectedFood(food);
    context.setQuantity(1);
  }

  updateQuantity(context: OrderContext, quantity: number): void {
    context.setQuantity(quantity);
  }

  selectPickupPoint(context: OrderContext, pickupPoint: string): void {
    context.setPickupPoint(pickupPoint);
  }

  addToCart(context: OrderContext): void {
    context.notifyAddToCart();
    context.setModalOpen(false);
    context.setState(new IdleState());
    context.reset();
  }

  async placeOrder(context: OrderContext): Promise<void> {
    if (!context.getUserId()) {
      context.notifyOrderError('Please log in to place an order');
      return;
    }

    const food = context.getSelectedFood();
    if (!food || food.price <= 0) {
      context.notifyOrderError('Cannot order this item');
      return;
    }

    // Transition to processing state
    context.setState(new ProcessingState());
    
    try {
      await context.submitOrder();
      context.setState(new CompletedState());
      context.notifyOrderSuccess();
    } catch (error) {
      context.setState(new ConfiguringState());
      context.notifyOrderError(error instanceof Error ? error.message : 'Order failed');
    }
  }

  closeModal(context: OrderContext): void {
    context.setModalOpen(false);
    context.setState(new IdleState());
    context.reset();
  }

  canModifyOrder(): boolean {
    return true;
  }

  canPlaceOrder(): boolean {
    return true;
  }
}

/**
 * Concrete State: Processing State
 * Order is being submitted to backend
 */
export class ProcessingState implements OrderState {
  getStateName(): string {
    return 'PROCESSING';
  }

  selectFood(): void {
    // No-op: Cannot change while processing
  }

  updateQuantity(): void {
    // No-op: Cannot modify while processing
  }

  selectPickupPoint(): void {
    // No-op: Cannot modify while processing
  }

  addToCart(): void {
    // No-op: Cannot add to cart while processing
  }

  async placeOrder(): Promise<void> {
    // Already processing
  }

  closeModal(): void {
    // Cannot close while processing
  }

  canModifyOrder(): boolean {
    return false;
  }

  canPlaceOrder(): boolean {
    return false;
  }
}

/**
 * Concrete State: Completed State
 * Order has been successfully placed
 */
export class CompletedState implements OrderState {
  getStateName(): string {
    return 'COMPLETED';
  }

  selectFood(context: OrderContext, food: MenuItem): void {
    // Start new order
    context.setModalOpen(false);
    context.reset();
    context.setState(new IdleState());
    context.selectFood(food);
  }

  updateQuantity(): void {
    // No-op: Order completed
  }

  selectPickupPoint(): void {
    // No-op: Order completed
  }

  addToCart(): void {
    // No-op: Order completed
  }

  async placeOrder(): Promise<void> {
    // No-op: Already completed
  }

  closeModal(context: OrderContext): void {
    context.setModalOpen(false);
    context.setState(new IdleState());
    context.reset();
  }

  canModifyOrder(): boolean {
    return false;
  }

  canPlaceOrder(): boolean {
    return false;
  }
}

/**
 * Factory function to create order context
 */
export function createOrderContext(): OrderContext {
  return new OrderContext(new IdleState());
}