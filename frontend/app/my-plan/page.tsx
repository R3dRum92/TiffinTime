"use client"

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';


import { MapPin, User, Edit, ShoppingBag, Clock, MapPin as LocationIcon, Loader2, Package, CheckCircle, XCircle, Calendar, DollarSign, Utensils } from 'lucide-react';
import { toast } from "sonner";
import { useTransformedUserSubscriptions, useUserInfo } from '../hooks/getUserDetails';
import { useUserOrders } from '../hooks/useOrder';
import { useRouter } from 'next/navigation';

const UserDashboard = () => {
    const router = useRouter();
    const [pickupPoint, setPickupPoint] = useState('Main Campus Cafeteria');
    const [isEditingPickup, setIsEditingPickup] = useState(false);
    interface Order {
        id: string;
        order_date: string;
        is_delivered: boolean;
        pickup: string;
        quantity: number;
        unit_price: number;
        total_price: number;
    }

    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

    const { subscriptions, isLoading: subscriptionsLoading, error: subscriptionsError, refetch: refetchSubscriptions } = useTransformedUserSubscriptions();
    const { user, isLoading: userLoading, error: userError } = useUserInfo();

    // Fetch user orders
    const { data: orders, isLoading: ordersLoading, error: ordersError, refetch: refetchOrders } = useUserOrders(user?.id || null);

    const isLoading = subscriptionsLoading || userLoading || ordersLoading;
    const error = subscriptionsError || userError || ordersError;

    const pickupPoints = [
        'VC Chattor',
        'Mokarrum Bhavan',
        'Central Library',
        'TSC'
    ];

    // Categorize orders
    const categorizedOrders = useMemo(() => {
        if (!orders) return { upcoming: [], completed: [], all: [] };

        return {
            upcoming: orders.filter(order => !order.is_delivered),
            completed: orders.filter(order => order.is_delivered),
            all: orders
        };
    }, [orders]);

    // Calculate stats
    const stats = useMemo(() => {
        return {
            activeSubscriptions: subscriptions.length,
            upcomingOrders: categorizedOrders.upcoming.length,
            completedOrders: categorizedOrders.completed.length,
            totalSpent: orders?.reduce((sum, order) => sum + order.total_price, 0) || 0
        };
    }, [subscriptions.length, categorizedOrders, orders]);

    const handleCancelSubscription = async (subscriptionId: string) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscribe/${subscriptionId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authentication header if needed
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                // Handle different error status codes
                if (response.status === 404) {
                    throw new Error('Subscription not found');
                } else if (response.status === 403) {
                    throw new Error('You are not authorized to cancel this subscription');
                } else if (response.status === 409) {
                    throw new Error('Subscription cannot be cancelled at this time');
                } else {
                    throw new Error('Failed to cancel subscription');
                }
            }

            toast("Subscription Cancelled", {
                description: "Your subscription has been cancelled!",
                action: {
                    label: "Undo",
                    onClick: () => console.log("Undo subscription cancellation"),
                },
            });

            // Refetch subscriptions after cancellation
            await refetchSubscriptions();
        } catch (error) {
            console.error('Error cancelling subscription:', error);

            toast("Error", {
                description: error instanceof Error ? error.message : "Failed to cancel subscription. Please try again.",
            });
        }
    };

    interface PickupPointChangeProps {
        newPoint: string;
    }

    const handlePickupPointChange = ({ newPoint }: PickupPointChangeProps): void => {
        setPickupPoint(newPoint);
        setIsEditingPickup(false);
        toast.success("Pickup Point Updated", {
            description: `Your pickup point has been changed to ${newPoint}`,
        });
    };

    const handleViewOrderDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsOrderDetailsOpen(true);
    };

    const formatDate = (dateString: string | number | Date) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 theme" />
                    <p className="text-lg darktext"> Loading your dashboard...</p>
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
                            <XCircle className="h-8 w-8 text-red-600" />
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-red-700">
                            Error Loading Dashboard
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {error.message || 'Failed to load your dashboard. Please try again.'}
                        </p>
                        <Button onClick={() => {
                            refetchSubscriptions();
                            refetchOrders();
                        }} style={{ backgroundColor: '#D98324' }}>
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
                    <p className="text-lg darktext" >No user data available</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
            <div className="absolute inset-0 opacity-20" />

            <div className="max-w-6xl mx-auto p-6 space-y-8 relative z-10">
                {/* Hero Section */}
                <div className="text-center pt-20">
                    <h2 className="text-3xl font-bold mb-4 darktext" >
                        Welcome back, {user.name}!
                    </h2>
                    <p className="text-xl" style={{ color: '#a0896b' }}>
                        Manage your orders, subscriptions, and preferences all in one place
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card className="shadow-lg border-0 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-5" style={{
                            backgroundImage: `radial-gradient(circle at 10px 10px, #D98324 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                        }} />
                        <CardContent className="p-6 text-center relative z-10">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EFDCAB' }}>
                                <ShoppingBag className="h-8 w-8 theme" />
                            </div>
                            <h3 className="font-bold text-lg mb-2 darktext">
                                Active Subscriptions
                            </h3>
                            <p className="text-2xl font-bold theme">{stats.activeSubscriptions}</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-5" style={{
                            backgroundImage: `radial-gradient(circle at 10px 10px, #D98324 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                        }} />
                        <CardContent className="p-6 text-center relative z-10">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EFDCAB' }}>
                                <Clock className="h-8 w-8 theme" />
                            </div>
                            <h3 className="font-bold text-lg mb-2 darktext">
                                Upcoming Orders
                            </h3>
                            <p className="text-2xl font-bold theme">{stats.upcomingOrders}</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-5" style={{
                            backgroundImage: `radial-gradient(circle at 10px 10px, #D98324 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                        }} />
                        <CardContent className="p-6 text-center relative z-10">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EFDCAB' }}>
                                <CheckCircle className="h-8 w-8 theme" />
                            </div>
                            <h3 className="font-bold text-lg mb-2 darktext">
                                Completed Orders
                            </h3>
                            <p className="text-2xl font-bold theme">{stats.completedOrders}</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-lg border-0 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-5" style={{
                            backgroundImage: `radial-gradient(circle at 10px 10px, #D98324 1px, transparent 1px)`,
                            backgroundSize: '20px 20px'
                        }} />
                        <CardContent className="p-6 text-center relative z-10">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EFDCAB' }}>
                                <DollarSign className="h-8 w-8 theme" />
                            </div>
                            <h3 className="font-bold text-lg mb-2 darktext">
                                Total Spent
                            </h3>
                            <p className="text-2xl font-bold theme">৳{stats.totalSpent.toFixed(2)}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* User Profile Section */}
                <Card className="shadow-lg border-0 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: `radial-gradient(circle at 12px 12px, #D98324 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }} />
                    <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="flex items-center gap-2 darktext">
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
                            <div>
                                <p className="text-sm" style={{ color: '#a0896b' }}>Email</p>
                                <p className="font-semibold darktext">{user.email}</p>
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#a0896b' }}>Phone</p>
                                <p className="font-semibold darktext" >{user.phone_number}</p>
                            </div>
                            <div>
                                <p className="text-sm" style={{ color: '#a0896b' }}>Pickup Point</p>
                                <p className="font-semibold darktext" >{pickupPoint}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Orders Section with Tabs */}
                <Card className="shadow-lg border-0 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: `radial-gradient(circle at 12px 12px, #D98324 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }} />
                    <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="flex items-center justify-between darktext">
                            <div className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                My Orders
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetchOrders()}
                                className="flex items-center gap-2"
                            >
                                <Loader2 className={`h-4 w-4 ${ordersLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <Tabs defaultValue="upcoming" className="w-full">
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="upcoming">
                                    Upcoming ({categorizedOrders.upcoming.length})
                                </TabsTrigger>
                                <TabsTrigger value="completed">
                                    Completed ({categorizedOrders.completed.length})
                                </TabsTrigger>
                                <TabsTrigger value="all">
                                    All Orders ({categorizedOrders.all.length})
                                </TabsTrigger>
                            </TabsList>

                            {/* Upcoming Orders */}
                            <TabsContent value="upcoming" className="space-y-4 mt-4">
                                {categorizedOrders.upcoming.length > 0 ? (
                                    categorizedOrders.upcoming.map((order) => (
                                        <div key={order.id} className="p-4 rounded-lg border relative overflow-hidden" style={{ backgroundColor: '#f8f6f3' }}>
                                            <div className="absolute inset-0 opacity-10" style={{
                                                backgroundImage: `radial-gradient(circle at 8px 8px, #D98324 0.5px, transparent 0.5px)`,
                                                backgroundSize: '16px 16px'
                                            }} />
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Utensils className="h-5 w-5 theme" />
                                                            <h3 className="font-bold text-lg darktext">
                                                                Order #{order.id.slice(0, 8)}
                                                            </h3>
                                                        </div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>
                                                            Ordered on {formatDate(order.order_date)}
                                                        </p>
                                                    </div>
                                                    <Badge className="px-3 py-1 bg-orange-100 text-orange-800 border-0">
                                                        Pending
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>Quantity</p>
                                                        <p className="font-semibold darktext">{order.quantity}x</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>Unit Price</p>
                                                        <p className="font-semibold darktext">৳{order.unit_price}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>Total</p>
                                                        <p className="font-semibold theme">৳{order.total_price}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>Pickup</p>
                                                        <p className="font-semibold text-sm darktext">{order.pickup}</p>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewOrderDetails(order)}
                                                    className="w-full"
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="h-12 w-12 mx-auto mb-4" style={{ color: '#a0896b' }} />
                                        <p style={{ color: '#a0896b' }}>No upcoming orders</p>
                                        <Button className="mt-4" style={{ backgroundColor: '#D98324' }}
                                            onClick={() => router.push("/food")}>
                                            Order Food Now
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>

                            {/* Completed Orders */}
                            <TabsContent value="completed" className="space-y-4 mt-4">
                                {categorizedOrders.completed.length > 0 ? (
                                    categorizedOrders.completed.map((order) => (
                                        <div key={order.id} className="p-4 rounded-lg border relative overflow-hidden" style={{ backgroundColor: '#f8f6f3' }}>
                                            <div className="absolute inset-0 opacity-10" style={{
                                                backgroundImage: `radial-gradient(circle at 8px 8px, #D98324 0.5px, transparent 0.5px)`,
                                                backgroundSize: '16px 16px'
                                            }} />
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Utensils className="h-5 w-5" style={{ color: '#D98324' }} />
                                                            <h3 className="font-bold text-lg darktext">
                                                                Order #{order.id.slice(0, 8)}
                                                            </h3>
                                                        </div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>
                                                            Delivered on {formatDate(order.order_date)}
                                                        </p>
                                                    </div>
                                                    <Badge className="px-3 py-1 bg-green-100 text-green-800 border-0">
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Delivered
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>Quantity</p>
                                                        <p className="font-semibold darktext">{order.quantity}x</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>Unit Price</p>
                                                        <p className="font-semibold darktext">৳{order.unit_price}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>Total</p>
                                                        <p className="font-semibold" style={{ color: '#D98324' }}>৳{order.total_price}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>Pickup</p>
                                                        <p className="font-semibold text-sm" style={{ color: '#443627' }}>{order.pickup}</p>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewOrderDetails(order)}
                                                    className="w-full"
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <CheckCircle className="h-12 w-12 mx-auto mb-4" style={{ color: '#a0896b' }} />
                                        <p style={{ color: '#a0896b' }}>No completed orders yet</p>
                                    </div>
                                )}
                            </TabsContent>

                            {/* All Orders */}
                            <TabsContent value="all" className="space-y-4 mt-4">
                                {categorizedOrders.all.length > 0 ? (
                                    categorizedOrders.all.map((order) => (
                                        <div key={order.id} className="p-4 rounded-lg border relative overflow-hidden" style={{ backgroundColor: '#f8f6f3' }}>
                                            <div className="absolute inset-0 opacity-10" style={{
                                                backgroundImage: `radial-gradient(circle at 8px 8px, #D98324 0.5px, transparent 0.5px)`,
                                                backgroundSize: '16px 16px'
                                            }} />
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <Utensils className="h-5 w-5" style={{ color: '#D98324' }} />
                                                            <h3 className="font-bold text-lg darktext">
                                                                Order #{order.id.slice(0, 8)}
                                                            </h3>
                                                        </div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>
                                                            {formatDate(order.order_date)}
                                                        </p>
                                                    </div>
                                                    <Badge className={`px-3 py-1 border-0 ${order.is_delivered ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                                        {order.is_delivered ? (
                                                            <>
                                                                <CheckCircle className="h-4 w-4 mr-1" />
                                                                Delivered
                                                            </>
                                                        ) : 'Pending'}
                                                    </Badge>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                    <div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>Quantity</p>
                                                        <p className="font-semibold darktext">{order.quantity}x</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>Unit Price</p>
                                                        <p className="font-semibold darktext">৳{order.unit_price}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>Total</p>
                                                        <p className="font-semibold darktext">৳{order.total_price}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm" style={{ color: '#a0896b' }}>Pickup</p>
                                                        <p className="font-semibold text-sm darktext">{order.pickup}</p>
                                                    </div>
                                                </div>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewOrderDetails(order)}
                                                    className="w-full"
                                                >
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <Package className="h-12 w-12 mx-auto mb-4" style={{ color: '#a0896b' }} />
                                        <p style={{ color: '#a0896b' }}>No orders yet</p>
                                        <Button className="mt-4" style={{ backgroundColor: '#D98324' }}
                                            onClick={() => router.push("/food-search")}>
                                            Start Ordering
                                        </Button>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>

                {/* Active Subscriptions */}
                <Card className="shadow-lg border-0 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-5" style={{
                        backgroundImage: `radial-gradient(circle at 12px 12px, #D98324 1px, transparent 1px)`,
                        backgroundSize: '24px 24px'
                    }} />
                    <CardHeader className="pb-4 relative z-10">
                        <CardTitle className="flex items-center justify-between" style={{ color: '#443627' }}>
                            Active Subscriptions
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetchSubscriptions()}
                                className="flex items-center gap-2"
                            >
                                <Loader2 className={`h-4 w-4 ${subscriptionsLoading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 relative z-10">
                        {subscriptions.length > 0 ? (
                            subscriptions.map((subscription) => (
                                <div key={subscription.id} className="p-4 rounded-lg border relative overflow-hidden" style={{ backgroundColor: '#f8f6f3' }}>
                                    <div className="absolute inset-0 opacity-10" style={{
                                        backgroundImage: `radial-gradient(circle at 8px 8px, #D98324 0.5px, transparent 0.5px)`,
                                        backgroundSize: '16px 16px'
                                    }} />
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-lg darktext">{subscription.vendor}</h3>
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
                                                <p className="font-semibold darktext">{subscription.startDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm" style={{ color: '#a0896b' }}>End Date</p>
                                                <p className="font-semibold darktext">{subscription.endDate}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm" style={{ color: '#a0896b' }}>Status</p>
                                                <p className="font-semibold darktext">{subscription.status}</p>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="flex items-center gap-2"
                                                    >
                                                        <XCircle className="h-4 w-4" />
                                                        Cancel Subscription
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
                                                        <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleCancelSubscription(subscription.id)}
                                                            className="bg-red-500 hover:bg-red-700"
                                                        >
                                                            Yes, Cancel
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
                                <ShoppingBag className="h-12 w-12 mx-auto mb-4" style={{ color: '#a0896b' }} />
                                <p style={{ color: '#a0896b' }}>No active subscriptions</p>
                                <Button className="mt-4" style={{ backgroundColor: '#D98324' }}
                                    onClick={() => router.push("/vendors")}>
                                    Browse Subscription Plans
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Order Details Modal */}
                <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle style={{ color: '#443627' }}>
                                Order Details
                            </DialogTitle>
                        </DialogHeader>

                        {selectedOrder && (
                            <div className="space-y-6">
                                <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8f6f3' }}>
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-bold text-xl mb-2 darktext">
                                                Order #{selectedOrder.id.slice(0, 8)}
                                            </h3>
                                            <p className="text-sm" style={{ color: '#a0896b' }}>
                                                Placed on {formatDate(selectedOrder.order_date)}
                                            </p>
                                        </div>
                                        <Badge className={`px-3 py-1 border-0 ${selectedOrder.is_delivered ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                                            {selectedOrder.is_delivered ? (
                                                <>
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Delivered
                                                </>
                                            ) : (
                                                <>
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    Pending
                                                </>
                                            )}
                                        </Badge>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <Calendar className="h-4 w-4" style={{ color: '#D98324' }} />
                                                <p className="text-sm font-semibold darktext">Order Date</p>
                                            </div>
                                            <p style={{ color: '#a0896b' }}>{formatDate(selectedOrder.order_date)}</p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <MapPin className="h-4 w-4" style={{ color: '#D98324' }} />
                                                <p className="text-sm font-semibold darktext" >Pickup Location</p>
                                            </div>
                                            <p style={{ color: '#a0896b' }}>{selectedOrder.pickup}</p>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 mt-4">
                                        <h4 className="font-semibold mb-3 darktext">Order Summary</h4>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span style={{ color: '#a0896b' }}>Quantity</span>
                                                <span className="font-semibold" style={{ color: '#443627' }}>{selectedOrder.quantity}x</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span style={{ color: '#a0896b' }}>Unit Price</span>
                                                <span className="font-semibold darktext">৳{selectedOrder.unit_price.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between pt-2 border-t">
                                                <span className="font-semibold darktext">Total Amount</span>
                                                <span className="font-bold text-xl" style={{ color: '#D98324' }}>৳{selectedOrder.total_price.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {!selectedOrder.is_delivered && (
                                        <div className="mt-4 p-3 rounded-lg bg-orange-50 border border-orange-200">
                                            <div className="flex items-start gap-2">
                                                <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-orange-900">Order in Progress</p>
                                                    <p className="text-sm text-orange-700">Your order is being prepared and will be ready for pickup soon.</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {selectedOrder.is_delivered && (
                                        <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200">
                                            <div className="flex items-start gap-2">
                                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                                <div>
                                                    <p className="font-semibold text-green-900">Order Delivered</p>
                                                    <p className="text-sm text-green-700">This order has been successfully delivered. Enjoy your meal!</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={() => setIsOrderDetailsOpen(false)}
                                        className="flex-1"
                                        variant="outline"
                                    >
                                        Close
                                    </Button>
                                    {!selectedOrder.is_delivered && (
                                        <Button
                                            className="flex-1"
                                            style={{ backgroundColor: '#D98324' }}
                                            onClick={() => router.push("/food-search")}
                                        >
                                            Order Again
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default UserDashboard;
