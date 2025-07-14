'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Crown, Clock, Calendar, Utensils } from 'lucide-react';
import { useVendor } from "@/app/hooks/singleVendor";
import { useVendorSubscription } from "@/app/hooks/useVendorSubscription";
import { toast } from "sonner";

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isVeg: boolean;
    isAvailable: boolean;
}

interface SubscriptionPlan {
    id: string;
    name: string;
    duration: string;
    price: number;
    mealsPerDay: number;
    description: string;
    features: string[];
    discount: number;
    isPopular?: boolean;
}

interface VendorDetails {
    id: string;
    name: string;
    description: string;
    image: string;
    coverImage: string;
    rating: number;
    totalReviews: number;
    deliveryTime: string;
    minimumOrder: number;
    deliveryFee: number;
    isOpen: boolean;
    location: {
        address: string;
        area: string;
        city: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
    contact: {
        phone: string;
        email: string;
    };
    openingHours: {
        [key: string]: string;
    };
    menu: MenuItem[];
    subscriptionPlans: SubscriptionPlan[];
    tags: string[];
}

interface ApiVendorData {
    id: string;
    name: string;
    description: string;
    img_url: string;
    delivery_time: {
        min: number;
        max: number;
    };
    is_open: boolean;
}

const transformVendorData = (apiData: ApiVendorData): VendorDetails => {
    return {
        id: apiData.id,
        name: apiData.name,
        description: apiData.description,
        image: apiData.img_url,
        coverImage: apiData.img_url, // Using same image for cover
        rating: 4.5, // Default values - replace with actual API data when available
        totalReviews: 248,
        deliveryTime: `${apiData.delivery_time.min}-${apiData.delivery_time.max} mins`,
        minimumOrder: 100,
        deliveryFee: 25,
        isOpen: apiData.is_open,
        location: {
            address: "123 Food Street, Block A",
            area: "Dhanmondi",
            city: "Dhaka",
            coordinates: {
                lat: 23.746466,
                lng: 90.376015
            }
        },
        contact: {
            phone: "+880 1234567890",
            email: "orders@vendor.com"
        },
        openingHours: {
            Monday: "11:00 AM - 9:00 PM",
            Tuesday: "11:00 AM - 9:00 PM",
            Wednesday: "11:00 AM - 9:00 PM",
            Thursday: "11:00 AM - 9:00 PM",
            Friday: "11:00 AM - 9:00 PM",
            Saturday: "11:00 AM - 10:00 PM",
            Sunday: "12:00 PM - 8:00 PM"
        },
        menu: [
            {
                id: "1",
                name: "Chicken Biryani",
                description: "Aromatic basmati rice cooked with tender chicken pieces and traditional spices",
                price: 180,
                image: "/api/placeholder/300/200",
                category: "Main Course",
                isVeg: false,
                isAvailable: true
            },
            {
                id: "2",
                name: "Vegetable Curry",
                description: "Mixed vegetables cooked in rich curry sauce with aromatic spices",
                price: 120,
                image: "/api/placeholder/300/200",
                category: "Main Course",
                isVeg: true,
                isAvailable: true
            },
            {
                id: "3",
                name: "Fish Curry",
                description: "Fresh fish cooked in traditional Bengali style with mustard oil and spices",
                price: 200,
                image: "/api/placeholder/300/200",
                category: "Main Course",
                isVeg: false,
                isAvailable: true
            },
            {
                id: "4",
                name: "Dal Tadka",
                description: "Yellow lentils tempered with cumin, mustard seeds, and curry leaves",
                price: 80,
                image: "/api/placeholder/300/200",
                category: "Dal",
                isVeg: true,
                isAvailable: true
            },
            {
                id: "5",
                name: "Mutton Kosha",
                description: "Tender mutton pieces cooked in thick spicy gravy",
                price: 280,
                image: "/api/placeholder/300/200",
                category: "Main Course",
                isVeg: false,
                isAvailable: false
            },
            {
                id: "6",
                name: "Rasgulla",
                description: "Soft cottage cheese balls soaked in sugar syrup",
                price: 60,
                image: "/api/placeholder/300/200",
                category: "Dessert",
                isVeg: true,
                isAvailable: true
            }
        ],
        subscriptionPlans: [
            {
                id: "weekly",
                name: "Weekly Plan",
                duration: "7 days",
                price: 299,
                mealsPerDay: 1,
                description: "Perfect for students who want a healthy lunch every day",
                features: [
                    'Unlimited food delivery',
                    'No delivery charges',
                    'Priority customer support',
                    'Access to exclusive vendors',
                    'Cancel anytime'
                ],
                discount: 10
            },
            {
                id: "monthly",
                name: "Monthly Plan",
                duration: "30 days",
                price: 999,
                mealsPerDay: 1,
                description: "Best value for long-term commitment",
                features: [
                    'Unlimited food delivery',
                    'No delivery charges',
                    'Priority customer support',
                    'Access to exclusive vendors',
                    'Cancel anytime',
                    'Free dessert with every order',
                    '24/7 customer service'
                ],
                discount: 20,
                isPopular: true,
            }
        ],
        tags: ["Homemade", "Bengali", "Vegetarian Options", "Non-Vegetarian", "Healthy"]
    };
};

export interface VendorDetailPageProps {
    params: Promise<{
        vendorId: string;
    }>;
}

export default function ClientVendorPage({ params }: VendorDetailPageProps) {
    const [activeTab, setActiveTab] = useState<'menu' | 'subscription'>('menu');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    // const [vendorLoading, setVendorLoading] = useState(true);
    const [vendorId, setVendorId] = useState<string>('');

    const { subscribe, isLoading: subscriptionLoading, error: subscriptionError, isSuccess } = useVendorSubscription();

    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params;
            setVendorId(resolvedParams.vendorId);
        };
        getParams();
    }, [params]);

    const { data: vendorData, isLoading, error, isError } = useVendor(vendorId);

    const vendor = vendorData ? transformVendorData(vendorData) : null;

    const categories = vendor ? ['All', ...Array.from(new Set(vendor.menu.map(item => item.category)))] : [];

    const filteredMenu = vendor?.menu.filter(item =>
        selectedCategory === 'All' || item.category === selectedCategory
    ) || [];


    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
    };

    const handleSubscribe = async () => {
        if (!selectedPlan) {
            toast("No Plan Selected", {
                description: "Please select a subscription plan before proceeding",
            });
            return;
        }

        if (!vendorId) {
            toast("Vendor Error", {
                description: "Vendor information not found. Please refresh the page and try again.",
            });
            return;
        }
        toast("Processing Subscription...", {
            description: "Please wait while we process your subscription",
        });

        try {
            const result = await subscribe(vendorId, selectedPlan);
        } catch (error) {
            console.error('Subscription failed:', error);
        }
    };

    useEffect(() => {
        if (isSuccess) {
            toast("Subscription Successful! 🎉", {
                description: "Your subscription has been activated. You can now enjoy unlimited food delivery!",
                duration: 1000,
            });

            // Reset selected plan after successful subscription
            setSelectedPlan(null);

            // Optional: You could redirect to a success page or user dashboard
            // router.push('/dashboard/subscription');

            console.log('Subscription completed successfully');
        }
    }, [isSuccess]);

    // Show subscription error if any
    useEffect(() => {
        if (subscriptionError) {
            const errorMessage = subscriptionError instanceof Error
                ? subscriptionError.message
                : 'Something went wrong with your subscription. Please try again.';

            toast("Subscription Failed", {
                description: errorMessage,
                duration: 1000,
            });

            console.error('Subscription error:', subscriptionError);
        }
    }, [subscriptionError]);

    const mapVendorPlansToDisplayPlans = (vendorPlans: SubscriptionPlan[]) => {
        return vendorPlans.map(plan => ({
            id: plan.id,
            name: plan.name,
            price: plan.price,
            duration: plan.duration,
            icon: plan.duration.includes('7 days') ? <Clock className="w-6 h-6" /> : <Calendar className="w-6 h-6" />,
            features: plan.features || [],
            popular: plan.isPopular || false,
            savings: plan.discount ? `Save ৳${Math.round(plan.price * plan.discount / 100)}` : null
        }));
    };

    const displayPlans = vendor ? mapVendorPlansToDisplayPlans(vendor.subscriptionPlans) : [];

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-300"></div>
                </div>
            </div>
        );
    }

    if (isError || !vendor) { // Handle error state and no vendor data
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h3 className="text-xl mb-2 text-red-600">Vendor not found or an error occurred.</h3>
                    {error && <p className="text-sm text-red-500">{error.message}</p>}
                    <Link href="/vendors" className="text-orange-500 hover:underline">
                        Back to Vendors
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: ' #f7f9e6' }}>
            {/* Background SVG Pattern for the entire page */}
            <div className="absolute inset-0 pt-30">
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
            </div>

            {/* Content Wrapper to ensure it's above the SVG background */}
            <div className="relative z-10">
                {/* Header Section */}
                <div className="relative">
                    <Image
                        src={vendor.coverImage}
                        alt={vendor.name}
                        width={800}
                        height={400}
                        className="w-full h-64 md:h-80 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">{vendor.name}</h1>
                        <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                                ⭐ {vendor.rating} ({vendor.totalReviews} reviews)
                            </span>
                            <span>🕒 {vendor.deliveryTime}</span>
                            <span className={`px-2 py-1 rounded ${vendor.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                                {vendor.isOpen ? 'Open' : 'Closed'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8">
                    {/* Sidebar */}
                    <div className="rounded-lg shadow-md p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Location Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div> <p><strong>Address:</strong> {vendor.location.address}</p>
                                <p><strong>Area:</strong> {vendor.location.area}</p>
                                <p><strong>City:</strong> {vendor.location.city}</p></div>
                            <div>
                                <p><strong>Contact:</strong> {vendor.contact.phone}</p>
                                <p><strong>Email:</strong> {vendor.contact.email}</p>
                                <p><strong>Delivery Fee:</strong> ৳{vendor.deliveryFee}</p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        {/* Tab Navigation */}
                        <div className="rounded-lg shadow-md mb-6">
                            <div className="flex border-b">
                                <button
                                    onClick={() => setActiveTab('menu')}
                                    className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'menu'
                                        ? 'border-b-2 border-orange-500 text-orange-500'
                                        : 'text-gray-600 hover:text-orange-500'
                                        }`}
                                >
                                    Menu
                                </button>
                                <button
                                    onClick={() => setActiveTab('subscription')}
                                    className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'subscription'
                                        ? 'border-b-2 border-orange-500 text-orange-500'
                                        : 'text-gray-600 hover:text-orange-500'
                                        }`}
                                >
                                    Subscription Plans
                                </button>
                            </div>

                            {/* Menu Tab */}
                            {activeTab === 'menu' && (
                                <div className="p-6">
                                    {/* Category Filter */}
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {categories.map(category => (
                                            <button
                                                key={category}
                                                onClick={() => setSelectedCategory(category)}
                                                className={`px-4 py-2 rounded-full text-sm font-medium ${selectedCategory === category
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                    }`}
                                            >
                                                {category}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Menu Items */}
                                    <div className="space-y-4">
                                        {filteredMenu.map(item => (
                                            <div
                                                key={item.id}
                                                className={`flex items-center justify-between p-4 border rounded-lg ${item.isAvailable ? 'bg-white' : 'bg-gray-100'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <Image
                                                        src={item.image}
                                                        alt={item.name}
                                                        width={80}
                                                        height={80}
                                                        className="w-20 h-20 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                            <span className={`text-xs px-2 py-1 rounded ${item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                                }`}>
                                                                {item.isVeg ? 'VEG' : 'NON-VEG'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                                                        <p className="font-bold text-lg" style={{ color: '#D98324' }}>
                                                            ৳{item.price}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subscription Tab */}
                            {activeTab === 'subscription' && (
                                <div className="p-6">
                                    <div className="max-w-6xl mx-auto">
                                        {/* Header */}
                                        <div className="text-center pt-5 mb-10">
                                            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full" style={{ backgroundColor: 'rgb(235, 206, 133)' }}>
                                                <Utensils className="w-5 h-5" style={{ color: '#D98324' }} />
                                                <span className="text-sm font-semibold" style={{ color: '#443627' }}>Student plan</span>
                                            </div>
                                            <h1 className="text-3xl lg:text-4xl font-bold mb-4 pt-5" style={{ color: '#443627' }}>
                                                Choose Your<br />
                                                <span style={{ color: '#D98324' }}>Subscription Plan</span>
                                            </h1>
                                        </div>

                                        {/* Plans Grid */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 max-w-5xl mx-auto">
                                            {displayPlans.map((plan) => (
                                                <div
                                                    key={plan.id}
                                                    className={`relative bg-white rounded-3xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-2xl transform hover:-translate-y-2 flex flex-col ${selectedPlan === plan.id
                                                        ? 'shadow-2xl scale-105'
                                                        : ''
                                                        }`}
                                                    style={{
                                                        boxShadow: selectedPlan === plan.id ? '0 0 0 4px #D98324, 0 25px 50px -12px rgba(0, 0, 0, 0.25)' : undefined
                                                    }}
                                                    onClick={() => handlePlanSelect(plan.id)}
                                                >
                                                    {/* Popular Badge */}
                                                    {plan.popular && (
                                                        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                                                            <div
                                                                className="text-white px-8 py-3 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg"
                                                                style={{ background: 'rgb(202, 83, 35)' }}
                                                            >
                                                                <Crown className="w-5 h-5" />
                                                                Most Popular Choice
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Savings Badge */}
                                                    {/* {plan.savings && (
                                                        <div className="absolute -top-3 -right-3">
                                                            <div className="bg-green-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                                                {plan.savings}
                                                            </div>
                                                        </div>
                                                    )} */}

                                                    <div className="p-8 flex flex-col flex-grow">
                                                        {/* Plan Header */}
                                                        <div className="flex items-center gap-4 mb-8">
                                                            <div
                                                                className={`p-4 rounded-2xl transition-all duration-300 ${selectedPlan === plan.id
                                                                    ? 'text-white'
                                                                    : 'text-white'
                                                                    }`}
                                                                style={{
                                                                    backgroundColor: selectedPlan === plan.id ? ' #D98324' : '#EFDCAB'
                                                                }}
                                                            >
                                                                {plan.icon}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-2xl font-bold" style={{ color: '#443627' }}>
                                                                    {plan.name}
                                                                </h3>
                                                                <p style={{ color: '#a0896b' }}>{plan.duration}</p>
                                                            </div>
                                                        </div>

                                                        {/* Price */}
                                                        <div className="mb-8">
                                                            <div className="flex items-baseline gap-2">
                                                                <span className="text-5xl font-bold" style={{ color: '#443627' }}>
                                                                    ৳{plan.price}
                                                                </span>
                                                                <span style={{ color: '#a0896b' }}>/{plan.duration}</span>
                                                            </div>
                                                            {plan.duration.includes('30 days') && (
                                                                <p className="text-sm mt-2" style={{ color: '#a0896b' }}>
                                                                    Only ৳{Math.round(plan.price / 30)}/day
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Features */}
                                                        <div className="space-y-4 mb-8">
                                                            {plan.features.map((feature, index) => (
                                                                <div key={index} className="flex items-center gap-3">
                                                                    <div
                                                                        className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${selectedPlan === plan.id
                                                                            ? 'text-white'
                                                                            : 'text-white'
                                                                            }`}
                                                                        style={{
                                                                            backgroundColor: selectedPlan === plan.id ? '#D98324' : '#EFDCAB'
                                                                        }}
                                                                    >
                                                                        <Check className="w-4 h-4" />
                                                                    </div>
                                                                    <span style={{ color: '#443627' }}>{feature}</span>
                                                                </div>
                                                            ))}
                                                        </div>

                                                        {/* Selection Button */}
                                                        <div className="mt-auto pt-2">
                                                            <button
                                                                className={`mx-auto block py-3 px-8 rounded-3xl font-semibold text-lg transition-all duration-300 ${selectedPlan === plan.id
                                                                    ? 'text-white shadow-lg transform scale-105'
                                                                    : 'text-white hover:shadow-lg hover:transform hover:scale-105'
                                                                    }`}
                                                                style={{
                                                                    background: selectedPlan === plan.id
                                                                        ? '#D98324'
                                                                        : 'rgb(233, 200, 119) 100%'
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePlanSelect(plan.id);
                                                                }}
                                                            >
                                                                {selectedPlan === plan.id ? (
                                                                    <span className="flex items-center justify-center gap-2">
                                                                        <Check className="w-5 h-5" />
                                                                        Selected
                                                                    </span>
                                                                ) : (
                                                                    'Select This Plan'
                                                                )}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Subscribe Button */}
                                        <div className="text-center mb-10">
                                            <button
                                                onClick={handleSubscribe}
                                                disabled={!selectedPlan || subscriptionLoading}
                                                className={`px-16 py-5 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${selectedPlan && !subscriptionLoading
                                                    ? 'text-white hover:shadow-2xl'
                                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                    }`}
                                                style={{
                                                    background: selectedPlan && !subscriptionLoading
                                                        ? 'rgb(236, 116, 47)'
                                                        : undefined
                                                }}
                                            >
                                                {subscriptionLoading ? (
                                                    <span className="flex items-center gap-3">
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                        Processing...
                                                    </span>
                                                ) : selectedPlan ? (
                                                    'Subscribe Now →'
                                                ) : (
                                                    'Select a Plan Above'
                                                )}
                                            </button>

                                            {selectedPlan && (
                                                <p className="text-sm mt-4" style={{ color: '#a0896b' }}>
                                                    🔒 Secure payment with SSLCOMMERZ • Cancel anytime
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* </div> */}

                    {/* Footer Info */}
                    <div className="rounded-3xl p-8 shadow-md">
                        <h4 className="font-bold text-xl mb-6 text-center" style={{ color: '#443627' }}>
                            Why Students Love Our Subscription
                        </h4>
                        <div className="grid md:grid-cols-3 gap-6 text-center">
                            <div>
                                <div className="font-semibold mb-2" style={{ color: '#D98324' }}>
                                    No Hidden Fees
                                </div>
                                <p className="text-sm" style={{ color: '#a0896b' }}>
                                    Transparent pricing with no surprise charges
                                </p>
                            </div>
                            <div>
                                <div className="font-semibold mb-2" style={{ color: '#D98324' }}>
                                    Instant Activation
                                </div>
                                <p className="text-sm" style={{ color: '#a0896b' }}>
                                    Start ordering immediately after payment
                                </p>
                            </div>
                            <div>
                                <div className="font-semibold mb-2" style={{ color: '#D98324' }}>
                                    Easy Cancellation
                                </div>
                                <p className="text-sm" style={{ color: '#a0896b' }}>
                                    Cancel anytime through your account
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}