"use client"

import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Plus,
    Edit3,
    Trash2,
    Clock,
    Star,
    ChefHat,
    Save,
    X,
    Store,
    Loader2
} from 'lucide-react';
import {
    useVendorMenu,
    MenuItem,
    BackendMenuItem,
} from '@/app/hooks/useVendorMenu';
import { getAuthToken } from '@/app/utils/auth'; // Ensure this path is correct

// ========== TYPES FOR THIS COMPONENT ==========

// Form state for adding a new item
interface NewMenuItemForm {
    name: string;
    price: string; // From input
    category: string;
    description: string;
    preparationTime: string; // From input
}

// Type for the /user/vendor/ response
interface VendorInfo {
    id: string;
    name: string;
    // Add other fields as they become available
}

// ========== VENDOR INFO HOOK (as requested) ==========

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// Re-using the fetchWithAuth logic for our new hook
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    if (!token) {
        throw new Error("No authentication token found.");
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        },
    });

    if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
            const err = await response.json();
            message = err.detail || err.message || message;
        } catch { }
        throw new Error(message);
    }

    // Handle 204 No Content
    return response.status === 204 ? null : response.json();
};


// Simple hook to fetch vendor info
const useVendorInfo = () => {
    return useQuery<VendorInfo>({
        queryKey: ['vendorInfo'],
        queryFn: () => fetchWithAuth(`${API_BASE_URL}/user/vendor/`),
        staleTime: 60 * 60 * 1000, // 1 hour
        retry: 1,
    });
};


// ========== COMPONENT ==========

