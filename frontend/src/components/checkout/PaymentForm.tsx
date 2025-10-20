'use client';

import { useState } from 'react';
import { Package, Shop } from '@/types';

interface PaymentFormProps {
  packageData: Package;
  shop: Shop;
  selectedCycle: string;
  setSelectedCycle: (cycle: string) => void;
  customerInfo: any;
  onBack: () => void;
  onSuccess: () => void;
  isProcessing: boolean;
  setIsProcessing: (processing: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export function PaymentForm({
  packageData,
  shop,
  selectedCycle,
  setSelectedCycle,
  customerInfo,
  onBack,
  onSuccess,
  isProcessing,
  setIsProcessing,
  error,
  setError
}: PaymentFormProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });

  const handleCardInfoChange = (field: string, value: string) => {
    let formattedValue = value;

    // Format card number
    if (field === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
    }

    // Format expiry date
    if (field === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(.{2})/, '$1/').trim();
      if (formattedValue.length > 5) {
        formattedValue = formattedValue.slice(0, 5);
      }
    }

    // Limit CVV to 4 digits
    if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    }

    setCardInfo(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsProcessing(true);
      setError(null);

      // Create checkout session
      const checkoutResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId: packageData.id,
          billingCycle: selectedCycle,
          email: customerInfo.email,
          name: customerInfo.name,
        }),
      });

      if (!checkoutResponse.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { sessionId, checkoutUrl } = await checkoutResponse.json();

      // Create Stripe checkout
      const stripeResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout/${sessionId}/stripe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerInfo.email,
          name: customerInfo.name,
          phone: customerInfo.phone,
          address: customerInfo.address,
          city: customerInfo.city,
          country: customerInfo.country,
          postalCode: customerInfo.postalCode,
        }),
      });

      if (!stripeResponse.ok) {
        throw new Error('Failed to create payment');
      }

      const { url } = await stripeResponse.json();

      // Redirect to Stripe Checkout
      window.location.href = url;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Information</h2>

      {/* Payment Method Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-4 border rounded-lg flex items-center justify-center transition-colors ${
              paymentMethod === 'card'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Credit Card
          </button>
          <button
            onClick={() => setPaymentMethod('paypal')}
            className={`p-4 border rounded-lg flex items-center justify-center transition-colors ${
              paymentMethod === 'paypal'
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 2.419c.11-.376.456-.638.848-.638h8.93c3.053 0 5.582 2.435 5.582 5.409 0 2.965-2.529 5.4-5.582 5.4H12.19l-.715 4.517a.641.641 0 01-.633.542H7.076z"/>
            </svg>
            PayPal
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {paymentMethod === 'card' ? (
          <>
            {/* Card Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={cardInfo.cardNumber}
                    onChange={(e) => handleCardInfoChange('cardNumber', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pl-12"
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    required
                  />
                  <div className="absolute left-3 top-2.5 flex space-x-1">
                    <div className="w-6 h-4 bg-gray-200 rounded"></div>
                    <div className="w-6 h-4 bg-blue-600 rounded"></div>
                    <div className="w-6 h-4 bg-red-500 rounded"></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={cardInfo.expiryDate}
                    onChange={(e) => handleCardInfoChange('expiryDate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CVV
                  </label>
                  <input
                    type="text"
                    value={cardInfo.cvv}
                    onChange={(e) => handleCardInfoChange('cvv', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123"
                    maxLength={4}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name on Card
                </label>
                <input
                  type="text"
                  value={cardInfo.nameOnCard}
                  onChange={(e) => setCardInfo(prev => ({ ...prev, nameOnCard: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M7.076 21.337H2.47a.641.641 0 01-.633-.74L4.944 2.419c.11-.376.456-.638.848-.638h8.93c3.053 0 5.582 2.435 5.582 5.409 0 2.965-2.529 5.4-5.582 5.4H12.19l-.715 4.517a.641.641 0 01-.633.542H7.076z"/>
              </svg>
            </div>
            <p className="text-gray-600 mb-4">You will be redirected to PayPal to complete your payment.</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            disabled={isProcessing}
          >
            Back
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0112 15c-1.618 0-3.124-.479-4.382-1.297l5.291-5.291z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              `Pay $${(getCurrentPrice() + (getCurrentPrice() * (shop.platformFeePercent / 100))).toFixed(2)}`
            )}
          </button>
        </div>
      </form>

      {/* Security Information */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span>Secure payment powered by Stripe. Your information is encrypted and protected.</span>
        </div>
      </div>
    </div>
  );

  function getCurrentPrice() {
    // Calculate price based on selected cycle
    switch (selectedCycle) {
      case 'weekly':
        return packageData.weeklyPrice || 0;
      case 'monthly':
        return packageData.monthlyPrice || 0;
      case 'yearly':
        return packageData.yearlyPrice || 0;
      default:
        return packageData.basePrice || 0;
    }
  }
}