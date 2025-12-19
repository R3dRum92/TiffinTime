'use client'
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import { Loader2 } from "lucide-react";

interface CustomJwtPayload {
    role: string;
    vendor_id?: string,
    user_id?: string,
    exp?: number;
}

export default function VendorGuard({ children }: { children: React.ReactNode }) {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token')

        if (!token) {
            router.push('/auth/');
            return;
        }

        try {
            const decoded = jwtDecode<CustomJwtPayload>(token);

            if (decoded.role === 'vendor') {
                setIsAuthorized(true);
            } else {
                console.warn("Access denied: User is not a vendor");
                router.push("/");
            }
        } catch (error) {
            console.error("Invalid token:", error);
            localStorage.removeItem('token');
            router.push("/auth");
        }
    }, [router]);

    if (!isAuthorized) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9f5e6]">
                <Loader2 className="h-10 w-10 animate-spin text-orange-500 mb-4" />
                <p className="text-gray-600 font-medium">Verifying Vendor Access...</p>
            </div>
        );
    }

    return <>{children}</>;
}