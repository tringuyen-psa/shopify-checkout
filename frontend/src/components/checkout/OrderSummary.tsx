'use client';

import { Package, Shop, BillingCycle } from '@/types';

interface OrderSummaryProps {
  packageData: Package;
  shop: Shop;
  selectedCycle: string;
  availableCycles: BillingCycle[];
  setSelectedCycle: (cycle: string) => void;
  totalPrice: number;
  platformFee: number;
}

export function OrderSummary({
  packageData,
  shop,
  selectedCycle,
  availableCycles,
  setSelectedCycle,
  totalPrice,
  platformFee
}: OrderSummaryProps) {
  const getCurrentPrice = () => {
    const cycle = availableCycles.find(c => c.value === selectedCycle);
    return cycle?.price || 0;
  };

  const getTrialText = () => {
    if (packageData.trialDays && packageData.trialDays > 0) {
      return `${packageData.trialDays} days free trial included`;
    }
    return null;
  };

  return (
    <div className="bg-gray-50 rounded-xl p-6 sticky top-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

      {/* Package Info */}
      <div className="flex items-start space-x-4 mb-6">
        {packageData.images && packageData.images.length > 0 ? (
          <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={packageData.images[0]}
              alt={packageData.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        ) : (
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        )}
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{packageData.name}</h4>
          <p className="text-sm text-gray-500">{shop.name}</p>
          {packageData.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
              {packageData.category}
            </span>
          )}
        </div>
      </div>

      {/* Billing Cycle Selection */}
      {availableCycles.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Billing Cycle
          </label>
          <div className="space-y-2">
            {availableCycles.map((cycle) => (
              <label
                key={cycle.value}
                className="flex items-center p-3 border rounded-lg cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name="billingCycle"
                  value={cycle.value}
                  checked={selectedCycle === cycle.value}
                  onChange={() => setSelectedCycle(cycle.value)}
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {cycle.label} - ${cycle.price}
                  </div>
                  <div className="text-sm text-gray-500">{cycle.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Trial Period */}
      {getTrialText() && (
        <div className="mb-6 p-3 bg-green-50 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-green-700">{getTrialText()}</span>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="border-t border-gray-200 pt-4 mb-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Package Price</span>
            <span className="font-medium">${getCurrentPrice().toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Platform Fee ({shop.platformFeePercent}%)</span>
            <span className="font-medium">${platformFee.toFixed(2)}</span>
          </div>

          <div className="border-t border-gray-200 pt-2">
            <div className="flex justify-between">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-lg font-bold text-gray-900">${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Info */}
      {packageData.isSubscription && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Subscription Details</p>
              <ul className="space-y-1">
                <li>• Auto-renewal enabled</li>
                <li>• Cancel anytime</li>
                <li>• Access updates during subscription</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Security Badge */}
      <div className="text-center text-xs text-gray-500">
        <div className="flex items-center justify-center mb-2">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Secured by Stripe
        </div>
        <p>Your payment information is encrypted and secure.</p>
      </div>
    </div>
  );
}