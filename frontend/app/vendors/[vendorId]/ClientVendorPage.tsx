'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
// Icons
import { Check, Crown, Clock, Calendar, Utensils, Loader2, MessageSquare, MapPin, Phone, Mail, DollarSign } from 'lucide-react';
// Custom hooks
import { useVendor } from "@/app/hooks/singleVendor";
import { useUserInfo } from "@/app/hooks/getUserDetails";
// UI Components
import RatingStars from "@/components/ui/RatingStars";
import { toast } from "sonner";
// Payment & Logic
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useMutation } from '@tanstack/react-query';
// We are keeping your existing review hooks/components usage
import { useReviewSubmission } from "@/app/hooks/useReviewSubmission";
import { useVendorReviews } from "@/app/hooks/useVendorReviews";

// --- Interfaces ---
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
    id: string; // "weekly" or "monthly"
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
        coordinates: { lat: number; lng: number };
    };
    contact: {
        phone: string;
        email: string;
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
    delivery_time: { min: number; max: number; };
    is_open: boolean;
}

// --- Data Transformation ---
const transformVendorData = (apiData: ApiVendorData): VendorDetails => {
    return {
        id: apiData.id,
        name: apiData.name,
        description: apiData.description,
        image: apiData.img_url,
        coverImage: apiData.img_url,
        rating: 4.5,
        totalReviews: 248,
        deliveryTime: `${apiData.delivery_time.min}-${apiData.delivery_time.max} mins`,
        minimumOrder: 100,
        deliveryFee: 25,
        isOpen: apiData.is_open,
        location: { address: "123 Food Street, Block A", area: "Dhanmondi", city: "Dhaka", coordinates: { lat: 23.746466, lng: 90.376015 } },
        contact: { phone: "+880 1234567890", email: "orders@vendor.com" },
        menu: [
            { id: "1", name: "Chicken Biryani", description: "Aromatic basmati rice cooked with tender chicken pieces", price: 180, image: "/api/placeholder/300/200", category: "Main Course", isVeg: false, isAvailable: true },
            { id: "2", name: "Vegetable Curry", description: "Mixed vegetables cooked in rich curry sauce", price: 120, image: "/api/placeholder/300/200", category: "Main Course", isVeg: true, isAvailable: true },
            { id: "3", name: "Fish Curry", description: "Fresh fish cooked in traditional Bengali style", price: 200, image: "/api/placeholder/300/200", category: "Main Course", isVeg: false, isAvailable: true },
        ],
        subscriptionPlans: [
            {
                id: "weekly", // Matches the 'type'
                name: "Weekly Plan",
                duration: "7 days",
                price: 299,
                mealsPerDay: 1,
                description: "Perfect for students who want a healthy lunch every day",
                features: ['Unlimited food delivery', 'No delivery charges', 'Priority customer support', 'Cancel anytime'],
                discount: 10
            },
            {
                id: "monthly", // Matches the 'type'
                name: "Monthly Plan",
                duration: "30 days",
                price: 999,
                mealsPerDay: 1,
                description: "Best value for long-term commitment",
                features: ['Unlimited food delivery', 'No delivery charges', 'Priority support', 'Free dessert', '24/7 service'],
                discount: 20,
                isPopular: true,
            }
        ],
        tags: ["Homemade", "Bengali", "Vegetarian Options"]
    };
};

// --- API Hooks ---
const useCreateSubscriptionOrder = () => {
    return useMutation({
        // UPDATED: Now only accepts vendor_id and type
        mutationFn: async (data: { vendor_id: string, type: string }) => {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/subscribe/${data.vendor_id}`, data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response.data;
        }
    });
};

const useInitPayment = () => {
    return useMutation({
        mutationFn: async (paymentData: any) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/payment/init`, paymentData, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        }
    });
};

