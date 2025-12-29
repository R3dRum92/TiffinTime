/* eslint-disable @next/next/no-img-element */
"use client"

import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
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
    Loader2,
    Calculator,
    CalendarDays,
    Tag,
    ArchiveX
} from 'lucide-react';
import {
    useVendorMenu,
    MenuItem,
    BackendMenuItem,
} from '@/app/hooks/useVendorMenu(ImageWhileCreatingMenu)';
import {
    useVendorSpecials,
    DateSpecial,
    NewDateSpecialPayload,
    UpdateDateSpecialPayload,
    DayOfWeek
} from '@/app/hooks/useVendorSpecials';
import {
    useVendorWeeklyMenu,
    WeeklyAvailability,
    SetWeeklyAvailabilityPayload, // Import the enum
} from '@/app/hooks/useVendorWeeklyMenu';
import { getAuthToken } from '@/app/utils/auth';

// ========== TYPES ==========

interface NewMenuItemForm {
    name: string;
    price: string; // From input
    category: string;
    description: string;
    preparationTime: string; // From input
        imageFile?: File;  // ADD THIS

}

interface VendorInfo {
    id: string;
    name: string;
}

// State for the "Add Special" dialog
interface AddSpecialForm {
    menu_item_id: string;
    special_price: string;
    quantity: string;
}

// State for the "Edit Special" dialog
interface EditSpecialForm {
    special_id: string;
    special_price: string;
    quantity: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ========== HELPER FUNCTIONS ==========

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

const getTodayISO = (): string => {
    const today = new Date();
    // Adjust for local timezone
    const offset = today.getTimezoneOffset();
    const adjustedToday = new Date(today.getTime() - (offset * 60 * 1000));
    return adjustedToday.toISOString().split('T')[0];
};

const DAYS_OF_WEEK = [
    { label: 'S', value: DayOfWeek.SUNDAY },
    { label: 'M', value: DayOfWeek.MONDAY },
    { label: 'T', value: DayOfWeek.TUESDAY },
    { label: 'W', value: DayOfWeek.WEDNESDAY },
    { label: 'T', value: DayOfWeek.THURSDAY },
    { label: 'F', value: DayOfWeek.FRIDAY },
    { label: 'S', value: DayOfWeek.SATURDAY },
];

// ========== VENDOR INFO HOOK ==========

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
    // --- Data Hooks ---
    const {
        menuData,
        isLoading: isMenuLoading,
        error: menuError,
        addMenuItem,
        isAdding,
        updateMenuItem,
        isUpdating,
        deleteMenuItem,
        isDeleting,
        uploadImage,      // ADD
        isUploading,      // ADD
    } = useVendorMenu();

    const {
        data: vendorInfo,
        isLoading: isVendorLoading,
        error: vendorError
    } = useVendorInfo();

    const {
        allSpecials,
        isLoading: isSpecialsLoading,
        error: specialsError,
        addSpecial,
        isAdding: isAddingSpecial,
        updateSpecial,
        isUpdating: isUpdatingSpecial,
        deleteSpecial,
        isDeleting: isDeletingSpecial,
    } = useVendorSpecials();

    const {
        weeklyMenuRules,
        isLoading: isWeeklyMenuLoading,
        //error: weeklyMenuError,
        setAvailability,
        isSetting: isSettingAvailability,
    } = useVendorWeeklyMenu();

    // --- Component State ---
    const [activeTab, setActiveTab] = useState('all-items');
    const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
    const [isEditMenuOpen, setIsEditMenuOpen] = useState(false);
    const [isAddSpecialOpen, setIsAddSpecialOpen] = useState(false);
    const [isEditSpecialOpen, setIsEditSpecialOpen] = useState(false);

    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [editingSpecial, setEditingSpecial] = useState<EditSpecialForm | null>(null);
    const [addSpecialForm, setAddSpecialForm] = useState<AddSpecialForm>({
        menu_item_id: '',
        special_price: '',
        quantity: '',
    });

    const [newMenuItem, setNewMenuItem] = useState<NewMenuItemForm>({
        name: '',
        price: '',
        category: '',
        description: '',
        preparationTime: '',
    });

