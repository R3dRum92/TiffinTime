"use client"

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, MapPin, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { toast } from "sonner";
import { useCart } from '@/app/context/CartContext';
import { useUserInfo } from '@/app/hooks/getUserDetails';
import { useCreateOrder } from '@/app/hooks/useOrder';
import { useMutation } from '@tanstack/react-query';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

// --- Type Definitions ---
interface PaymentPayload {
    order_ids: string[];
    total_amount: number;
    tran_id: string;
    cus_add1: string;
    cus_city: string;
    num_of_item: number;
    product_name: string;
    product_category: string;
}

interface OrderResponse {
    order_id: string;
    [key: string]: unknown; // Allow other properties but ensure order_id is present
}

// --- Payment Hook ---
const useInitPayment = () => {
    return useMutation({
        // Fix 1: Replaced 'any' with 'PaymentPayload' interface
        mutationFn: async (paymentData: PaymentPayload) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/payment/init`, paymentData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                }
            });
            return response.data;
        }
    });
};

export default function CartPage() {
    const { cartItems, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
    const { user, isLoading: userLoading } = useUserInfo();
    const createOrderMutation = useCreateOrder();
    const initPaymentMutation = useInitPayment();

    const [pickupPoint, setPickupPoint] = useState('Main Campus Cafeteria');
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const pickupPoints = [
        'Main Campus Cafeteria',
        'VC Chattor',
        'Mokarrum Bhavan',
        'Central Library',
        'TSC'
    ];

    const handleCheckout = async () => {
        if (!user) {
            toast.error("Please login to checkout");
            return;
        }

        setIsCheckingOut(true);
        const transactionId = uuidv4();

        try {
            const orderPromises = cartItems.map(item => {
                return createOrderMutation.mutateAsync({
                    user_id: user.id,
                    vendor_id: item.vendorId,
                    menu_id: item.id,
                    quantity: item.quantity,
                    unit_price: item.price,
                    pickup: pickupPoint
                });
            });

            // Wait for all orders to be created
            // We cast the result to unknown first if the mutation type isn't generic, 
            // but mapping over the result with a specific type is safer.
            const createdOrders = await Promise.all(orderPromises);

            // Fix 2: Replaced 'any' with 'OrderResponse' (or a shape matching your API return)
            const orderIds = createdOrders.map((order: unknown) => (order as OrderResponse).order_id);

            const paymentPayload: PaymentPayload = {
                order_ids: orderIds,
                total_amount: cartTotal,
                tran_id: transactionId,
                cus_add1: pickupPoint,
                cus_city: "Dhaka",
                num_of_item: cartItems.length,
                product_name: cartItems.map(item => item.name).join(', ').substring(0, 250),
                product_category: "Food"
            };

            const paymentResponse = await initPaymentMutation.mutateAsync(paymentPayload);

            if (paymentResponse?.status === 'SUCCESS' && paymentResponse?.GatewayPageURL) {
                toast.success("Redirecting to payment gateway...");
                window.location.href = paymentResponse.GatewayPageURL;
            } else {
                throw new Error("Failed to get payment gateway URL");
            }

        } catch (error) {
            console.error("Checkout failed", error);
            toast.error("Failed to initiate payment", {
                description: "Please try again or contact support."
            });
            setIsCheckingOut(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 space-y-6" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
                <div className="p-6 bg-white rounded-full shadow-lg">
                    <ShoppingBag className="h-16 w-16" style={{ color: '#D98324' }} />
                </div>
                <h2 className="text-2xl font-bold" style={{ color: '#443627' }}>Your Cart is Empty</h2>
                {/* Fix 3: Escaped the apostrophe in "haven't" */}
                <p style={{ color: '#a0896b' }}>Looks like you haven&apos;t added any delicious food yet.</p>
                <Link href="/food">
                    <Button className="mt-4" style={{ backgroundColor: '#D98324' }}>
                        Browse Menu
                    </Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-4 md:p-8" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/food">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-6 w-6" style={{ color: '#443627' }} />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold" style={{ color: '#443627' }}>Shopping Cart</h1>
                    <span className="ml-auto text-sm font-medium" style={{ color: '#a0896b' }}>
                        {cartItems.length} Items
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items List */}
                    <div className="lg:col-span-2 space-y-4">
                        {cartItems.map((item) => (
                            <Card key={item.id} className="border-0 shadow-md hover:shadow-lg transition-shadow overflow-hidden">
                                <CardContent className="p-0 flex flex-col sm:flex-row">
                                    <div className="relative w-full sm:w-32 h-32 bg-gray-100 shrink-0">
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 p-4 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg" style={{ color: '#443627' }}>{item.name}</h3>
                                                <p className="text-sm" style={{ color: '#a0896b' }}>{item.vendorName}</p>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeFromCart(item.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <div className="flex justify-between items-end mt-4">
                                            <div className="flex items-center border rounded-md bg-white">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2"
                                                    onClick={() => updateQuantity(item.id, -1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2"
                                                    onClick={() => updateQuantity(item.id, 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-xs text-gray-500">Unit: ৳{item.price}</p>
                                                <p className="font-bold text-lg" style={{ color: '#D98324' }}>
                                                    ৳{(item.price * item.quantity).toFixed(2)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="border-0 shadow-lg sticky top-6">
                            <CardContent className="p-6 space-y-6">
                                <h2 className="text-xl font-bold" style={{ color: '#443627' }}>Order Summary</h2>
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold flex items-center gap-2" style={{ color: '#443627' }}>
                                        <MapPin className="h-4 w-4" />
                                        Pickup Point
                                    </label>
                                    <Select value={pickupPoint} onValueChange={setPickupPoint}>
                                        <SelectTrigger className="w-full bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {pickupPoints.map((point) => (
                                                <SelectItem key={point} value={point}>{point}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: '#a0896b' }}>Subtotal</span>
                                        <span className="font-medium">৳{cartTotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span style={{ color: '#a0896b' }}>Service Fee</span>
                                        <span className="font-medium">৳0.00</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between text-lg font-bold" style={{ color: '#443627' }}>
                                        <span>Total</span>
                                        <span style={{ color: '#D98324' }}>৳{cartTotal.toFixed(2)}</span>
                                    </div>
                                </div>
                                <Button
                                    className="w-full h-12 text-lg font-semibold transition-all hover:brightness-110"
                                    style={{ backgroundColor: '#D98324' }}
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut || userLoading}
                                >
                                    {isCheckingOut ? (
                                        <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="h-5 w-5 mr-2" />
                                            Pay Now
                                        </>
                                    )}
                                </Button>
                                {!user && !userLoading && (
                                    <p className="text-xs text-center text-red-500">
                                        Please log in to complete your order
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}