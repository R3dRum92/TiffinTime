"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MapPin, Calendar, User, CreditCard, X, Edit, ShoppingBag, Clock, MapPin as LocationIcon } from 'lucide-react';
import { toast, Toaster } from "sonner"

const Index = () => {
    const [pickupPoint, setPickupPoint] = useState('Main Campus Cafeteria');
    const [isEditingPickup, setIsEditingPickup] = useState(false);

    const userData = {
        name: 'Papry Rahman',
        email: 'papryrahman@gmail.com',
        phone: '+880 1234 567890',
        studentId: 'CSE-2021-22'
    };

    const subscriptions = [
        {
            id: 1,
            vendor: 'Kashem Mama',
            plan: 'Monthly Plan',
            price: 999,
            duration: '30 days',
            startDate: '2024-06-01',
            endDate: '2024-06-30',
            status: 'Active',
            mealsLeft: 18
        }
    ];

    const singleOrders = [
        {
            id: 1,
            vendor: 'Pushti r chipa',
            items: ['Grilled Chicken', 'RC-cola'],
            price: 450,
            deliveryDate: '2024-06-29',
            status: 'Confirmed'
        },
        {
            id: 2,
            vendor: 'Modhur Cantine',
            items: ['Biryani Special', 'Raita'],
            price: 350,
            deliveryDate: '2024-06-30',
            status: 'Pending'
        }
    ];

    const pickupPoints = [
        'VC Chattor',
        'Mokarrum Bhavan',
        'Central Library',
        'TSC'
    ];

    const handleCancelOrder = (orderId: number) => {
        toast("Order Cancelled", {
            description: "Your order has been successfully cancelled.",
        });
    };

    const handleCancelSubscription = (subscriptionId: number) => {
        toast(
            "Subscription Cancelled", {
            description: "Your subscription has been cancelled. You can still use remaining meals.",
            action: {
                label: "Undo",
                onClick: () => console.log("Undo"),
            },

        });
    };

    const handlePickupPointChange = (newPoint: string) => {
        setPickupPoint(newPoint);
        setIsEditingPickup(false);
        toast("Pickup Point Updated", {
            description: `Your pickup point has been changed to ${newPoint}`,
        });
    };

    const totalBill = subscriptions.reduce((sum, sub) => sum + sub.price, 0) +
        singleOrders.reduce((sum, order) => sum + order.price, 0);

    return (
        <div className="min-h-screen relative bgtheme2" style={{ backgroundColor: 'rgb(243, 236, 217)' }}>
            {/* <div className="absolute inset-0">
                <svg
                    viewBox="0 0 1440 800"
                    className="w-full h-full"
                    preserveAspectRatio="none"
                >
                    <path
                        d="M 0 200 C 100 150 200 100 400 120 C 600 140 800 180 1000 160 C 1200 140 1300 120 1440 140 L 1440 0 L 0 0 Z"
                        fill="url(#subscriptionGradient)"
                        opacity="0.3"
                    />
                    <defs>
                        <linearGradient id="subscriptionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#D98324" />
                            <stop offset="100%" stopColor="#EFDCAB" />
                        </linearGradient>
                    </defs>
                </svg>
            </div> */}
            {/* Subtle circle pattern background */}
            <div
                className="absolute inset-0 opacity-20"
            // style={{
            //     backgroundImage: `radial-gradient(circle at 20px 20px, #D98324 2px, transparent 2px)`,
            //     backgroundSize: '40px 40px'

            // }}
            />
            {/* <div className="absolute top-30 right-10 w-32 h-32 bg-orange-200 rounded-full opacity-100"></div>
            <div className="absolute bottom-50 left-20 w-24 h-24 bg-yellow-200 rounded-full opacity-100"></div>
            <div className="absolute top-70 left-20 w-16 h-16 bg-orange-300 rounded-full opacity-100">

            </div> */}

            {/* Header */}
            <div

            />
            <div className="max-w-6xl mx-auto relative z-10">
                <div className="text-center ">

                </div>
            </div>


            <div className="max-w-6xl mx-auto p-6 space-y-20 relative z-10">
                {/* Hero Section */}
                <div className="text-center pt-20">
                    <h2 className="text-3xl font-bold mb-4 theme">
                        Welcome back, {userData.name}!
                    </h2>
                    <p className="text-xl" style={{ color: '#a0896b' }}>
                        Manage your orders, subscriptions, and preferences all in one place
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="shadow-lg border-0 relative overflow-hidden">
                        <div
                            className="absolute inset-0 opacity-5"
                            style={{
                                backgroundImage: `radial-gradient(circle at 10px 10px, #D98324 1px, transparent 1px)`,
                                backgroundSize: '20px 20px'
                            }}
                        />
                        <CardContent className="p-6 text-center relative z-10">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EFDCAB' }}>
                                <ShoppingBag className="h-8 w-8" style={{ color: '#D98324' }} />
                            </div>
                            <h3 className="font-bold text-lg mb-2" style={{ color: '#443627' }}>
                                Active Subscriptions
                            </h3>
                            <p className="text-2xl font-bold" style={{ color: '#D98324' }}>{subscriptions.length}</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 relative overflow-hidden">
                        <div
                            className="absolute inset-0 opacity-5"
                            style={{
                                backgroundImage: `radial-gradient(circle at 10px 10px, #D98324 1px, transparent 1px)`,
                                backgroundSize: '20px 20px'
                            }}
                        />
                        <CardContent className="p-6 text-center relative z-10">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EFDCAB' }}>
                                <Clock className="h-8 w-8" style={{ color: '#D98324' }} />
                            </div>
                            <h3 className="font-bold text-lg mb-2" style={{ color: '#443627' }}>
                                Upcoming Orders
                            </h3>
                            <p className="text-2xl font-bold" style={{ color: '#D98324' }}>{singleOrders.length}</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 relative overflow-hidden">
                        <div
                            className="absolute inset-0 opacity-5"
                            style={{
                                backgroundImage: `radial-gradient(circle at 10px 10px, #D98324 1px, transparent 1px)`,
                                backgroundSize: '20px 20px'
                            }}
                        />
                        <CardContent className="p-6 text-center relative z-10">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EFDCAB' }}>
                                <LocationIcon className="h-8 w-8" style={{ color: '#D98324' }} />
                            </div>
                            <h3 className="font-bold text-lg mb-2" style={{ color: '#443627' }}>
                                Pickup Point
                            </h3>
                            <p className="text-sm font-medium" style={{ color: '#D98324' }}>{pickupPoint}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* User Profile Section */}
                <Card className="shadow-lg border-0 relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `radial-gradient(circle at 12px 12px, #D98324 1px, transparent 1px)`,
                            backgroundSize: '24px 24px'
                        }}
                    />
                    <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="flex items-center gap-2" style={{ color: '#443627' }}>
                            <User className="h-5 w-5" />
                            My Profile
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm" style={{ color: '#a0896b' }}>Full Name</p>
                                <p className="font-semibold" style={{ color: '#443627' }}>{userData.name}</p>
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#a0896b' }}>Student ID</p>
                                <p className="font-semibold" style={{ color: '#443627' }}>{userData.studentId}</p>
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#a0896b' }}>Email</p>
                                <p className="font-semibold" style={{ color: '#443627' }}>{userData.email}</p>
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#a0896b' }}>Phone</p>
                                <p className="font-semibold" style={{ color: '#443627' }}>{userData.phone}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pickup Point Section */}
                <Card className="shadow-lg border-0 relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `radial-gradient(circle at 12px 12px, #D98324 1px, transparent 1px)`,
                            backgroundSize: '24px 24px'
                        }}
                    />
                    <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="flex items-center gap-2" style={{ color: '#443627' }}>
                            <MapPin className="h-5 w-5" />
                            Pickup Point
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-lg" style={{ color: '#443627' }}>{pickupPoint}</p>
                                <p className="text-sm" style={{ color: '#a0896b' }}>All your orders will be delivered here</p>
                            </div>
                            <Dialog open={isEditingPickup} onOpenChange={setIsEditingPickup}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Edit className="h-4 w-4" />
                                        Change
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Change Pickup Point</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                        <Select onValueChange={handlePickupPointChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a pickup point" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {pickupPoints.map((point) => (
                                                    <SelectItem key={point} value={point}>
                                                        {point}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Subscriptions */}
                <Card className="shadow-lg border-0 relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `radial-gradient(circle at 12px 12px, #D98324 1px, transparent 1px)`,
                            backgroundSize: '24px 24px'
                        }}
                    />
                    <CardHeader className="pb-4 relative z-10">
                        <CardTitle style={{ color: '#443627' }}>Active Subscriptions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        {subscriptions.length > 0 ? (
                            subscriptions.map((subscription) => (
                                <div key={subscription.id} className="p-4 rounded-lg border relative overflow-hidden" style={{ backgroundColor: '#f8f6f3' }}>
                                    <div
                                        className="absolute inset-0 opacity-10"
                                        style={{
                                            backgroundImage: `radial-gradient(circle at 8px 8px, #D98324 0.5px, transparent 0.5px)`,
                                            backgroundSize: '16px 16px'
                                        }}
                                    />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg" style={{ color: '#443627' }}>{subscription.vendor}</h3>
                                                <p style={{ color: '#a0896b' }}>{subscription.plan}</p>
                                            </div>
                                            <Badge
                                                className="px-3 py-1"
                                                style={{ backgroundColor: '#D98324', color: 'white' }}
                                            >
                                                {subscription.status}
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div>
                                                <p className="text-sm" style={{ color: '#a0896b' }}>Price</p>
                                                <p className="font-semibold" style={{ color: '#443627' }}>৳{subscription.price}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm" style={{ color: '#a0896b' }}>Duration</p>
                                                <p className="font-semibold" style={{ color: '#443627' }}>{subscription.duration}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm" style={{ color: '#a0896b' }}>Start Date</p>
                                                <p className="font-semibold" style={{ color: '#443627' }}>{subscription.startDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm" style={{ color: '#a0896b' }}>Meals Left</p>
                                                <p className="font-semibold" style={{ color: '#443627' }}>{subscription.mealsLeft}</p>
                                            </div>
                                        </div>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="destructive" size="sm" className="flex items-center gap-2">
                                                    <X className="h-4 w-4" />
                                                    Cancel Subscription
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        Are you sure you want to cancel your subscription with {subscription.vendor}?
                                                        You can still use your remaining meals until the end date.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() => handleCancelSubscription(subscription.id)}
                                                        className="bg-red-600 hover:bg-red-700"
                                                    >
                                                        Cancel Subscription
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p style={{ color: '#a0896b' }}>No active subscriptions</p>
                                <Button className="mt-4" style={{ backgroundColor: '#D98324' }}>
                                    Browse Subscription Plans
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Single Orders */}
                <Card className="shadow-lg border-0 relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `radial-gradient(circle at 12px 12px, #D98324 1px, transparent 1px)`,
                            backgroundSize: '24px 24px'
                        }}
                    />
                    <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="flex items-center gap-2" style={{ color: '#443627' }}>
                            <Calendar className="h-5 w-5" />
                            Upcoming Single Orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        {singleOrders.length > 0 ? (
                            singleOrders.map((order) => (
                                <div key={order.id} className="p-4 rounded-lg border relative overflow-hidden" style={{ backgroundColor: '#f8f6f3' }}>
                                    <div
                                        className="absolute inset-0 opacity-10"
                                        style={{
                                            backgroundImage: `radial-gradient(circle at 8px 8px, #D98324 0.5px, transparent 0.5px)`,
                                            backgroundSize: '16px 16px'
                                        }}
                                    />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg" style={{ color: '#443627' }}>{order.vendor}</h3>
                                                <p style={{ color: '#a0896b' }}>Delivery: {order.deliveryDate}</p>
                                            </div>
                                            <Badge
                                                variant={order.status === 'Confirmed' ? 'default' : 'secondary'}
                                                style={order.status === 'Confirmed' ? { backgroundColor: '#D98324', color: 'white' } : {}}
                                            >
                                                {order.status}
                                            </Badge>
                                        </div>

                                        <div className="mb-4">
                                            <p className="text-sm mb-2" style={{ color: '#a0896b' }}>Items:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {order.items.map((item, index) => (
                                                    <li key={index} style={{ color: '#443627' }}>{item}</li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-lg" style={{ color: '#443627' }}>৳{order.price}</p>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm" className="flex items-center gap-2">
                                                        <X className="h-4 w-4" />
                                                        Cancel Order
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Cancel Order</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to cancel this order from {order.vendor}?
                                                            This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Keep Order</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleCancelOrder(order.id)}
                                                            className="bg-red-600 hover:bg-red-700"
                                                        >
                                                            Cancel Order
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8">
                                <p style={{ color: '#a0896b' }}>No upcoming orders</p>
                                <Button className="mt-4" style={{ backgroundColor: '#D98324' }}>
                                    Order Now
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bill Summary */}
                <Card className="shadow-lg border-0 relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `radial-gradient(circle at 12px 12px, #D98324 1px, transparent 1px)`,
                            backgroundSize: '24px 24px'
                        }}
                    />
                    <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="flex items-center gap-2" style={{ color: '#443627' }}>
                            <CreditCard className="h-5 w-5" />
                            Bill Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span style={{ color: '#a0896b' }}>Active Subscriptions</span>
                                <span style={{ color: '#443627' }}>৳{subscriptions.reduce((sum, sub) => sum + sub.price, 0)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span style={{ color: '#a0896b' }}>Single Orders</span>
                                <span style={{ color: '#443627' }}>৳{singleOrders.reduce((sum, order) => sum + order.price, 0)}</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between font-bold text-lg">
                                <span style={{ color: '#443627' }}>Total Amount</span>
                                <span style={{ color: '#D98324' }}>৳{totalBill}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Index;
