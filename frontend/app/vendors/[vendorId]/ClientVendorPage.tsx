'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Crown, Clock, Calendar, Utensils, Loader2, MessageSquare, Plus, Minus, ShoppingCart, Star } from 'lucide-react';
import { useVendor } from "@/app/hooks/singleVendor";
import { useVendorMenu, MenuItem as VendorMenuItem } from "@/app/hooks/vendorMenu";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ReviewItem {
    review_id: number; // Ensure this is number now
    food_quality: string;
    delivery_experience: string;
    comment: string | null;
    username: string;
    is_replied: boolean;
    reply: string | null;
}

// MenuItem interface for component use (compatible with vendorMenu hook)
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
        coverImage: apiData.img_url,
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
        menu: [], // Menu will be fetched separately using useVendorMenu hook
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

// --- 1. Review Submission Modal (Add Review) ---
interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorId: string;
    vendorName: string;
}

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
            // 1. Update the Stars (Rating Stats)
            queryClient.invalidateQueries({ queryKey: ['rating-stats', vendorId] });
            // 2. Update the Text Reviews List (The Orange Button Count)
            queryClient.invalidateQueries({ queryKey: ['vendor-reviews', vendorId] });
            onClose();
        }
    };

    return (
        // FIX: Using bg-black/50 and backdrop-blur-sm for better overlay
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 font-bold text-2xl"
                >
                    ✕
                </button>
                <h2 className="text-2xl font-bold mb-4 text-[#443627]">Review {vendorName}</h2>
                <form onSubmit={handleSubmit}>
                    {/* ... Inputs ... */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-medium mb-2">Food Quality</label>
                        <div className="flex flex-wrap gap-2">
                            {reviewOptions.map(opt => (
                                <button type="button" key={opt} onClick={() => setFoodQuality(opt)}
                                    className={`px-3 py-1 text-sm rounded-full ${foodQuality === opt ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
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
                                    className={`px-3 py-1 text-sm rounded-full ${deliveryExperience === opt ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full p-3 border rounded" placeholder="Comment..." />
                    </div>

                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-2 border rounded-full text-black-700 hover:bg-gray-300">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors duration-200">
                            {isLoading ? 'Submitting...' : 'Submit'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
// --- End Review Submission Modal ---


// --- 2. Review Display Modal ---
interface ReviewsDisplayModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendorId: string;
    vendorName: string;
}

const ReviewsDisplayModal: React.FC<ReviewsDisplayModalProps> = ({ isOpen, onClose, vendorId, vendorName }) => {
    const { data: reviews, isLoading, isError } = useVendorReviews(vendorId);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-3/4 flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold" style={{ color: '#D98324' }}>
                        Reviews for {vendorName}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold text-2xl">
                        &times;
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {isLoading && <p className="text-center text-gray-500">Loading reviews...</p>}

                    {!isLoading && isError && <p className="text-center text-red-500">Failed to load reviews. Please ensure you are logged in.</p>}

                    {!isLoading && !isError && reviews?.length === 0 && (
                        <p className="text-center text-gray-500">No reviews yet for this vendor.</p>
                    )}

                    {reviews?.map((review) => (
                        <div key={review.review_id} className="p-4 border rounded-lg bg-grey-50 border-gray-200">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-bold text-[#443627]">{review.username}</span>
                                <div className="flex flex-col items-end text-[10px] sm:text-xs gap-1">
                                    <span className={review.food_quality === 'Very bad' ? 'text-red-600' : 'text-green-700'}>Food: {review.food_quality}</span>
                                    <span className={review.delivery_experience === 'Very bad' ? 'text-red-600' : 'text-blue-700'}>Delivery: {review.delivery_experience}</span>
                                </div>
                            </div>
                            <div className="mt-3 pl-3 border-l-2 border-gray-500 bg-gray-100 p-2 rounded-r-md">
                                <p className="text-gray-700 text-sm">{review.comment}</p>
                            </div>


                            {/* --- NEW: RENDER VENDOR REPLY --- */}
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
// --- End Review Display Modal ---


export default function ClientVendorPage({ params }: VendorDetailPageProps) {
    // Check URL hash to determine initial tab
    const [activeTab, setActiveTab] = useState<'menu' | 'subscription'>(() => {
        if (typeof window !== 'undefined') {
            return window.location.hash === '#subscription' ? 'subscription' : 'menu';
        }
        return 'menu';
    });
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [vendorId, setVendorId] = useState<string>('');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false); // For adding a review
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false); // For viewing reviews

    // Handle hash change to switch tabs
    useEffect(() => {
        const handleHashChange = () => {
            if (window.location.hash === '#subscription') {
                setActiveTab('subscription');
            } else if (window.location.hash === '#menu') {
                setActiveTab('menu');
            }
        };

        window.addEventListener('hashchange', handleHashChange);
        // Check on mount
        if (window.location.hash === '#subscription') {
            setActiveTab('subscription');
        }

        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);
    const { subscribe, isLoading: subscriptionLoading, error: subscriptionError, isSuccess } = useVendorSubscription();
    // Review Hook (For Text Comments - NEW)
    const { data: reviewsList } = useVendorReviews(vendorId || '');
    const textReviewCount = reviewsList ? reviewsList.length : 0;

    useEffect(() => {
        const getParams = async () => {
            const resolvedParams = await params;
            setVendorId(resolvedParams.vendorId);
        };
        getParams();
    }, [params]);

    const { data: vendorData, isLoading, error, isError } = useVendor(vendorId);
    const { data: menuData, isLoading: isMenuLoading, error: menuError } = useVendorMenu(vendorId);
    const { user } = useUserInfo();
    const { addToCart, cartCount } = useCart();
    
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

    const vendor = vendorData ? transformVendorData(vendorData) : null;

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

    // Transform menu items to AllMenuMenuItem format for cart/order functionality
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

    // Handle add to cart
    const handleAddToCart = () => {
        if (selectedFood) {
            addToCart(selectedFood, quantity);
            setIsDetailsOpen(false);
            setQuantity(1);
        }
    };

    const categories = menuItems.length > 0 
        ? ['All', ...Array.from(new Set(menuItems.map(item => item.category).filter(Boolean)))] 
        : ['All'];

    const filteredMenu = menuItems.filter(item =>
        selectedCategory === 'All' || item.category === selectedCategory
    );

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
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: '#D98324' }} />
                    <p className="text-lg" style={{ color: '#443627' }}>Loading vendor details...</p>
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
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: ' #f9f5e6' }}>
            {/* 1. Review Submission Modal */}
            <ReviewModal
                isOpen={isReviewModalOpen}
                onClose={() => setIsReviewModalOpen(false)}
                vendorId={vendorId}
                vendorName={vendor.name}
            />

            {/* 2. Review Display Modal */}
            <ReviewsDisplayModal
                isOpen={isReviewsModalOpen}
                onClose={() => setIsReviewsModalOpen(false)}
                vendorId={vendorId}
                vendorName={vendor.name}
            />

            {/* Content Wrapper to ensure it's above the SVG background */}
            <div className="relative z-10">
                {/* Header Section */}
                <div className="container mx-auto px-4 py-6 pt-20">
                    <div className="flex items-center gap-4 bg-white rounded-lg shadow-md p-4">
                        <Image
                            src={vendor.coverImage}
                            alt={vendor.name}
                            width={100}
                            height={100}
                            className="w-30 h-30 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold mb-2 darktext">{vendor.name}</h1>
                            <div className="flex items-center gap-4 text-sm lighttext">
                                {/* --- FIX: Separated Logic --- */}
                                <div className="flex items-center gap-2">
                                    {/* 1. STARS (Uses rating logic) */}
                                    <RatingStars vendorId={vendor.id} variant="readonly" showText={false} />

                                    {/* 2. REVIEWS (Uses text review logic) */}
                                    <button
                                        onClick={() => setIsReviewsModalOpen(true)}
                                        className="text-orange-500 hover:underline font-medium"
                                    >
                                        ({textReviewCount} reviews) {/* <--- NOW USING CORRECT COUNT */}
                                    </button>
                                </div>
                                {/* --- END FIX --- */}
                                <span>🕒 {vendor.deliveryTime}</span>
                                <span className={`px-2 py-1 rounded text-white ${vendor.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                                    {vendor.isOpen ? 'Open' : 'Closed'}
                                </span>
                            </div>
                        </div>

                        {/* ADDED: Add Review Button */}
                        <button
                            onClick={() => setIsReviewModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-400 transition-colors duration-200"
                        >
                            <MessageSquare className="w-5 h-5" />
                            Add Review
                        </button>
                    </div>
                </div>

                {/* 2. NEW RATE US SECTION (Interactive) */}
                <div className="container mx-auto py-4 px-4">
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-orange-100 flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-gray-800">Have you eaten here?</h3>
                        </div>
                        <RatingStars vendorId={vendor.id} variant="input" size={24} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="container mx-auto px-4 py-8">
                    <div className="lg:col-span-2">
                        {/* Tab Navigation */}
                        <div className="rounded-lg shadow-md mb-6">
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
                                        <>
                                            {filteredMenu.length === 0 ? (
                                                <div className="text-center py-12">
                                                    <p className="text-gray-500">No menu items available in this category.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    {filteredMenu.map(item => (
                                            <div
                                                key={item.id}
                                                className={`flex items-center gap-4 p-4 border rounded-lg ${item.isAvailable ? 'bg-white' : 'bg-gray-100'
                                                    }`}
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
                                                <Button
                                                    size="sm"
                                                    disabled={!item.isAvailable}
                                                    onClick={() => {
                                                        const allMenuItem = allMenuItems.find(m => m.id === item.id);
                                                        if (allMenuItem) {
                                                            handleFoodClick(allMenuItem);
                                                        }
                                                    }}
                                                    style={{ backgroundColor: '#D98324' }}
                                                    className="hover:bg-opacity-90 flex-shrink-0"
                                                >
                                                    {item.isAvailable ? 'View Details' : 'Unavailable'}
                                                </Button>
                                            </div>
                                        ))}
                                                </div>
                                            )}
                                        </>
                                    )}
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