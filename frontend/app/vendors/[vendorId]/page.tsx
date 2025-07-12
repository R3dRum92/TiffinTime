// 'use client';

import ClientVendorPage from './ClientVendorPage';
import { BackendVendor } from '@/app/hooks/useVendors';

export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/vendors/`, {
      headers: {
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
        'Content-Type': `application/json`
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    };

    const vendors = await response.json();

    return vendors.map((vendor: BackendVendor) => ({
      vendorId: vendor.id,
    }));
  } catch (error) {
    console.error('Error fetching vendors:', error);
  }
}

export default function VendorDetailPage({ params }: { params: { vendorId: string } }) {
  return <ClientVendorPage vendorId={params.vendorId} />;
}



