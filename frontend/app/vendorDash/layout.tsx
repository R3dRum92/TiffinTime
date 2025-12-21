'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Home,
    ShoppingBag,
    Menu as MenuIcon,
    Settings,
    X,
    LogOut,
    MessageSquare,
} from 'lucide-react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VendorGuard from '@/components/auth/VendorGuard';

const queryClient = new QueryClient();

export default function VendorLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();

    // Close sidebar when screen size changes to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        try {
            // Clear any stored authentication tokens
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('userSession');

            // Clear session storage
            sessionStorage.clear();

            // Clear cookies (if using cookies for auth)
            document.cookie.split(";").forEach((c) => {
                const eqPos = c.indexOf("=");
                const name = eqPos > -1 ? c.substr(0, eqPos) : c;
                document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
            });

            // Optional: Call logout API endpoint
            // await fetch('/api/auth/logout', { method: 'POST' });

            // Redirect to login page
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
            // Even if there's an error, still redirect to login
            router.push('/');
        }
    };

    const sidebarItems = [
        { href: '/vendorDash', icon: Home, label: 'Dashboard' },
        { href: '/vendorDash/orders', icon: ShoppingBag, label: 'Orders' },
        { href: '/vendorDash/menu', icon: MenuIcon, label: 'Menu Routine' },
        { href: '/vendorDash/reviews', icon: MessageSquare, label: 'Reviews' },
        { href: '/vendorDash/settings', icon: Settings, label: 'Settings' },
    ];

    return (
        <VendorGuard>
            <QueryClientProvider client={queryClient}>
                <div className="flex min-h-screen bg-[#fdf4dc] w-full">
                    {/* Mobile Sidebar */}
                    <div
                        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 md:hidden transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                            }`}
                    >
                        <div className="p-6 pt-20 flex flex-col h-full">
                            <button
                                className="absolute top-4 right-4 p-2 rounded-md hover:bg-gray-100 transition-colors"
                                onClick={() => setSidebarOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <nav className="space-y-2 flex-1">
                                {sidebarItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className="flex items-center space-x-3 text-gray-700 hover:bg-orange-100 p-2 rounded-md transition-colors"
                                    >
                                        <item.icon className="w-5 h-5 text-orange-500" />
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </nav>

                            {/* Logout Button */}
                            <div className="mt-auto pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleLogout}
                                    className="w-full bgtheme text-white font-bold px-6 py-2 rounded-full hover:bg-red-500 transition-colors cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Desktop Sidebar */}
                    <aside className="hidden md:block w-64 bg-white shadow-md fixed h-screen z-20">
                        <div className="p-6 pt-15 flex flex-col h-full">
                            <Link href={"/"} className="text-3xl font-bold">
                                <span className="theme">Tiffin</span>
                                <span className="darktext">Time</span>
                            </Link>

                            <nav className="space-y-2 pt-15 flex-1">
                                {sidebarItems.map((item) => (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex items-center space-x-3 text-gray-700 hover:bg-orange-100 p-2 rounded-md transition-colors"
                                    >
                                        <item.icon className="w-5 h-5 text-orange-500" />
                                        <span>{item.label}</span>
                                    </Link>
                                ))}
                            </nav>

                            {/* Logout Button */}
                            <div className="mt-auto pt-4 border-t border-gray-200">
                                <button
                                    onClick={handleLogout}
                                    className="w-full bgtheme text-white font-bold px-6 py-2 rounded-full hover:bg-red-500 hover:scale-105 hover:shadow-lg transition-all duration-300 ease-in-out transform transition-colors cursor-pointer"
                                >
                                    Logout
                                </button>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Top Bar */}
                    <div className="md:hidden fixed top-0 left-0 right-0 bg-white p-4 shadow-md z-40 flex justify-between items-center">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
                        >
                            <MenuIcon className="w-6 h-6 text-orange-500" />
                        </button>
                        <Link href={"/"} className="text-3xl font-bold">
                            <span className="theme">Tiffin</span>
                            <span className="darktext">Time</span>
                        </Link>
                        <div className="w-10" />
                        {/* Spacer for centering */}
                    </div>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0 md:ml-64 p-4 pt-6 relative">
                        <div className="pt-14 md:pt-0 w-full">
                            {children}
                        </div>
                    </main>
                </div>
            </QueryClientProvider>
        </VendorGuard>
    );
}