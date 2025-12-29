'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";
import { Loader2 } from 'lucide-react';

interface CustomJwtPayload {
    role: string;
    vendor_id?: string;
    user_id?: string;
    exp?: number;
}

export default function VendorGuard({ children }: { children: React.ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // 1. Get token from localStorage
        const token = localStorage.getItem('token');

        if (!token) {
            router.push('/auth/');
            return;
        }

        try {
            // 2. Decode the token to see the payload
            const decoded = jwtDecode<CustomJwtPayload>(token);

            // 3. Check Role
            if (decoded.role === 'vendor') {
                setIsAuthorized(true);
            } else {
                console.warn("Access Denied: User is not a vendor");
                router.push('/');
            }
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem('token'); // Clear bad token
            router.push('/auth');
        }
    }, [router]);

    // Show loading spinner while checking permission
    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f5e6]">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
                <p className="text-gray-600 font-medium">Verifying Vendor Access...</p>
            </div>
        );
    }

    // Render the protected page
    return <>{children}</>;
}