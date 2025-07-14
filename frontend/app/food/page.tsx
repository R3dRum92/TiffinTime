



"use client"

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Clock, Star, Plus, Minus, ShoppingCart, Loader2, AlertCircle } from 'lucide-react';
import { toast } from "sonner";
import { useMenu, MenuItem } from '@/app/hooks/allmenu'; // Adjust import path as needed
import Image from 'next/image';


const FoodSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFood, setSelectedFood] = useState<MenuItem | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [pickupPoint, setPickupPoint] = useState('Main Campus Cafeteria');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedVendor, setSelectedVendor] = useState('All');

    // Fetch vendors and menu data
    const { data: menuItems, isLoading: menuLoading, error: menuError } = useMenu();

    const pickupPoints = [
        'Main Campus Cafeteria',
        'VC Chattor',
        'Mokarrum Bhavan',
        'Central Library',
        'TSC'
    ];

    // Extract unique categories from menu items
    const categories = useMemo(() => {
        if (!menuItems) return ['All'];
        const uniqueCategories = [...new Set(menuItems.map(item => item.category).filter((category): category is string => category !== undefined && category !== null))];
        return ['All', ...uniqueCategories];
    }, [menuItems]);

    // Extract unique vendors from menu items
    const vendorOptions = useMemo(() => {
        if (!menuItems) return ['All'];
        const uniqueVendors = [...new Set(menuItems.map(item => item.vendorName))];
        return ['All', ...uniqueVendors];
    }, [menuItems]);

    // Filter menu items based on search and filters
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

    const handleFoodClick = (food: MenuItem) => {
        setSelectedFood(food);
        setQuantity(1);
        setIsDetailsOpen(true);
    };

    const handleAddToCart = () => {
        if (selectedFood) {
            toast("Added to Cart", {
                description: `${quantity}x ${selectedFood.name} added to your cart`,
            });
            setIsDetailsOpen(false);
        }
    };

    const handleOrderNow = () => {
        if (selectedFood) {
            toast("Order Placed", {
                description: `Your order for ${quantity}x ${selectedFood.name} has been placed successfully!`,
            });
            setIsDetailsOpen(false);
        }
    };

    const totalPrice = selectedFood ? (selectedFood.price * quantity) : 0;

    // Loading state
    if (menuLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" style={{ color: '#D98324' }} />
                    <p className="text-lg" style={{ color: '#443627' }}>Loading menu...</p>
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
            {/* Background Pattern */}
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
                            className={`shadow-lg border-0 cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 relative overflow-hidden ${
                                !food.available ? 'opacity-60' : ''
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
                                    
                                    <p className="text-sm mb-3" style={{ color: '#443627' }}>
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
                                            {food.available ? 'Order Now' : 'Unavailable'}
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
                                    <img
                                        src={selectedFood.image}
                                        alt={selectedFood.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
                                        }}
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
                                                disabled={quantity <= 1}
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
                                            >
                                                <Plus className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    {/* Pickup Point */}
                                    <div className="space-y-2">
                                        <label className="font-semibold" style={{ color: '#443627' }}>
                                            Pickup Point:
                                        </label>
                                        <Select value={pickupPoint} onValueChange={setPickupPoint}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {pickupPoints.map((point) => (
                                                    <SelectItem key={point} value={point}>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="h-4 w-4" />
                                                            {point}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    {/* Total Price */}
                                    {selectedFood.price > 0 && (
                                        <div className="p-4 rounded-lg" style={{ backgroundColor: '#f8f6f3' }}>
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold" style={{ color: '#443627' }}>
                                                    Total Amount:
                                                </span>
                                                <span className="text-2xl font-bold" style={{ color: '#D98324' }}>
                                                    ৳{totalPrice}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            onClick={handleAddToCart}
                                            variant="outline"
                                            className="flex-1"
                                            disabled={selectedFood.price <= 0}
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Add to Cart
                                        </Button>
                                        <Button
                                            onClick={handleOrderNow}
                                            className="flex-1"
                                            style={{ backgroundColor: '#D98324' }}
                                            disabled={selectedFood.price <= 0}
                                        >
                                            Order Now
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default FoodSearch;