    const categories = ['Rice', 'Curry', 'Snacks', 'Drinks', 'Desserts'];

    // --- Memoized Data Processing ---

    const todaySpecials = useMemo(() => {
        const today = getTodayISO();
        return allSpecials.filter(s => s.available_date === today);
    }, [allSpecials]);

    // Create a Map for fast weekly availability lookup: Map<menu_item_id, Set<day_of_week>>
    // const weeklyAvailabilityMap = useMemo(() => {
    //     const map = new Map<string, Set<DayOfWeek>>();
    //     for (const rule of weeklyMenuRules) {
    //         // After transformation in the hook, 'id' is the menu_item_id
    //         const menuItemId = rule.id;

    //         if (rule.is_available) {
    //             if (!map.has(menuItemId)) {
    //                 map.set(menuItemId, new Set());
    //             }
    //             map.get(menuItemId)!.add(rule.day_of_week);
    //         }
    //     }
    //     console.log('Weekly Availability Map:', map);
    //     return map;
    // }, [weeklyMenuRules]);

    const weeklyAvailabilityMap = useMemo(() => {
        // Key: menu_item_id (string), Value: Set of active days (numbers)
        const map = new Map<string, Set<number>>();

        for (const rule of weeklyMenuRules) {
            // Use menu_item_id because that's what matches item.id in the UI loop
            const mId = String(rule.menu_item_id);

            if (rule.is_available) {
                if (!map.has(mId)) {
                    map.set(mId, new Set());
                }
                map.get(mId)!.add(Number(rule.day_of_week));
            }
        }
        return map;
    }, [weeklyMenuRules]);

    // --- CRUD Handlers (Menu Items) ---

    const handleAddMenuItem = async () => {
        if (!newMenuItem.name || !newMenuItem.price || !newMenuItem.preparationTime) {
            alert("Name, price, and preparation time are required.");
            return;
        }

        try {
            const payload: Omit<BackendMenuItem, 'id' | 'vendor_id'> = {
                name: newMenuItem.name,
                price: parseFloat(newMenuItem.price),
                category: newMenuItem.category, // Send lowercase
                description: newMenuItem.description,
                preparation_time: parseInt(newMenuItem.preparationTime, 10),
            };

            await addMenuItem(payload);
            setNewMenuItem({ name: '', price: '', category: '', description: '', preparationTime: '' });
            setIsAddMenuOpen(false);
        } catch (e) {
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
            const updatePayload: Partial<BackendMenuItem> & { id: string } = {
                id: editingItem.id,
                name: editingItem.name,
                price: editingItem.price,
                category: editingItem.category.toLowerCase(),
                description: editingItem.description,
                preparation_time: editingItem.preparationTime,
            };

            await updateMenuItem(updatePayload);
            setIsEditMenuOpen(false);
            setEditingItem(null);
        } catch (e) {
            alert("Failed to update item: " + (e as Error).message);
        }
    };

    const handleDeleteMenuItem = async (itemId: string) => {
        if (!window.confirm("Are you sure? This will remove the item and all its specials and weekly rules.")) return;

        try {
            await deleteMenuItem(itemId);
        } catch (e) {
            alert("Failed to delete item: " + (e as Error).message);
        }
    };

    // --- CRUD Handlers (Date Specials) ---

    const handleOpenAddSpecial = () => {
        setAddSpecialForm({ menu_item_id: '', special_price: '', quantity: '' });
        setIsAddSpecialOpen(true);
    };

    const handleAddSpecial = async () => {
        if (!addSpecialForm.menu_item_id) {
            alert("Please select an item.");
            return;
        }

        const selectedItem = menuData.find(m => m.id === addSpecialForm.menu_item_id);
        if (!selectedItem) return;

        // Use special price/qty if provided, otherwise null
        const price = addSpecialForm.special_price ? parseFloat(addSpecialForm.special_price) : null;
        const qty = addSpecialForm.quantity ? parseInt(addSpecialForm.quantity, 10) : null;

        const payload: NewDateSpecialPayload = {
            menu_item_id: addSpecialForm.menu_item_id,
            available_date: getTodayISO(),
            special_price: price,
            quantity: qty,
        };

        try {
            await addSpecial(payload);
            setIsAddSpecialOpen(false);
        } catch (e) {
            alert("Failed to add special: " + (e as Error).message);
        }
    };

