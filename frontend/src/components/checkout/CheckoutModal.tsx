'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { CheckoutForm } from './CheckoutForm';
import { getPackageBySlug, getShopBySlug } from '@/lib/api/shops';
import { Package, Shop } from '@/types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  shopId: string;
  packageSlug: string;
  shopSlug: string;
}

export function CheckoutModal({
  isOpen,
  onClose,
  packageId,
  shopId,
  packageSlug,
  shopSlug
}: CheckoutModalProps) {
  const [packageData, setPackageData] = useState<Package | null>(null);
  const [shop, setShop] = useState<Shop | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCheckoutData();
    }
  }, [isOpen, packageSlug, shopSlug]);

  const loadCheckoutData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [pkg, shopData] = await Promise.all([
        getPackageBySlug(packageSlug, shopSlug),
        getShopBySlug(shopSlug)
      ]);

      if (!pkg || !shopData) {
        setError('Package or shop not found');
        return;
      }

      setPackageData(pkg);
      setShop(shopData);
    } catch (err) {
      setError('Failed to load checkout data');
      console.error('Error loading checkout data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="relative inline-block w-full max-w-4xl p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal content */}
          <div className="mt-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-gray-600">Loading checkout...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg"
                >
                  Close
                </button>
              </div>
            ) : packageData && shop ? (
              <CheckoutForm
                packageData={packageData}
                shop={shop}
                onClose={onClose}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}