// --- Placeholder Modals ---
const ReviewModal = ({ isOpen, onClose, vendorId, vendorName }: any) => isOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="bg-white p-6 rounded">Review Modal Placeholder <button onClick={onClose}>Close</button></div></div> : null;
const ReviewsDisplayModal = ({ isOpen, onClose, vendorId, vendorName, totalReviews }: any) => isOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"><div className="bg-white p-6 rounded">Reviews List Placeholder <button onClick={onClose}>Close</button></div></div> : null;

// --- Main Page Component ---
export default function ClientVendorPage({ params }: { params: Promise<{ vendorId: string; }> }) {
    const [activeTab, setActiveTab] = useState<'menu' | 'subscription'>('menu');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [vendorId, setVendorId] = useState<string>('');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const { user } = useUserInfo();
    const createSubscriptionMutation = useCreateSubscriptionOrder();
    const initPaymentMutation = useInitPayment();

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
    const filteredMenu = vendor?.menu.filter(item => selectedCategory === 'All' || item.category === selectedCategory) || [];

    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
    };

    // --- PAYMENT LOGIC ---
    const handleSubscribe = async () => {
        if (!selectedPlan) {
            toast.error("No Plan Selected", { description: "Please select a subscription plan." });
            return;
        }
        if (!user) {
            toast.error("Login Required", { description: "Please log in to subscribe." });
            return;
        }
        if (!vendor) return;

        // We still need plan details locally to calculate the total amount for the Payment Gateway
        const planDetails = vendor.subscriptionPlans.find(p => p.id === selectedPlan);
        if (!planDetails) return;

        setIsProcessing(true);
        const transactionId = uuidv4();

        try {
            toast.info("Creating Subscription...", { description: "Please wait a moment." });

            // 1. Create Subscription Record (Pending Status)
            // UPDATED PAYLOAD: Only sending vendor_id and type ('weekly' or 'monthly')
            const subscriptionRecord = await createSubscriptionMutation.mutateAsync({
                vendor_id: vendorId,
                type: selectedPlan // selectedPlan is "weekly" or "monthly"
            });

            // 2. Prepare Payment Payload
            // Using 'subscription_id' from step 1, but using local planDetails for the amount
            const paymentPayload = {
                subscription_id: subscriptionRecord.id,
                total_amount: planDetails.price,
                tran_id: transactionId,
                cus_add1: "Digital Subscription",
                cus_city: "Dhaka",
                num_of_item: 1,
                product_name: `${planDetails.name} Subscription`,
                product_category: "Subscription"
            };

            toast.info("Redirecting to Payment...", { description: "Handing over to SSLCommerz." });

            // 3. Initiate Payment
            const paymentResponse = await initPaymentMutation.mutateAsync(paymentPayload);

            if (paymentResponse?.status === 'SUCCESS' && paymentResponse?.GatewayPageURL) {
                window.location.href = paymentResponse.GatewayPageURL;
            } else {
                throw new Error("Failed to get payment gateway URL");
            }

        } catch (err) {
            console.error('Subscription failed:', err);
            toast.error("Subscription Failed", {
                description: "Could not initiate payment. Please try again."
            });
            setIsProcessing(false);
        }
    };

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

    // --- Loading & Error States ---
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9f5e6' }}>
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#D98324]" />
                    <p className="text-lg text-[#443627]">Loading vendor details...</p>
                </div>
            </div>
        );
    }

    if (isError || !vendor) {
        return (
            <div className="container mx-auto px-4 py-8 mt-20">
                <div className="text-center py-12">
                    <h3 className="text-xl mb-2 text-red-600">Vendor not found.</h3>
                    <Link href="/vendors" className="text-orange-500 hover:underline">Back to Vendors</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#f9f5e6' }}>
            {/* Modals */}
            <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} vendorId={vendorId} vendorName={vendor.name} />
            <ReviewsDisplayModal isOpen={isReviewsModalOpen} onClose={() => setIsReviewsModalOpen(false)} vendorId={vendorId} vendorName={vendor.name} totalReviews={vendor.totalReviews} />

            <div className="relative z-10">
                {/* Header Section */}
                <div className="container mx-auto px-4 py-6 pt-24">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white rounded-xl shadow-lg p-6">
                        <div className="relative w-full md:w-48 h-48 flex-shrink-0">
                            <Image
                                src={vendor.coverImage}
                                alt={vendor.name}
                                fill
                                className="object-cover rounded-xl shadow-sm"
                            />
                        </div>
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2 text-[#443627]">{vendor.name}</h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded text-yellow-800">
                                            <span>⭐ {vendor.rating}</span>
                                            <button onClick={() => setIsReviewsModalOpen(true)} className="hover:underline font-medium">
                                                ({vendor.totalReviews} reviews)
                                            </button>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-4 h-4 text-[#D98324]" />
                                            {vendor.deliveryTime}
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs font-bold text-white ${vendor.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {vendor.isOpen ? 'OPEN NOW' : 'CLOSED'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {vendor.tags.map(tag => (
                                            <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsReviewModalOpen(true)}
                                    className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#D98324] text-white rounded-lg font-semibold hover:bg-opacity-90 transition-all shadow-md hover:shadow-lg"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Write Review
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 text-sm text-gray-600 border-t pt-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-gray-400" />
                                        {vendor.location.address}, {vendor.location.area}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        {vendor.contact.phone}
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-gray-400" />
                                        {vendor.contact.email}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                        Delivery: ৳{vendor.deliveryFee} (Min ৳{vendor.minimumOrder})
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8">
                    {/* Tab Navigation */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                        <div className="flex border-b">
                            <button
                                onClick={() => setActiveTab('menu')}
                                className={`flex-1 py-4 px-6 text-center font-bold text-lg transition-colors ${activeTab === 'menu' ? 'border-b-4 border-[#D98324] text-[#D98324] bg-orange-50' : 'text-gray-500 hover:text-[#D98324] hover:bg-gray-50'}`}
                            >
                                <Utensils className="w-5 h-5 inline-block mr-2 mb-1" />
                                Full Menu
                            </button>
                            <button
                                onClick={() => setActiveTab('subscription')}
                                className={`flex-1 py-4 px-6 text-center font-bold text-lg transition-colors ${activeTab === 'subscription' ? 'border-b-4 border-[#D98324] text-[#D98324] bg-orange-50' : 'text-gray-500 hover:text-[#D98324] hover:bg-gray-50'}`}
                            >
                                <Crown className="w-5 h-5 inline-block mr-2 mb-1" />
                                Subscription Plans
                            </button>
                        </div>

                        {/* Menu Tab */}
                        {activeTab === 'menu' && (
                            <div className="p-6 md:p-8">
                                <div className="flex overflow-x-auto pb-4 gap-3 mb-6 scrollbar-hide">
                                    {categories.map(category => (
                                        <button
                                            key={category}
                                            onClick={() => setSelectedCategory(category)}
                                            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === category ? 'bg-[#D98324] text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                        >
                                            {category}
                                        </button>
                                    ))}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredMenu.map(item => (
                                        <div key={item.id} className={`flex gap-4 p-4 border rounded-xl hover:shadow-md transition-shadow ${!item.isAvailable ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
                                            <div className="relative w-24 h-24 flex-shrink-0">
                                                <Image src={item.image} alt={item.name} fill className="object-cover rounded-lg" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between items-start">
                                                        <h3 className="font-bold text-gray-800 line-clamp-1">{item.name}</h3>
                                                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {item.isVeg ? 'VEG' : 'NON-VEG'}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                                                </div>
                                                <div className="flex justify-between items-end mt-2">
                                                    <span className="text-lg font-bold text-[#D98324]">৳{item.price}</span>
                                                    {/* Add to Cart button could go here */}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Subscription Tab */}
                        {activeTab === 'subscription' && (
                            <div className="p-6 md:p-10 bg-gradient-to-b from-white to-orange-50">
                                <div className="text-center mb-12">
                                    <div className="inline-block px-4 py-1.5 rounded-full bg-orange-100 text-[#D98324] font-semibold text-sm mb-4">
                                        For Students & Professionals
                                    </div>
                                    <h2 className="text-3xl md:text-4xl font-bold text-[#443627] mb-4">
                                        Save Big with <span className="text-[#D98324]">Meal Plans</span>
                                    </h2>
                                    <p className="text-gray-600 max-w-2xl mx-auto">
                                        Enjoy healthy, homemade meals delivered to your doorstep every day.
                                        Flexible plans that you can cancel anytime.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                                    {displayPlans.map((plan) => (
                                        <div
                                            key={plan.id}
                                            onClick={() => handlePlanSelect(plan.id)}
                                            className={`relative group bg-white rounded-3xl p-1 transition-all duration-300 cursor-pointer ${selectedPlan === plan.id
                                                ? 'ring-4 ring-[#D98324] shadow-2xl scale-[1.02] z-10'
                                                : 'hover:shadow-xl hover:-translate-y-1 shadow-md border border-gray-100'
                                                }`}
                                        >
                                            {plan.popular && (
                                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#D98324] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg z-20 flex items-center gap-2">
                                                    <Crown className="w-4 h-4 fill-white" /> Most Popular
                                                </div>
                                            )}

                                            <div className="bg-white rounded-[20px] p-8 h-full flex flex-col">
                                                <div className="flex items-center gap-4 mb-6">
                                                    <div className={`p-3 rounded-2xl ${selectedPlan === plan.id ? 'bg-[#D98324] text-white' : 'bg-orange-100 text-[#D98324]'}`}>
                                                        {plan.icon}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-xl font-bold text-[#443627]">{plan.name}</h3>
                                                        <p className="text-gray-500 text-sm">{plan.duration} duration</p>
                                                    </div>
                                                </div>

                                                <div className="mb-8 pb-8 border-b border-gray-100">
                                                    <div className="flex items-baseline gap-1">
                                                        <span className="text-4xl font-extrabold text-[#443627]">৳{plan.price}</span>
                                                        <span className="text-gray-400 font-medium">/period</span>
                                                    </div>
                                                    {plan.savings && (
                                                        <div className="mt-2 text-green-600 text-sm font-semibold bg-green-50 inline-block px-2 py-1 rounded">
                                                            {plan.savings}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-4 mb-8 flex-grow">
                                                    {plan.features.map((feature, idx) => (
                                                        <div key={idx} className="flex items-start gap-3">
                                                            <div className="mt-0.5 min-w-[20px]">
                                                                <Check className="w-5 h-5 text-green-500" />
                                                            </div>
                                                            <span className="text-gray-600 text-sm">{feature}</span>
                                                        </div>
                                                    ))}
                                                </div>

                                                <button
                                                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 ${selectedPlan === plan.id
                                                        ? 'bg-[#D98324] text-white shadow-lg shadow-orange-200'
                                                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {selectedPlan === plan.id ? 'Plan Selected' : 'Select Plan'}
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-12 text-center">
                                    <button
                                        onClick={handleSubscribe}
                                        disabled={!selectedPlan || isProcessing}
                                        className={`
                                            px-12 py-5 rounded-full font-bold text-xl shadow-xl transition-all duration-300
                                            ${selectedPlan && !isProcessing
                                                ? 'bg-[#D98324] text-white hover:bg-[#c27520] hover:scale-105 cursor-pointer'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }
                                        `}
                                    >
                                        {isProcessing ? (
                                            <span className="flex items-center gap-3">
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                Processing Payment...
                                            </span>
                                        ) : selectedPlan ? (
                                            'Proceed to Checkout'
                                        ) : (
                                            'Select a Plan Above'
                                        )}
                                    </button>
                                    <p className="mt-4 text-sm text-gray-500 flex items-center justify-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        Instant activation after payment
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Review Section */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="font-bold text-[#443627]">Have you eaten here recently?</h3>
                            <p className="text-sm text-gray-500">Share your experience to help others choose better.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <span className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wide">Tap to Rate</span>
                            <RatingStars vendorId={vendor.id} variant="input" size={28} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}