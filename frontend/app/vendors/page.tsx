// pages/vendors.js or app/vendors/page.js (depending on your NextJS version)
'use client'; // Add this if using App Router (NextJS 13+)

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Vendor {
  id: string | number;
  name: string;
  description: string;
  image: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  isOpen: boolean;
}

interface VendorCardProps {
  vendor: Vendor;
}

const VendorCard = ({ vendor }: VendorCardProps) => {
  const handleCardClick = () => {
    if (vendor.isOpen) {
      window.location.href = `/vendor/${vendor.id}`;
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 w-full cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative">
        <Image
          src={vendor.image}
          alt={vendor.name}
          width={400}
          height={240}
          className="w-full h-56 object-cover"
        />
        {!vendor.isOpen && (
          <div className="absolute inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold text-lg">Closed</span>
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center">
          <span className="text-yellow-500 text-sm">★</span>
          <span className="text-sm font-medium ml-1" style={{ color: '#443627' }}>{vendor.rating}</span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xl font-semibold mb-2" style={{ color: '#443627' }}>{vendor.name}</h3>
        <p className="text-sm mb-3 line-clamp-2" style={{ color: '#a0896b' }}>{vendor.description}</p>

        <div className="flex items-center justify-between text-sm mb-3" style={{ color: '#a0896b' }}>
          {/* <span className="px-2 py-1 rounded text-white" style={{ backgroundColor: '#EFDCAB', color: '#443627' }}>{vendor.cuisine}</span> */}
          <span>{vendor.deliveryTime}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: '#a0896b' }}>
            Delivery: ${vendor.deliveryFee}
          </span>
          <Link href={`/vendor/${vendor.id}`}>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${vendor.isOpen
                ? 'text-white hover:opacity-90'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              style={vendor.isOpen ? { backgroundColor: '#D98324' } : {}}
              disabled={!vendor.isOpen}
              onClick={(e) => e.stopPropagation()}
            >
              {vendor.isOpen ? 'Order Now' : 'Closed'}
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

const VendorsPage = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch vendors from JSON file in the same folder
  useEffect(() => {
    const fetchVendors = async () => {
      setLoading(true);
      try {
        // Import the JSON file directly
        const vendorsData = await import('./vendors.json');
        setVendors(vendorsData.vendors || vendorsData.default || vendorsData);
      } catch (error) {
        console.error('Error loading vendors:', error);
        setVendors([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  // Filter vendors based on search only
  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-8 lg:px-16 xl:px-24 pt-20 pb-8">
      {/* Search Section */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 py-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVendors.map(vendor => (
            <VendorCard key={vendor.id} vendor={vendor} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h3 className="text-xl mb-2" style={{ color: '#443627' }}>No vendors found</h3>
          <p style={{ color: '#a0896b' }}>Try adjusting your search or filter criteria</p>
        </div>
      )}

    </div>
  );
};

export default VendorsPage;