"use client"

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Clock, Star, Plus, Minus, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import { useMenu } from '@/app/hooks/allmenu';
import { useUserInfo } from '@/app/hooks/getUserDetails';
import { useOrderState } from '@/app/hooks/useOrderState';
import { useCart } from '../context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

const FoodSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedVendor, setSelectedVendor] = useState('All');

    // Get current user
    const { user, isLoading: userLoading, error: userError } = useUserInfo();
    const isAuthenticated = !!user && !userError;

    const { addToCart, cartCount } = useCart();

    // Fetch menu data
    const { data: menuItems, isLoading: menuLoading, error: menuError } = useMenu();

    // Use order state hook with State pattern
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

    // Extract unique categories
    const categories = useMemo(() => {
        if (!menuItems) return ['All'];
        const uniqueCategories = [...new Set(menuItems.map(item => item.category).filter((category): category is string => category !== undefined && category !== null))];
        return ['All', ...uniqueCategories];
    }, [menuItems]);

    // Extract unique vendors
    const vendorOptions = useMemo(() => {
        if (!menuItems) return ['All'];
        const uniqueVendors = [...new Set(menuItems.map(item => item.vendorName))];
        return ['All', ...uniqueVendors];
    }, [menuItems]);


    const handleAddToCart = () => {
        if (selectedFood) {
            addToCart(selectedFood, quantity);
            setIsDetailsOpen(false);
            // Optional: Reset quantity
            setQuantity(1);
        }
    };

    // Filter menu items
    const filteredFoods = useMemo(() => {
        if (!menuItems) return [];

        return menuItems.filter(food => {
            const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                food.vendorName.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
            const matchesVendor = selectedVendor === 'All' || food.vendorName === selectedVendor;
            return matchesSearch && matchesCategory && matchesVendor;
        });
    }, [menuItems, searchQuery, selectedCategory, selectedVendor]);

    // Loading state
    if (menuLoading || userLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: '#D98324' }} />
                    <p className="text-lg" style={{ color: '#443627' }}>
                        {userLoading ? 'Loading user data...' : 'Loading menu...'}
                    </p>
                </div>
            </div>
        );
    }

    // Error state
    if (menuError) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
                <div className="text-center">
                    <AlertCircle className="h-8 w-8 mx-auto mb-4" style={{ color: '#D98324' }} />
                    <p className="text-lg mb-2" style={{ color: '#443627' }}>Failed to load menu</p>
                    <p className="text-sm" style={{ color: '#a0896b' }}>Please try again later</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
            <div className="absolute inset-0 opacity-20" />

            <div className="max-w-6xl mx-auto p-6 space-y-6 relative z-10">
                {/* Header */}
                <div className="text-center mt-10 pt-8 pb-6">
                    <h1 className="text-3xl font-bold mb-4" style={{ color: '#443627' }}>
                        Order Your Favorite Food
                    </h1>
                    <p className="text-xl" style={{ color: '#a0896b' }}>
                        Discover delicious meals from your favorite campus vendors
                    </p>
                    {isAuthenticated && user && (
                        <p className="text-sm mt-2" style={{ color: '#a0896b' }}>
                            Welcome, {user.name}!
                        </p>
                    )}
                    {!isAuthenticated && !userLoading && (
                        <p className="text-sm mt-2 text-yellow-600">
                            Please log in to place orders
                        </p>
                    )}
                </div>

                {/* Search and Filter Section */}
                <Card className="shadow-lg border-0 relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `radial-gradient(circle at 12px 12px, #D98324 1px, transparent 1px)`,
                            backgroundSize: '24px 24px'
                        }}
                    />
                    <CardContent className="p-1 relative z-10 px-10">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: '#a0896b' }} />
                                <input
                                    placeholder="Search food items or vendors..."
                                    value={searchQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-12 w-full border border-gray-300 rounded-md px-3 focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger className="w-full md:w-48 h-12">
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={selectedVendor} onValueChange={setSelectedVendor}>
                                <SelectTrigger className="w-full md:w-48 h-12">
                                    <SelectValue placeholder="Vendor" />
                                </SelectTrigger>
                                <SelectContent>
                                    {vendorOptions.map((vendor) => (
                                        <SelectItem key={vendor} value={vendor}>
                                            {vendor}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Food Items Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFoods.map((food) => (
                        <Card
                            key={food.id}
                            className={`shadow-lg border-0 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden ${!food.available ? 'opacity-60' : ''
                                }`}
                            onClick={() => food.available && handleFoodClick(food)}
                        >
                            <div
                                className="absolute inset-0 opacity-5"
                                style={{
                                    backgroundImage: `radial-gradient(circle at 8px 8px, #D98324 0.5px, transparent 0.5px)`,
                                    backgroundSize: '16px 16px'
                                }}
                            />
                            <div className="relative z-10">
                                <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden">
                                    <Image
                                        src={food.image}
                                        alt={food.name}
                                        className="w-full h-full object-cover"
                                        width={400}
                                        height={240}
                                    />
                                </div>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg" style={{ color: '#443627' }}>
                                            {food.name}
                                        </h3>
                                        <Badge
                                            className={`${food.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border-0`}
                                        >
                                            {food.available ? 'Available' : 'Unavailable'}
                                        </Badge>
                                    </div>

                                    <p className="text-sm mb-2" style={{ color: '#a0896b' }}>
                                        by {food.vendorName}
                                    </p>

                                    <p className="text-sm mb-3 line-clamp-2" style={{ color: '#443627' }}>
                                        {food.description || 'No description available'}
                                    </p>

                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-medium" style={{ color: '#443627' }}>
                                                {food.rating || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" style={{ color: '#a0896b' }} />
                                            <span className="text-sm" style={{ color: '#a0896b' }}>
                                                {food.preparationTime || 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold" style={{ color: '#D98324' }}>
                                            {food.price > 0 ? `৳${food.price}` : 'Price TBD'}
                                        </span>
                                        <Button
                                            size="sm"
                                            disabled={!food.available}
                                            style={{ backgroundColor: '#D98324' }}
                                            className="hover:bg-opacity-90"
                                        >
                                            {/* Changed text from 'Order Now' to 'View Details' */}
                                            {food.available ? 'View Details' : 'Unavailable'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* No Results */}
                {filteredFoods.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-lg" style={{ color: '#a0896b' }}>
                            No food items found matching your search.
                        </p>
                    </div>
                )}

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

                                    {/* NOTE: Pickup Point selector removed as selection happens at Checkout */}

                                    {/* Authentication Warning */}
                                    {!isAuthenticated && (
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
                                            // Changed to full width and primary color since it's the only button
                                            className="w-full"
                                            style={{ backgroundColor: '#D98324' }}
                                            disabled={selectedFood.price <= 0 || !isAuthenticated}
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
            </div>

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
};

export default FoodSearch;