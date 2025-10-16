'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePackage } from '@/hooks/usePackages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { BillingCycle } from '@/types/package';
import { PaymentMethod } from '@/types/purchase';
import { formatCurrency, validateEmail, validateRequired } from '@/lib/utils';
import { ArrowLeft, CreditCard, Shield, Truck, Check, X } from 'lucide-react';
import { StripePaymentService } from '@/lib/stripe';
import { PurchaseService } from '@/lib/purchase';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardNumberElement, CardExpiryElement, CardCvcElement } from '@stripe/react-stripe-js';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const billingCycleOptions = [
  { value: BillingCycle.WEEKLY, label: 'Weekly' },
  { value: BillingCycle.MONTHLY, label: 'Monthly' },
  { value: BillingCycle.YEARLY, label: 'Yearly' },
];

const paymentMethodOptions = [
  { value: PaymentMethod.STRIPE_CARD, label: 'Credit Card (Stripe)' },
  { value: PaymentMethod.STRIPE_POPUP, label: 'Stripe Checkout Popup' },
  { value: PaymentMethod.PAYPAL, label: 'PayPal' },
];

// Custom Card Element styles
const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
      iconColor: '#666EE8',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
};

// CheckoutForm Component with Stripe Elements
function CheckoutForm({ pkg, selectedCycle, paymentMethod, formData, errors, onInputChange, onValidationError }: {
  pkg: any;
  selectedCycle: BillingCycle;
  paymentMethod: PaymentMethod;
  formData: any;
  errors: any;
  onInputChange: (field: string, value: string) => void;
  onValidationError: (errors: Record<string, string>) => void;
}) {
  const stripe = paymentMethod === PaymentMethod.STRIPE_CARD ? useStripe() : null;
  const elements = paymentMethod === PaymentMethod.STRIPE_CARD ? useElements() : null;
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [checkoutSessionId, setCheckoutSessionId] = useState<string | null>(null);

  // Debug popup state changes
  useEffect(() => {
    console.log('=== showPopup state changed ===', showPopup);
  }, [showPopup]);

  const getPrice = () => {
    switch (selectedCycle) {
      case BillingCycle.WEEKLY:
        return pkg.weeklyPrice;
      case BillingCycle.MONTHLY:
        return pkg.monthlyPrice;
      case BillingCycle.YEARLY:
        return pkg.yearlyPrice;
      default:
        return pkg.monthlyPrice;
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    const requiredValidation = validateRequired(formData);
    if (!requiredValidation.isValid) {
      requiredValidation.missing.forEach(field => {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
      });
    }

    // Email validation
    if (formData.customerEmail && !validateEmail(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    // Zip code validation (basic)
    if (formData.zipCode && formData.zipCode.length < 5) {
      newErrors.zipCode = 'Please enter a valid zip code';
    }

    onValidationError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // For card payment, check if Stripe is loaded
    if (paymentMethod === PaymentMethod.STRIPE_CARD && (!stripe || !elements)) {
      onValidationError({ stripe: 'Stripe has not loaded yet. Please try again.' });
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create purchase record first
      const purchaseData = {
        packageId: pkg.id,
        userId: formData.userId,
        billingCycle: selectedCycle,
        paymentMethod,
        customerEmail: formData.customerEmail,
        customerName: formData.customerName,
        isRecurring: true,
        metadata: {
          address: formData.address,
          city: formData.city,
          country: formData.country,
          zipCode: formData.zipCode,
        },
      };

      console.log('Creating purchase:', purchaseData);
      const purchase = await PurchaseService.createPurchase(purchaseData);

      // Save purchase ID for later use in popup confirmation
      if (paymentMethod === PaymentMethod.STRIPE_POPUP) {
        setPurchaseId(purchase.id);
      }

      // Step 2: Process payment based on selected method
      const price = getPrice();
      // Use production URL for success/cancel redirects, fallback to current origin
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shopify-checkout-frontend.vercel.app' || window.location.origin;
      console.log('Base URL for redirects:', baseUrl);

      if (paymentMethod === PaymentMethod.STRIPE_CARD) {
        // Create Payment Intent
        const paymentIntent = await StripePaymentService.createPaymentIntent({
          amount: price,
          currency: 'usd',
          customerEmail: formData.customerEmail,
        });

        // Update purchase with payment intent metadata
        await PurchaseService.completePurchase(purchase.id, paymentIntent.id);

        // Create payment method with individual card elements
        const { error: paymentMethodError, paymentMethod } = await stripe!.createPaymentMethod({
          type: 'card',
          card: elements!.getElement(CardNumberElement)!,
          billing_details: {
            name: formData.customerName,
            email: formData.customerEmail,
            address: {
              line1: formData.address,
              city: formData.city,
              country: 'VN', // Always use Vietnam country code
              postal_code: formData.zipCode,
            },
          },
        });

        if (paymentMethodError) {
          throw new Error(paymentMethodError.message);
        }

        // Confirm payment with the created payment method
        const { error } = await stripe!.confirmCardPayment(paymentIntent.client_secret, {
          payment_method: paymentMethod.id,
          return_url: `${baseUrl}/my-purchases?session_id=${paymentIntent.id}`,
        });

        if (error) {
          throw new Error(error.message);
        }

        // Payment will be redirected to return_url automatically

      } else if (paymentMethod === PaymentMethod.STRIPE_POPUP) {
        // Show popup confirmation first
        console.log('=== STRIPE_POPUP selected ===');
        console.log('Setting showPopup to true for STRIPE_POPUP');
        setShowPopup(true);
        console.log('showPopup should be true now');
        console.log('Current popup state:', showPopup);

      } else {
        // PayPal flow (placeholder)
        alert(`PayPal payment for ${formatCurrency(price)} - Coming soon!`);
        setIsProcessing(false);
        return;
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      // Don't reset popup state here - let popup handle its own closing
      if (paymentMethod !== PaymentMethod.STRIPE_POPUP) {
        setShowPopup(false);
      }
    }
  };

  const handlePopupConfirm = async () => {
    console.log('=== handlePopupConfirm called ===');
    console.log('purchaseId:', purchaseId);
    console.log('pkg:', pkg);
    console.log('formData:', formData);

    if (!purchaseId) {
      console.log('No purchaseId, returning');
      setShowPopup(false);
      setIsProcessing(false);
      return;
    }

    try {
      const price = getPrice();
      // Use production URL for success/cancel redirects, fallback to current origin
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shopify-checkout-frontend.vercel.app' || window.location.origin;
      console.log('Base URL for redirects:', baseUrl);

      console.log('Creating checkout session with data:', {
        packageName: pkg.name,
        price: price,
        customerEmail: formData.customerEmail,
        successUrl: `${baseUrl}/my-purchases?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/payment/cancel`,
      });

      // Create Checkout Session
      const checkoutSession = await StripePaymentService.createCheckoutSession({
        packageName: pkg.name,
        price: price,
        customerEmail: formData.customerEmail,
        successUrl: `${baseUrl}/my-purchases?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/payment/cancel`,
      });

      console.log('Checkout session created:', checkoutSession);

      if (!checkoutSession || !checkoutSession.checkoutUrl) {
        throw new Error('Invalid checkout session response');
      }

      // Update purchase with session metadata (webhook will handle final update)
      console.log('Updating purchase with session ID:', checkoutSession.sessionId);
      await PurchaseService.completePurchase(purchaseId, checkoutSession.sessionId);

      // Save checkout session ID for tracking
      setCheckoutSessionId(checkoutSession.sessionId);

      console.log('About to open popup with URL:', checkoutSession.checkoutUrl);

      // For testing: Always redirect instead of popup to bypass popup blockers
      console.log('Redirecting to Stripe (bypassing popup)...');
      window.location.href = checkoutSession.checkoutUrl;
      return;

      // Original popup code (commented out for testing)
      /*
      // Try to open popup first
      let popup = window.open(
        checkoutSession.checkoutUrl,
        'stripe-checkout',
        'width=500,height=600,scrollbars=yes,resizable=yes'
      );

      console.log('Popup opened:', popup);

      // Check if popup was blocked
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        console.log('Popup blocked or failed, redirecting to Stripe checkout in same tab...');
        // Fallback: Redirect to Stripe checkout in same tab
        window.location.href = checkoutSession.checkoutUrl;
        return;
      }

      // Poll to check if popup is closed
      const checkClosed = setInterval(() => {
        if (popup!.closed) {
          clearInterval(checkClosed);
          setShowPopup(false);
          setIsProcessing(false);

          // Show notification to user
          alert('Thank you for your purchase! You will receive a confirmation email shortly. If you completed the payment, your purchase will be processed automatically.');

          // Here you can add additional logic like redirecting to a success page
          // The webhook will handle the purchase completion
        }
      }, 1000);

      // Close confirmation popup
      setShowPopup(false);
      */

    } catch (error) {
      console.error('Error creating checkout session:', error);
      alert(`Failed to create checkout session: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setShowPopup(false);
      setIsProcessing(false);
    }
  };

  const handlePopupCancel = () => {
    setShowPopup(false);
    setIsProcessing(false);
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Contact Information</h3>
        <Input
          label="Full Name"
          value={formData.customerName}
          onChange={(e) => onInputChange('customerName', e.target.value)}
          error={errors.customerName}
          placeholder="John Doe"
          required
        />
        <Input
          label="Email Address"
          type="email"
          value={formData.customerEmail}
          onChange={(e) => onInputChange('customerEmail', e.target.value)}
          error={errors.customerEmail}
          placeholder="john@example.com"
          required
        />
      </div>

      {/* Shipping Information */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Billing Information</h3>
        <Input
          label="Street Address"
          value={formData.address}
          onChange={(e) => onInputChange('address', e.target.value)}
          error={errors.address}
          placeholder="123 Main St"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="City"
            value={formData.city}
            onChange={(e) => onInputChange('city', e.target.value)}
            error={errors.city}
            placeholder="New York"
            required
          />
          <Input
            label="ZIP Code"
            value={formData.zipCode}
            onChange={(e) => onInputChange('zipCode', e.target.value)}
            error={errors.zipCode}
            placeholder="10001"
            required
          />
        </div>
        <Input
          label="Country"
          value={formData.country}
          onChange={(e) => onInputChange('country', e.target.value)}
          error={errors.country}
          placeholder="Việt Nam"
          required
        />
      </div>

      {/* Payment Method */}
      <div className="space-y-4">
        <h3 className="font-medium text-lg">Payment Method</h3>
        <Select
          value={paymentMethod}
          onChange={(e) => {
            // This will be handled by parent component
            const event = new CustomEvent('paymentMethodChange', {
              detail: e.target.value as PaymentMethod
            });
            window.dispatchEvent(event);
          }}
          options={paymentMethodOptions}
          label="Select Payment Method"
        />

        {paymentMethod === PaymentMethod.STRIPE_CARD && (
          <div className="mt-6">
            {/* Credit Card Form Section */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Credit Card Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-6 w-6 text-white" />
                    <h4 className="text-white font-semibold text-lg">Credit Card Information</h4>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-green-300" />
                    <span className="text-xs text-green-300">Secured by Stripe</span>
                  </div>
                </div>
              </div>

              {/* Credit Card Form Content */}
              <div className="p-6 space-y-6">
                {/* Card Number Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Card Information</label>
                  <div className="bg-white border border-gray-300 rounded-lg p-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                    <CardNumberElement
                      options={{
                        style: cardElementOptions.style,
                        placeholder: '1234 1234 1234 1234',
                        showIcon: true,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>Support:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-5 bg-blue-600 rounded"></div>
                        <span>Visa</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-5 bg-red-500 rounded"></div>
                        <span>Mastercard</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-5 bg-blue-700 rounded"></div>
                        <span>Amex</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-5 bg-green-600 rounded"></div>
                        <span>JCB</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expiration Date and Security Code */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Expiration Date */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Expiration date</label>
                    <div className="bg-white border border-gray-300 rounded-lg p-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                      <CardExpiryElement
                        options={{
                          style: cardElementOptions.style,
                          placeholder: 'MM / YY',
                        }}
                      />
                    </div>
                  </div>

                  {/* Security Code */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Security code</label>
                    <div className="bg-white border border-gray-300 rounded-lg p-4 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                      <CardCvcElement
                        options={{
                          style: cardElementOptions.style,
                          placeholder: 'CVC',
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500">3-digit code on back of card</p>
                  </div>
                </div>

                {/* Security Information */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <h5 className="font-medium text-blue-900 mb-1">Secure, fast checkout</h5>
                      <p className="text-sm text-blue-700">
                        While entering card information, you'll be automatically advanced to the next form field when the current field is complete.
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        Your payment information is encrypted and secure. We never store your card details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Billing Details Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Billing Details</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">{formData.customerName || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium">{formData.customerEmail || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium text-right">
                        {formData.address && formData.city && formData.country
                          ? `${formData.address}, ${formData.city}, ${formData.country}`
                          : 'Not provided'
                        }
                      </span>
                    </div>
                  </div>
                  {(!formData.customerName || !formData.customerEmail || !formData.address) && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-xs text-yellow-700">
                        Please complete the contact and billing information above before proceeding.
                      </p>
                    </div>
                  )}
                </div>

                {/* Amount Summary */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-gray-600">Total Amount</span>
                      <p className="text-xs text-gray-500">Including all taxes and fees</p>
                    </div>
                    <span className="text-2xl font-bold text-gray-900">{formatCurrency(getPrice() * 0.98)}</span>
                  </div>

                  {/* Complete Purchase Button */}
                  <Button
                    type="button"
                    className="w-full"
                    size="lg"
                    loading={isProcessing}
                    onClick={handleSubmit}
                    disabled={!formData.customerName || !formData.customerEmail || !formData.address}
                  >
                    {isProcessing ? 'Processing...' : `Complete Purchase - ${formatCurrency(getPrice() * 0.98)}`}
                  </Button>

                  <p className="text-xs text-gray-500 text-center mt-3">
                    By completing this purchase you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === PaymentMethod.STRIPE_POPUP && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              You will be redirected to Stripe's secure checkout popup to complete your purchase.
            </p>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-600">Secured by Stripe Checkout</span>
            </div>
          </div>
        )}

        {paymentMethod === PaymentMethod.PAYPAL && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              You will be redirected to PayPal to complete your purchase.
            </p>
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-600">Secured by PayPal</span>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button - Only show for non-card payment methods */}
      {paymentMethod !== PaymentMethod.STRIPE_CARD && (
        <div className="border-t pt-6">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            loading={isProcessing}
            onClick={handleSubmit}
          >
            {isProcessing ? 'Processing...' : `Complete Purchase - ${formatCurrency(getPrice() * 0.98)}`}
          </Button>

          <p className="text-xs text-gray-500 text-center mt-4">
            By completing this purchase you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      )}

          {/* Popup Modal for STRIPE_POPUP confirmation */}
      {showPopup && (
        <>
          {console.log('=== POPUP RENDERING ===', { showPopup, purchaseId })}
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Confirm Payment</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePopupCancel}
                className="p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Click "Continue to Payment" to open Stripe's secure checkout popup where you can complete your payment of {formatCurrency(getPrice() * 0.98)}.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Secure Checkout by Stripe</span>
                </div>
                <p className="text-xs text-blue-700 mt-1">
                  A new window will open with Stripe's secure payment form
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handlePopupCancel}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handlePopupConfirm}
                className="flex-1"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}

function CheckoutPage() {
  const searchParams = useSearchParams();
  const packageId = searchParams.get('packageId');
  const billingCycle = searchParams.get('billingCycle') as BillingCycle;

  const { package: pkg, loading } = usePackage(packageId || '');

  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(billingCycle || BillingCycle.MONTHLY);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.STRIPE_CARD);

  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    address: '',
    city: '',
    country: 'Việt Nam', // Default to Vietnam
    zipCode: '',
    userId: 'sample-user-123',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (billingCycle) {
      setSelectedCycle(billingCycle);
    }

    // Listen for payment method changes from child component
    const handlePaymentMethodChange = (event: CustomEvent) => {
      setPaymentMethod(event.detail);
    };

    window.addEventListener('paymentMethodChange', handlePaymentMethodChange as EventListener);

    return () => {
      window.removeEventListener('paymentMethodChange', handlePaymentMethodChange as EventListener);
    };
  }, [billingCycle]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleValidationError = (newErrors: Record<string, string>) => {
    setErrors(newErrors);
  };

  const getPrice = () => {
    if (!pkg) return 0;
    switch (selectedCycle) {
      case BillingCycle.WEEKLY:
        return pkg.weeklyPrice;
      case BillingCycle.MONTHLY:
        return pkg.monthlyPrice;
      case BillingCycle.YEARLY:
        return pkg.yearlyPrice;
      default:
        return pkg.monthlyPrice;
    }
  };

  if (!packageId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Package Selected</h1>
          <p className="text-gray-600 mb-6">Please select a package to proceed with checkout.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Packages
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading package details...</p>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Package Not Found</h1>
          <p className="text-gray-600 mb-6">The selected package could not be found.</p>
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Packages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Order Summary */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Package Info */}
                <div className="flex items-start space-x-4">
                  {pkg.imageUrl ? (
                    <img
                      src={pkg.imageUrl}
                      alt={pkg.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-2xl">📦</div>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{pkg.name}</h3>
                    <p className="text-gray-600 text-sm">{pkg.description}</p>
                    <div className="mt-2">
                      <Select
                        value={selectedCycle}
                        onChange={(e) => setSelectedCycle(e.target.value as BillingCycle)}
                        options={billingCycleOptions}
                        className="w-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Package ({getBillingCycleLabel(selectedCycle)})</span>
                    <span className="font-medium">{formatCurrency(getPrice())}</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Black Friday Discount</span>
                    <span>-{formatCurrency(getPrice() * 0.1)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Shipping</span>
                    <span>FREE</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax</span>
                    <span>{formatCurrency(getPrice() * 0.08)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(getPrice() * 0.98)}</span>
                    </div>
                  </div>
                </div>

                {/* Features */}
                {pkg.features && pkg.features.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">What's included:</h4>
                    <ul className="space-y-2">
                      {pkg.features.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-start text-sm">
                          <Check className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Trust Badges */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Shield className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                      <div className="text-xs font-medium">Secure Payment</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Truck className="h-6 w-6 text-green-600 mx-auto mb-1" />
                      <div className="text-xs font-medium">Instant Access</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <CreditCard className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                      <div className="text-xs font-medium">30-Day Guarantee</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Checkout Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentMethod === PaymentMethod.STRIPE_CARD ? (
                  <Elements stripe={stripePromise}>
                    <CheckoutForm
                      pkg={pkg}
                      selectedCycle={selectedCycle}
                      paymentMethod={paymentMethod}
                      formData={formData}
                      errors={errors}
                      onInputChange={handleInputChange}
                      onValidationError={handleValidationError}
                    />
                  </Elements>
                ) : (
                  <CheckoutForm
                    pkg={pkg}
                    selectedCycle={selectedCycle}
                    paymentMethod={paymentMethod}
                    formData={formData}
                    errors={errors}
                    onInputChange={handleInputChange}
                    onValidationError={handleValidationError}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function getBillingCycleLabel(cycle: BillingCycle): string {
  switch (cycle) {
    case BillingCycle.WEEKLY:
      return 'Weekly';
    case BillingCycle.MONTHLY:
      return 'Monthly';
    case BillingCycle.YEARLY:
      return 'Yearly';
    default:
      return cycle;
  }
}

// Wrapper component to handle Suspense
function CheckoutPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutPage />
    </Suspense>
  );
}

export default CheckoutPageWrapper;