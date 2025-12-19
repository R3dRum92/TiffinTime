'use client';

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
// Icons
import { 
    Check, Crown, Clock, Calendar, Utensils, Loader2, MessageSquare, 
    MapPin, Phone, Mail, DollarSign, Plus, Minus, ShoppingCart, Star 
} from 'lucide-react';

// Custom hooks
import { useVendor } from "@/app/hooks/singleVendor";
import { useVendorMenu } from "@/app/hooks/vendorMenu";
import { useVendorSubscription } from "@/app/hooks/useVendorSubscription";
import { useReviewSubmission } from "@/app/hooks/useReviewSubmission";
import { useVendorReviews } from "@/app/hooks/useVendorReviews";
import { useOrderState } from "@/app/hooks/useOrderState";
import { useCart } from "@/app/context/CartContext";
import { useUserInfo } from "@/app/hooks/getUserDetails";

// UI Components
import RatingStars from "@/components/ui/RatingStars";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Payment & Logic
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

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

interface ReviewItem {
    review_id: number;
    food_quality: string;
    delivery_experience: string;
    comment: string | null;
    username: string;
    is_replied: boolean;
    reply: string | null;
}

// Unified Menu Item Interface
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
    rating?: number;
    vendorId?: string; // Optional as it might come from parent context
    vendorName?: string;
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
    rating: number;
    totalReviews: number;
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

export interface VendorDetailPageProps {
    params: Promise<{
        vendorId: string;
    }>;
}

// --- Data Transformation ---
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
        rating: apiData.rating || 4.5,
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
        menu: [], // Menu fetched via separate hook
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

// --- API Hooks ---
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

// --- Modals ---

