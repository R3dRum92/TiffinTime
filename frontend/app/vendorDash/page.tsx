'use client';

import { useState } from 'react';
import { ShoppingBag, User, Star, Clock, ChefHat } from 'lucide-react';

export default function VendorDashboard() {
    const [vendorStats] = useState({
        activeOrdersToday: 15,
        totalMealsToday: 42,
        pendingSingleOrders: 8,
        averageRating: 4.7
    });

    //to fetch subscribers
    async function fetchSubscribers() {
        try {
            const response = await fetch('/api/subscribers', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    // Add authentication headers if needed
                    // 'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching subscribers:', error);
            throw error;
        }
    }

    // Mock data for subscribers
    const subscribers = [
        {
            id: 1,
            name: 'John Doe',
            startDate: '2025-01-15',
            endDate: '2025-07-15'
        },
        {
            id: 2,
            name: 'Jane Smith',
            startDate: '2025-02-01',
            endDate: '2025-08-01'
        },
        {
            id: 3,
            name: 'Mike Johnson',
            startDate: '2025-03-10',
            endDate: '2025-09-10'
        },
        {
            id: 4,
            name: 'Sarah Wilson',
            startDate: '2025-04-05',
            endDate: '2025-10-05'
        },
        {
            id: 5,
            name: 'David Brown',
            startDate: '2025-05-20',
            endDate: '2025-11-20'
        }
    ];

    // Mock data for recent orders (commented out)
    /*
    const recentOrders = [
        {
            id: 1,
            customerName: 'John Doe',
            type: 'subscription',
            meal: 'Chicken Biryani',
            quantity: 2,
            date: '2025-07-11',
            status: 'pending',
            time: '12:00 PM',
            pickupPoint: 'Dhanmondi 27'
        },
        {
            id: 2,
            customerName: 'Jane Smith',
            type: 'single',
            meal: 'Beef Curry',
            quantity: 1,
            date: '2025-07-11',
            status: 'preparing',
            time: '1:30 PM',
            pickupPoint: 'Uttara Sec 7'
        },
        {
            id: 3,
            customerName: 'Mike Johnson',
            type: 'subscription',
            meal: 'Fish Fry',
            quantity: 3,
            date: '2025-07-11',
            status: 'ready',
            time: '2:00 PM',
            pickupPoint: 'Gulshan 1'
        }
    ];
    */

    return (
        <div>
            {/* Main Content */}
            <div className="p-6 pt-20">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold darktext">
                        Welcome Back, Chef! 👨‍🍳
                    </h1>
                    <p className="lighttext">Here&apos;s what&apos;s happening in your kitchen today</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="lighttext text-sm font-medium">Active Orders Today</p>
                                <p className="text-2xl font-bold darktext">{vendorStats.activeOrdersToday}</p>
                            </div>
                            <ShoppingBag className="w-8 h-8 theme" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="lighttext text-sm font-medium">Total Meals to Prepare</p>
                                <p className="text-2xl font-bold darktext">{vendorStats.totalMealsToday}</p>
                            </div>
                            <ChefHat className="w-8 h-8 theme" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="lighttext text-sm font-medium">Pending Single Orders</p>
                                <p className="text-2xl font-bold darktext">{vendorStats.pendingSingleOrders}</p>
                            </div>
                            <Clock className="w-8 h-8 theme" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="lighttext text-sm font-medium">Average Rating</p>
                                <p className="text-2xl font-bold darktext">{vendorStats.averageRating}/5</p>
                            </div>
                            <Star className="w-8 h-8 theme" />
                        </div>
                    </div>
                </div>

                {/* My Subscribers */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4 darktext">My Subscribers</h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-3 px-4 font-medium darktext">Subscriber Name</th>
                                    <th className="text-left py-3 px-4 font-medium darktext">Started</th>
                                    <th className="text-left py-3 px-4 font-medium darktext">Ends</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.map(subscriber => (
                                    <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center bglight">
                                                    <User className="w-4 h-4 theme" />
                                                </div>
                                                <span className="font-medium darktext">{subscriber.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4 lighttext">{subscriber.startDate}</td>
                                        <td className="py-3 px-4 lighttext">{subscriber.endDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Orders (commented out) */}
                {/*
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4 darktext">Recent Orders</h2>
                    <div className="space-y-4">
                        {recentOrders.map(order => (
                            <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center bglight">
                                        <User className="w-6 h-6 theme" />
                                    </div>
                                    <div>
                                        <p className="font-medium darktext">{order.customerName}</p>
                                        <p className="text-sm lighttext">{order.meal} x{order.quantity}</p>
                                        <p className="text-xs lighttext">{order.type} • {order.time} • {order.pickupPoint}</p>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                    {order.status.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                */}
            </div>
        </div>
    );
}