"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Clock, Star, Plus, Minus, ShoppingCart } from 'lucide-react';
import { toast } from "sonner";

const FoodSearch = () => {
    const [searchQuery, setSearchQuery] = useState('');
    interface FoodItem {
        id: number;
        name: string;
        vendor: string;
        price: number;
        category: string;
        rating: number;
        image: string;
        description: string;
        preparationTime?: string;
        available: boolean;
    }
    const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [pickupPoint, setPickupPoint] = useState('Main Campus Cafeteria');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const pickupPoints = [
        'Main Campus Cafeteria',
        'VC Chattor',
        'Mokarrum Bhavan',
        'Central Library',
        'TSC'
    ];

    const categories = ['All', 'Rice', 'Curry', 'Snacks', 'Drinks', 'Desserts'];

    const foodItems = [
        {
            id: 1,
            name: 'Chicken Biryani',
            vendor: 'Modhur Cantine',
            price: 180,
            category: 'Rice',
            rating: 4.5,
            image: 'https://ministryofcurry.com/wp-content/uploads/2024/06/chicken-biryani.jpg',
            description: 'Aromatic basmati rice cooked with tender chicken pieces and traditional spices',
            // preparationTime: '15-20 min',
            available: true
        },
        {
            id: 2,
            name: 'Beef Curry',
            vendor: 'Kashem Mama',
            price: 150,
            category: 'Curry',
            rating: 4.2,
            image: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjdg5XYh-KMdCsZQRdFZnunWAM2DorsRwoLVPt_c6ujnaAljR-4GPIsvL79G5vb5vN4nmprZWX2ygRw8K7nSIjAHc7Vl-SJYz5O8RPWKxm73yegoU7V7RcGu5HbEdiB36TMt0lQbW9uSmI/s2048/nadan+beef+curry+24.JPG',
            description: 'Slow-cooked beef in rich, spicy gravy with traditional Bengali spices',
            // preparationTime: '10-15 min',
            available: true
        },
        {
            id: 3,
            name: 'Chicken Fry',
            vendor: 'Pushti r Chipa',
            price: 120,
            category: 'Snacks',
            rating: 4.8,
            image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=300&fit=crop',
            description: 'Crispy fried chicken marinated with special spices and herbs',
            preparationTime: '8-12 min',
            available: true
        },
        {
            id: 4,
            name: 'Fish Curry',
            vendor: 'Modhur Cantine',
            price: 140,
            category: 'Curry',
            rating: 4.3,
            image: 'https://images.unsplash.com/photo-1626205084096-cdc1c9e0a8a6?w=400&h=300&fit=crop',
            description: 'Fresh fish cooked in traditional Bengali curry with mustard oil',
            preparationTime: '12-18 min',
            available: false
        },
        {
            id: 5,
            name: 'Vegetable Fried Rice',
            vendor: 'Green Spoon',
            price: 100,
            category: 'Rice',
            rating: 4.0,
            image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
            description: 'Healthy fried rice with mixed vegetables and aromatic spices',
            preparationTime: '10-15 min',
            available: true
        },
        {
            id: 6,
            name: 'Coca Cola',
            vendor: 'Pushti r Chipa',
            price: 25,
            category: 'Drinks',
            rating: 4.7,
            image: 'https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400&h=300&fit=crop',
            description: 'Refreshing cold drink to complement your meal',
            preparationTime: '2-3 min',
            available: true
        },
        {
            id: 7,
            name: 'Rasgulla',
            vendor: 'Sweet Corner',
            price: 40,
            category: 'Desserts',
            rating: 4.6,
            image: 'https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=300&fit=crop',
            description: 'Traditional Bengali sweet made from fresh cottage cheese',
            preparationTime: '5 min',
            available: true
        },
        {
            id: 8,
            name: 'Mutton Curry',
            vendor: 'Kashem Mama',
            price: 200,
            category: 'Curry',
            rating: 4.4,
            image: 'https://images.unsplash.com/photo-1574653191817-9d7c0e2f7c5c?w=400&h=300&fit=crop',
            description: 'Tender mutton cooked in rich, aromatic spices and onion gravy',
            preparationTime: '20-25 min',
            available: true
        }
    ];

    const filteredFoods = foodItems.filter(food => {
        const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            food.vendor.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleFoodClick = (food: FoodItem) => {
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

    const totalPrice = selectedFood ? selectedFood.price * quantity : 0;

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
                <Card className=" shadow-lg border-0 relative overflow-hidden ">
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `radial-gradient(circle at 12px 12px, #D98324 1px, transparent 1px)`,
                            backgroundSize: '24px 24px'
                        }}
                    />
                    <CardContent className=" p-1 relative z-10 px-10">
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 h-4 w-4" style={{ color: '#a0896b' }} />
                                <input
                                    placeholder="Search food items or vendors..."
                                    value={searchQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    className="pl-10 h-12"
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
                                    <img
                                        src={food.image}
                                        alt={food.name}
                                        className="w-full h-full object-cover"
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
                                        by {food.vendor}
                                    </p>
                                    
                                    <p className="text-sm mb-3" style={{ color: '#443627' }}>
                                        {food.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span className="text-sm font-medium" style={{ color: '#443627' }}>
                                                {food.rating}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" style={{ color: '#a0896b' }} />
                                            <span className="text-sm" style={{ color: '#a0896b' }}>
                                                {food.preparationTime}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-xl font-bold" style={{ color: '#D98324' }}>
                                            ৳{food.price}
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
                                    />
                                </div>
                                
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2" style={{ color: '#443627' }}>
                                            Vendor: {selectedFood.vendor}
                                        </h3>
                                        <p style={{ color: '#a0896b' }}>
                                            {selectedFood.description}
                                        </p>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                                <span style={{ color: '#443627' }}>{selectedFood.rating}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" style={{ color: '#a0896b' }} />
                                                <span style={{ color: '#a0896b' }}>
                                                    {selectedFood.preparationTime}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-xl font-bold" style={{ color: '#D98324' }}>
                                            ৳{selectedFood.price}
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
                                    
                                    {/* Action Buttons */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            onClick={handleAddToCart}
                                            variant="outline"
                                            className="flex-1"
                                        >
                                            <ShoppingCart className="h-4 w-4 mr-2" />
                                            Add to Cart
                                        </Button>
                                        <Button
                                            onClick={handleOrderNow}
                                            className="flex-1"
                                            style={{ backgroundColor: '#D98324' }}
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