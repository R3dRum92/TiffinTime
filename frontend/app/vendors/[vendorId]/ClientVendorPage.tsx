'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Crown, Clock, Calendar, Loader2, MessageSquare, Plus, Minus, ShoppingCart, Star } from 'lucide-react';
import { useVendor } from "@/app/hooks/singleVendor";
import { useVendorMenu } from "@/app/hooks/vendorMenu(UserSideVendorSpecificFoodShower)";
import { useVendorSubscription } from "@/app/hooks/useVendorSubscription";
import { useReviewSubmission } from "@/app/hooks/useReviewSubmission";
import { useVendorReviews } from "@/app/hooks/useVendorReviews";
import { useOrderState } from "@/app/hooks/useOrderState";
import { useCart } from "@/app/context/CartContext";
import { MenuItem as AllMenuMenuItem } from "@/app/hooks/allmenu";
import { useUserInfo } from "@/app/hooks/getUserDetails";
import RatingStars from "@/components/ui/RatingStars";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// --- Interfaces ---
interface PaymentPayload {
    subscription_id: string;
    total_amount: number;
    tran_id: string;
    cus_add1: string;
    cus_city: string;
    num_of_item: number;
    product_name: string;
    product_category: string;
}

export interface VendorDetailPageProps {
    params: Promise<{
        vendorId: string;
    }>;
}

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorId: string;
    vendorName: string;
}

interface ReviewsDisplayModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorId: string;
    vendorName: string;
}

// MenuItem interface for component use
interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isVeg: boolean;
    isAvailable: boolean;
    preparationTime?: string | null;
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
    deliveryTime: string;
    minimumOrder: number;
    deliveryFee: number;
    isOpen: boolean;
    rating?: number; // Added optional rating
    totalReviews?: number; // Added optional count
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
    rating?: number;
    total_reviews?: number;
}

// --- Helper Functions & Sub-Components ---

