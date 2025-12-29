/* eslint-disable @typescript-eslint/no-explicit-any */

'use client';

import { useState, useMemo, useEffect } from 'react';
import { User, MapPin, Clock, Loader2, AlertCircle, Package } from 'lucide-react';
import { useSubscribers } from '@/app/hooks/useSubscribers';
import { useVendorOrders, useUpdateOrderStatus } from '@/app/hooks/useOrder';
import { useVendorInfo } from '@/app/hooks/getVendorDetails';
import { format } from 'date-fns';

import { useBatchUserDetails } from '@/app/hooks/useUserDetails';
import { ChevronDown, Users } from 'lucide-react';
//import them here
import '@/app/globals.css';




export default function VendorOrders() {
    const [activeTab, setActiveTab] = useState<'subscription' | 'single'>('single');
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'delivered'>('all');
    

    

    // Get vendor details from token
    const { vendor, isLoading: vendorLoading, error: vendorError } = useVendorInfo();
    const vendorId = vendor?.id || null;

    const [groupByUser, setGroupByUser] = useState<boolean>(false);
    const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());

    

    // Fetch data using hooks
    const { data: subscribers, isLoading: subscribersLoading, error: subscribersError } = useSubscribers();

    const {
        data: singleOrders,
        isLoading: ordersLoading,
        error: ordersError
    } = useVendorOrders(vendorId);

    const uniqueUserIds = useMemo(() => {
    if (!singleOrders) return [];
    return [...new Set(singleOrders.map(order => order.user_id))];
}, [singleOrders]);

const { data: userDetailsMap, isLoading: userDetailsLoading } = useBatchUserDetails(uniqueUserIds);

    const updateOrderMutation = useUpdateOrderStatus();

    // Filter single orders based on delivery status
    const filteredSingleOrders = useMemo(() => {
        if (!singleOrders) return [];

        if (filterStatus === 'all') return singleOrders;
        if (filterStatus === 'pending') return singleOrders.filter(order => !order.is_delivered);
        if (filterStatus === 'delivered') return singleOrders.filter(order => order.is_delivered);

        return singleOrders;
    }, [singleOrders, filterStatus]);

    


    const groupedOrders = useMemo(() => {
    if (!filteredSingleOrders || !groupByUser || !userDetailsMap) return null;

    const grouped = filteredSingleOrders.reduce((acc, order) => {
        const userId = order.user_id;
        
        if (!acc[userId]) {
            const userDetails = userDetailsMap[userId];
            acc[userId] = {
                userId,
                userName: userDetails?.name || `User ${userId.slice(0, 8)}`,
                userPhone: userDetails?.phone_number || 'N/A',
                orders: [],
                totalOrders: 0,
                totalQuantity: 0,
                totalAmount: 0,
                hasPending: false,
                latestOrderDate: order.order_date,
            };
        }
        
        acc[userId].orders.push(order);
        acc[userId].totalOrders += 1;
        acc[userId].totalQuantity += order.quantity;
        acc[userId].totalAmount += order.total_price;
        
        if (!order.is_delivered) acc[userId].hasPending = true;
        
        if (new Date(order.order_date) > new Date(acc[userId].latestOrderDate)) {
            acc[userId].latestOrderDate = order.order_date;
        }
        
        return acc;
    }, {} as Record<string, any>);
    
    return Object.values(grouped).sort((a: any, b: any) => 
        new Date(b.latestOrderDate).getTime() - new Date(a.latestOrderDate).getTime()
    );
}, [filteredSingleOrders, groupByUser, userDetailsMap]);


const toggleUserExpansion = (userId: string) => {
    setExpandedUsers(prev => {
        const newSet = new Set(prev);
        if (newSet.has(userId)) {
            newSet.delete(userId);
        } else {
            newSet.add(userId);
        }
        return newSet;
    });
};

