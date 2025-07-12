"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
    Plus, 
    Edit3, 
    Trash2, 
    Calendar, 
    Clock, 
    Star, 
    ChefHat,
    Eye,
    EyeOff,
    Save,
    X,
    Store
} from 'lucide-react';

// Type definitions
interface MenuItem {
    id: number;
    name: string;
    price: number;
    category: string;
    description: string;
    preparationTime: string;
    image: string;
    available: boolean;
    editDate?: string;
}

interface NewMenuItem {
    name: string;
    price: string;
    category: string;
    description: string;
    preparationTime: string;
    image: string;
    available: boolean;
}

interface MenuData {
    [date: string]: MenuItem[];
}

const VendorDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [viewMode, setViewMode] = useState('today');

    // Current vendor info
    const vendorInfo = {
        name: 'Modhur Cantine',
        location: 'Main Campus Cafeteria',
        rating: 4.5,
        totalOrders: 234
    };

    const categories = ['Rice', 'Curry', 'Snacks', 'Drinks', 'Desserts'];

    const [newMenuItem, setNewMenuItem] = useState<NewMenuItem>({
        name: '',
        price: '',
        category: 'Rice',
        description: '',
        preparationTime: '',
        image: '',
        available: true
    });

    // Sample menu data
    const [menuData, setMenuData] = useState<MenuData>({
        '2025-07-12': [
            {
                id: 1,
                name: 'Chicken Biryani',
                price: 180,
                category: 'Rice',
                description: 'Aromatic basmati rice cooked with tender chicken pieces and traditional spices',
                preparationTime: '15-20 min',
                image: 'https://ministryofcurry.com/wp-content/uploads/2024/06/chicken-biryani.jpg',
                available: true
            },
            {
                id: 2,
                name: 'Fish Curry',
                price: 140,
                category: 'Curry',
                description: 'Fresh fish cooked in traditional Bengali curry with mustard oil',
                preparationTime: '12-18 min',
                image: 'https://images.unsplash.com/photo-1626205084096-cdc1c9e0a8a6?w=400&h=300&fit=crop',
                available: false
            },
            {
                id: 3,
                name: 'Chicken Fry',
                price: 120,
                category: 'Snacks',
                description: 'Crispy fried chicken marinated with special spices and herbs',
                preparationTime: '8-12 min',
                image: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=300&fit=crop',
                available: true
            }
        ],
        '2025-07-13': [
            {
                id: 4,
                name: 'Beef Biryani',
                price: 200,
                category: 'Rice',
                description: 'Special beef biryani with premium spices and aromatic rice',
                preparationTime: '20-25 min',
                image: 'https://ministryofcurry.com/wp-content/uploads/2024/06/chicken-biryani.jpg',
                available: true
            },
            {
                id: 5,
                name: 'Dal Curry',
                price: 80,
                category: 'Curry',
                description: 'Traditional lentil curry with authentic Bengali spices',
                preparationTime: '10-15 min',
                image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
                available: true
            }
        ],
        '2025-07-14': [
            {
                id: 6,
                name: 'Mutton Curry',
                price: 220,
                category: 'Curry',
                description: 'Tender mutton cooked in rich, aromatic spices and onion gravy',
                preparationTime: '25-30 min',
                image: 'https://images.unsplash.com/photo-1574653191817-9d7c0e2f7c5c?w=400&h=300&fit=crop',
                available: true
            }
        ]
    });

    const [selectedDateForAdd, setSelectedDateForAdd] = useState<string>('');

    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    const getTodaysMenu = (): MenuItem[] => {
        const today = formatDate(new Date());
        return menuData[today] || [];
    };

    const getWeeklyMenu = () => {
        const startDate = new Date(selectedDate);
        const weekMenu = [];
        
        for (let i = 0; i < 7; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateStr = formatDate(currentDate);
            const dayMenu = menuData[dateStr] || [];
            
            weekMenu.push({
                date: currentDate,
                dateStr: dateStr,
                dayName: currentDate.toLocaleDateString('en-US', { weekday: 'long' }),
                shortDay: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
                menu: dayMenu
            });
        }
        
        return weekMenu;
    };

    const handleAddMenuItem = () => {
        if (!newMenuItem.name || !newMenuItem.price) {
            alert("Please fill in required fields - Name and price are required");
            return;
        }

        const targetDate = selectedDateForAdd || formatDate(new Date());
        const newItem: MenuItem = {
            id: Date.now(),
            name: newMenuItem.name,
            price: parseFloat(newMenuItem.price),
            category: newMenuItem.category,
            description: newMenuItem.description,
            preparationTime: newMenuItem.preparationTime,
            image: newMenuItem.image,
            available: newMenuItem.available
        };

        setMenuData(prev => ({
            ...prev,
            [targetDate]: [...(prev[targetDate] || []), newItem]
        }));

        setNewMenuItem({
            name: '',
            price: '',
            category: 'Rice',
            description: '',
            preparationTime: '',
            image: '',
            available: true
        });

        setSelectedDateForAdd('');
        setIsAddMenuOpen(false);
        
        const targetDateFormatted = new Date(targetDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        });
        
        console.log(`Menu Item Added: ${newItem.name} has been added to ${targetDateFormatted === new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            month: 'short', 
            day: 'numeric' 
        }) ? "today's" : targetDateFormatted + "'s"} menu`);
    };

    const handleEditMenuItem = (item: MenuItem, dateStr?: string) => {
        setEditingItem({...item, editDate: dateStr});
        setIsEditMenuOpen(true);
    };

    const handleUpdateMenuItem = () => {
        if (!editingItem) return;
        
        const targetDate = editingItem.editDate || formatDate(new Date());
        
        setMenuData(prev => ({
            ...prev,
            [targetDate]: prev[targetDate]?.map(item => 
                item.id === editingItem.id ? editingItem : item
            ) || []
        }));

        setIsEditMenuOpen(false);
        setEditingItem(null);
        console.log("Menu Item Updated successfully");
    };

    const handleDeleteMenuItem = (itemId: number, dateStr?: string) => {
        const targetDate = dateStr || formatDate(new Date());
        
        setMenuData(prev => ({
            ...prev,
            [targetDate]: prev[targetDate]?.filter(item => item.id !== itemId) || []
        }));

        console.log("Menu item has been removed");
    };

    const toggleAvailability = (itemId: number, dateStr?: string) => {
        const targetDate = dateStr || formatDate(new Date());
        
        setMenuData(prev => ({
            ...prev,
            [targetDate]: prev[targetDate]?.map(item => 
                item.id === itemId ? {...item, available: !item.available} : item
            ) || []
        }));
    };

    // Fixed function to handle adding items for specific dates
    const handleAddMenuForDate = (dateStr: string) => {
        console.log('Adding menu for date:', dateStr);
        setSelectedDateForAdd(dateStr);
        setNewMenuItem({
            name: '',
            price: '',
            category: 'Rice',
            description: '',
            preparationTime: '',
            image: '',
            available: true
        });
        setIsAddMenuOpen(true);
    };

    return (
        <div className="min-h-screen relative" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
            <div className="absolute inset-0 opacity-20" />

            <div className="max-w-7xl mx-auto p-6 space-y-6 relative z-10">
                {/* Header with Vendor Info */}
                <div className="text-center mt-10 pt-8 pb-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Store className="h-8 w-8" style={{ color: '#D98324' }} />
                        <h1 className="text-3xl font-bold" style={{ color: '#443627' }}>
                            {vendorInfo.name}
                        </h1>
                    </div>
                    <p className="text-xl mb-4" style={{ color: '#a0896b' }}>
                        Manage your menu and track your orders
                    </p>
                    
                    {/* Vendor Stats */}
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span style={{ color: '#443627' }}>{vendorInfo.rating} Rating</span>
                        </div>
                        <div style={{ color: '#a0896b' }}>
                            📍 {vendorInfo.location}
                        </div>
                        <div style={{ color: '#D98324' }}>
                            {vendorInfo.totalOrders} Total Orders
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <Card className="shadow-lg border-0 relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `radial-gradient(circle at 12px 12px, #D98324 1px, transparent 1px)`,
                            backgroundSize: '24px 24px'
                        }}
                    />
                    <CardContent className="p-6 relative z-10">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="flex gap-2">
                                <Button
                                    variant={viewMode === 'today' ? 'default' : 'outline'}
                                    onClick={() => setViewMode('today')}
                                    style={viewMode === 'today' ? { backgroundColor: '#D98324' } : {}}
                                >
                                    Todays Menu
                                </Button>
                                <Button
                                    variant={viewMode === 'weekly' ? 'default' : 'outline'}
                                    onClick={() => setViewMode('weekly')}
                                    style={viewMode === 'weekly' ? { backgroundColor: '#D98324' } : {}}
                                >
                                    Weekly Menu
                                </Button>
                            </div>

                            {viewMode === 'weekly' && (
                                <div>
                                    <Label className="text-sm font-medium" style={{ color: '#443627' }}>
                                        Week Starting From
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" style={{ color: '#a0896b' }} />
                                        <Input
                                            type="date"
                                            value={formatDate(selectedDate)}
                                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                            className="w-64"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Today's Menu View */}
                {viewMode === 'today' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-bold" style={{ color: '#443627' }}>
                                Todays Menu - {new Date().toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </h2>
                            <Button 
                                style={{ backgroundColor: '#D98324' }}
                                onClick={() => {
                                    setSelectedDateForAdd('');
                                    setNewMenuItem({
                                        name: '',
                                        price: '',
                                        category: 'Rice',
                                        description: '',
                                        preparationTime: '',
                                        image: '',
                                        available: true
                                    });
                                    setIsAddMenuOpen(true);
                                }}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Add New Item
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getTodaysMenu().map((item) => (
                                <Card
                                    key={item.id}
                                    className="shadow-lg border-0 relative overflow-hidden"
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
                                                src={item.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop'}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-bold text-lg" style={{ color: '#443627' }}>
                                                    {item.name}
                                                </h3>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => toggleAvailability(item.id)}
                                                        className="p-1"
                                                        title={item.available ? 'Mark as unavailable' : 'Mark as available'}
                                                    >
                                                        {item.available ? 
                                                            <Eye className="h-4 w-4 text-green-600" /> : 
                                                            <EyeOff className="h-4 w-4 text-red-600" />
                                                        }
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleEditMenuItem(item)}
                                                        className="p-1"
                                                        title="Edit item"
                                                    >
                                                        <Edit3 className="h-4 w-4" style={{ color: '#D98324' }} />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => handleDeleteMenuItem(item.id)}
                                                        className="p-1"
                                                        title="Delete item"
                                                    >
                                                        <Trash2 className="h-4 w-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            <Badge className={`mb-2 ${item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border-0`}>
                                                {item.available ? 'Available' : 'Unavailable'}
                                            </Badge>
                                            
                                            <p className="text-sm mb-3" style={{ color: '#443627' }}>
                                                {item.description}
                                            </p>
                                            
                                            <div className="flex items-center justify-between mb-3">
                                                <Badge variant="outline" style={{ color: '#a0896b' }}>
                                                    {item.category}
                                                </Badge>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-4 w-4" style={{ color: '#a0896b' }} />
                                                    <span className="text-sm" style={{ color: '#a0896b' }}>
                                                        {item.preparationTime}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="text-center">
                                                <span className="text-xl font-bold" style={{ color: '#D98324' }}>
                                                    ৳{item.price}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {getTodaysMenu().length === 0 && (
                            <div className="text-center py-12">
                                <ChefHat className="h-16 w-16 mx-auto mb-4" style={{ color: '#a0896b' }} />
                                <p className="text-lg" style={{ color: '#a0896b' }}>
                                    No menu items for today. Add some items to get started!
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Weekly Menu View - FIXED */}
                {viewMode === 'weekly' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold" style={{ color: '#443627' }}>
                            Weekly Menu - {selectedDate.toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric' 
                            })} to {new Date(selectedDate.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { 
                                month: 'long', 
                                day: 'numeric' 
                            })}
                        </h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {getWeeklyMenu().map((day, index) => (
                                <Card key={index} className="shadow-lg border-0 relative overflow-hidden">
                                    <div
                                        className="absolute inset-0 opacity-5"
                                        style={{
                                            backgroundImage: `radial-gradient(circle at 8px 8px, #D98324 0.5px, transparent 0.5px)`,
                                            backgroundSize: '16px 16px'
                                        }}
                                    />
                                    <CardHeader className="relative z-10 pb-3">
                                        <CardTitle className="flex justify-between items-center">
                                            <div>
                                                <div style={{ color: '#443627' }} className="font-bold">
                                                    {day.dayName}
                                                </div>
                                                <div style={{ color: '#a0896b' }} className="text-sm font-normal">
                                                    {day.date.toLocaleDateString('en-US', { 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" style={{ color: '#a0896b' }}>
                                                    {day.menu.length} items
                                                </Badge>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleAddMenuForDate(day.dateStr);
                                                    }}
                                                    className="p-2 hover:bg-opacity-20 hover:bg-orange-200"
                                                    title={`Add menu item for ${day.dayName}`}
                                                    style={{ minWidth: '32px', minHeight: '32px' }}
                                                >
                                                    <Plus className="h-4 w-4" style={{ color: '#D98324' }} />
                                                </Button>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="relative z-10 space-y-3">
                                        {day.menu.length > 0 ? (
                                            day.menu.map((item) => (
                                                <div
                                                    key={item.id}
                                                    className="flex justify-between items-center p-3 rounded-lg border"
                                                    style={{ backgroundColor: '#f8f6f3' }}
                                                >
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium" style={{ color: '#443627' }}>
                                                                {item.name}
                                                            </h4>
                                                            <div className="flex gap-1">
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        toggleAvailability(item.id, day.dateStr);
                                                                    }}
                                                                    className="p-1"
                                                                    title={item.available ? 'Mark as unavailable' : 'Mark as available'}
                                                                >
                                                                    {item.available ? 
                                                                        <Eye className="h-3 w-3 text-green-600" /> : 
                                                                        <EyeOff className="h-3 w-3 text-red-600" />
                                                                    }
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleEditMenuItem(item, day.dateStr);
                                                                    }}
                                                                    className="p-1"
                                                                    title="Edit item"
                                                                >
                                                                    <Edit3 className="h-3 w-3" style={{ color: '#D98324' }} />
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        handleDeleteMenuItem(item.id, day.dateStr);
                                                                    }}
                                                                    className="p-1"
                                                                    title="Delete item"
                                                                >
                                                                    <Trash2 className="h-3 w-3 text-red-500" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {item.category}
                                                            </Badge>
                                                            <span className="text-sm font-bold" style={{ color: '#D98324' }}>
                                                                ৳{item.price}
                                                            </span>
                                                            <Badge
                                                                className={`text-xs ${item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} border-0`}
                                                            >
                                                                {item.available ? 'Available' : 'Unavailable'}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-sm mb-3" style={{ color: '#a0896b' }}>
                                                    No menu items for this day
                                                </p>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleAddMenuForDate(day.dateStr);
                                                    }}
                                                    style={{ borderColor: '#D98324', color: '#D98324' }}
                                                    className="hover:bg-orange-50"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add Item
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Menu Item Dialog */}
                <Dialog open={isAddMenuOpen} onOpenChange={(open) => {
                    setIsAddMenuOpen(open);
                    if (!open) setSelectedDateForAdd('');
                }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle style={{ color: '#443627' }}>
                                Add New Menu Item
                                {selectedDateForAdd && selectedDateForAdd !== formatDate(new Date()) && (
                                    <span className="text-sm font-normal block mt-1" style={{ color: '#a0896b' }}>
                                        for {new Date(selectedDateForAdd).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                )}
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Item Name *</Label>
                                <Input
                                    value={newMenuItem.name}
                                    onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                                    placeholder="Enter item name"
                                />
                            </div>
                            <div>
                                <Label>Price (৳) *</Label>
                                <Input
                                    type="number"
                                    value={newMenuItem.price}
                                    onChange={(e) => setNewMenuItem({...newMenuItem, price: e.target.value})}
                                    placeholder="Enter price"
                                />
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Select 
                                    value={newMenuItem.category} 
                                    onValueChange={(value) => setNewMenuItem({...newMenuItem, category: value})}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
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
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={newMenuItem.description}
                                    onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                                    placeholder="Describe your dish"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label>Preparation Time</Label>
                                <Input
                                    value={newMenuItem.preparationTime}
                                    onChange={(e) => setNewMenuItem({...newMenuItem, preparationTime: e.target.value})}
                                    placeholder="e.g., 15-20 min"
                                />
                            </div>
                            <div>
                                <Label>Image URL</Label>
                                <Input
                                    value={newMenuItem.image}
                                    onChange={(e) => setNewMenuItem({...newMenuItem, image: e.target.value})}
                                    placeholder="Enter image URL"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => {
                                        setIsAddMenuOpen(false);
                                        setSelectedDateForAdd('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleAddMenuItem}
                                    style={{ backgroundColor: '#D98324' }}
                                >
                                    Add Item
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Menu Item Dialog */}
                <Dialog open={isEditMenuOpen} onOpenChange={(open) => {
                    setIsEditMenuOpen(open);
                    if (!open) setEditingItem(null);
                }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle style={{ color: '#443627' }}>
                                Edit Menu Item
                                {editingItem?.editDate && editingItem.editDate !== formatDate(new Date()) && (
                                    <span className="text-sm font-normal block mt-1" style={{ color: '#a0896b' }}>
                                        for {new Date(editingItem.editDate).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                )}
                            </DialogTitle>
                        </DialogHeader>
                        {editingItem && (
                            <div className="space-y-4">
                                <div>
                                    <Label>Item Name</Label>
                                    <Input
                                        value={editingItem.name}
                                        onChange={(e) => setEditingItem({...editingItem, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label>Price (৳)</Label>
                                    <Input
                                        type="number"
                                        value={editingItem.price}
                                        onChange={(e) => setEditingItem({...editingItem, price: parseFloat(e.target.value) || 0})}
                                    />
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <Select 
                                        value={editingItem.category} 
                                        onValueChange={(value) => setEditingItem({...editingItem, category: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
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
                                <div>
                                    <Label>Description</Label>
                                    <Textarea
                                        value={editingItem.description}
                                        onChange={(e) => setEditingItem({...editingItem, description: e.target.value})}
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label>Preparation Time</Label>
                                    <Input
                                        value={editingItem.preparationTime}
                                        onChange={(e) => setEditingItem({...editingItem, preparationTime: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <Label>Image URL</Label>
                                    <Input
                                        value={editingItem.image}
                                        onChange={(e) => setEditingItem({...editingItem, image: e.target.value})}
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setIsEditMenuOpen(false);
                                            setEditingItem(null);
                                        }}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={handleUpdateMenuItem}
                                        style={{ backgroundColor: '#D98324' }}
                                    >
                                        <Save className="h-4 w-4 mr-2" />
                                        Update
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

export default VendorDashboard;