'use client';

import { useState, useEffect } from 'react';
import { Package, Shop, BillingCycle } from '@/types';
import { OrderSummary } from './OrderSummary';
import { PaymentForm } from './PaymentForm';

interface CheckoutFormProps {
  packageData: Package;
  shop: Shop;
  onClose: () => void;
}

export function CheckoutForm({ packageData, shop, onClose }: CheckoutFormProps) {
  const [selectedCycle, setSelectedCycle] = useState<BillingCycle['value']>('one_time');
  const [customerInfo, setCustomerInfo] = useState({
    email: '',
    name: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    postalCode: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'details' | 'payment'>('details');

  // Get available billing cycles
  const availableCycles: BillingCycle[] = [];

  if (packageData.isSubscription) {
    if (packageData.weeklyPrice) {
      availableCycles.push({
        value: 'weekly',
        label: 'Weekly',
        price: packageData.weeklyPrice,
        description: 'Billed weekly'
      });
    }
    if (packageData.monthlyPrice) {
      availableCycles.push({
        value: 'monthly',
        label: 'Monthly',
        price: packageData.monthlyPrice,
        description: 'Billed monthly'
      });
    }
    if (packageData.yearlyPrice) {
      availableCycles.push({
        value: 'yearly',
        label: 'Yearly',
        price: packageData.yearlyPrice,
        description: 'Billed yearly'
      });
    }
  }

  if (packageData.basePrice) {
    availableCycles.push({
      value: 'one_time',
      label: 'One Time',
      price: packageData.basePrice,
      description: 'One-time purchase'
    });
  }

  // Set default cycle
  useEffect(() => {
    if (availableCycles.length > 0 && !selectedCycle) {
      setSelectedCycle(availableCycles[0].value);
    }
  }, [availableCycles]);

  const handleCustomerInfoChange = (field: string, value: string) => {
    setCustomerInfo(prev => ({ ...prev, [field]: value }));
  };

  const handleContinue = () => {
    // Validate customer info
    if (!customerInfo.email || !customerInfo.name) {
      setError('Please fill in required fields');
      return;
    }

    if (!customerInfo.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setCurrentStep('payment');
  };

  const handleBack = () => {
    setCurrentStep('details');
    setError(null);
  };

  const getCurrentPrice = () => {
    const cycle = availableCycles.find(c => c.value === selectedCycle);
    return cycle?.price || 0;
  };

  const getPlatformFee = () => {
    const price = getCurrentPrice();
    return price * (shop.platformFeePercent / 100);
  };

  const getTotalPrice = () => {
    return getCurrentPrice() + getPlatformFee();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Customer Details & Payment */}
      <div className="lg:col-span-2">
        {currentStep === 'details' ? (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Information</h2>

            {/* Customer Form */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) => handleCustomerInfoChange('name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => handleCustomerInfoChange('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => handleCustomerInfoChange('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={customerInfo.country}
                    onChange={(e) => handleCustomerInfoChange('country', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Country</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                    {/* Add more countries as needed */}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    value={customerInfo.city}
                    onChange={(e) => handleCustomerInfoChange('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="New York"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    value={customerInfo.postalCode}
                    onChange={(e) => handleCustomerInfoChange('postalCode', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10001"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address (Optional)
                </label>
                <input
                  type="text"
                  value={customerInfo.address}
                  onChange={(e) => handleCustomerInfoChange('address', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Main Street"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex">
                  <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-red-800 text-sm">{error}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleContinue}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        ) : (
          <PaymentForm
            packageData={packageData}
            shop={shop}
            selectedCycle={selectedCycle}
            setSelectedCycle={(cycle: string) => setSelectedCycle(cycle as BillingCycle['value'])}
            customerInfo={customerInfo}
            onBack={handleBack}
            onSuccess={onClose}
            isProcessing={isProcessing}
            setIsProcessing={setIsProcessing}
            error={error}
            setError={setError}
          />
        )}
      </div>

      {/* Right: Order Summary */}
      <div className="lg:col-span-1">
        <OrderSummary
          packageData={packageData}
          shop={shop}
          selectedCycle={selectedCycle}
          availableCycles={availableCycles}
          setSelectedCycle={(cycle: string) => setSelectedCycle(cycle as BillingCycle['value'])}
          totalPrice={getTotalPrice()}
          platformFee={getPlatformFee()}
        />
      </div>
    </div>
  );
}