const transformVendorData = (apiData: ApiVendorData): VendorDetails => {
    return {
        id: apiData.id,
        name: apiData.name,
        description: apiData.description,
        image: apiData.img_url,
        coverImage: apiData.img_url,
        deliveryTime: `${apiData.delivery_time.min}-${apiData.delivery_time.max} mins`,
        minimumOrder: 100,
        deliveryFee: 25,
        isOpen: apiData.is_open,
        rating: apiData.rating || 0,
        totalReviews: apiData.total_reviews || 0,
        location: {
            address: "123 Food Street, Block A",
            area: "Dhanmondi",
            city: "Dhaka",
            coordinates: { lat: 23.746466, lng: 90.376015 }
        },
        contact: {
            phone: "+880 1234567890",
            email: "orders@vendor.com"
        },
        menu: [],
        subscriptionPlans: [
            {
                id: "weekly",
                name: "Weekly Plan",
                duration: "7 days",
                price: 299,
                mealsPerDay: 1,
                description: "Perfect for students who want a healthy lunch every day",
                features: ['Unlimited food delivery', 'No delivery charges', 'Priority customer support', 'Cancel anytime'],
                discount: 10
            },
            {
                id: "monthly",
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

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, vendorId, vendorName }) => {
    const reviewOptions = ["Very bad", "Bad", "Average", "Good", "Very good"];
    const [foodQuality, setFoodQuality] = useState<string | null>(null);
    const [deliveryExperience, setDeliveryExperience] = useState<string | null>(null);
    const [comment, setComment] = useState<string>('');
    const { submitReview, isLoading } = useReviewSubmission();
    const queryClient = useQueryClient();

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!foodQuality || !deliveryExperience) {
            toast.error("Please select reviews for both Food Quality and Delivery Experience.");
            return;
        }

        const payload = {
            vendor_id: vendorId,
            food_quality: foodQuality!,
            delivery_experience: deliveryExperience!,
            comment: comment || '',
        };

        const success = await submitReview(payload);
        if (success) {
            toast.success(`Review Submitted!`);
            queryClient.invalidateQueries({ queryKey: ['rating-stats', vendorId] });
            queryClient.invalidateQueries({ queryKey: ['vendor-reviews', vendorId] });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 font-bold text-2xl hover:text-gray-600"
                >
                    ✕
                </button>
                <h2 className="text-2xl font-bold mb-4 text-[#443627]">Review {vendorName}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Food Quality</label>
                        <div className="flex flex-wrap gap-2">
                            {reviewOptions.map(opt => (
                                <button type="button" key={opt} onClick={() => setFoodQuality(opt)}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${foodQuality === opt ? 'bg-orange-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Delivery Experience</label>
                        <div className="flex flex-wrap gap-2">
                            {reviewOptions.map(opt => (
                                <button type="button" key={opt} onClick={() => setDeliveryExperience(opt)}
                                    className={`px-3 py-1 text-sm rounded-full transition-colors ${deliveryExperience === opt ? 'bg-orange-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <textarea
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                            placeholder="Share your thoughts..."
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-2 border rounded-full text-gray-700 hover:bg-gray-100">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors duration-200">
                            {isLoading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ReviewsDisplayModal: React.FC<ReviewsDisplayModalProps> = ({ isOpen, onClose, vendorId, vendorName }) => {
    const { data: reviews, isLoading, isError } = useVendorReviews(vendorId);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-3/4 flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold" style={{ color: '#D98324' }}>
                        Reviews for {vendorName}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold text-2xl">
                        &times;
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {isLoading && <div className="flex justify-center"><Loader2 className="animate-spin text-orange-500" /></div>}

                    {!isLoading && isError && <p className="text-center text-red-500">Failed to load reviews.</p>}

                    {!isLoading && !isError && reviews?.length === 0 && (
                        <p className="text-center text-gray-500">No reviews yet for this vendor.</p>
                    )}

                    {reviews?.map((review) => (
                        <div key={review.review_id} className="p-4 border rounded-lg bg-gray-50 border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-bold text-[#443627]">{review.username}</span>
                                <div className="flex flex-col items-end text-[10px] sm:text-xs gap-1">
                                    <span className={review.food_quality === 'Very bad' ? 'text-red-600' : 'text-green-700'}>Food: {review.food_quality}</span>
                                    <span className={review.delivery_experience === 'Very bad' ? 'text-red-600' : 'text-blue-700'}>Delivery: {review.delivery_experience}</span>
                                </div>
                            </div>
                            <div className="mt-3 pl-3 border-l-2 border-gray-500 bg-white p-2 rounded-r-md">
                                <p className="text-gray-700 text-sm">{review.comment}</p>
                            </div>
                            {review.is_replied && review.reply && (
                                <div className="mt-3 pl-3 border-l-2 border-green-500 bg-green-50 p-2 rounded-r-md">
                                    <p className="text-xs font-bold text-green-700 mb-1">
                                        Response from {vendorName}:
                                    </p>
                                    <p className="text-sm text-gray-800">
                                        {review.reply}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const useCreateSubscriptionOrder = () => {
    return useMutation({
        mutationFn: async (data: { vendor_id: string, type: string }) => {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/subscribe/${data.vendor_id}`, data, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        }
    });
};

const useInitPayment = () => {
    return useMutation({
        mutationFn: async (paymentData: PaymentPayload) => {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/payment/init`, paymentData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            return response.data;
        }
    });
};

// --- Main Component ---

export default function ClientVendorPage({ params }: VendorDetailPageProps) {
    // Check URL hash to determine initial tab
    const [activeTab, setActiveTab] = useState<'menu' | 'subscription'>('menu');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [vendorId, setVendorId] = useState<string>('');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Params Unwrap
    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params;
            setVendorId(resolvedParams.vendorId);
        };
        getParams();

        // Hash handling
        const handleHashChange = () => {
            if (window.location.hash === '#subscription') setActiveTab('subscription');
            else if (window.location.hash === '#menu') setActiveTab('menu');
        };

        // Initial Check
        if (typeof window !== 'undefined' && window.location.hash === '#subscription') {
            setActiveTab('subscription');
        }

        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [params]);

    // Hooks
    const { user } = useUserInfo();
    const { data: vendorData, isLoading: isVendorLoading, isError: isVendorError } = useVendor(vendorId);
    const { data: menuData, isLoading: isMenuLoading, error: menuError } = useVendorMenu(vendorId);
    const { data: reviewsList } = useVendorReviews(vendorId || '');
    const { addToCart, cartCount } = useCart();

    // Mutations
    const createSubscriptionMutation = useCreateSubscriptionOrder();
    const initPaymentMutation = useInitPayment();

    const textReviewCount = reviewsList ? reviewsList.length : 0;
    const vendor = vendorData ? transformVendorData(vendorData) : null;

    // Order state hook
    const {
        selectedFood,
        quantity,
        isDetailsOpen,
        totalPrice,
        canModifyOrder,
        handleFoodClick,
        setQuantity,
        setIsDetailsOpen,
    } = useOrderState(user?.id || null);

    // Transform menu items from hook to match component's expected format
    const menuItems: MenuItem[] = menuData?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        price: item.price,
        image: item.image,
        category: item.category || 'Uncategorized',
        isVeg: item.isVeg || false,
        isAvailable: item.isAvailable || item.available,
        preparationTime: item.preparationTime
    })) || [];

    // Transform for Cart Context
    const allMenuItems: AllMenuMenuItem[] = menuData?.map(item => ({
        id: item.id,
        vendorId: item.vendorId,
        vendorName: item.vendorName,
        name: item.name,
        description: item.description,
        image: item.image,
        price: item.price,
        category: item.category,
        preparationTime: item.preparationTime,
        rating: item.rating,
        available: item.available || item.isAvailable || false,
        date: item.date
    })) || [];

    const categories = menuItems.length > 0
        ? ['All', ...Array.from(new Set(menuItems.map(item => item.category).filter(Boolean)))]
        : ['All'];

    const filteredMenu = menuItems.filter(item =>
        selectedCategory === 'All' || item.category === selectedCategory
    );

    const handleAddToCart = () => {
        if (selectedFood) {
            addToCart(selectedFood, quantity);
            setIsDetailsOpen(false);
            setQuantity(1);
        }
    };

    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
    };

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

        const planDetails = vendor.subscriptionPlans.find(p => p.id === selectedPlan);
        if (!planDetails) return;

        setIsProcessing(true);
        const transactionId = uuidv4();

        try {
            toast.info("Creating Subscription...", { description: "Please wait a moment." });

            const subscriptionRecord = await createSubscriptionMutation.mutateAsync({
                vendor_id: vendorId,
                type: selectedPlan
            });

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
    if (isVendorLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f9f5e6' }}>
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-[#D98324]" />
                    <p className="text-lg text-[#443627]">Loading vendor details...</p>
                </div>
            </div>
        );
    }

    if (isVendorError || !vendor) {
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
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: ' #f9f5e6' }}>
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                vendorId={vendorId}
                vendorName={vendor.name}
            />

            <ReviewsDisplayModal
                isOpen={isReviewsModalOpen}
                onClose={() => setIsReviewsModalOpen(false)}
                vendorId={vendorId}
                vendorName={vendor.name}
            />

            {/* Content Wrapper */}
            <div className="relative z-10">
                {/* Header Section */}
                <div className="container mx-auto px-4 py-6 pt-20">
                    <div className="flex flex-col md:flex-row items-start gap-4 bg-white rounded-lg shadow-md p-6">
                        <Image
                            src={vendor.coverImage}
                            alt={vendor.name}
                            width={120}
                            height={120}
                            className="w-32 h-32 object-cover rounded-lg"
                        />
                        <div className="flex-1 w-full">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2 text-[#443627]">{vendor.name}</h1>
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                                        <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded text-yellow-800">
                                            {/* Uses rating logic */}
                                            <RatingStars vendorId={vendor.id} variant="readonly" showText={false} />
                                            <button onClick={() => setIsReviewsModalOpen(true)} className="hover:underline font-medium ml-2">
                                                ({textReviewCount} reviews)
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
                                    Add Review
                                </button>
                            </div>

                            {/* Mobile Add Review Button */}
                            <button
                                onClick={() => setIsReviewModalOpen(true)}
                                className="md:hidden w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-400"
                            >
                                <MessageSquare className="w-5 h-5" />
                                Add Review
                            </button>
                        </div>
                    </div>

                    {/* Rate Us Section */}
                    <div className="container mx-auto py-4 px-0">
                        <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-100 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-gray-800">Have you eaten here?</h3>
                            </div>
                            <RatingStars vendorId={vendor.id} variant="input" size={24} />
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="container mx-auto px-0 py-4">
                        <div className="lg:col-span-2">
                            {/* Tab Navigation */}
                            <div className="bg-white rounded-lg shadow-md mb-6">
                                <div className="flex border-b">
                                    <button
                                        onClick={() => {
                                            setActiveTab('menu');
                                            window.history.replaceState(null, '', window.location.pathname);
                                        }}
                                        className={`flex-1 py-4 px-6 text-center font-medium ${activeTab === 'menu'
                                            ? 'border-b-2 border-orange-500 text-orange-500'
                                            : 'text-gray-600 hover:text-orange-500'
                                            }`}
                                    >
                                        Menu
                                    </button>
                                    <button
                                        onClick={() => {
                                            setActiveTab('subscription');
                                            window.history.replaceState(null, '', `${window.location.pathname}#subscription`);
                                        }}
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

                                        {/* Menu Loading State */}
                                        {isMenuLoading && (
                                            <div className="flex items-center justify-center py-12">
                                                <Loader2 className="h-8 w-8 animate-spin mr-3" style={{ color: '#D98324' }} />
                                                <p className="text-lg" style={{ color: '#443627' }}>Loading menu...</p>
                                            </div>
                                        )}

                                        {/* Menu Error State */}
                                        {menuError && !isMenuLoading && (
                                            <div className="text-center py-12">
                                                <p className="text-red-600 mb-2">Failed to load menu items</p>
                                                <p className="text-sm text-gray-500">{menuError instanceof Error ? menuError.message : 'Unknown error'}</p>
                                            </div>
                                        )}

                                        {/* Menu Items */}
                                        {!isMenuLoading && !menuError && (
                                            <div className="space-y-4">
                                                {filteredMenu.length === 0 ? (
                                                    <div className="text-center py-12">
                                                        <p className="text-gray-500">No menu items available in this category.</p>
                                                    </div>
                                                ) : (
                                                    filteredMenu.map(item => (
                                                        <div
                                                            key={item.id}
                                                            className={`flex items-center gap-4 p-4 border rounded-lg ${item.isAvailable ? 'bg-white' : 'bg-gray-100'}`}
                                                        >
                                                            <Image
                                                                src={item.image}
                                                                alt={item.name}
                                                                width={80}
                                                                height={80}
                                                                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                                                            />
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="font-semibold text-gray-800">{item.name}</h3>
                                                                    {/* <span className={`text-xs px-2 py-1 rounded ${item.isVeg ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                                        {item.isVeg ? 'VEG' : 'NON-VEG'}
                                                                    </span> */}
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                                                                <p className="font-bold text-lg" style={{ color: '#D98324' }}>
                                                                    ৳{item.price}
                                                                </p>
                                                            </div>
                                                            {item.isAvailable && (
                                                            <Button
                                                                size="sm"
                                                                onClick={() => {
                                                                    const allMenuItem = allMenuItems.find(m => m.id === item.id);
                                                                    if (allMenuItem) {
                                                                        handleFoodClick(allMenuItem);
                                                                    }
                                                                }}
                                                                style={{ backgroundColor: '#D98324' }}
                                                                className="hover:bg-opacity-90 flex-shrink-0"
                                                            >
                                                                View Details
                                                            </Button>
                                                        )}
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        )}
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
                                                                        <Check className="w-5 h-5 text-orange-500" />
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
                        </div>
                    </div>
                </div>
            </div>

            {/* Food Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle style={{ color: '#443627' }}>
                            {selectedFood?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedFood && (
                        <div className="space-y-6">
                            <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                                <Image
                                    src={selectedFood.image}
                                    alt={selectedFood.name}
                                    width={600}
                                    height={256}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2" style={{ color: '#443627' }}>
                                        Vendor: {selectedFood.vendorName}
                                    </h3>
                                    <p style={{ color: '#a0896b' }}>
                                        {selectedFood.description || 'No description available'}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span style={{ color: '#443627' }}>{selectedFood.rating || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" style={{ color: '#a0896b' }} />
                                            <span style={{ color: '#a0896b' }}>
                                                {selectedFood.preparationTime || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-xl font-bold" style={{ color: '#D98324' }}>
                                        {selectedFood.price > 0 ? `৳${selectedFood.price}` : 'Price TBD'}
                                    </span>
                                </div>

                                {/* Quantity Selector */}
                                <div className="space-y-2">
                                    <label className="font-semibold" style={{ color: '#443627' }}>
                                        Quantity:
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            disabled={!canModifyOrder || quantity <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="font-semibold text-lg px-4" style={{ color: '#443627' }}>
                                            {quantity}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setQuantity(quantity + 1)}
                                            disabled={!canModifyOrder}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Authentication Warning */}
                                {!user && (
                                    <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200">
                                        <p className="text-sm text-yellow-800">
                                            Please log in to add items to your cart
                                        </p>
                                    </div>
                                )}

                                {/* Total Price */}
                                {selectedFood.price > 0 && (
                                    <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8f6f3' }}>
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold" style={{ color: '#443627' }}>
                                                Subtotal:
                                            </span>
                                            <span className="text-2xl font-bold" style={{ color: '#D98324' }}>
                                                ৳{totalPrice.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        onClick={handleAddToCart}
                                        className="w-full"
                                        style={{ backgroundColor: '#D98324' }}
                                        disabled={selectedFood.price <= 0 || !user}
                                    >
                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                        Add to Cart
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Floating Cart Button */}
            <Link href="/cart">
                <Button
                    className="fixed bottom-6 right-6 z-50 rounded-full shadow-2xl h-16 w-16 transition-transform hover:scale-110"
                    style={{ backgroundColor: '#D98324' }}
                >
                    <div className="relative">
                        <ShoppingCart className="h-6 w-6" />
                        {cartCount > 0 && (
                            <span className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-in zoom-in">
                                {cartCount}
                            </span>
                        )}
                    </div>
                </Button>
            </Link>
        </div>
    );
}