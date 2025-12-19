"use client"

import React, { useEffect, Suspense, useRef } from 'react'; // <--- Import useRef
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, AlertCircle, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCart } from '@/app/context/CartContext';

function PaymentStatusContent() {
    const searchParams = useSearchParams();
    const { clearCart } = useCart();

    // Track if we have already cleared the cart to prevent infinite loops
    const hasClearedCart = useRef(false);

    const status = searchParams.get('status');
    const tranId = searchParams.get('tran_id');

    // Automatically clear cart on success
    useEffect(() => {
        // Only run if success AND we haven't cleared it yet
        if (status === 'success' && !hasClearedCart.current) {
            clearCart();
            hasClearedCart.current = true; // Mark as done
        }
    }, [status, clearCart]);

    const renderContent = () => {
        switch (status) {
            case 'success':
                return {
                    icon: <CheckCircle2 className="h-24 w-24 text-orange-400 mb-4" />,
                    title: "Payment Successful!",
                    description: "Your order has been placed successfully. The vendor has been notified.",
                    color: "text-orange-400",
                    action: (
                        <Link href="/my-plan">
                            <Button className="w-full bg-orange-400 hover:bg-orange-700">
                                View My Plan <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </Link>
                    )
                };
            case 'fail':
                return {
                    icon: <XCircle className="h-24 w-24 text-red-500 mb-4" />,
                    title: "Payment Failed",
                    description: "We couldn't process your payment. Please try again.",
                    color: "text-red-600",
                    action: (
                        <Link href="/cart">
                            <Button className="w-full bg-red-600 hover:bg-red-700">
                                Try Again
                            </Button>
                        </Link>
                    )
                };
            case 'cancel':
                return {
                    icon: <AlertCircle className="h-24 w-24 text-yellow-500 mb-4" />,
                    title: "Payment Cancelled",
                    description: "You cancelled the payment process.",
                    color: "text-yellow-600",
                    action: (
                        <Link href="/cart">
                            <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                                Return to Cart
                            </Button>
                        </Link>
                    )
                };
            default:
                return {
                    icon: <AlertCircle className="h-24 w-24 text-gray-400 mb-4" />,
                    title: "Something went wrong",
                    description: "We aren't sure what happened. Please check your order status.",
                    color: "text-gray-600",
                    action: (
                        <Link href="/food">
                            <Button variant="outline" className="w-full">
                                Return Home
                            </Button>
                        </Link>
                    )
                };
        }
    };

    const content = renderContent();

    return (
        <Card className="max-w-md w-full shadow-xl border-0">
            <CardContent className="pt-10 pb-10 px-6 flex flex-col items-center text-center">
                <div className="animate-in zoom-in duration-500">
                    {content.icon}
                </div>

                <h1 className={`text-2xl font-bold mb-2 ${content.color}`}>
                    {content.title}
                </h1>

                <p className="text-gray-600 mb-6">
                    {content.description}
                </p>

                {tranId && (
                    <div className="bg-gray-100 rounded-lg p-3 mb-6 w-full">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Transaction ID</p>
                        <p className="text-sm font-mono text-gray-800 break-all">{tranId}</p>
                    </div>
                )}

                <div className="w-full space-y-3">
                    {content.action}

                    {status === 'success' && (
                        <Link href="/food">
                            <Button variant="outline" className="w-full">
                                Back
                            </Button>
                        </Link>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

export default function PaymentStatusPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#D98324 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />
            <Suspense fallback={<div className="text-[#D98324]">Loading status...</div>}>
                <PaymentStatusContent />
            </Suspense>
        </div>
    );
}