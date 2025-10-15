'use client';

import React, { useState, Suspense } from 'react';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function PaymentCancelPage() {
  const [loading, setLoading] = useState(false);

  const handleRetryPayment = () => {
    // Go back to previous page or specific package
    window.history.back();
  };

  const handleBrowsePackages = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Cancel Icon */}
          <div className="bg-red-100 rounded-full p-4 w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>

          {/* Cancel Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Your payment has been cancelled. No charges were made to your account.
          </p>

          {/* Cancellation Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
            <p className="text-sm text-gray-600 mb-2">
              If you cancelled by mistake, you can try again.
            </p>
            <p className="text-sm text-gray-600">
              If you have any questions, please contact our support team.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button onClick={handleRetryPayment} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Payment Again
            </Button>
            <Button variant="outline" onClick={handleBrowsePackages} className="w-full">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Browse Other Packages
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Need help?</strong> Your cart has been saved and you can complete your purchase later.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Wrapper component to handle Suspense
function PaymentCancelPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <PaymentCancelPage />
    </Suspense>
  );
}

export default PaymentCancelPageWrapper;