const ReviewModal: React.FC<{ isOpen: boolean; onClose: () => void; vendorId: string; vendorName: string; }> = ({ isOpen, onClose, vendorId, vendorName }) => {
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
            toast.error("Please select reviews for both fields.");
            return;
        }
        const success = await submitReview({ vendor_id: vendorId, food_quality: foodQuality, delivery_experience: deliveryExperience, comment });
        if (success) {
            toast.success(`Review Submitted!`);
            queryClient.invalidateQueries({ queryKey: ['rating-stats', vendorId] });
            queryClient.invalidateQueries({ queryKey: ['vendor-reviews', vendorId] });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 font-bold text-2xl">✕</button>
                <h2 className="text-2xl font-bold mb-4 text-[#443627]">Review {vendorName}</h2>
                <form onSubmit={handleSubmit}>
                    {/* Simplified Form Content for Brevity */}
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">Food Quality</label>
                        <div className="flex flex-wrap gap-2">{reviewOptions.map(opt => <button key={opt} type="button" onClick={() => setFoodQuality(opt)} className={`px-3 py-1 rounded-full text-sm ${foodQuality === opt ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>{opt}</button>)}</div>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 font-medium">Delivery Experience</label>
                        <div className="flex flex-wrap gap-2">{reviewOptions.map(opt => <button key={opt} type="button" onClick={() => setDeliveryExperience(opt)} className={`px-3 py-1 rounded-full text-sm ${deliveryExperience === opt ? 'bg-orange-600 text-white' : 'bg-gray-200'}`}>{opt}</button>)}</div>
                    </div>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} className="w-full p-3 border rounded mb-4" placeholder="Comment..." />
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 border rounded-full">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 bg-orange-500 text-white rounded-full">{isLoading ? '...' : 'Submit'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ReviewsDisplayModal: React.FC<{ isOpen: boolean; onClose: () => void; vendorId: string; vendorName: string; }> = ({ isOpen, onClose, vendorId, vendorName }) => {
    const { data: reviews, isLoading, isError } = useVendorReviews(vendorId);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg h-3/4 flex flex-col">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold text-[#D98324]">Reviews for {vendorName}</h2>
                    <button onClick={onClose} className="text-2xl">&times;</button>
                </div>
                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {isLoading && <p className="text-center">Loading...</p>}
                    {!isLoading && isError && <p className="text-center text-red-500">Error loading reviews.</p>}
                    {!isLoading && reviews?.length === 0 && <p className="text-center">No reviews yet.</p>}
                    {reviews?.map((r) => (
                        <div key={r.review_id} className="p-4 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-start mb-2"><span className="font-bold">{r.username}</span></div>
                            <p className="text-gray-700 text-sm bg-gray-100 p-2 rounded">{r.comment}</p>
                            {r.is_replied && <div className="mt-2 pl-3 border-l-2 border-green-500"><p className="text-xs font-bold text-green-700">Reply:</p><p className="text-sm">{r.reply}</p></div>}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- Main Page Component ---

export default function ClientVendorPage({ params }: VendorDetailPageProps) {
    // --- State Initialization ---
    const [vendorId, setVendorId] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'menu' | 'subscription'>('menu');
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    
    // Modal States
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // --- Hooks ---
    const { user } = useUserInfo();
    const { addToCart, cartCount } = useCart();
    
    // Payment Mutations
    const createSubscriptionMutation = useCreateSubscriptionOrder();
    const initPaymentMutation = useInitPayment();
    
    // Order State (for Food Details Modal)
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

    // Fetch Data
    const { data: vendorData, isLoading, isError } = useVendor(vendorId);
    const { data: menuData, isLoading: isMenuLoading, error: menuError } = useVendorMenu(vendorId);
    const { data: reviewsList } = useVendorReviews(vendorId || '');

    // --- Effects ---
    useEffect(() => {
        const resolveParams = async () => {
            const resolved = await params;
            setVendorId(resolved.vendorId);
        };
        resolveParams();
    }, [params]);

    useEffect(() => {
        // Handle initial hash routing
        if (typeof window !== 'undefined') {
            if (window.location.hash === '#subscription') setActiveTab('subscription');
        }
    }, []);

    // --- Derived Data ---
    const vendor = vendorData ? transformVendorData(vendorData) : null;
    const textReviewCount = reviewsList ? reviewsList.length : 0;

    // Merge Menu Data with Vendor Info for Cart Items
    const menuItems: MenuItem[] = menuData?.map(item => ({
        ...item,
        // Ensure properties exist for UI
        category: item.category || 'Uncategorized',
        isVeg: item.isVeg || false,
        isAvailable: item.isAvailable || (item as any).available || false,
        vendorId: vendor?.id,
        vendorName: vendor?.name
    })) || [];

    const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category).filter(Boolean)))];
    
    const filteredMenu = menuItems.filter(item => 
        selectedCategory === 'All' || item.category === selectedCategory
    );

    // --- Handlers ---
    const handlePlanSelect = (planId: string) => setSelectedPlan(planId);

    const handleSubscribe = async () => {
        if (!selectedPlan) return toast.error("Select a plan first");
        if (!user) return toast.error("Please login first");
        if (!vendor) return;

        const planDetails = vendor.subscriptionPlans.find(p => p.id === selectedPlan);
        if (!planDetails) return;

        setIsProcessing(true);
        const transactionId = uuidv4();

        try {
            toast.info("Initiating subscription...");
            const subRecord = await createSubscriptionMutation.mutateAsync({
                vendor_id: vendorId,
                type: selectedPlan
            });

            const paymentPayload: PaymentPayload = {
                subscription_id: subRecord.id,
                total_amount: planDetails.price,
                tran_id: transactionId,
                cus_add1: "Digital Subscription",
                cus_city: "Dhaka",
                num_of_item: 1,
                product_name: `${planDetails.name}`,
                product_category: "Subscription"
            };

            const paymentRes = await initPaymentMutation.mutateAsync(paymentPayload);
            if (paymentRes?.GatewayPageURL) {
                window.location.href = paymentRes.GatewayPageURL;
            }
        } catch (err) {
            console.error(err);
            toast.error("Subscription failed.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAddToCart = () => {
        if (selectedFood) {
            addToCart(selectedFood, quantity);
            setIsDetailsOpen(false);
            setQuantity(1);
            toast.success("Added to cart");
        }
    };

    // --- Render Loading/Error ---
    if (isLoading) return <div className="min-h-screen flex center items-center justify-center bg-[#f9f5e6]"><Loader2 className="animate-spin text-orange-500 w-10 h-10"/></div>;
    if (isError || !vendor) return <div className="text-center mt-20">Vendor not found. <Link href="/vendors">Go Back</Link></div>;

    // --- Render Main ---
    return (
        <div className="min-h-screen relative overflow-hidden bg-[#f9f5e6]">
            {/* Modals */}
            <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} vendorId={vendorId} vendorName={vendor.name} />
            <ReviewsDisplayModal isOpen={isReviewsModalOpen} onClose={() => setIsReviewsModalOpen(false)} vendorId={vendorId} vendorName={vendor.name} />

            <div className="relative z-10 container mx-auto px-4 py-6 pt-24">
                {/* Header Info */}
                <div className="flex flex-col md:flex-row gap-6 bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="relative w-full md:w-48 h-48 flex-shrink-0">
                        <Image src={vendor.coverImage} alt={vendor.name} fill className="object-cover rounded-xl" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-[#443627]">{vendor.name}</h1>
                                <div className="flex items-center gap-4 text-sm text-gray-600 my-2">
                                    <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded">
                                        <RatingStars vendorId={vendor.id} variant="readonly" showText={false} />
                                        <span>({textReviewCount})</span>
                                    </div>
                                    <div className="flex items-center gap-1"><Clock className="w-4" /> {vendor.deliveryTime}</div>
                                    <span className={`px-2 py-1 rounded text-white text-xs ${vendor.isOpen ? 'bg-green-500' : 'bg-red-500'}`}>{vendor.isOpen ? 'OPEN' : 'CLOSED'}</span>
                                </div>
                                <div className="flex gap-2">{vendor.tags.map(t => <span key={t} className="px-2 py-1 bg-gray-100 rounded-full text-xs">{t}</span>)}</div>
                            </div>
                            <button onClick={() => setIsReviewModalOpen(true)} className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#D98324] text-white rounded-lg">
                                <MessageSquare className="w-4 h-4" /> Review
                            </button>
                        </div>
                        {/* Mobile Review Button */}
                        <button onClick={() => setIsReviewModalOpen(true)} className="md:hidden w-full mt-4 bg-orange-500 text-white py-2 rounded-lg">Add Review</button>
                    </div>
                </div>

                {/* Rate Us Box */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex justify-between items-center">
                    <div><h3 className="font-semibold">Have you eaten here?</h3><p className="text-sm text-gray-500">Rate now</p></div>
                    <RatingStars vendorId={vendor.id} variant="input" size={24} />
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white p-4 rounded-xl shadow-sm mb-8">
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex gap-2"><MapPin className="w-4" /> {vendor.location.address}</div>
                        <div className="flex gap-2"><Phone className="w-4" /> {vendor.contact.phone}</div>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex gap-2"><Mail className="w-4" /> {vendor.contact.email}</div>
                        <div className="flex gap-2"><DollarSign className="w-4" /> Delivery: ৳{vendor.deliveryFee}</div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className="flex border-b">
                        <button onClick={() => { setActiveTab('menu'); window.history.replaceState(null, '', window.location.pathname); }} 
                            className={`flex-1 py-4 font-bold ${activeTab === 'menu' ? 'border-b-4 border-[#D98324] text-[#D98324]' : 'text-gray-500'}`}>
                            <Utensils className="w-5 inline mr-2" /> Full Menu
                        </button>
                        <button onClick={() => { setActiveTab('subscription'); window.history.replaceState(null, '', '#subscription'); }} 
                            className={`flex-1 py-4 font-bold ${activeTab === 'subscription' ? 'border-b-4 border-[#D98324] text-[#D98324]' : 'text-gray-500'}`}>
                            <Crown className="w-5 inline mr-2" /> Subscriptions
                        </button>
                    </div>

                    {/* Menu Content */}
                    {activeTab === 'menu' && (
                        <div className="p-6">
                            <div className="flex overflow-x-auto gap-3 mb-6 pb-2">
                                {categories.map(cat => (
                                    <button key={cat} onClick={() => setSelectedCategory(cat)} 
                                        className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${selectedCategory === cat ? 'bg-[#D98324] text-white' : 'bg-gray-100'}`}>
                                        {cat}
                                    </button>
                                ))}
                            </div>

                            {isMenuLoading ? (
                                <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-orange-500"/> Loading Menu...</div>
                            ) : menuError ? (
                                <div className="text-center text-red-500">Failed to load menu.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {filteredMenu.map(item => (
                                        <div key={item.id} className={`flex gap-4 p-4 border rounded-xl hover:shadow-md transition-shadow ${!item.isAvailable ? 'opacity-60 bg-gray-50' : 'bg-white'}`}>
                                            <div className="relative w-24 h-24 flex-shrink-0">
                                                <Image src={item.image} alt={item.name} fill className="object-cover rounded-lg" />
                                            </div>
                                            <div className="flex-1 flex flex-col justify-between">
                                                <div>
                                                    <div className="flex justify-between">
                                                        <h3 className="font-bold line-clamp-1">{item.name}</h3>
                                                        <span className={`text-[10px] px-2 py-1 rounded font-bold ${item.isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.isVeg ? 'VEG' : 'NON'}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
                                                </div>
                                                <div className="flex justify-between items-end mt-2">
                                                    <span className="text-lg font-bold text-[#D98324]">৳{item.price}</span>
                                                    <Button size="sm" disabled={!item.isAvailable} 
                                                        onClick={() => {
                                                            // Cast to any to fit generic hook type requirements if strict mismatch occurs
                                                            handleFoodClick(item as any);
                                                        }} 
                                                        className="bg-[#D98324] hover:bg-orange-600">
                                                        {item.isAvailable ? 'Add' : 'Sold Out'}
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Subscription Content */}
                    {activeTab === 'subscription' && (
                        <div className="p-6 bg-orange-50">
                            <h2 className="text-2xl font-bold text-center mb-6">Meal Plans</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {vendor.subscriptionPlans.map(plan => (
                                    <div key={plan.id} onClick={() => handlePlanSelect(plan.id)}
                                        className={`bg-white p-6 rounded-2xl cursor-pointer border-2 transition-all ${selectedPlan === plan.id ? 'border-[#D98324] shadow-lg' : 'border-transparent'}`}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-xl font-bold">{plan.name}</h3>
                                            <span className="text-[#D98324] font-bold text-xl">৳{plan.price}</span>
                                        </div>
                                        <ul className="mb-4 space-y-2">
                                            {plan.features.map((f, i) => <li key={i} className="flex gap-2 text-sm"><Check className="w-4 text-green-500"/> {f}</li>)}
                                        </ul>
                                        <button className={`w-full py-2 rounded-lg font-bold ${selectedPlan === plan.id ? 'bg-[#D98324] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            {selectedPlan === plan.id ? 'Selected' : 'Choose Plan'}
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 text-center">
                                <button onClick={handleSubscribe} disabled={!selectedPlan || isProcessing} className="px-8 py-3 bg-[#D98324] text-white rounded-full font-bold shadow-lg disabled:opacity-50">
                                    {isProcessing ? 'Processing...' : 'Proceed to Payment'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Food Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader><DialogTitle>{selectedFood?.name}</DialogTitle></DialogHeader>
                    {selectedFood && (
                        <div className="space-y-4">
                            <div className="relative h-48 w-full"><Image src={selectedFood.image} alt={selectedFood.name} fill className="object-cover rounded-md" /></div>
                            <p className="text-gray-600">{selectedFood.description}</p>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2"><Star className="w-4 text-yellow-500 fill-yellow-500" /> {selectedFood.rating || 'New'}</div>
                                <span className="text-xl font-bold text-[#D98324]">৳{selectedFood.price}</span>
                            </div>
                            {/* Quantity */}
                            <div className="flex items-center gap-4">
                                <span className="font-semibold">Quantity:</span>
                                <Button size="sm" variant="outline" onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}><Minus className="w-4"/></Button>
                                <span>{quantity}</span>
                                <Button size="sm" variant="outline" onClick={() => setQuantity(quantity + 1)}><Plus className="w-4"/></Button>
                            </div>
                            {/* Total & Add */}
                            <div className="bg-gray-50 p-4 rounded-lg flex justify-between items-center">
                                <span className="font-bold">Total: ৳{(totalPrice).toFixed(2)}</span>
                                <Button onClick={handleAddToCart} className="bg-[#D98324] hover:bg-orange-600" disabled={!user}>
                                    <ShoppingCart className="w-4 mr-2" /> Add to Cart
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Floating Cart */}
            <Link href="/cart">
                <Button className="fixed bottom-6 right-6 z-50 rounded-full h-14 w-14 bg-[#D98324] shadow-xl hover:scale-105 transition-transform">
                    <div className="relative">
                        <ShoppingCart className="h-6 w-6" />
                        {cartCount > 0 && <span className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">{cartCount}</span>}
                    </div>
                </Button>
            </Link>
        </div>
    );
}