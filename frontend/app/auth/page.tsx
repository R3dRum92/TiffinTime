"use client"
import React, { useState } from 'react';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setFormData({
            email: '',
            password: '',
            confirmPassword: '',
            name: ''
        });
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-[#EFDCAB]">
            {/* Irregular Background Decorations */}
            <div className="absolute inset-0 overflow-hidden">
                {/* Large organic shape top-left */}
                <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-[#D98324] opacity-20 blur-3xl"></div>

                {/* Wavy decorative elements */}
                <svg className="absolute top-0 left-0 w-full h-full" viewBox="0 0 1440 800" preserveAspectRatio="none">
                    <path
                        d="M0,200 C200,150 400,250 600,200 C800,150 1000,300 1200,250 C1300,230 1400,200 1440,220 L1440,0 L0,0 Z"
                        fill="#443627"
                        className="opacity-10 mix-blend-multiply"
                    />
                    <path
                        d="M0,400 C300,350 600,450 900,400 C1100,370 1300,420 1440,400 L1440,800 L0,800 Z"
                        fill="#D98324"

                        className="opacity-10 mix-blend-multiply"
                    />
                </svg>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md">
                    {/* Logo/Brand Section */}
                    <div className="text-center mb-8">
                        <span className="text-3xl font-bold mb-2 text-[#D98324]">
                            Tiffin</span><span className='text-3xl font-bold mb-2 text-[#443627]'>Time</span>

                        <p className="text-lg text-[#a0896b]">
                            Delicious food, delivered fast
                        </p>
                    </div>

                    {/* Auth Card */}
                    <div className="backdrop-blur-lg bg-white/80 shadow-2xl border-0 rounded-3xl overflow-hidden">
                        <div className="text-center pb-2 pt-6 px-6">
                            <h2 className="text-2xl font-bold mb-2 text-[#443627]">
                                {isLogin ? 'Welcome Back!' : 'Join FoodieApp'}
                            </h2>
                            <p className="text-base text-[#a0896b]">
                                {isLogin
                                    ? 'Sign in to continue your culinary journey'
                                    : 'Create an account to start ordering amazing food'
                                }
                            </p>
                        </div>

                        <div className="pt-2 px-6 pb-6">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!isLogin && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium block text-[#443627]">
                                            Full Name
                                        </label>
                                        <input
                                            name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-2 focus:border-[#D98324] focus:outline-none transition-all duration-200 bg-white"
                                            placeholder="Enter your full name"
                                            required={!isLogin}
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium block text-[#443627]">
                                        Email Address
                                    </label>
                                    <input
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-2 focus:border-[#D98324] focus:outline-none transition-all duration-200 bg-white"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium block text-[#443627]">
                                        Password
                                    </label>
                                    <input
                                        name="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-2 focus:border-[#D98324] focus:outline-none transition-all duration-200 bg-white"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>

                                {!isLogin && (
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium block text-[#443627]">
                                            Confirm Password
                                        </label>
                                        <input
                                            name="confirmPassword"
                                            type="password"
                                            value={formData.confirmPassword}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-2 focus:border-[#D98324] focus:outline-none transition-all duration-200 bg-white"
                                            placeholder="Confirm your password"
                                            required={!isLogin}
                                        />
                                    </div>
                                )}

                                {isLogin && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            className="text-sm hover:underline transition-all duration-200 text-[#D98324]"
                                        >
                                            Forgot Password?
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 bg-[#D98324]"
                                >
                                    {isLogin ? 'Sign In' : 'Create Account'}
                                </button>
                            </form>

                            <div className="mt-6">


                            </div>

                            <div className="mt-6 text-center">
                                <p className="text-[#a0896b]">
                                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    <button
                                        type="button"
                                        onClick={toggleAuthMode}
                                        className="font-semibold hover:underline transition-all duration-200 text-[#D98324]"
                                    >
                                        {isLogin ? 'Sign Up' : 'Sign In'}
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8">
                        <p className="text-sm text-[#a0896b]">
                            By continuing, you agree to our{' '}
                            <button className="hover:underline text-[#D98324]">
                                Terms of Service
                            </button>
                            {' '}and{' '}
                            <button className="hover:underline text-[#D98324]">
                                Privacy Policy
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;