    const handleOpenEditSpecial = (special: DateSpecial) => {
        setEditingSpecial({
            special_id: special.special_id,
            special_price: special.special_price?.toString() || '',
            quantity: special.quantity?.toString() || '',
        });
        setIsEditSpecialOpen(true);
    };

    const handleUpdateSpecial = async () => {
        if (!editingSpecial) return;

        const price = editingSpecial.special_price ? parseFloat(editingSpecial.special_price) : null;
        const qty = editingSpecial.quantity ? parseInt(editingSpecial.quantity, 10) : null;

        const payload: UpdateDateSpecialPayload = {
            id: editingSpecial.special_id,
            special_price: price,
            quantity: qty,
        };

        try {
            await updateSpecial(payload);
            setIsEditSpecialOpen(false);
            setEditingSpecial(null);
        } catch (e) {
            alert("Failed to update special: " + (e as Error).message);
        }
    };

    const handleDeleteSpecial = async (special_id: string) => {
        if (!window.confirm("Remove this item from today's specials?")) return;

        try {
            await deleteSpecial(special_id);
        } catch (e) {
            alert("Failed to remove special: " + (e as Error).message);
        }
    };

    // --- CRUD Handlers (Weekly Menu) ---

    // const handleWeeklyAvailabilityChange = async (
    //     menu_item_id: string,
    //     day: DayOfWeek,
    //     is_available: boolean
    // ) => {
    //     const payload: SetWeeklyAvailabilityPayload = {
    //         menu_item_id,
    //         day_of_week: day,
    //         is_available,
    //     };
    //     try {
    //         await setAvailability(payload);
    //     } catch (e) {
    //         alert("Failed to update weekly menu: " + (e as Error).message);
    //     }
    // };

    const handleWeeklyAvailabilityChange = async (
        menu_item_id: string,
        day: number, // Use number for safety with the Enum
        is_now_checked: boolean // Receive the new state from the checkbox
    ) => {
        const payload: SetWeeklyAvailabilityPayload = {
            menu_item_id,
            day_of_week: day,
            is_available: is_now_checked, // Use the new value
        };
        try {
            await setAvailability(payload);
            // Removed alert for better UX, the onSettled refetch in the hook handles UI update
        } catch (e) {
            alert("Failed to update weekly menu: " + (e as Error).message);
        }
    };


    // ========== RENDER HELPERS ==========

