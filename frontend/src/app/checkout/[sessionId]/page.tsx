'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle2, X, ArrowLeft, Shield, CreditCard } from 'lucide-react';
import { CheckoutAPI } from '@/lib/api/checkout';
import { CheckoutForm } from '@/components/checkout/CheckoutForm';

export default function CheckoutPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionId) {
      loadSession();
    }
  }, [sessionId]);

  const loadSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const sessionData = await CheckoutAPI.getCheckoutSession(sessionId as string);

      if (!sessionData) {
        setError('Checkout session not found or has expired');
        return;
      }

      // Check if session is expired
      const expiresAt = new Date(sessionData.expiresAt);
      if (expiresAt < new Date()) {
        setError('This checkout session has expired');
        return;
      }

      setSession(sessionData);
    } catch (err) {
      setError('Failed to load checkout session');
      console.error('Error loading checkout session:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Checkout Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <X className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Session Not Found</h2>
          <p className="text-gray-600 mb-6">The checkout session could not be found or has expired.</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                Checkout
              </h1>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Shield className="w-4 h-4" />
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </header>

      {/* Checkout Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {session.isSubscription ? 'Subscribe to' : 'Purchase'} {session.package?.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      Checkout Session: {session.sessionId.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <CheckoutForm
                  packageData={session.package}
                  shop={session.shop}
                  onClose={() => {
                    // Will be handled by CheckoutForm with redirect
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

              {/* Package Info */}
              <div className="mb-6">
                <div className="flex items-start space-x-4">
                  {session.package?.images && session.package.images.length > 0 ? (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                      <img
                        src={session.package.images[0]}
                        alt={session.package.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex-shrink-0 flex items-center justify-center">
                      <div className="text-2xl">📦</div>
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{session.package?.name}</h4>
                    <p className="text-sm text-gray-500">{session.shop?.name}</p>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Package Price</span>
                    <span className="font-medium">${session.price?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform Fee ({session.shop?.platformFeePercent || 15}%)</span>
                    <span className="font-medium">${session.platformFee?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">
                        ${((session.price || 0) + (session.platformFee || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Billing Cycle */}
              {session.package?.isSubscription && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-2">Billing Cycle</h4>
                  <div className="bg-blue-50 rounded-lg p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-900 font-medium capitalize">
                        {session.billingCycle?.replace('_', ' ')}
                      </span>
                      <span className="text-blue-700 font-semibold">
                        ${session.price?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Trial Period */}
              {session.package?.trialDays && session.package.trialDays > 0 && (
                <div className="mb-6">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="flex items-center">
                      <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                      <span className="text-green-800 text-sm font-medium">
                        {session.package.trialDays} days free trial included
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Information */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-center text-sm text-gray-500">
                  <Shield className="w-4 h-4 mr-1" />
                  <span>Secured by Stripe</span>
                </div>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Your payment information is encrypted and secure.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}