'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

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

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

// Dummy data
const getDummyVendorData = (id: string): VendorDetails => (

    {
        id,
        name: "Mama's Kitchen",
        description: "Authentic homemade meals prepared with love and fresh ingredients. We specialize in traditional recipes passed down through generations.",
        image: "/api/placeholder/400/240",
        coverImage: "/api/placeholder/800/400",
        rating: 4.5,
        totalReviews: 248,
        deliveryTime: "30-45 mins",
        minimumOrder: 100,
        deliveryFee: 25,
        isOpen: true,
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
            email: "orders@mamaskitchen.com"
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
                id: "basic",
                name: "Basic Plan",
                duration: "7 days",
                price: 800,
                mealsPerDay: 1,
                description: "Perfect for students who want a healthy lunch every day",
                features: ["1 meal per day", "Free delivery", "Menu variety", "Cancel anytime"],
                discount: 10
            },
            {
                id: "standard",
                name: "Standard Plan",
                duration: "15 days",
                price: 1500,
                mealsPerDay: 1,
                description: "Great value for regular customers",
                features: ["1 meal per day", "Free delivery", "Menu variety", "Cancel anytime", "Weekend specials"],
                discount: 15
            },
            {
                id: "premium",
                name: "Premium Plan",
                duration: "30 days",
                price: 2800,
                mealsPerDay: 1,
                description: "Best value for long-term commitment",
                features: ["1 meal per day", "Free delivery", "Menu variety", "Cancel anytime", "Weekend specials", "Priority support"],
                discount: 20
            }
        ],
        tags: ["Homemade", "Bengali", "Vegetarian Options", "Non-Vegetarian", "Healthy"]
    });

interface VendorDetailPageProps {
    vendorId: string;
}

