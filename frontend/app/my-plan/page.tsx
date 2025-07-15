"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MapPin, Calendar, User, CreditCard, X, Edit, ShoppingBag, Clock, MapPin as LocationIcon, Loader2 } from 'lucide-react';
import { toast } from "sonner"
import { useTransformedUserSubscriptions, useUserInfo } from '../hooks/getUserDetails';

const Index = () => {
    const [pickupPoint, setPickupPoint] = useState('Main Campus Cafeteria');
    const [isEditingPickup, setIsEditingPickup] = useState(false);
    const { subscriptions, isLoading: subscriptionsLoading, error: subscriptionsError, refetch } = useTransformedUserSubscriptions();
    const { user, isLoading: userLoading, error: userError } = useUserInfo();

    const isLoading = subscriptionsLoading || userLoading;
    const error = subscriptionsError || userError;

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

    const handleCancelSubscription = (subscriptionId: string) => {
        // TODO: Implement API call to cancel subscription
        toast("Subscription Cancelled", {
            description: "Your subscription has been cancelled. You can still use remaining meals.",
            action: {
                label: "Undo",
                onClick: () => console.log("Undo subscription cancellation"),
            },
        });

        // Refetch subscriptions after cancellation
        refetch();
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

    // Handle loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: '#D98324' }} />
                    <p className="text-lg" style={{ color: '#443627' }}>Loading your subscriptions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
                <Card className="shadow-lg border-0 max-w-md w-full">
                    <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
                            <X className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-red-700">
                            Error Loading Profile
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {error.message || 'Failed to load your profile. Please try again.'}
                        </p>
                        <Button onClick={() => refetch()} style={{ backgroundColor: '#D98324' }}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
                <div className="text-center">
                    <p className="text-lg" style={{ color: '#443627' }}>No user data available</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen relative bgtheme2" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
            {/* Subtle circle pattern background */}
            <div
                className="absolute inset-0 opacity-20"
            />

            <div className="max-w-6xl mx-auto p-6 space-y-20 relative z-10">
                {/* Hero Section */}
                <div className="text-center pt-20">
                    <h2 className="text-3xl font-bold mb-4 darktext">
                        Welcome back, {user.name}!
                    </h2>
                    <p className="text-xl lighttext">
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
                                <p className="font-semibold" style={{ color: '#443627' }}>{user.name}</p>
                            </div>
                            {/* <div>
                                <p className="text-sm" style={{ color: '#a0896b' }}>Student ID</p>
                                <p className="font-semibold" style={{ color: '#443627' }}>{user.studentId}</p>
                            </div> */}
                            <div>
                                <p className="text-sm" style={{ color: '#a0896b' }}>Email</p>
                                <p className="font-semibold" style={{ color: '#443627' }}>{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#a0896b' }}>Phone</p>
                                <p className="font-semibold" style={{ color: '#443627' }}>{user.phone_number}</p>
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
                        <CardTitle className="flex items-center justify-between" style={{ color: '#443627' }}>
                            Active Subscriptions
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                className="flex items-center gap-2"
                            >
                                <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        {subscriptions.length > 0 ? (
                            subscriptions.map((subscription) => (
                                <div key={subscription.id} className="p-4 rounded-lg border relative overflow-hidden" style={{ backgroundColor: '#f8f6f3' }}>
                                    {/* Your existing subscription card JSX */}
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
                                                <p className="text-sm" style={{ color: '#a0896b' }}>Duration</p>
                                                <p className="font-semibold" style={{ color: '#443627' }}>{subscription.duration}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm" style={{ color: '#a0896b' }}>Start Date</p>
                                                <p className="font-semibold" style={{ color: '#443627' }}>{subscription.startDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm" style={{ color: '#a0896b' }}>End Date</p>
                                                <p className="font-semibold" style={{ color: '#443627' }}>{subscription.endDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm" style={{ color: '#a0896b' }}>Status</p>
                                                <p className="font-semibold" style={{ color: '#443627' }}>{subscription.status}</p>
                                            </div>
                                        </div>
                                        {/* Cancel Button */}
                                        <div className="flex justify-end">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="flex items-center gap-2 bgalert"
                                                    >
                                                        <X className="h-4 w-4" />
                                                        Cancel
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to cancel your subscription with {subscription.vendor}?
                                                            This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Keep</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleCancelSubscription(subscription.id)}
                                                            className="bg-red-500 hover:bg-red-700"
                                                        >
                                                            Cancel
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
                                <p style={{ color: '#a0896b' }}>No active subscriptions</p>
                                <Button className="mt-4" style={{ backgroundColor: '#D98324' }}>
                                    Browse Subscription Plans
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Single Orders */}
                {/* <Card className="shadow-lg border-0 relative overflow-hidden">
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
                                            <p className="font-bold text-lg " style={{ color: ' #443627' }}>৳{order.price}</p>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm" className="flex bgalert items-center gap-2">
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
                                                            className="bg-red-500 hover:bg-red-700"
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
                </Card> */}

                {/* Bill Summary */}
                {/* <Card className="shadow-lg border-0 relative overflow-hidden">
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
                </Card> */}
            </div>
        </div>
    );
};

export default Index;