useEffect(() => {
    if (groupByUser && groupedOrders) {
        const allUserIds = groupedOrders.map((group: any) => group.userId);
        setExpandedUsers(new Set(allUserIds));
    } else if (!groupByUser) {
        setExpandedUsers(new Set());
    }
}, [groupByUser]);

    // Statistics
    const stats = useMemo(() => {
    return {
        totalOrders: singleOrders?.length || 0,
        pendingOrders: singleOrders?.filter(o => !o.is_delivered).length || 0,
        deliveredOrders: singleOrders?.filter(o => o.is_delivered).length || 0,
        totalRevenue: singleOrders?.reduce((sum, order) => sum + order.total_price, 0) || 0,
        uniqueCustomers: uniqueUserIds.length, // NEW LINE
    };
}, [singleOrders, uniqueUserIds]);


    const handleMarkAsDelivered = async (orderId: string) => {
        try {
            await updateOrderMutation.mutateAsync({
                orderId,
                statusUpdate: { is_delivered: true }
            });
        } catch (error) {
            console.error('Failed to update order status:', error);
        }
    };

    const formatTime = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, 'h:mm a');
        } catch {
            return 'N/A';
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, 'MMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    
    // Show vendor authentication error
    if (vendorError) {
        return (
            <div className="p-6 pt-20 min-h-screen bg-gray-50">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <div className="flex items-start">
                            <AlertCircle className="h-6 w-6 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold text-red-800 mb-2">
                                    Authentication Error
                                </h3>
                                <p className="text-red-700 mb-4">
                                    {vendorError.message || 'Unable to load vendor details. Please log in again.'}
                                </p>
                                <button
                                    onClick={() => window.location.href = '/login'}
                                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Go to Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
    if (vendorLoading || subscribersLoading || ordersLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 theme" />
                    <p className="text-lg text-gray-600">Loading orders...</p>
                </div>
            </div>
        );
    }

    // No vendor ID
    if (!vendorId) {
        return (
            <div className="p-6 pt-20 min-h-screen bg-gray-50">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="flex items-start">
                            <AlertCircle className="h-6 w-6 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                                    Vendor Not Found
                                </h3>
                                <p className="text-yellow-700 mb-4">
                                    Please log in as a vendor to view orders.
                                </p>
                                <button
                                    onClick={() => window.location.href = '/login'}
                                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                                >
                                    Go to Login
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state for orders
    if (subscribersError || ordersError) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <AlertCircle className="h-10 w-10 mx-auto mb-4 text-red-500" />
                    <p className="text-lg text-gray-800 mb-2">Failed to load orders</p>
                    <p className="text-sm text-gray-500 mb-4">
                        {ordersError?.message || subscribersError?.message || 'Please try again later'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="theme text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    const SubscriptionOrders = () => (
        <div className="space-y-6">
            {!subscribers || subscribers.length === 0 ? (
                <div className="text-center py-16 bglight rounded-lg shadow-md">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg text-gray-500 mb-2">No subscription orders found</p>
                    <p className="text-sm text-gray-400">Subscribers will appear here once they subscribe</p>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="theme">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Subscriber Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Start Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        End Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Duration
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {subscribers.map((subscriber) => {
                                    const startDate = new Date(subscriber.start_date);
                                    const endDate = new Date(subscriber.end_date);
                                    const today = new Date();
                                    const isActive = today >= startDate && today <= endDate;
                                    const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                                    return (
                                        <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-full flex items-center justify-center theme">
                                                        <User className="w-5 h-5 theme" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {subscriber.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(subscriber.start_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(subscriber.end_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                                {isActive ? (
                                                    daysLeft > 0 ? `${daysLeft} days left` : 'Expires today'
                                                ) : 'Expired'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-3 py-1 text-xs font-semibold rounded-full ${isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                        }`}
                                                >
                                                    {isActive ? 'ACTIVE' : 'EXPIRED'}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    const SingleOrders = () => (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Orders</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                    </div>
                </div>



                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Delivered</p>
                            <p className="text-3xl font-bold text-green-600 mt-2">{stats.deliveredOrders}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                            <p className="text-3xl font-bold text-orange-600 mt-2">৳{stats.totalRevenue.toFixed(0)}</p>
                        </div>
                        <div className="w-12 h-12 theme rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 theme" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </div>


                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Customers</p>
                            <p className="text-3xl font-bold text-purple-600 mt-2">{stats.uniqueCustomers}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6 text-purple-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-3 bg-white p-4 rounded-lg shadow-md">
                <button
                    onClick={() => setFilterStatus('all')}
                    className={`px-6 py-2 rounded-md font-medium transition-all ${filterStatus === 'all'
                        ? 'bgtheme text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    All Orders ({stats.totalOrders})
                </button>
                <button
                    onClick={() => setFilterStatus('pending')}
                    className={`px-6 py-2 rounded-md font-medium transition-all ${filterStatus === 'pending'
                        ? 'bgtheme text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Pending ({stats.pendingOrders})
                </button>
                <button
                    onClick={() => setFilterStatus('delivered')}
                    className={`px-6 py-2 rounded-md font-medium transition-all ${filterStatus === 'delivered'
                        ? 'bgtheme text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Delivered ({stats.deliveredOrders})
                </button>
            </div>

            <div className="ml-auto flex items-center">
                <button
                    onClick={() => setGroupByUser(!groupByUser)}
                    disabled={userDetailsLoading}
                    className={`px-6 py-2 rounded-md font-medium transition-all flex items-center gap-2 ${
                        groupByUser
                            ? 'bgtheme text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } ${userDetailsLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Users className="w-5 h-5" />
                    {userDetailsLoading ? 'Loading...' : groupByUser ? 'Show All Orders' : 'Group by Customer'}
                </button>
            </div>

            {groupByUser && groupedOrders ? (
    // GROUPED VIEW
    <div className="space-y-4">
        {groupedOrders.map((userGroup: any) => (
            <div key={userGroup.userId} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                {/* User Header */}
                <button
                    onClick={() => toggleUserExpansion(userGroup.userId)}
                    className="w-full px-6 py-5 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-150 transition-all flex items-center justify-between"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg">
                            <User className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-left">
                            <h3 className="text-lg font-bold text-gray-800">{userGroup.userName}</h3>
                            <p className="text-sm text-gray-600">{userGroup.userPhone}</p>
                            <div className="flex gap-4 mt-2 text-sm text-gray-700">
                                <span className="font-semibold">{userGroup.totalOrders} orders</span>
                                <span>•</span>
                                <span>{userGroup.totalQuantity} items</span>
                                <span>•</span>
                                <span className="font-bold text-orange-600">৳{userGroup.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {userGroup.hasPending && (
                            <span className="px-4 py-2 text-sm font-bold rounded-full bg-yellow-100 text-yellow-800 shadow-sm">
                                📦 Pending Orders
                            </span>
                        )}
                        <ChevronDown 
                            className={`w-7 h-7 text-gray-500 transition-transform duration-300 ${
                                expandedUsers.has(userGroup.userId) ? 'rotate-180' : ''
                            }`}
                        />
                    </div>
                </button>

                {/* Expanded Orders */}
                {expandedUsers.has(userGroup.userId) && (
                    <div className="overflow-x-auto border-t-2 border-orange-200">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Order ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Date & Time</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Pickup</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Qty</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Price</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {userGroup.orders.map((order: any) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono font-medium text-gray-900">
                                                #{order.id.slice(0, 8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatDate(order.order_date)}</div>
                                            <div className="flex items-center mt-1">
                                                <Clock className="w-3 h-3 text-gray-400 mr-1" />
                                                <span className="text-xs text-gray-500">{formatTime(order.order_date)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                                <span className="text-sm text-gray-700">{order.pickup}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">{order.quantity}x</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold theme">৳{order.total_price.toFixed(2)}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                                order.is_delivered ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                                {order.is_delivered ? 'DELIVERED' : 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {!order.is_delivered ? (
                                                <button
                                                    onClick={() => handleMarkAsDelivered(order.id)}
                                                    disabled={updateOrderMutation.isPending}
                                                    className="bgtheme text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50 transition-all"
                                                >
                                                    {updateOrderMutation.isPending ? 'Updating...' : 'Mark Delivered'}
                                                </button>
                                            ) : (
                                                <div className="flex items-center text-green-600 font-medium">
                                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Delivered
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        ))}
    </div>
) : (
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-orange-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Date & Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Pickup Point
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Total Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredSingleOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-mono font-medium text-gray-900">
                                                #{order.id.slice(0, 8).toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900">{formatDate(order.order_date)}</div>
                                            <div className="flex items-center mt-1">
                                                <Clock className="w-3 h-3 text-gray-400 mr-1" />
                                                <span className="text-xs text-gray-500">{formatTime(order.order_date)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                                                <span className="text-sm text-gray-700">{order.pickup}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-gray-900">{order.quantity}x</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold theme">
                                                ৳{order.total_price.toFixed(2)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 text-xs font-semibold rounded-full ${order.is_delivered
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                    }`}
                                            >
                                                {order.is_delivered ? 'DELIVERED' : 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            {!order.is_delivered ? (
                                                <button
                                                    onClick={() => handleMarkAsDelivered(order.id)}
                                                    disabled={updateOrderMutation.isPending}
                                                    className="bgtheme text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                                                >
                                                    {updateOrderMutation.isPending ? (
                                                        <div className="flex items-center">
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                            Updating...
                                                        </div>
                                                    ) : (
                                                        'Mark as Delivered'
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="flex items-center text-green-600 font-medium">
                                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Delivered
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6 pt-20 min-h-screen style={{ backgroundColor: 'rgb(249, 245, 230)' }">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
                        <p className="text-gray-500 mt-1">
                            Welcome back, <span className="theme font-medium">{vendor?.name}</span>!
                            Manage all your orders here.
                        </p>
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-medium ${vendor?.is_open
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}>
                        {vendor?.is_open ? '🟢 Open' : '🔴 Closed'}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('single')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'single'
                                ? 'border-orange-500 theme'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Single Orders
                            {singleOrders && singleOrders.length > 0 && (
                                <span className="ml-2 bgtheme theme px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                    {singleOrders.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('subscription')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'subscription'
                                ? 'border-orange-500 theme'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Subscription Orders
                            {subscribers && subscribers.length > 0 && (
                                <span className="ml-2 bg-orange-100 text-orange-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                    {subscribers.length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'subscription' && <SubscriptionOrders />}
            {activeTab === 'single' && <SingleOrders />}
        </div>
    );
}