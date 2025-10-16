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

const countryOptions = [
  { value: 'VN', label: '🇻🇳 Vietnam' },
  { value: 'US', label: '🇺🇸 United States' },
  { value: 'GB', label: '🇬🇧 United Kingdom' },
  { value: 'JP', label: '🇯🇵 Japan' },
  { value: 'KR', label: '🇰🇷 South Korea' },
  { value: 'SG', label: '🇸🇬 Singapore' },
  { value: 'TH', label: '🇹🇭 Thailand' },
  { value: 'MY', label: '🇲🇾 Malaysia' },
  { value: 'ID', label: '🇮🇩 Indonesia' },
  { value: 'PH', label: '🇵🇭 Philippines' },
  { value: 'CN', label: '🇨🇳 China' },
  { value: 'HK', label: '🇭🇰 Hong Kong' },
  { value: 'TW', label: '🇹🇼 Taiwan' },
  { value: 'AU', label: '🇦🇺 Australia' },
  { value: 'CA', label: '🇨🇦 Canada' },
  { value: 'DE', label: '🇩🇪 Germany' },
  { value: 'FR', label: '🇫🇷 France' },
  { value: 'IT', label: '🇮🇹 Italy' },
  { value: 'ES', label: '🇪🇸 Spain' },
  { value: 'NL', label: '🇳🇱 Netherlands' },
  { value: 'IN', label: '🇮🇳 India' },
  { value: 'BR', label: '🇧🇷 Brazil' },
  { value: 'MX', label: '🇲🇽 Mexico' },
  { value: 'RU', label: '🇷🇺 Russia' },
  { value: 'SA', label: '🇸🇦 Saudi Arabia' },
  { value: 'AE', label: '🇦🇪 United Arab Emirates' },
  { value: 'IL', label: '🇮🇱 Israel' },
  { value: 'ZA', label: '🇿🇦 South Africa' },
  { value: 'EG', label: '🇪🇬 Egypt' },
  { value: 'NG', label: '🇳🇬 Nigeria' },
  { value: 'KE', label: '🇰🇪 Kenya' },
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
function CheckoutForm({ pkg, selectedCycle, paymentMethod, formData, errors, onInputChange, onValidationError, mode, purchaseId, extendDays }: {
  pkg: any;
  selectedCycle: BillingCycle;
  paymentMethod: PaymentMethod;
  formData: any;
  errors: any;
  onInputChange: (field: string, value: string) => void;
  onValidationError: (errors: Record<string, string>) => void;
  mode?: string;
  purchaseId?: string;
  extendDays?: string;
}) {
  const stripe = paymentMethod === PaymentMethod.STRIPE_CARD ? useStripe() : null;
  const elements = paymentMethod === PaymentMethod.STRIPE_CARD ? useElements() : null;
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [existingPurchaseId, setExistingPurchaseId] = useState<string | null>(purchaseId || null);
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
      let purchase;

      if (existingPurchaseId && (mode === 'renew' || mode === 'extend' || mode === 'purchase-again')) {
        // For renew/extend/purchase-again, use existing purchase
        console.log('Using existing purchase:', existingPurchaseId, 'mode:', mode);
        purchase = { id: existingPurchaseId };

        if (paymentMethod === PaymentMethod.STRIPE_POPUP) {
          setExistingPurchaseId(existingPurchaseId);
        }
      } else {
        // Step 1: Create new purchase record first
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
            mode: mode || 'new',
            originalPurchaseId: existingPurchaseId,
            extendDays: extendDays,
          },
        };

        console.log('Creating purchase:', purchaseData);
        purchase = await PurchaseService.createPurchase(purchaseData);

        // Save purchase ID for later use in popup confirmation
        if (paymentMethod === PaymentMethod.STRIPE_POPUP) {
          setExistingPurchaseId(purchase.id);
        }
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

        // Get card data from custom inputs
        const cardNumberInput = document.getElementById('cardNumber') as HTMLInputElement;
        const expiryInput = document.getElementById('cardExpiry') as HTMLInputElement;
        const cvcInput = document.getElementById('cardCvc') as HTMLInputElement;

        const cardNumber = cardNumberInput?.value.replace(/\s/g, '') || '';
        const expiry = expiryInput?.value || '';
        const cvc = cvcInput?.value || '';

        console.log('Custom card data:', { cardNumber, expiry, cvc });

        // For now, use a test token since we're using custom inputs
        // In production, you'd need to properly integrate with Stripe's tokenization
        const { error: paymentMethodError, paymentMethod } = await stripe!.createPaymentMethod({
          type: 'card',
          card: {
            token: 'tok_visa', // Test token for Visa
            // Alternative: Use stripe.createToken with manual card data
          },
          billing_details: {
            name: formData.customerName,
            email: formData.customerEmail,
            address: {
              line1: formData.address,
              city: formData.city,
              country: formData.country, // Use selected country code
              postal_code: formData.zipCode,
            },
          },
        });

        if (paymentMethodError) {
          throw new Error(paymentMethodError.message);
        }

        // Confirm payment with the created payment method
        const { error, paymentIntent: confirmedIntent } = await stripe!.confirmCardPayment(paymentIntent.client_secret, {
          payment_method: paymentMethod.id,
        });

        if (error) {
          throw new Error(error.message);
        }

        // Check if payment was successful
        if (confirmedIntent?.status === 'succeeded') {
          // Payment successful - redirect to my-purchases
          console.log('Payment successful, redirecting to /my-purchases');
          window.location.href = `${baseUrl}/my-purchases?session_id=${confirmedIntent.id}`;
          return;
        } else if (confirmedIntent?.status === 'processing') {
          // Payment is processing - show message and redirect
          console.log('Payment is processing, redirecting to /my-purchases');
          window.location.href = `${baseUrl}/my-purchases?session_id=${confirmedIntent.id}`;
          return;
        } else {
          // Payment requires additional action
          console.log('Payment requires additional action:', confirmedIntent?.status);
          throw new Error(`Payment status: ${confirmedIntent?.status || 'unknown'}. Please contact support.`);
        }

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
    console.log('existingPurchaseId:', existingPurchaseId);
    console.log('mode:', mode);
    console.log('pkg:', pkg);
    console.log('formData:', formData);

    if (!existingPurchaseId) {
      console.log('No existingPurchaseId, returning');
      setShowPopup(false);
      setIsProcessing(false);
      return;
    }

    try {
      const price = getPrice();
      // Use production URL for success/cancel redirects, fallback to current origin
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shopify-checkout-frontend.vercel.app' || window.location.origin;
      console.log('Base URL for redirects:', baseUrl);

      const sessionData = {
        packageName: pkg.name,
        price: price,
        customerEmail: formData.customerEmail,
        successUrl: `${baseUrl}/my-purchases?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/payment/cancel`,
      };

      // Add mode-specific metadata
      if (mode) {
        console.log('Adding mode metadata:', { mode, originalPurchaseId: existingPurchaseId, extendDays });
        // Note: Backend will need to handle these metadata fields for webhook processing
      }

      console.log('Creating checkout session with data:', sessionData);

      // Create Checkout Session
      const checkoutSession = await StripePaymentService.createCheckoutSession(sessionData);

      console.log('Checkout session created:', checkoutSession);

      if (!checkoutSession || !checkoutSession.checkoutUrl) {
        throw new Error('Invalid checkout session response');
      }

      // Update purchase with session metadata (webhook will handle final update)
      console.log('Updating purchase with session ID:', checkoutSession.sessionId);
      await PurchaseService.completePurchase(existingPurchaseId, checkoutSession.sessionId);

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
        <Select
          value={formData.country}
          onChange={(e) => onInputChange('country', e.target.value)}
          options={countryOptions}
          label="Country"
          error={errors.country}
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
            {/* Enhanced Credit Card Form Section */}
            <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-purple-700/30">
              {/* Credit Card Header */}
              <div className="bg-black/20 backdrop-blur-sm p-6 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-bold text-xl">Secure Payment</h4>
                      <p className="text-purple-200 text-sm">Enter your credit card details</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-green-400" />
                    <span className="text-sm text-green-400 font-medium">256-bit SSL</span>
                  </div>
                </div>
              </div>

              {/* Credit Card Form Content */}
              <div className="p-6 space-y-6">
                {/* Enhanced Card Number Section */}
                <div className="space-y-3">
                  <label className="text-white font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                    <div className="w-1 h-4 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
                    Card Number
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                      <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 16">
                        <rect x="0" y="0" width="24" height="16" rx="2" fill="url(#cardGradient)"/>
                        <rect x="2" y="11" width="20" height="3" rx="1" fill="gold"/>
                        <text x="4" y="7" fill="white" fontSize="4" fontFamily="monospace">1234</text>
                        <defs>
                          <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#4F46E5"/>
                            <stop offset="100%" stopColor="#7C3AED"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 pl-14 focus-within:border-purple-400 focus-within:bg-white/15 transition-all duration-300">
                      <input
                        type="text"
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        className="w-full bg-transparent text-white text-xl font-mono placeholder-purple-300 outline-none"
                        style={{
                          fontSize: '20px',
                          letterSpacing: '0.15em',
                        }}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\s/g, ''); // Remove all spaces
                          let formattedValue = '';

                          // Format: add space every 4 digits
                          for (let i = 0; i < value.length; i++) {
                            if (i > 0 && i % 4 === 0) {
                              formattedValue += ' ';
                            }
                            formattedValue += value[i];
                          }

                          // Limit to 19 characters (16 digits + 3 spaces)
                          formattedValue = formattedValue.slice(0, 19);

                          // Update input value
                          e.target.value = formattedValue;

                          // Store formatted value for Stripe (without spaces)
                          e.target.dataset.cardNumber = value;
                        }}
                        onInput={(e) => {
                          let value = e.target.value.replace(/\s/g, ''); // Remove all spaces
                          let formattedValue = '';

                          // Format: add space every 4 digits
                          for (let i = 0; i < value.length; i++) {
                            if (i > 0 && i % 4 === 0) {
                              formattedValue += ' ';
                            }
                            formattedValue += value[i];
                          }

                          // Limit to 19 characters (16 digits + 3 spaces)
                          formattedValue = formattedValue.slice(0, 19);

                          // Update input value
                          e.target.value = formattedValue;
                        }}
                        maxLength={19} // 16 digits + 3 spaces
                      />
                      {/* Hidden Stripe Element for validation */}
                      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0 }}>
                        <CardNumberElement
                          options={{
                            style: { base: { fontSize: '1px' } },
                          }}
                          onChange={(e) => {
                            // Update custom input when Stripe element changes
                            const customInput = document.getElementById('cardNumber') as HTMLInputElement;
                            if (e.value && customInput) {
                              // Format Stripe's value to match our custom format
                              const cleanValue = e.value.replace(/\s/g, '');
                              let formattedValue = '';
                              for (let i = 0; i < cleanValue.length; i++) {
                                if (i > 0 && i % 4 === 0) {
                                  formattedValue += ' ';
                                }
                                formattedValue += cleanValue[i];
                              }
                              customInput.value = formattedValue.slice(0, 19);
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Card Brand Icons */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-purple-200 text-xs font-medium">We accept:</span>
                    <div className="flex items-center space-x-3">
                      {/* Visa */}
                      <div className="flex items-center space-x-1 px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                        <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
                          <rect width="32" height="20" rx="2" fill="#1A1F71"/>
                          <text x="6" y="13" fill="white" fontSize="8" fontWeight="bold">VISA</text>
                        </svg>
                      </div>
                      {/* Mastercard */}
                      <div className="flex items-center space-x-1 px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                        <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
                          <rect width="32" height="20" rx="2" fill="#EB001B"/>
                          <circle cx="11" cy="10" r="5" fill="#F79E1B"/>
                          <circle cx="21" cy="10" r="5" fill="#EB001B"/>
                        </svg>
                      </div>
                      {/* Amex */}
                      <div className="flex items-center space-x-1 px-2 py-1 bg-white/10 rounded-lg backdrop-blur-sm">
                        <svg className="w-8 h-5" viewBox="0 0 32 20" fill="none">
                          <rect width="32" height="20" rx="2" fill="#006FCF"/>
                          <text x="4" y="13" fill="white" fontSize="6" fontWeight="bold">AMEX</text>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Expiration Date and Security Code */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Expiration Date */}
                  <div className="space-y-3">
                    <label className="text-white font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                      <div className="w-1 h-4 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
                      Expiry Date
                    </label>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 focus-within:border-purple-400 focus-within:bg-white/15 transition-all duration-300">
                      <input
                        type="text"
                        id="cardExpiry"
                        placeholder="MM / YY"
                        className="w-full bg-transparent text-white text-xl font-mono placeholder-purple-300 outline-none"
                        style={{
                          fontSize: '18px',
                          letterSpacing: '0.1em',
                        }}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

                          if (value.length >= 2) {
                            value = value.slice(0, 2) + ' / ' + value.slice(2, 4);
                          }

                          // Limit to MM / YY format
                          value = value.slice(0, 7);

                          e.target.value = value;
                        }}
                        maxLength={7}
                      />
                    </div>
                  </div>

                  {/* Security Code */}
                  <div className="space-y-3">
                    <label className="text-white font-semibold text-sm uppercase tracking-wide flex items-center gap-2">
                      <div className="w-1 h-4 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full"></div>
                      CVV
                    </label>
                    <div className="relative">
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                        <svg className="w-5 h-5 text-purple-300" fill="currentColor" viewBox="0 0 20 14">
                          <rect x="0" y="0" width="20" height="14" rx="2" fill="url(#cvvGradient)"/>
                          <rect x="12" y="4" width="6" height="6" rx="1" fill="white" opacity="0.3"/>
                          <rect x="2" y="10" width="16" height="2" rx="1" fill="gold"/>
                          <defs>
                            <linearGradient id="cvvGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#8B5CF6"/>
                              <stop offset="100%" stopColor="#EC4899"/>
                            </linearGradient>
                          </defs>
                        </svg>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 pr-12 focus-within:border-purple-400 focus-within:bg-white/15 transition-all duration-300">
                        <input
                          type="text"
                          id="cardCvc"
                          placeholder="123"
                          className="w-full bg-transparent text-white text-xl font-mono placeholder-purple-300 outline-none"
                          style={{
                            fontSize: '18px',
                            letterSpacing: '0.1em',
                          }}
                          onChange={(e) => {
                            // Only allow numbers, max 4 digits
                            let value = e.target.value.replace(/\D/g, '').slice(0, 4);
                            e.target.value = value;
                          }}
                          maxLength={4}
                        />
                      </div>
                    </div>
                    <p className="text-purple-200 text-xs">3-4 digits on back of card</p>
                  </div>
                </div>

                {/* Enhanced Security Information */}
                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 rounded-xl p-4 backdrop-blur-sm">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Shield className="h-5 w-5 text-green-400" />
                    </div>
                    <div className="flex-1">
                      <h5 className="font-semibold text-green-400 mb-1">🔒 Military-grade Security</h5>
                      <p className="text-sm text-green-200">
                        Your payment information is encrypted with 256-bit SSL technology. We never store your card details.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Billing Details Summary */}
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                  <h5 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                    Billing Information
                  </h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-purple-200">Name:</span>
                      <span className="text-white font-medium">{formData.customerName || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                      <span className="text-purple-200">Email:</span>
                      <span className="text-white font-medium truncate ml-2">{formData.customerEmail || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-purple-200">Address:</span>
                      <span className="text-white font-medium text-right ml-2">
                        {formData.address && formData.city && formData.country
                          ? `${formData.address}, ${formData.city}, ${countryOptions.find(c => c.value === formData.country)?.label || formData.country}`
                          : 'Not provided'
                        }
                      </span>
                    </div>
                  </div>
                  {(!formData.customerName || !formData.customerEmail || !formData.address) && (
                    <div className="mt-3 p-3 bg-yellow-500/20 border border-yellow-400/30 rounded-lg">
                      <p className="text-xs text-yellow-200">
                        ⚠️ Please complete all contact and billing information above before proceeding.
                      </p>
                    </div>
                  )}
                </div>

                {/* Enhanced Amount Summary */}
                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-purple-200 font-medium">Total Amount</span>
                      <p className="text-xs text-purple-300">Including all taxes and fees</p>
                    </div>
                    <span className="text-3xl font-bold text-white">{formatCurrency(getPrice() * 0.98)}</span>
                  </div>

                  {/* Enhanced Complete Purchase Button */}
                  <Button
                    type="button"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 border-2 border-purple-500/50"
                    size="lg"
                    loading={isProcessing}
                    onClick={handleSubmit}
                    disabled={!formData.customerName || !formData.customerEmail || !formData.address}
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>{isProcessing ? 'Processing Payment...' : `Complete Purchase - ${formatCurrency(getPrice() * 0.98)}`}</span>
                    </div>
                  </Button>

                  <p className="text-xs text-purple-200 text-center mt-3 flex items-center justify-center gap-1">
                    <span>🔒</span>
                    <span>By completing this purchase you agree to our Terms of Service and Privacy Policy</span>
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
          {console.log('=== POPUP RENDERING ===', { showPopup, existingPurchaseId })}
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
  const purchaseId = searchParams.get('purchaseId');
  const mode = searchParams.get('mode'); // renew, extend, purchase-again
  const preFilledName = searchParams.get('name');
  const preFilledEmail = searchParams.get('email');
  const extendDays = searchParams.get('days');

  const { package: pkg, loading } = usePackage(packageId || '');

  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(billingCycle || BillingCycle.MONTHLY);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.STRIPE_CARD);

  // Form state
  const [formData, setFormData] = useState({
    customerName: preFilledName || '',
    customerEmail: preFilledEmail || '',
    address: '',
    city: '',
    country: 'VN', // Default to Vietnam (country code)
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
            <h1 className="text-2xl font-bold text-gray-900">
              {mode === 'renew' ? 'Renew Purchase' :
               mode === 'extend' ? 'Extend Purchase' :
               mode === 'purchase-again' ? 'Purchase Again' :
               'Checkout'}
            </h1>
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
                      mode={mode || undefined}
                      purchaseId={purchaseId || undefined}
                      extendDays={extendDays || undefined}
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
                    mode={mode || undefined}
                    purchaseId={purchaseId || undefined}
                    extendDays={extendDays || undefined}
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