export default function ClientVendorPage({ vendorId }: VendorDetailPageProps) {
    const [vendor, setVendor] = useState<VendorDetails | null>(null);
    const [activeTab, setActiveTab] = useState<'menu' | 'subscription'>('menu');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVendor = async () => {
            setLoading(true);
            await new Promise((res) => setTimeout(res, 500)); // Simulate delay
            const data = getDummyVendorData(vendorId);
            setVendor(data);
            setLoading(false);
        };
        fetchVendor();
    }, [vendorId]);

    const categories = vendor ? ['All', ...Array.from(new Set(vendor.menu.map(item => item.category)))] : [];

    const filteredMenu = vendor?.menu.filter(item =>
        selectedCategory === 'All' || item.category === selectedCategory
    ) || [];

    const addToCart = (item: MenuItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id
                        ? { ...cartItem, quantity: cartItem.quantity + 1 }
                        : cartItem
                );
            }
            return [...prevCart, {
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: 1,
                image: item.image
            }];
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart(prevCart => {
            return prevCart.reduce((acc, item) => {
                if (item.id === itemId) {
                    if (item.quantity > 1) {
                        acc.push({ ...item, quantity: item.quantity - 1 });
                    }
                } else {
                    acc.push(item);
                }
                return acc;
            }, [] as CartItem[]);
        });
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartItemCount = () => {
        return cart.reduce((total, item) => total + item.quantity, 0);
    };

    const handleSubscriptionPurchase = (planId: string) => {
        setSelectedPlan(planId);
        // Here you would integrate with payment system
        alert(`Subscription selected: ${vendor?.subscriptionPlans.find(p => p.id === planId)?.name}`);
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
                </div>
            </div>
        );
    }

    if (!vendor) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h3 className="text-xl mb-2 text-red-600">Vendor not found</h3>
                    <Link href="/vendors" className="text-orange-500 hover:underline">
                        Back to Vendors
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
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

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Vendor Info */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <p className="text-gray-600 mb-4">{vendor.description}</p>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {vendor.tags.map(tag => (
                                    <span key={tag} className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="font-semibold">Minimum Order: ৳{vendor.minimumOrder}</p>
                                    <p>Delivery Fee: ৳{vendor.deliveryFee}</p>
                                </div>
                                <div>
                                    <p className="font-semibold">Contact: {vendor.contact.phone}</p>
                                    <p>Email: {vendor.contact.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="bg-white rounded-lg shadow-md mb-6">
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
                                                <div className="flex items-center gap-2">
                                                    {cart.find(cartItem => cartItem.id === item.id) ? (
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => removeFromCart(item.id)}
                                                                className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                                                            >
                                                                -
                                                            </button>
                                                            <span className="w-8 text-center">
                                                                {cart.find(cartItem => cartItem.id === item.id)?.quantity || 0}
                                                            </span>
                                                            <button
                                                                onClick={() => addToCart(item)}
                                                                className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600"
                                                                disabled={!item.isAvailable}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => addToCart(item)}
                                                            disabled={!item.isAvailable}
                                                            className={`px-4 py-2 rounded-lg font-medium ${item.isAvailable
                                                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Subscription Tab */}
                            {activeTab === 'subscription' && (
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {vendor.subscriptionPlans.map(plan => (
                                            <div
                                                key={plan.id}
                                                className={`border rounded-lg p-6 ${selectedPlan === plan.id
                                                    ? 'border-orange-500 bg-orange-50'
                                                    : 'border-gray-200 hover:border-orange-300'
                                                    }`}
                                            >
                                                <div className="text-center mb-4">
                                                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                                    <div className="text-3xl font-bold text-orange-500 mb-1">
                                                        ৳{plan.price}
                                                    </div>
                                                    <p className="text-sm text-gray-600">{plan.duration}</p>
                                                    <p className="text-sm text-green-600 font-medium">
                                                        {plan.discount}% off regular price
                                                    </p>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                                                <ul className="text-sm space-y-2 mb-6">
                                                    {plan.features.map((feature, index) => (
                                                        <li key={index} className="flex items-center gap-2">
                                                            <span className="text-green-500">✓</span>
                                                            {feature}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button
                                                    onClick={() => handleSubscriptionPurchase(plan.id)}
                                                    className={`w-full py-3 rounded-lg font-medium transition-colors ${selectedPlan === plan.id
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-gray-200 text-gray-700 hover:bg-orange-500 hover:text-white'
                                                        }`}
                                                >
                                                    Select Plan
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Location Info */}
                        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                            <h3 className="text-lg font-semibold mb-4">Location & Hours</h3>
                            <div className="space-y-2 text-sm">
                                <p><strong>Address:</strong> {vendor.location.address}</p>
                                <p><strong>Area:</strong> {vendor.location.area}</p>
                                <p><strong>City:</strong> {vendor.location.city}</p>
                            </div>
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">Opening Hours</h4>
                                <div className="text-sm space-y-1">
                                    {Object.entries(vendor.openingHours).map(([day, hours]) => (
                                        <div key={day} className="flex justify-between">
                                            <span>{day}:</span>
                                            <span>{hours}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Cart Summary */}
                        {cart.length > 0 && (
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    Cart ({getCartItemCount()} items)
                                </h3>
                                <div className="space-y-3 mb-4">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-medium">{item.name}</p>
                                                <p className="text-sm text-gray-600">
                                                    ৳{item.price} x {item.quantity}
                                                </p>
                                            </div>
                                            <p className="font-semibold">৳{item.price * item.quantity}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="border-t pt-3">
                                    <div className="flex justify-between items-center mb-2">
                                        <span>Subtotal:</span>
                                        <span className="font-semibold">৳{getCartTotal()}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span>Delivery Fee:</span>
                                        <span>৳{vendor.deliveryFee}</span>
                                    </div>
                                    <div className="flex justify-between items-center font-bold text-lg border-t pt-2">
                                        <span>Total:</span>
                                        <span>৳{getCartTotal() + vendor.deliveryFee}</span>
                                    </div>
                                </div>
                                <button
                                    className="w-full mt-4 bg-orange-500 text-white py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                                    disabled={getCartTotal() < vendor.minimumOrder}
                                >
                                    {getCartTotal() < vendor.minimumOrder
                                        ? `Minimum order ৳${vendor.minimumOrder}`
                                        : 'Proceed to Checkout'
                                    }
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );


}