'use client';

import { useState } from 'react';
import { CheckoutModal } from './CheckoutModal';

interface CheckoutButtonProps {
  packageId: string;
  shopId: string;
  packageSlug: string;
  shopSlug: string;
  className?: string;
}

export function CheckoutButton({
  packageId,
  shopId,
  packageSlug,
  shopSlug,
  className = ""
}: CheckoutButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 ${className}`}
      >
        Purchase Package
      </button>

      <CheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        packageId={packageId}
        shopId={shopId}
        packageSlug={packageSlug}
        shopSlug={shopSlug}
      />
    </>
  );
}