const VendorDashboard = () => {
    // --- 1. HOOK USAGE ---
    const {
        menuData, // This is now MenuItem[]
        isLoading,
        error: menuError,
        addMenuItem,
        isAdding,
        updateMenuItem,
        isUpdating,
        deleteMenuItem,
        isDeleting,
    } = useVendorMenu();

    const {
        data: vendorInfo,
        isLoading: isVendorLoading,
        error: vendorError
    } = useVendorInfo();

    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

    const categories = ['rice', 'curry', 'snacks', 'drinks', 'desserts'];

    const [newMenuItem, setNewMenuItem] = useState<NewMenuItemForm>({
        name: '',
        price: '', // Price is string from input
        category: 'rice',
        description: '',
        preparationTime: '', // Prep time is string from input
    });

    // --- 2. CRUD HANDLERS (Updated for new hook) ---

    const handleAddMenuItem = async () => {
        if (!newMenuItem.name || !newMenuItem.price || !newMenuItem.preparationTime) {
            alert("Name, price, and preparation time are required.");
            return;
        }

        try {
            // Transform form state (strings) to BackendMenuItem payload (numbers)
            const payload: Omit<BackendMenuItem, 'id' | 'vendor_id'> = {
                name: newMenuItem.name,
                price: parseFloat(newMenuItem.price),
                category: newMenuItem.category,
                description: newMenuItem.description,
                preparation_time: parseInt(newMenuItem.preparationTime, 10),
            };

            await addMenuItem(payload);

            // Reset state and close dialog
            setNewMenuItem({ name: '', price: '', category: 'rice', description: '', preparationTime: '' });
            setIsAddMenuOpen(false);
            console.log("Menu Item Added successfully");
        } catch (e) {
            console.error(e);
            alert("Failed to add item: " + (e as Error).message);
        }
    };

    const handleEditMenuItem = (item: MenuItem) => {
        setEditingItem(item);
        setIsEditMenuOpen(true);
    };

    const handleUpdateMenuItem = async () => {
        if (!editingItem) return;

        try {
            // Prepare payload for the update mutation
            const updatePayload: Partial<BackendMenuItem> & { id: string } = {
                id: editingItem.id,
                name: editingItem.name,
                price: editingItem.price, // Already a number in editingItem state
                category: editingItem.category,
                description: editingItem.description,
                preparation_time: editingItem.preparationTime, // Already a number
            };

            await updateMenuItem(updatePayload);

            setIsEditMenuOpen(false);
            setEditingItem(null);
            console.log("Menu Item Updated successfully");
        } catch (e) {
            console.error(e);
            alert("Failed to update item: " + (e as Error).message);
        }
    };

    const handleDeleteMenuItem = async (itemId: string) => { // ID is now string
        if (!window.confirm("Are you sure you want to delete this item?")) return;

        try {
            await deleteMenuItem(itemId);
            console.log("Menu item has been removed");
        } catch (e) {
            console.error(e);
            alert("Failed to delete item: " + (e as Error).message);
        }
    };

    // --- 3. LOADING / ERROR STATES ---

    if (isLoading || isVendorLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
                <Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: '#D98324' }} />
                <p className="text-xl font-medium" style={{ color: '#443627' }}>
                    {isLoading ? "Loading Menu Data..." : "Loading Vendor Info..."}
                </p>
            </div>
        );
    }

    // Handle either menu error or vendor info error
    const dataError = menuError || vendorError;
    if (dataError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
                <p className="text-xl font-bold text-red-600">
                    ❌ Error: Could not load data
                </p>
                <p className="text-sm mt-2 text-gray-700">
                    {dataError.message}
                </p>
            </div>
        );
    }

    // --- 4. RENDER ---

    return (
        <div className="min-h-screen relative" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-20" />

            <div className="max-w-7xl mx-auto p-6 space-y-6 relative z-10">

                {/* Vendor Header */}
                <div className="text-center mt-10 pt-8 pb-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Store className="h-8 w-8" style={{ color: '#D98324' }} />
                        <h1 className="text-3xl font-bold" style={{ color: '#443627' }}>
                            {vendorInfo?.name || 'Vendor Dashboard'}
                        </h1>
                    </div>
                    <p className="text-xl mb-4" style={{ color: '#a0896b' }}>
                        Manage your menu items
                    </p>

                    {/* Placeholder for future stats */}
                    <div className="flex items-center justify-center gap-6 text-sm">
                        <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-gray-400" />
                            <span style={{ color: '#a0896b' }}>(Rating not available)</span>
                        </div>
                        <div style={{ color: '#a0896b' }}>
                            📍 (Location not available)
                        </div>
                    </div>
                </div>

                {/* Control Bar - Removed Today/Weekly toggle */}
                <Card className="shadow-lg border-0 relative overflow-hidden">
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `radial-gradient(circle at 12px 12px, #D98324 1px, transparent 1px)`,
                            backgroundSize: '24px 24px'
                        }}
                    />
                    <CardContent className="p-6 relative z-10">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold" style={{ color: '#443627' }}>
                                Manage Your Menu
                            </h2>
                            <Button
                                style={{ backgroundColor: '#D98324' }}
                                onClick={() => {
                                    setNewMenuItem({ name: '', price: '', category: 'rice', description: '', preparationTime: '' });
                                    setIsAddMenuOpen(true);
                                }}
                                disabled={isAdding}
                            >
                                {isAdding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                                Add New Item
                            </Button>
                        </div>
                    </CardContent>
                </Card>


                {/* Menu Item List */}
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {menuData.map((item) => (
                            <Card
                                key={item.id} // Use string ID
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

                                    {/* Image removed, replaced with placeholder icon */}
                                    <div className="h-48 bg-gray-200 rounded-t-lg overflow-hidden flex items-center justify-center">
                                        <ChefHat className="h-24 w-24" style={{ color: '#a0896b' }} />
                                    </div>

                                    <CardContent className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-lg" style={{ color: '#443627' }}>
                                                {item.name}
                                            </h3>
                                            <div className="flex gap-1">
                                                {/* Availability Toggle Removed */}
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleEditMenuItem(item)}
                                                    className="p-1"
                                                    title="Edit item"
                                                    disabled={isUpdating}
                                                >
                                                    <Edit3 className="h-4 w-4" style={{ color: '#D98324' }} />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleDeleteMenuItem(item.id)} // Pass string ID
                                                    className="p-1"
                                                    title="Delete item"
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-500" />}
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Availability Badge Removed */}

                                        <p className="text-sm mb-3 h-10 overflow-y-auto" style={{ color: '#443627' }}>
                                            {item.description || <span className="text-gray-400 italic">No description</span>}
                                        </p>

                                        <div className="flex items-center justify-between mb-3">
                                            <Badge variant="outline" style={{ color: '#a0896b' }}>
                                                {item.category}
                                            </Badge>
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" style={{ color: '#a0896b' }} />
                                                <span className="text-sm" style={{ color: '#a0896b' }}>
                                                    {item.preparationTime} min
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

                    {menuData.length === 0 && (
                        <div className="text-center py-12">
                            <ChefHat className="h-16 w-16 mx-auto mb-4" style={{ color: '#a0896b' }} />
                            <p className="text-lg" style={{ color: '#a0896b' }}>
                                You have no menu items. Add some to get started!
                            </p>
                        </div>
                    )}
                </div>


                {/* Add Menu Item Dialog (Simplified) */}
                <Dialog open={isAddMenuOpen} onOpenChange={setIsAddMenuOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle style={{ color: '#443627' }}>
                                Add New Menu Item
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Item Name *</Label>
                                <Input
                                    value={newMenuItem.name}
                                    onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                                    placeholder="Enter item name"
                                />
                            </div>
                            <div>
                                <Label>Price (৳) *</Label>
                                <Input
                                    type="number"
                                    value={newMenuItem.price}
                                    onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                                    placeholder="e.g., 50"
                                />
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Select
                                    value={newMenuItem.category}
                                    onValueChange={(value) => setNewMenuItem({ ...newMenuItem, category: value })}
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
                                    onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                                    placeholder="Describe your dish"
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label>Preparation Time (in minutes) *</Label>
                                <Input
                                    type="number"
                                    value={newMenuItem.preparationTime}
                                    onChange={(e) => setNewMenuItem({ ...newMenuItem, preparationTime: e.target.value })}
                                    placeholder="e.g., 15"
                                />
                            </div>
                            {/* Image URL Removed */}
                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setIsAddMenuOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleAddMenuItem}
                                    style={{ backgroundColor: '#D98324' }}
                                    disabled={isAdding}
                                >
                                    {isAdding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                                    Add Item
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Menu Item Dialog (Simplified) */}
                <Dialog open={isEditMenuOpen} onOpenChange={(open) => {
                    setIsEditMenuOpen(open);
                    if (!open) setEditingItem(null);
                }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle style={{ color: '#443627' }}>
                                Edit Menu Item
                            </DialogTitle>
                        </DialogHeader>
                        {editingItem && (
                            <div className="space-y-4">
                                <div>
                                    <Label>Item Name</Label>
                                    <Input
                                        value={editingItem.name}
                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Price (৳)</Label>
                                    <Input
                                        type="number"
                                        value={editingItem.price} // Renders number as string
                                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <Label>Category</Label>
                                    <Select
                                        value={editingItem.category}
                                        onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
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
                                        onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label>Preparation Time (in minutes)</Label>
                                    <Input
                                        type="number"
                                        value={editingItem.preparationTime} // Renders number as string
                                        onChange={(e) => setEditingItem({ ...editingItem, preparationTime: parseInt(e.target.value, 10) || 0 })}
                                    />
                                </div>
                                {/* Image URL Removed */}
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
                                        disabled={isUpdating}
                                    >
                                        {isUpdating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
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