    // Renders a generic menu item card
    const renderMenuItemCard = (item: MenuItem, showActions: boolean = true) => (
        <Card key={item.id} className="shadow-lg border-0 relative overflow-hidden">
            <CardContent className="p-4">
                <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-40 object-cover rounded-md mb-3"
                    onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop';
                    }}
                />
                <div className="flex justify-between items-start mb-2">

                    <h3 className="font-bold text-lg" style={{ color: '#443627' }}>
                        {item.name}
                    </h3>
                    {showActions && (
                        <div className="flex gap-1">
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
                                onClick={() => handleDeleteMenuItem(item.id)}
                                className="p-1"
                                title="Delete item"
                                disabled={isDeleting}
                            >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-500" />}
                            </Button>
                        </div>
                    )}
                </div>
                <p className="text-sm mb-3 h-10 overflow-y-auto" style={{ color: '#443627' }}>
                    {item.description || <span className="text-gray-400 italic">No description</span>}
                </p>
                <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="capitalize" style={{ color: '#a0896b' }}>
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
        </Card>
    );

    // Renders a special item card for "Today's Menu"
    const renderSpecialItemCard = (item: DateSpecial) => (
        <Card key={item.special_id} className="shadow-lg border-0 relative overflow-hidden">
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg" style={{ color: '#443627' }}>
                        {item.name}
                    </h3>
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenEditSpecial(item)}
                            className="p-1"
                            title="Edit special"
                            disabled={isUpdatingSpecial}
                        >
                            <Edit3 className="h-4 w-4" style={{ color: '#D98324' }} />
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSpecial(item.special_id)}
                            className="p-1"
                            title="Remove special"
                            disabled={isDeletingSpecial}
                        >
                            {isDeletingSpecial ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-red-500" />}
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                    <Badge variant="outline" className="capitalize" style={{ color: '#a0896b' }}>
                        {item.category}
                    </Badge>
                    {item.quantity !== null && (
                        <div className="flex items-center gap-1">
                            <ArchiveX className="h-4 w-4" style={{ color: '#a0896b' }} />
                            <span className="text-sm" style={{ color: '#a0896b' }}>
                                {item.quantity} left
                            </span>
                        </div>
                    )}
                </div>

                <div className="text-center">
                    {item.special_price !== null ? (
                        <>
                            <span className="text-xl font-bold line-through text-gray-400 mr-2">
                                ৳{item.price}
                            </span>
                            <span className="text-2xl font-bold" style={{ color: '#D98324' }}>
                                ৳{item.special_price}
                            </span>
                        </>
                    ) : (
                        <span className="text-2xl font-bold" style={{ color: '#D98324' }}>
                            ৳{item.price}
                        </span>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    // --- Loading / Error States ---
    const isLoading = isMenuLoading || isVendorLoading || isSpecialsLoading || isWeeklyMenuLoading;
    const dataError = menuError || vendorError || specialsError;// || weeklyMenuError;

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
                <Loader2 className="h-12 w-12 animate-spin mb-4" style={{ color: '#D98324' }} />
                <p className="text-xl font-medium" style={{ color: '#443627' }}>
                    Loading Dashboard Data...
                </p>
            </div>
        );
    }

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

    // --- RENDER ---
    return (
        <div className="min-h-screen relative" style={{ backgroundColor: 'rgb(249, 245, 230)' }}>
            <div className="max-w-7xl mx-auto p-6 space-y-6 relative z-10">

                {/* Vendor Header */}
                <div className="text-center mt-10 pt-8 pb-6">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Store className="h-8 w-8" style={{ color: '#D98324' }} />
                        <h1 className="text-3xl font-bold" style={{ color: '#443627' }}>
                            {vendorInfo?.name || 'Vendor Dashboard'}
                        </h1>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-6">
                        <TabsTrigger value="all-items">All Menu Items</TabsTrigger>
                        <TabsTrigger value="today">Today&apos;s Specials</TabsTrigger>
                        <TabsTrigger value="weekly">Weekly Menu</TabsTrigger>
                    </TabsList>

                    {/* All menu items tab */}
                    <TabsContent value="all-items" className="space-y-6">
                        <Card className="shadow-lg border-0">
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold" style={{ color: '#443627' }}>
                                        All Menu Items
                                    </h2>
                                    <Button
                                        style={{ backgroundColor: '#D98324' }}
                                        onClick={() => setIsAddMenuOpen(true)}
                                        disabled={isAdding}
                                    >
                                        {isAdding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                                        Add New Item
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {menuData.map((item) => renderMenuItemCard(item, true))}
                        </div>
                        {menuData.length === 0 && (
                            <div className="text-center py-12">
                                <ChefHat className="h-16 w-16 mx-auto mb-4" style={{ color: '#a0896b' }} />
                                <p className="text-lg" style={{ color: '#a0896b' }}>
                                    You have no menu items. Add some to get started!
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Today's Menu Tab */}
                    <TabsContent value="today" className="space-y-6">
                        <Card className="shadow-lg border-0">
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className='flex items-center gap-3'>
                                        <h2 className="text-2xl font-bold" style={{ color: '#443627' }}>
                                            Today&apos;ss Specials
                                        </h2>
                                    </div>
                                    <Button
                                        style={{ backgroundColor: '#D98324' }}
                                        onClick={handleOpenAddSpecial}
                                    >
                                        <Plus className="h-4 w-4 mr-2" />
                                        Add Special
                                    </Button>
                                </div>
                                <p className='text-sm mt-2' style={{ color: '#a0896b' }}>
                                    {todaySpecials.length} item(s) on special for today.
                                </p>
                            </CardContent>
                        </Card>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                            {todaySpecials.map(item => renderSpecialItemCard(item))}
                        </div>
                        {todaySpecials.length === 0 && (
                            <div className="text-center py-12">
                                <Calculator className='h-16 w-16 mx-auto mb-4' style={{ color: '#a0896b' }} />
                                <p className="text-lg" style={{ color: '#a0896b' }}>
                                    No items on special for today.
                                </p>
                            </div>
                        )}
                    </TabsContent>

                    {/* Weekly Menu Tab */}
                    <TabsContent value="weekly" className="space-y-6">
                        <Card className="shadow-lg border-0">
                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <CalendarDays className="h-6 w-6" style={{ color: '#D98324' }} />
                                        <h2 className="text-2xl font-bold" style={{ color: '#443627' }}>
                                            Weekly Menu
                                        </h2>
                                    </div>
                                </div>
                                <p className="text-sm mt-2" style={{ color: '#a0896b' }}>
                                    Set the default availability for your items for each day of the week.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Weekly Menu Table-like UI */}
                        <Card className="shadow-lg border-0">
                            <CardContent className="p-0">
                                <div className="space-y-2">
                                    {/* Header Row */}
                                    <div className="flex items-center p-4 bg-gray-50 rounded-t-lg">
                                        <div className="flex-1 font-bold" style={{ color: '#443627' }}>Menu Item</div>
                                        <div className="flex gap-2 text-center">
                                            {DAYS_OF_WEEK.map(day => (
                                                <div key={day.value} className="w-8 font-bold" style={{ color: '#a0896b' }}>
                                                    {day.label}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    {/* Item Rows new logics added */}
                                    {menuData.map(item => {
                                        const itemId = String(item.id);
                                        const availableDays = weeklyAvailabilityMap.get(item.id) || new Set();

                                        return (
                                            <div key={item.id} className="flex items-center p-4 border-t hover:bg-gray-50/50 transition-colors">
                                                <div className="flex-1 font-medium" style={{ color: '#443627' }}>
                                                    {item.name}
                                                </div>
                                                <div className="flex gap-2">
                                                    {DAYS_OF_WEEK.map(day => {
                                                        const isChecked = availableDays.has(day.value);

                                                        return (
                                                            <div key={day.value} className="w-8 flex justify-center">
                                                                <Checkbox
                                                                    // UI reflects the real data from our memoized Map
                                                                    checked={isChecked}
                                                                    // onCheckedChange provides the NEW boolean value
                                                                    onCheckedChange={(newCheckedValue: boolean) => {
                                                                        handleWeeklyAvailabilityChange(
                                                                            itemId,
                                                                            day.value,
                                                                            newCheckedValue // Pass the new value to the API
                                                                        );
                                                                    }}
                                                                    disabled={isSettingAvailability}
                                                                    className="data-[state=checked]:bg-[#D98324] data-[state=checked]:border-[#D98324]"
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                {menuData.length === 0 && (
                                    <div className="text-center py-12">
                                        <p className="text-lg" style={{ color: '#a0896b' }}>
                                            Add items in the &quot;All Menu Items&quot; tab to set their weekly schedule.
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Add Menu Item Dialog */}
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
                                />
                            </div>
                            <div>
                                <Label>Price (৳) *</Label>
                                <Input
                                    type="number"
                                    value={newMenuItem.price}
                                    onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Category</Label>
                                <Select
                                    value={newMenuItem.category}
                                    onValueChange={(value) => setNewMenuItem({ ...newMenuItem, category: value })}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                                    <SelectContent>
                                        {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Description</Label>
                                <Textarea
                                    value={newMenuItem.description}
                                    onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                                    rows={3}
                                />
                            </div>
                            <div>
                                <Label>Preparation Time (in minutes) *</Label>
                                <Input
                                    type="number"
                                    value={newMenuItem.preparationTime}
                                    onChange={(e) => setNewMenuItem({ ...newMenuItem, preparationTime: e.target.value })}
                                />
                            </div>
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

                {/* Edit Menu Item Dialog */}
               {/* Edit Menu Item Dialog */}
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
                
                {/* ADD THIS ENTIRE IMAGE SECTION */}
                <div>
                    <Label>Image</Label>
                    {editingItem.image && (  // ✅ change
    <img 
        src={editingItem.image}  // ✅ change
        alt={editingItem.name}
        className="w-full h-32 object-cover rounded-md"
    />
)}
                    <Input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png"
                        onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file && editingItem) {
                                try {
                                    await uploadImage({ itemId: editingItem.id, file });
                                    alert('Image uploaded successfully!');
                                } catch (err) {
                                    alert('Failed to upload image: ' + (err as Error).message);
                                }
                            }
                        }}
                        disabled={isUploading}
                    />
                    {isUploading && (
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Uploading...
                        </p>
                    )}
                </div>
                {/* IMAGE SECTION ENDS */}

                <div>
                    <Label>Price (৳)</Label>
                    <Input
                        type="number"
                        value={editingItem.price}
                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || 0 })}
                    />
                </div>
                <div>
                    <Label>Category</Label>
                    <Select
                        value={editingItem.category}
                        onValueChange={(value) => setEditingItem({ ...editingItem, category: value })}
                    >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
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
                        value={editingItem.preparationTime}
                        onChange={(e) => setEditingItem({ ...editingItem, preparationTime: parseInt(e.target.value, 10) || 0 })}
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

                {/* Add Special Dialog */}
                <Dialog open={isAddSpecialOpen} onOpenChange={setIsAddSpecialOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle style={{ color: '#443627' }}>
                                Add Today&apos;s Special
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div>
                                <Label>Menu Item *</Label>
                                <Select
                                    value={addSpecialForm.menu_item_id}
                                    onValueChange={(value) => setAddSpecialForm(f => ({ ...f, menu_item_id: value }))}
                                >
                                    <SelectTrigger><SelectValue placeholder="Select an item" /></SelectTrigger>
                                    <SelectContent>
                                        {menuData.map(item => (
                                            <SelectItem key={item.id} value={item.id}>
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Special Price (৳)</Label>
                                <Input
                                    type="number"
                                    value={addSpecialForm.special_price}
                                    onChange={(e) => setAddSpecialForm(f => ({ ...f, special_price: e.target.value }))}
                                    placeholder={`Regular: ৳${menuData.find(m => m.id === addSpecialForm.menu_item_id)?.price || '...'}`}
                                />
                            </div>
                            <div>
                                <Label>Quantity Available</Label>
                                <Input
                                    type="number"
                                    value={addSpecialForm.quantity}
                                    onChange={(e) => setAddSpecialForm(f => ({ ...f, quantity: e.target.value }))}
                                    placeholder="Leave blank for unlimited"
                                />
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => setIsAddSpecialOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleAddSpecial}
                                    style={{ backgroundColor: '#D98324' }}
                                    disabled={isAddingSpecial}
                                >
                                    {isAddingSpecial ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
                                    Add Special
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Edit Special Dialog */}
                <Dialog open={isEditSpecialOpen} onOpenChange={(open) => {
                    setIsEditSpecialOpen(open);
                    if (!open) setEditingSpecial(null);
                }}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle style={{ color: '#443627' }}>
                                Edit Today&apos;s Special
                            </DialogTitle>
                        </DialogHeader>
                        {editingSpecial && (
                            <div className="space-y-4">
                                <div>
                                    <Label>Special Price (৳)</Label>
                                    <Input
                                        type="number"
                                        value={editingSpecial.special_price}
                                        onChange={(e) => setEditingSpecial(f => ({ ...f!, special_price: e.target.value }))}
                                        placeholder="Leave blank to use regular price"
                                    />
                                </div>
                                <div>
                                    <Label>Quantity Available</Label>
                                    <Input
                                        type="number"
                                        value={editingSpecial.quantity}
                                        onChange={(e) => setEditingSpecial(f => ({ ...f!, quantity: e.target.value }))}
                                        placeholder="Leave blank for unlimited"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setIsEditSpecialOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        className="flex-1"
                                        onClick={handleUpdateSpecial}
                                        style={{ backgroundColor: '#D98324' }}
                                        disabled={isUpdatingSpecial}
                                    >
                                        {isUpdatingSpecial ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                                        Update Special
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

