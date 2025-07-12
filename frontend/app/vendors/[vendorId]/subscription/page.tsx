"use client"

import React, { useState } from 'react';
import { Check, Crown, Clock, Calendar, Utensils, Truck, Star, Shield } from 'lucide-react';

const SubscriptionPlans = () => {
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const plans = [
        {
            id: 'weekly',
            name: 'Weekly Plan',
            price: 299,
            duration: '7 days',
            icon: <Clock className="w-6 h-6" />,
            features: [
                'Unlimited food delivery',
                'No delivery charges',
                'Priority customer support',
                'Access to exclusive vendors',
                'Cancel anytime'
            ],
            popular: false
        },
        {
            id: 'monthly',
            name: 'Monthly Plan',
            price: 999,
            duration: '30 days',
            icon: <Calendar className="w-6 h-6" />,
            features: [
                'Unlimited food delivery',
                'No delivery charges',
                'Priority customer support',
                'Access to exclusive vendors',
                'Cancel anytime',
                'Free dessert with every order',
                '24/7 customer service'
            ],
            popular: true,
            savings: 'Save ৳197'
        }
    ];

    const handlePlanSelect = (planId: string) => {
        setSelectedPlan(planId);
    };

    const handleSubscribe = async () => {
        if (!selectedPlan) {
            alert('Please select a subscription plan');
            return;
        }

        setLoading(true);

        // try {
        //     // Simulate API call for demo
        //     await new Promise(resolve => setTimeout(resolve, 2000));
        //     alert('Redirecting to payment gateway...');
        // } catch (error) {
        //     console.error('Error creating subscription:', error);
        //     alert('Something went wrong. Please try again.');
        // } finally {
        //     setLoading(false);
        // }
        // try {
        //     const token = localStorage.getItem('token');

        //     const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/create`, {
        //         method: 'POST',
        //         headers: {
        //             'Content-Type': 'application/json',
        //             'Authorization': `Bearer ${token}`
        //         },
        //         body: JSON.stringify({
        //             plan_type: selectedPlan
        //         })
        //     });

        //     const data = await response.json();

        //     if (response.ok && data.payment_url) {
        //         // Redirect to SSLCOMMERZ payment gateway
        //         window.location.href = data.payment_url;
        //     } else {
        //         alert(data.detail || 'Failed to create subscription');
        //     }
        // } catch (error) {
        //     console.error('Error creating subscription:', error);
        //     alert('Something went wrong. Please try again.');
        // } finally {
        //     setLoading(false);
        // }
    };

    return (
        <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: ' #f7f9e6' }}>
            {/* Background SVG Pattern */}
            <div className="absolute inset-0">
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

            <div className="relative z-10 py-12 px-4">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="text-center pt-15 mb-16">
                        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full" style={{ backgroundColor: 'rgb(235, 206, 133)' }}>
                            <Utensils className="w-5 h-5" style={{ color: '#D98324' }} />
                            <span className="text-sm font-semibold" style={{ color: '#443627' }}>Student plan</span>
                        </div>
                        <h1 className="text-5xl lg:text-6xl font-bold mb-6 pt-10" style={{ color: '#443627' }}>
                            Choose Your<br />
                            <span style={{ color: '#D98324' }}>Subscription Plan</span>
                        </h1>
                        <p className="text-lg max-w-2xl mx-auto" style={{ color: '#a0896b' }}>
                            Affordable food delivery plans designed for university students in Bangladesh. Get unlimited access to your favorite vendors!
                        </p>
                    </div>

                    {/* Plans Grid */}
                    <div className="grid grid-cols-2 gap-10 mb-16 max-w-5xl mx-auto">
                        {plans.map((plan) => (
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
                                {plan.savings && (
                                    <div className="absolute -top-3 -right-3">
                                        <div className="bg-green-700 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                            {plan.savings}
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
                                        {plan.id === 'monthly' && (
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
                    <div className="text-center mb-16">
                        <button
                            onClick={handleSubscribe}
                            disabled={!selectedPlan || loading}
                            className={`px-16 py-5 rounded-full font-bold text-xl transition-all duration-300 transform hover:scale-105 shadow-lg ${selectedPlan && !loading
                                ? 'text-white hover:shadow-2xl'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            style={{
                                background: selectedPlan && !loading
                                    ? 'rgb(202, 83, 35)'
                                    : undefined
                            }}
                        >
                            {loading ? (
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

                    {/* Features Section */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16">
                        <div className="text-center">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                                style={{ backgroundColor: '#EFDCAB' }}
                            >
                                <Truck className="w-8 h-8" style={{ color: '#D98324' }} />
                            </div>
                            <h3 className="font-bold text-lg mb-2" style={{ color: '#443627' }}>
                                Fast Delivery
                            </h3>
                            <p style={{ color: '#a0896b' }}>
                                Get your fresh food delivered within 1-2 hours
                            </p>
                        </div>

                        <div className="text-center">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                                style={{ backgroundColor: '#EFDCAB' }}
                            >
                                <Star className="w-8 h-8" style={{ color: '#D98324' }} />
                            </div>
                            <h3 className="font-bold text-lg mb-2" style={{ color: '#443627' }}>
                                Premium Quality
                            </h3>
                            <p style={{ color: '#a0896b' }}>
                                100% organic and fresh ingredients from trusted vendors
                            </p>
                        </div>

                        <div className="text-center">
                            <div
                                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                                style={{ backgroundColor: '#EFDCAB' }}
                            >
                                <Shield className="w-8 h-8" style={{ color: '#D98324' }} />
                            </div>
                            <h3 className="font-bold text-lg mb-2" style={{ color: '#443627' }}>
                                Money Back Guarantee
                            </h3>
                            <p style={{ color: '#a0896b' }}>
                                Not satisfied? Get full refund within 7 days
                            </p>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="bg-white rounded-3xl p-8 shadow-lg">
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
};

export default SubscriptionPlans;