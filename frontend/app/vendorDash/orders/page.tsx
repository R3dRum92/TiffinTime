'use client';

import { useState } from 'react';
import { User, MapPin, Clock } from 'lucide-react';

export default function VendorOrders() {
    const [activeTab, setActiveTab] = useState('subscription');
    const [dateFilter, setDateFilter] = useState('today');
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

    // Mock subscription orders
    const [subscriptionOrders, setSubscriptionOrders] = useState([
        {
            id: 1,
            studentName: 'John Doe',
            pickupPoint: 'Dhanmondi 27',
            mealTime: 'Lunch',
            meal: 'Rice + Chicken Curry',
            date: '2025-07-11',
            status: 'pending'
        },
        {
            id: 2,
            studentName: 'Jane Smith',
            pickupPoint: 'Uttara Sec 7',
            mealTime: 'Dinner',
            meal: 'Rice + Fish Fry',
            date: '2025-07-11',
            status: 'ready'
        },
        {
            id: 3,
            studentName: 'Mike Johnson',
            pickupPoint: 'Gulshan 1',
            mealTime: 'Lunch',
            meal: 'Biryani + Raita',
            date: '2025-07-11',
            status: 'delivered'
        },
        {
            id: 4,
            studentName: 'Sarah Ahmed',
            pickupPoint: 'Dhanmondi 27',
            mealTime: 'Lunch',
            meal: 'Rice + Beef Curry',
            date: '2025-07-12',
            status: 'pending'
        }
    ]);

    // Mock single orders
    const [singleOrders, setSingleOrders] = useState([
        {
            id: 'SO001',
            items: [
                { name: 'Chicken Biryani', quantity: 2, price: 180 },
                { name: 'Raita', quantity: 1, price: 50 }
            ],
            deliveryDate: '2025-07-11',
            pickupPoint: 'Dhanmondi 27',
            totalPrice: 410,
            status: 'pending',
            customerName: 'Alex Rahman'
        },
        {
            id: 'SO002',
            items: [
                { name: 'Fish Curry', quantity: 1, price: 150 },
                { name: 'Rice', quantity: 1, price: 80 }
            ],
            deliveryDate: '2025-07-11',
            pickupPoint: 'Uttara Sec 7',
            totalPrice: 230,
            status: 'ready',
            customerName: 'Lisa Khan'
        },
        {
            id: 'SO003',
            items: [
                { name: 'Beef Tehari', quantity: 3, price: 200 }
            ],
            deliveryDate: '2025-07-12',
            pickupPoint: 'Gulshan 1',
            totalPrice: 600,
            status: 'pending',
            customerName: 'Omar Faruk'
        }
    ]);

    const updateSubscriptionStatus = (orderId: number, newStatus: string) => {
        setSubscriptionOrders(orders =>
            orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
    };

    const updateSingleOrderStatus = (orderId: string, newStatus: string) => {
        setSingleOrders(orders =>
            orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            )
        );
    };

    const getFilteredSubscriptionOrders = () => {
        const today = new Date().toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        switch (dateFilter) {
            case 'today':
                return subscriptionOrders.filter(order => order.date === today);
            case 'tomorrow':
                return subscriptionOrders.filter(order => order.date === tomorrowStr);
            case 'custom':
                return subscriptionOrders.filter(order =>
                    order.date >= customDateRange.start && order.date <= customDateRange.end
                );
            default:
                return subscriptionOrders;
        }
    };

    const SubscriptionOrders = () => (
        <div className="space-y-6">
            {/* Date Filter */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setDateFilter('today')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${dateFilter === 'today' ? 'bgtheme' : 'border border-orange-300 lighttext'
                                }`}
                        >
                            Today
                        </button>
                        <button
                            onClick={() => setDateFilter('tomorrow')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${dateFilter === 'tomorrow' ? 'bgtheme' : 'border border-orange-300 lighttext'
                                }`}
                        >
                            Tomorrow
                        </button>
                        <button
                            onClick={() => setDateFilter('custom')}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${dateFilter === 'custom' ? 'bgtheme' : 'border border-orange-300 lighttext'
                                }`}
                        >
                            Date Range
                        </button>
                    </div>

                    {dateFilter === 'custom' && (
                        <div className="flex items-center space-x-2">
                            <input
                                type="date"
                                value={customDateRange.start}
                                onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                                className="border rounded px-3 py-2 text-sm"
                            />
                            <span className="lighttext">to</span>
                            <input
                                type="date"
                                value={customDateRange.end}
                                onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                                className="border rounded px-3 py-2 text-sm"
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Subscription Orders Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bglight">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Student Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Pickup Point
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Meal Time
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Meal
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {getFilteredSubscriptionOrders().map(order => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bglight">
                                                <User className="w-5 h-5 theme" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium darktext">{order.studentName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 lighttext mr-1" />
                                            <span className="text-sm darktext">{order.pickupPoint}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 lighttext mr-1" />
                                            <span className="text-sm darktext">{order.mealTime}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm darktext">
                                        {order.meal}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm lighttext">
                                        {order.date}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {order.status !== 'delivered' && (
                                            <button
                                                onClick={() => updateSubscriptionStatus(order.id, 'delivered')}
                                                className="bgtheme px-3 py-1 rounded text-sm hover:bg-orange-600"
                                            >
                                                Mark as Delivered
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const SingleOrders = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bglight">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Order ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Customer
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Items
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Delivery Date
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Pickup Point
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium darktext uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {singleOrders.map(order => (
                                <tr key={order.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium darktext">
                                        {order.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bglight">
                                                <User className="w-5 h-5 theme" />
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium darktext">{order.customerName}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm darktext">
                                            {order.items.map((item, index) => (
                                                <div key={index}>
                                                    {item.name} x{item.quantity}
                                                </div>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm lighttext">
                                        {order.deliveryDate}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <MapPin className="w-4 h-4 lighttext mr-1" />
                                            <span className="text-sm darktext">{order.pickupPoint}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium theme">
                                        ৳{order.totalPrice}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            order.status === 'ready' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                            {order.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {order.status === 'pending' && (
                                                <button
                                                    onClick={() => updateSingleOrderStatus(order.id, 'ready')}
                                                    className="bgtheme px-3 py-1 rounded text-sm hover:bg-orange-600"
                                                >
                                                    Mark as Ready
                                                </button>
                                            )}
                                            {order.status === 'ready' && (
                                                <button
                                                    onClick={() => updateSingleOrderStatus(order.id, 'delivered')}
                                                    className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                                                >
                                                    Mark as Delivered
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-6 pt-20">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Order Management</h1>
                <p className="text-gray-500">Manage all subscription and single orders</p>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow-md mb-6">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        <button
                            onClick={() => setActiveTab('subscription')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'subscription'
                                ? 'border-orange-500 theme'
                                : 'border-transparent lighttext hover:text-gray-700'
                                }`}
                        >
                            Subscription Orders
                        </button>
                        <button
                            onClick={() => setActiveTab('single')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'single'
                                ? 'border-orange-500 theme'
                                : 'border-transparent lighttext hover:text-gray-700'
                                }`}
                        >
                            Single Orders
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