import React, { useState } from 'react';
import { Check, Crown, Clock, Calendar } from 'lucide-react';

const SubscriptionPlans = () => {
    const [selectedPlan, setSelectedPlan] = useState(null);
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

    // const handlePlanSelect = (planId) => {
    //     setSelectedPlan(planId);
    // };

    const handleSubscribe = async () => {
        if (!selectedPlan) {
            alert('Please select a subscription plan');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('/api/subscription/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth
                },
                body: JSON.stringify({
                    plan_type: selectedPlan,
                    user_id: 'user123' // Replace with actual user ID from your auth context
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Redirect to SSLCOMMERZ payment gateway
                window.location.href = data.payment_url;
            } else {
                alert(data.detail || 'Failed to create subscription');
            }
        } catch (error) {
            console.error('Error creating subscription:', error);
            alert('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">
                        Choose Your Subscription Plan
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Enjoy unlimited food delivery with no delivery charges. Perfect for university students!
                    </p>
                </div>

                {/* Plans Grid */}
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    {plans.map((plan) => (
                        <div
                            key={plan.id}
                            className={`relative bg-white rounded-2xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl ${selectedPlan === plan.id
                                ? 'ring-4 ring-orange-400 shadow-2xl scale-105'
                                : 'hover:scale-102'
                                }`}
                        // onClick={() => handlePlanSelect(plan.id)}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <div className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center gap-1">
                                        <Crown className="w-4 h-4" />
                                        Most Popular
                                    </div>
                                </div>
                            )}

                            {/* Savings Badge */}
                            {plan.savings && (
                                <div className="absolute -top-2 -right-2">
                                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                        {plan.savings}
                                    </div>
                                </div>
                            )}

                            <div className="p-8">
                                {/* Plan Header */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className={`p-3 rounded-lg ${selectedPlan === plan.id
                                        ? 'bg-orange-100 text-orange-600'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {plan.icon}
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-gray-800">{plan.name}</h3>
                                        <p className="text-gray-600">{plan.duration}</p>
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="mb-8">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-gray-800">৳{plan.price}</span>
                                        <span className="text-gray-600">/{plan.duration}</span>
                                    </div>
                                    {plan.id === 'monthly' && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            ৳{Math.round(plan.price / 30)}/day
                                        </p>
                                    )}
                                </div>

                                {/* Features */}
                                <div className="space-y-4 mb-8">
                                    {plan.features.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${selectedPlan === plan.id
                                                ? 'bg-orange-100 text-orange-600'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                <Check className="w-3 h-3" />
                                            </div>
                                            <span className="text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Selection Indicator */}
                                {selectedPlan === plan.id && (
                                    <div className="text-center">
                                        <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-semibold">
                                            <Check className="w-4 h-4" />
                                            Selected
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Subscribe Button */}
                <div className="text-center">
                    <button
                        onClick={handleSubscribe}
                        disabled={!selectedPlan || loading}
                        className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300 ${selectedPlan && !loading
                            ? 'bg-gradient-to-r from-orange-400 to-red-400 text-white hover:from-orange-500 hover:to-red-500 shadow-lg hover:shadow-xl'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Processing...' : selectedPlan ? 'Subscribe Now' : 'Select a Plan'}
                    </button>

                    {selectedPlan && (
                        <p className="text-sm text-gray-600 mt-4">
                            You'll be redirected to SSLCOMMERZ for secure payment
                        </p>
                    )}
                </div>

                {/* Footer Info */}
                <div className="mt-12 text-center">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <h4 className="font-semibold text-gray-800 mb-2">Why Choose Our Subscription?</h4>
                        <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
                            <div>
                                <strong>No Hidden Fees:</strong> What you see is what you pay
                            </div>
                            <div>
                                <strong>Instant Activation:</strong> Start ordering immediately after payment
                            </div>
                            <div>
                                <strong>Easy Cancellation:</strong> Cancel anytime through your account
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SubscriptionPlans;