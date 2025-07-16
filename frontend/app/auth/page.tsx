"use client"
import React, { useState } from 'react';

// Loading Spinner Component
const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center space-x-2">
        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
        <span>Processing...</span>
    </div>
);

// Define types for roles
type UserRole = 'student' | 'vendor';

// Define props interface for SignInForm
interface SignInFormProps {
    toggleAuthMode: () => void;
    handleRoleSelect: (role: UserRole) => void;
    selectedRole: UserRole;
}

// SignInForm Component
const SignInForm: React.FC<SignInFormProps> = ({ toggleAuthMode, handleRoleSelect, selectedRole }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: selectedRole
    });
    const [isLoading, setIsLoading] = useState(false);

    // Update form data when role changes from parent
    React.useEffect(() => {
        setFormData(prev => ({ ...prev, role: selectedRole }));
    }, [selectedRole]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                // Store JWT token
                localStorage.setItem('token', data.token);
                // Then redirect based on role
                window.location.href = formData.role === 'student' ? '/' : '/vendorDash';
            } else {
                // Handle login error (e.g., show a message to the user)
                console.error('Login failed:', data.message || 'Unknown error');
                // You might want to display an error message on the UI
            }
        } catch (error) {
            console.error('Auth error:', error);
            // Handle network or other unexpected errors
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection - Kept in both forms as per original design */}
            <div className="mb-6">
                <label className="text-sm font-medium block text-[#443627] mb-3">
                    I am a:
                </label>
                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={() => handleRoleSelect('student')}
                        disabled={isLoading}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 border-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            } ${selectedRole === 'student'
                                ? 'bg-[#D98324] text-white border-[#D98324] shadow-lg transform scale-105'
                                : 'bg-white text-[#443627] border-gray-200 hover:border-[#D98324] hover:shadow-md'
                            }`}
                    >
                        🎓 Student
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRoleSelect('vendor')}
                        disabled={isLoading}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 border-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            } ${selectedRole === 'vendor'
                                ? 'bg-[#D98324] text-white border-[#D98324] shadow-lg transform scale-105'
                                : 'bg-white text-[#443627] border-gray-200 hover:border-[#D98324] hover:shadow-md'
                            }`}
                    >
                        🍳 Vendor
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium block text-[#443627]">
                    Email Address
                </label>
                <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-2 focus:border-[#D98324] focus:outline-none transition-all duration-200 bg-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
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
                    disabled={isLoading}
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-2 focus:border-[#D98324] focus:outline-none transition-all duration-200 bg-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    placeholder="Enter your password"
                    required
                />
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    disabled={isLoading}
                    className={`text-sm hover:underline transition-all duration-200 text-[#D98324] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                >
                    Forgot Password?
                </button>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 bg-[#D98324] ${isLoading ? 'opacity-75 cursor-not-allowed transform-none' : ''
                    }`}
            >
                {isLoading ? <LoadingSpinner /> : 'Sign In'}
            </button>

            <div className="mt-6 text-center">
                <p className="text-[#a0896b]">
                    Don&apos;t have an account?{' '}
                    <button
                        type="button"
                        onClick={toggleAuthMode}
                        disabled={isLoading}
                        className={`font-semibold hover:underline transition-all duration-200 text-[#D98324] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        Sign Up
                    </button>
                </p>
            </div>
        </form>
    );
};

// Define props interface for SignUpForm
interface SignUpFormProps {
    toggleAuthMode: () => void;
    handleRoleSelect: (role: UserRole) => void;
    selectedRole: UserRole;
}

// SignUpForm Component
const SignUpForm: React.FC<SignUpFormProps> = ({ toggleAuthMode, handleRoleSelect, selectedRole }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
        phone_number: '',
        role: selectedRole
    });
    const [isLoading, setIsLoading] = useState(false);

    // Update form data when role changes from parent
    React.useEffect(() => {
        setFormData(prev => ({ ...prev, role: selectedRole }));
    }, [selectedRole]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            console.error("Passwords do not match!");
            // You might want to display an error message on the UI
            return;
        }

        setIsLoading(true);

        try {
            // Assuming a /api/auth/register endpoint for sign-up
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    phone_number: formData.phone_number,
                    confirm_password: formData.confirmPassword,
                    role: formData.role
                })
            });

            const data = await response.json();

            if (response.ok) {
                toggleAuthMode()
            } else {
                // Handle registration error
                console.error('Registration failed:', data.message || 'Unknown error');
            }
        } catch (error) {
            console.error('Auth error:', error);
            // Handle network or other unexpected errors
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection - Kept in both forms as per original design */}
            <div className="mb-6">
                <label className="text-sm font-medium block text-[#443627] mb-3">
                    I am a:
                </label>
                <div className="flex space-x-3">
                    <button
                        type="button"
                        onClick={() => handleRoleSelect('student')}
                        disabled={isLoading}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 border-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            } ${selectedRole === 'student'
                                ? 'bg-[#D98324] text-white border-[#D98324] shadow-lg transform scale-105'
                                : 'bg-white text-[#443627] border-gray-200 hover:border-[#D98324] hover:shadow-md'
                            }`}
                    >
                        🎓 Student
                    </button>
                    <button
                        type="button"
                        onClick={() => handleRoleSelect('vendor')}
                        disabled={isLoading}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 border-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            } ${selectedRole === 'vendor'
                                ? 'bg-[#D98324] text-white border-[#D98324] shadow-lg transform scale-105'
                                : 'bg-white text-[#443627] border-gray-200 hover:border-[#D98324] hover:shadow-md'
                            }`}
                    >
                        🍳 Vendor
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium block text-[#443627]">
                    Full Name
                </label>
                <input
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-2 focus:border-[#D98324] focus:outline-none transition-all duration-200 bg-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    placeholder="Enter your full name"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium block text-[#443627]">
                    Email Address
                </label>
                <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-2 focus:border-[#D98324] focus:outline-none transition-all duration-200 bg-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    placeholder="Enter your email"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium block text-[#443627]">
                    Phone Number
                </label>
                <input
                    name="phone_number"
                    type="tel"
                    value={formData.phone_number || ''}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-2 focus:border-[#D98324] focus:outline-none transition-all duration-200 bg-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    placeholder="Enter your phone number"
                    required
                    autoComplete="tel"
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
                    disabled={isLoading}
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-2 focus:border-[#D98324] focus:outline-none transition-all duration-200 bg-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    placeholder="Enter your password"
                    required
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium block text-[#443627]">
                    Confirm Password
                </label>
                <input
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-2 focus:border-[#D98324] focus:outline-none transition-all duration-200 bg-white ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    placeholder="Confirm your password"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 bg-[#D98324] ${isLoading ? 'opacity-75 cursor-not-allowed transform-none' : ''
                    }`}
            >
                {isLoading ? <LoadingSpinner /> : 'Create Account'}
            </button>

            <div className="mt-6 text-center">
                <p className="text-[#a0896b]">
                    Already have an account?{' '}
                    <button
                        type="button"
                        onClick={toggleAuthMode}
                        disabled={isLoading}
                        className={`font-semibold hover:underline transition-all duration-200 text-[#D98324] ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        Sign In
                    </button>
                </p>
            </div>
        </form>
    );
};


// Main AuthPage Component
const AuthPage: React.FC = () => {
    const [isLogin, setIsLogin] = useState<boolean>(true);
    const [selectedRole, setSelectedRole] = useState<UserRole>('student'); // Initial role

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
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
                                {isLogin ? 'Welcome Back!' : 'Join Us'}
                            </h2>
                            <p className="text-base text-[#a0896b]">
                                {isLogin
                                    ? 'Sign in to continue your culinary journey'
                                    : 'Create an account to start ordering amazing food'
                                }
                            </p>
                        </div>

                        <div className="pt-2 px-6 pb-6">
                            {isLogin ? (
                                <SignInForm
                                    toggleAuthMode={toggleAuthMode}
                                    handleRoleSelect={handleRoleSelect}
                                    selectedRole={selectedRole}
                                />
                            ) : (
                                <SignUpForm
                                    toggleAuthMode={toggleAuthMode}
                                    handleRoleSelect={handleRoleSelect}
                                    selectedRole={selectedRole}
                                />
                            )}
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