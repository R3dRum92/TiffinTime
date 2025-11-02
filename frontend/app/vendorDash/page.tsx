// 'use client';

// import { useState } from 'react';
// import { ShoppingBag, User, Star, Clock, ChefHat } from 'lucide-react';
// import { useSubscribers } from '../hooks/useSubscribers';

// export default function VendorDashboard() {
//     const [vendorStats] = useState({
//         activeOrdersToday: 15,
//         totalMealsToday: 42,
//         pendingSingleOrders: 8,
//         averageRating: 4.7
//     });


//     const { data: subscribers, isLoading, isError } = useSubscribers();



//     return (
//         <div>
//             {/* Main Content */}
//             <div className="p-6 pt-20">
//                 <div className="mb-6">
//                     <h1 className="text-3xl font-bold darktext">
//                         Welcome Back, Chef! 👨‍🍳
//                     </h1>
//                     <p className="lighttext">Here&apos;s what&apos;s happening in your kitchen today</p>
//                 </div>

//                 {/* Stats Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                     <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-300">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="lighttext text-sm font-medium">Active Orders Today</p>
//                                 <p className="text-2xl font-bold darktext">{vendorStats.activeOrdersToday}</p>
//                             </div>
//                             <ShoppingBag className="w-8 h-8 theme" />
//                         </div>
//                     </div>

//                     <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-300">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="lighttext text-sm font-medium">Total Meals to Prepare</p>
//                                 <p className="text-2xl font-bold darktext">{vendorStats.totalMealsToday}</p>
//                             </div>
//                             <ChefHat className="w-8 h-8 theme" />
//                         </div>
//                     </div>

//                     <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-300">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="lighttext text-sm font-medium">Pending Single Orders</p>
//                                 <p className="text-2xl font-bold darktext">{vendorStats.pendingSingleOrders}</p>
//                             </div>
//                             <Clock className="w-8 h-8 theme" />
//                         </div>
//                     </div>

//                     <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-300">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="lighttext text-sm font-medium">Average Rating</p>
//                                 <p className="text-2xl font-bold darktext">{vendorStats.averageRating}/5</p>
//                             </div>
//                             <Star className="w-8 h-8 theme" />
//                         </div>
//                     </div>
//                 </div>

//                 {/* My Subscribers */}
//                 <div className="bg-white rounded-lg shadow-md p-6">
//                     <h2 className="text-xl font-bold mb-4 darktext">My Subscribers</h2>

//                     {isLoading ? (
//                         <p className="lighttext">Loading subscribers...</p>
//                     ) : isError ? (
//                         <p className="text-red-500">Failed to load subscribers.</p>
//                     ) : (
//                         <div className="overflow-x-auto">
//                             <table className="w-full">
//                                 <thead>
//                                     <tr className="border-b">
//                                         <th className="text-left py-3 px-4 font-medium darktext">Subscriber Name</th>
//                                         <th className="text-left py-3 px-4 font-medium darktext">Started</th>
//                                         <th className="text-left py-3 px-4 font-medium darktext">Ends</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody>
//                                     {subscribers?.map(subscriber => (
//                                         <tr key={subscriber.id} className="border-b hover:bg-gray-50">
//                                             <td className="py-3 px-4">
//                                                 <div className="flex items-center space-x-3">
//                                                     <div className="w-8 h-8 rounded-full flex items-center justify-center bglight">
//                                                         <User className="w-4 h-4 theme" />
//                                                     </div>
//                                                     <span className="font-medium darktext">{subscriber.name}</span>
//                                                 </div>
//                                             </td>
//                                             <td className="py-3 px-4 lighttext">{subscriber.start_date}</td>
//                                             <td className="py-3 px-4 lighttext">{subscriber.end_date}</td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </div>

//             </div>
//         </div>
//     );
// }

'use client';

import { useState, useMemo } from 'react';
import { ShoppingBag, User, Star, Clock, Package } from 'lucide-react';
import { useSubscribers } from '../hooks/useSubscribers';
import { useVendorOrders } from '@/app/hooks/useOrder';
import { useVendorInfo } from '@/app/hooks/getVendorDetails';
import { format } from 'date-fns';

