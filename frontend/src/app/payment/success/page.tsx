'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PurchaseService } from '@/lib/purchase';
import { Purchase } from '@/types/purchase';

function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      handlePaymentSuccess();
    }
  }, [sessionId]);

  const handlePaymentSuccess = async () => {
    try {
      setLoading(true);

      // In a real implementation, you would retrieve the session and update the purchase
      // For now, we'll show a success message
      setPurchase(null); // Will be populated with actual purchase data

      setTimeout(() => {
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment verification failed');
      setLoading(false);
    }
  };

  const handleViewPurchases = () => {
    window.location.href = '/my-purchases';
  };

  const handleBrowseMore = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          <p className="mt-4 text-gray-600">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button onClick={handleBrowseMore} className="w-full">
              Browse Packages
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Success Icon */}
          <div className="bg-green-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Thank you for your purchase. Your digital package is now ready.
          </p>

          {/* Order Details (placeholder) */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <div className="flex items-center justify-center mb-4">
              <Package className="h-8 w-8 text-gray-400 mr-2" />
              <span className="text-sm text-gray-500">Order Confirmation</span>
            </div>
            <p className="text-sm text-gray-600">
              Session ID: {sessionId?.slice(0, 20)}...
            </p>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <Button onClick={handleViewPurchases} className="w-full">
              View My Purchases
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button variant="outline" onClick={handleBrowseMore} className="w-full">
              Browse More Packages
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-sm text-gray-500 mt-6">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
}

// Wrapper component to handle Suspense
function PaymentSuccessPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentSuccessPage />
    </Suspense>
  );
}

export default PaymentSuccessPageWrapper;