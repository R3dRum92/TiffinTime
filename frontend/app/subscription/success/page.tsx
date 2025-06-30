"use client"

import React, { useState } from 'react';

export default function SubscriptionSuccess() {
    return (
        <div className="relative min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(247, 241, 234)' }}>
            {/* Background SVG */}
            <div className="absolute inset-0 z-0">
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

            {/* Content */}
            <div className="relative z-10 text-center max-w-md mx-auto px-6">
                <div className="mb-8">
                    <div className="text-6xl mb-4">🎉</div>
                    <h1 className="text-4xl font-bold mb-4" style={{ color: '#D98324' }}>
                        Subscription Activated!
                    </h1>
                    <p className="text-lg mb-8" style={{ color: '#a0896b' }}>
                        Your subscription has been successfully activated. You can now enjoy unlimited food delivery!
                    </p>
                </div>

                <button
                    className="px-8 py-4 rounded-3xl font-semibold text-lg transition-all duration-300 hover:opacity-90 hover:transform hover:scale-105"
                    style={{ backgroundColor: '#D98324', color: 'white' }}
                >
                    Start Ordering
                </button>
            </div>
        </div>
    );
}