export default function VendorDashboard() {
    const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');

    // Get vendor details from token
    const { vendor } = useVendorInfo();
    const vendorId = vendor?.id || null;

    // Fetch subscribers and orders
    const { data: subscribers, isLoading, isError } = useSubscribers();
    const { data: singleOrders } = useVendorOrders(vendorId);

    // Calculate statistics
    const stats = useMemo(() => {
        const activeSubscribers = subscribers?.filter(sub => {
            const today = new Date();
            const startDate = new Date(sub.start_date);
            const endDate = new Date(sub.end_date);
            return today >= startDate && today <= endDate;
        }) || [];

        const pendingSingleOrders = singleOrders?.filter(order => !order.is_delivered).length || 0;
        const activeOrdersToday = activeSubscribers.length + pendingSingleOrders;

        return {
            activeOrdersToday,
            pendingSingleOrders,
            averageRating: 4.7 // This would come from your backend
        };
    }, [subscribers, singleOrders]);

    // Separate active and expired subscribers
    const { activeSubscribers, expiredSubscribers } = useMemo(() => {
        if (!subscribers) return { activeSubscribers: [], expiredSubscribers: [] };

        const today = new Date();
        const active = subscribers.filter(sub => {
            const startDate = new Date(sub.start_date);
            const endDate = new Date(sub.end_date);
            return today >= startDate && today <= endDate;
        });

        const expired = subscribers.filter(sub => {
            const endDate = new Date(sub.end_date);
            return today > endDate;
        });

        return { activeSubscribers: active, expiredSubscribers: expired };
    }, [subscribers]);

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return format(date, 'MMM dd, yyyy');
        } catch {
            return dateString;
        }
    };

    const ActiveSubscribers = () => (
        <div className="overflow-x-auto">
            {activeSubscribers.length === 0 ? (
                <div className="text-center py-16">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg text-gray-500 mb-2">No active subscribers</p>
                    <p className="text-sm text-gray-400">Active subscribers will appear here</p>
                </div>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium darktext">Subscriber Name</th>
                            <th className="text-left py-3 px-4 font-medium darktext">Started</th>
                            <th className="text-left py-3 px-4 font-medium darktext">Ends</th>
                            <th className="text-left py-3 px-4 font-medium darktext">Days Left</th>
                            <th className="text-left py-3 px-4 font-medium darktext">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeSubscribers.map(subscriber => {
                            const today = new Date();
                            const endDate = new Date(subscriber.end_date);
                            const daysLeft = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                            return (
                                <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center bglight">
                                                <User className="w-4 h-4 theme" />
                                            </div>
                                            <span className="font-medium darktext">{subscriber.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 lighttext">{formatDate(subscriber.start_date)}</td>
                                    <td className="py-3 px-4 lighttext">{formatDate(subscriber.end_date)}</td>
                                    <td className="py-3 px-4 text-gray-700 font-medium">
                                        {daysLeft > 0 ? `${daysLeft} days` : 'Expires today'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            ACTIVE
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </div>
    );

    const ExpiredSubscribers = () => (
        <div className="overflow-x-auto">
            {expiredSubscribers.length === 0 ? (
                <div className="text-center py-16">
                    <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg text-gray-500 mb-2">No expired subscribers</p>
                    <p className="text-sm text-gray-400">Expired subscribers will appear here</p>
                </div>
            ) : (
                <table className="w-full">
                    <thead>
                        <tr className="border-b">
                            <th className="text-left py-3 px-4 font-medium darktext">Subscriber Name</th>
                            <th className="text-left py-3 px-4 font-medium darktext">Started</th>
                            <th className="text-left py-3 px-4 font-medium darktext">Ended</th>
                            <th className="text-left py-3 px-4 font-medium darktext">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {expiredSubscribers.map(subscriber => (
                            <tr key={subscriber.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200">
                                            <User className="w-4 h-4 text-gray-500" />
                                        </div>
                                        <span className="font-medium text-gray-600">{subscriber.name}</span>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-gray-500">{formatDate(subscriber.start_date)}</td>
                                <td className="py-3 px-4 text-gray-500">{formatDate(subscriber.end_date)}</td>
                                <td className="py-3 px-4">
                                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                        EXPIRED
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );

    return (
        <div>
            {/* Main Content */}
            <div className="p-6 pt-20">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold darktext">
                        Welcome Back, <span className='theme'>{vendor?.name || 'Chef'}!</span> 👨‍🍳
                    </h1>
                    <p className="lighttext">Here&apos;s what&apos;s happening in your kitchen today</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="lighttext text-sm font-medium">Active Orders Today</p>
                                <p className="text-2xl font-bold darktext">{stats.activeOrdersToday}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {activeSubscribers.length} subscriptions + {stats.pendingSingleOrders} single
                                </p>
                            </div>
                            <ShoppingBag className="w-8 h-8 theme" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="lighttext text-sm font-medium">Pending Single Orders</p>
                                <p className="text-2xl font-bold darktext">{stats.pendingSingleOrders}</p>
                            </div>
                            <Clock className="w-8 h-8 theme" />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-300">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="lighttext text-sm font-medium">Average Rating</p>
                                <p className="text-2xl font-bold darktext">{stats.averageRating}/5</p>
                            </div>
                            <Star className="w-8 h-8 theme" />
                        </div>
                    </div>
                </div>

                {/* My Subscribers */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4 darktext">My Subscribers</h2>

                    {isLoading ? (
                        <p className="lighttext">Loading subscribers...</p>
                    ) : isError ? (
                        <p className="text-red-500">Failed to load subscribers.</p>
                    ) : (
                        <>
                            {/* Tab Navigation */}
                            <div className="border-b border-gray-200 mb-6">
                                <nav className="flex space-x-8">
                                    <button
                                        onClick={() => setActiveTab('active')}
                                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'active'
                                                ? 'border-orange-500 theme'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Active Subscribers
                                        {activeSubscribers.length > 0 && (
                                            <span className="ml-2 bg-green-100 text-green-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                {activeSubscribers.length}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('expired')}
                                        className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                                            activeTab === 'expired'
                                                ? 'border-orange-500 theme'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        Expired Subscribers
                                        {expiredSubscribers.length > 0 && (
                                            <span className="ml-2 bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                                                {expiredSubscribers.length}
                                            </span>
                                        )}
                                    </button>
                                </nav>
                            </div>

                            {/* Tab Content */}
                            {activeTab === 'active' && <ActiveSubscribers />}
                            {activeTab === 'expired' && <ExpiredSubscribers />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}