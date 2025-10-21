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
import { ArrowLeft, Shield, Truck, Check, CreditCard, User, MapPin, Wallet, X } from 'lucide-react';
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

type CheckoutStep = 'information' | 'shipping' | 'payment';

interface StepIndicatorProps {
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
}

function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  const steps = [
    { id: 'information', label: 'INFORMATION', icon: User },
    { id: 'shipping', label: 'SHIPPING', icon: MapPin },
    { id: 'payment', label: 'PAYMENT', icon: Wallet },
  ] as const;

  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = completedSteps.includes(step.id as CheckoutStep);
        const isUpcoming = !isActive && !isCompleted;

        return (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex items-center">
              <div
                className={`
                  flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                  ${isActive
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : isCompleted
                    ? 'border-green-600 bg-green-600 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
                  }
                `}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="ml-3">
                <div
                  className={`
                    text-sm font-medium transition-colors duration-300
                    ${isActive
                      ? 'text-blue-600'
                      : isCompleted
                      ? 'text-green-600'
                      : 'text-gray-400'
                    }
                  `}
                >
                  {step.label}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`
                  flex-1 h-0.5 mx-4 transition-colors duration-300
                  ${isCompleted ? 'bg-green-600' : 'bg-gray-300'}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Information Step Component
function InformationStep({ formData, errors, onInputChange, onValidationError }: {
  formData: any;
  errors: any;
  onInputChange: (field: string, value: string) => void;
  onValidationError: (errors: Record<string, string>) => void;
}) {
  const validateInformation = () => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    const requiredValidation = validateRequired(formData);
    if (!requiredValidation.isValid) {
      requiredValidation.missing.forEach(field => {
        if (['customerName', 'customerEmail'].includes(field)) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
        }
      });
    }

    // Email validation
    if (formData.customerEmail && !validateEmail(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    onValidationError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
        <div className="space-y-4">
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
      </div>
    </div>
  );
}

// Shipping Step Component
function ShippingStep({ formData, errors, onInputChange, onValidationError }: {
  formData: any;
  errors: any;
  onInputChange: (field: string, value: string) => void;
  onValidationError: (errors: Record<string, string>) => void;
}) {
  const validateShipping = () => {
    const newErrors: Record<string, string> = {};

    // Required field validation
    const requiredValidation = validateRequired(formData);
    if (!requiredValidation.isValid) {
      requiredValidation.missing.forEach(field => {
        if (['address', 'city', 'country', 'zipCode'].includes(field)) {
          newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
        }
      });
    }

    // Zip code validation (basic)
    if (formData.zipCode && formData.zipCode.length < 5) {
      newErrors.zipCode = 'Please enter a valid zip code';
    }

    onValidationError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold mb-4">Shipping Address</h3>
        <div className="space-y-4">
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
      </div>
    </div>
  );
}

// Payment Step Component
function PaymentStep({
  pkg,
  selectedCycle,
  paymentMethod,
  formData,
  errors,
  onInputChange,
  onValidationError,
  mode,
  purchaseId,
  extendDays
}: {
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

  const validatePayment = () => {
    const newErrors: Record<string, string> = {};

    if (paymentMethod === PaymentMethod.STRIPE_CARD && (!stripe || !elements)) {
      newErrors.stripe = 'Stripe has not loaded yet. Please try again.';
    }

    onValidationError(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePayment()) {
      return;
    }

    setIsProcessing(true);

    try {
      let purchase;

      if (existingPurchaseId && (mode === 'renew' || mode === 'extend' || mode === 'purchase-again')) {
        purchase = { id: existingPurchaseId };
        if (paymentMethod === PaymentMethod.STRIPE_POPUP) {
          setExistingPurchaseId(existingPurchaseId);
        }
      } else {
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

        purchase = await PurchaseService.createPurchase(purchaseData);

        if (paymentMethod === PaymentMethod.STRIPE_POPUP) {
          setExistingPurchaseId(purchase.id);
        }
      }

      const price = getPrice();
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shopify-checkout-frontend.vercel.app' || window.location.origin;

      if (paymentMethod === PaymentMethod.STRIPE_CARD) {
        const paymentIntent = await StripePaymentService.createPaymentIntent({
          amount: price,
          currency: 'usd',
          customerEmail: formData.customerEmail,
        });

        await PurchaseService.completePurchase(purchase.id, paymentIntent.id);

        const cardNumberInput = document.getElementById('cardNumber') as HTMLInputElement;
        const expiryInput = document.getElementById('cardExpiry') as HTMLInputElement;
        const cvcInput = document.getElementById('cardCvc') as HTMLInputElement;

        const cardNumber = cardNumberInput?.value.replace(/\s/g, '') || '';
        const expiry = expiryInput?.value || '';
        const cvc = cvcInput?.value || '';

        const { error: paymentMethodError, paymentMethod: stripePaymentMethod } = await stripe!.createPaymentMethod({
          type: 'card',
          card: {
            token: 'tok_visa',
          },
          billing_details: {
            name: formData.customerName,
            email: formData.customerEmail,
            address: {
              line1: formData.address,
              city: formData.city,
              country: formData.country,
              postal_code: formData.zipCode,
            },
          },
        });

        if (paymentMethodError) {
          throw new Error(paymentMethodError.message);
        }

        const { error, paymentIntent: confirmedIntent } = await stripe!.confirmCardPayment(paymentIntent.client_secret, {
          payment_method: stripePaymentMethod.id,
        });

        if (error) {
          throw new Error(error.message);
        }

        if (confirmedIntent?.status === 'succeeded' || confirmedIntent?.status === 'processing') {
          window.location.href = `${baseUrl}/my-purchases?session_id=${confirmedIntent.id}`;
          return;
        } else {
          throw new Error(`Payment status: ${confirmedIntent?.status || 'unknown'}. Please contact support.`);
        }

      } else if (paymentMethod === PaymentMethod.STRIPE_POPUP) {
        setShowPopup(true);
      } else {
        alert(`PayPal payment for ${formatCurrency(price)} - Coming soon!`);
        setIsProcessing(false);
        return;
      }

    } catch (error) {
      console.error('Payment processing error:', error);
      alert(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsProcessing(false);
      if (paymentMethod !== PaymentMethod.STRIPE_POPUP) {
        setShowPopup(false);
      }
    }
  };

  const handlePopupConfirm = async () => {
    if (!existingPurchaseId) {
      setShowPopup(false);
      setIsProcessing(false);
      return;
    }

    try {
      const price = getPrice();
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://shopify-checkout-frontend.vercel.app' || window.location.origin;

      const sessionData = {
        packageName: pkg.name,
        price: price,
        customerEmail: formData.customerEmail,
        successUrl: `${baseUrl}/my-purchases?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/payment/cancel`,
      };

      const checkoutSession = await StripePaymentService.createCheckoutSession(sessionData);

      if (!checkoutSession || !checkoutSession.checkoutUrl) {
        throw new Error('Invalid checkout session response');
      }

      await PurchaseService.completePurchase(existingPurchaseId, checkoutSession.sessionId);
      setCheckoutSessionId(checkoutSession.sessionId);

      window.location.href = checkoutSession.checkoutUrl;
      return;

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
      <div>
        <h3 className="text-xl font-semibold mb-4">Payment Method</h3>
        <Select
          value={paymentMethod}
          onChange={(e) => {
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
            <div className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-purple-700/30">
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

              <div className="p-6 space-y-6">
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          let value = e.target.value.replace(/\s/g, '');
                          let formattedValue = '';

                          for (let i = 0; i < value.length; i++) {
                            if (i > 0 && i % 4 === 0) {
                              formattedValue += ' ';
                            }
                            formattedValue += value[i];
                          }

                          formattedValue = formattedValue.slice(0, 19);
                          e.target.value = formattedValue;
                          e.target.dataset.cardNumber = value;
                        }}
                        maxLength={19}
                      />
                      <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0 }}>
                        <CardNumberElement
                          options={{
                            style: { base: { fontSize: '1px' } },
                          }}
                          onChange={(e: any) => {
                            const customInput = document.getElementById('cardNumber') as HTMLInputElement;
                            if (e.value && customInput) {
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
                </div>

                <div className="grid grid-cols-2 gap-4">
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
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          let value = e.target.value.replace(/\D/g, '');

                          if (value.length >= 2) {
                            value = value.slice(0, 2) + ' / ' + value.slice(2, 4);
                          }

                          value = value.slice(0, 7);
                          e.target.value = value;
                        }}
                        maxLength={7}
                      />
                    </div>
                  </div>

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
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
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

                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-purple-200 font-medium">Total Amount</span>
                      <p className="text-xs text-purple-300">Including all taxes and fees</p>
                    </div>
                    <span className="text-3xl font-bold text-white">{formatCurrency(getPrice() * 0.98)}</span>
                  </div>

                  <Button
                    type="button"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 border-2 border-purple-500/50"
                    size="lg"
                    loading={isProcessing}
                    onClick={handleSubmit}
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

      {showPopup && (
        <>
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
  const mode = searchParams.get('mode');
  const preFilledName = searchParams.get('name');
  const preFilledEmail = searchParams.get('email');
  const extendDays = searchParams.get('days');

  const { package: pkg, loading } = usePackage(packageId || '');

  const [selectedCycle, setSelectedCycle] = useState<BillingCycle>(billingCycle || BillingCycle.MONTHLY);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.STRIPE_CARD);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('information');
  const [completedSteps, setCompletedSteps] = useState<CheckoutStep[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    customerName: preFilledName || '',
    customerEmail: preFilledEmail || '',
    address: '',
    city: '',
    country: 'VN',
    zipCode: '',
    userId: 'sample-user-123',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (billingCycle) {
      setSelectedCycle(billingCycle);
    }

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
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleValidationError = (newErrors: Record<string, string>) => {
    setErrors(newErrors);
  };

  const handleNextStep = () => {
    const newCompletedSteps = [...completedSteps, currentStep];
    setCompletedSteps(newCompletedSteps);

    if (currentStep === 'information') {
      setCurrentStep('shipping');
    } else if (currentStep === 'shipping') {
      setCurrentStep('payment');
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 'shipping') {
      setCurrentStep('information');
      setCompletedSteps(completedSteps.filter(step => step !== 'shipping'));
    } else if (currentStep === 'payment') {
      setCurrentStep('shipping');
      setCompletedSteps(completedSteps.filter(step => step !== 'payment'));
    }
  };

  const handleStepClick = (step: CheckoutStep) => {
    if (completedSteps.includes(step) || currentStep === step) {
      setCurrentStep(step);
      // Keep completed steps that come before the selected step
      const stepOrder: CheckoutStep[] = ['information', 'shipping', 'payment'];
      const stepIndex = stepOrder.indexOf(step);
      setCompletedSteps(stepOrder.slice(0, stepIndex));
    }
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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'information':
        return (
          <InformationStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            onValidationError={handleValidationError}
          />
        );
      case 'shipping':
        return (
          <ShippingStep
            formData={formData}
            errors={errors}
            onInputChange={handleInputChange}
            onValidationError={handleValidationError}
          />
        );
      case 'payment':
        return (
          <PaymentStep
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
        );
      default:
        return null;
    }
  };

  const canProceedToNextStep = () => {
    switch (currentStep) {
      case 'information':
        return formData.customerName && formData.customerEmail && validateEmail(formData.customerEmail);
      case 'shipping':
        return formData.address && formData.city && formData.country && formData.zipCode;
      case 'payment':
        return true; // Payment step handles its own validation
      default:
        return false;
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

          {/* Right Column - Multi-step Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="cursor-pointer" onClick={() => handleStepClick('information')}>
                  {currentStep === 'information' ? 'Customer Information' :
                   currentStep === 'shipping' ? 'Shipping Information' :
                   'Payment Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="cursor-pointer"
                  onClick={() => handleStepClick('information')}
                >
                  <StepIndicator currentStep={currentStep} completedSteps={completedSteps} />
                </div>

                <div className="mt-6">
                  {paymentMethod === PaymentMethod.STRIPE_CARD && currentStep === 'payment' ? (
                    <Elements stripe={stripePromise}>
                      {renderCurrentStep()}
                    </Elements>
                  ) : (
                    renderCurrentStep()
                  )}
                </div>

                {/* Navigation Buttons */}
                {currentStep !== 'payment' && (
                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={handlePreviousStep}
                      disabled={currentStep === 'information'}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      disabled={!canProceedToNextStep()}
                    >
                      {currentStep === 'information' ? 'Continue to Shipping' : 'Continue to Payment'}
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  </div>
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