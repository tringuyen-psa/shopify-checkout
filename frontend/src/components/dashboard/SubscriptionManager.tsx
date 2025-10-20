'use client';

import { useState } from 'react';
import { CreditCard, Calendar, AlertTriangle, Check, X, Pause, Play, Settings, ExternalLink } from 'lucide-react';

interface Subscription {
  id: string;
  packageName: string;
  shopName: string;
  shopSlug: string;
  amount: number;
  status: 'active' | 'cancelled' | 'past_due' | 'paused';
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  nextBillingDate: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  paymentMethod?: {
    brand: string;
    last4: string;
    expiresMonth: number;
    expiresYear: number;
  };
}

interface SubscriptionManagerProps {
  subscriptions: Subscription[];
  onManageSubscription?: (subscriptionId: string, action: string) => void;
}

export function SubscriptionManager({ subscriptions, onManageSubscription }: SubscriptionManagerProps) {
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPauseModal, setShowPauseModal] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (dateString: string) => {
    const now = new Date();
    const targetDate = new Date(dateString);
    const diffTime = targetDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'past_due':
        return 'bg-orange-100 text-orange-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Check className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      case 'past_due':
        return <AlertTriangle className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getBillingCycleText = (cycle: string) => {
    switch (cycle) {
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      case 'yearly':
        return 'Yearly';
      default:
        return cycle;
    }
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    setSelectedSubscription(subscriptionId);
    setShowCancelModal(true);
  };

  const handlePauseSubscription = (subscriptionId: string) => {
    setSelectedSubscription(subscriptionId);
    setShowPauseModal(true);
  };

  const confirmCancelSubscription = () => {
    if (selectedSubscription && onManageSubscription) {
      onManageSubscription(selectedSubscription, 'cancel');
    }
    setShowCancelModal(false);
    setSelectedSubscription(null);
  };

  const confirmPauseSubscription = () => {
    if (selectedSubscription && onManageSubscription) {
      onManageSubscription(selectedSubscription, 'pause');
    }
    setShowPauseModal(false);
    setSelectedSubscription(null);
  };

  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');
  const monthlyTotal = activeSubscriptions
    .filter(s => s.billingCycle === 'monthly')
    .reduce((sum, s) => sum + s.amount, 0);
  const yearlyTotal = activeSubscriptions
    .filter(s => s.billingCycle === 'yearly')
    .reduce((sum, s) => sum + s.amount, 0);

  if (subscriptions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Subscription Management</h2>
        </div>
        <div className="p-12">
          <div className="text-center">
            <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscriptions</h3>
            <p className="text-gray-500 mb-6">Subscribe to packages to get recurring access to digital products</p>
            <a
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Subscriptions
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Active</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{activeSubscriptions.length}</div>
          <p className="text-sm text-gray-500">Current subscriptions</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Monthly</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(monthlyTotal)}</div>
          <p className="text-sm text-gray-500">Monthly recurring</p>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Yearly</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatCurrency(yearlyTotal)}</div>
          <p className="text-sm text-gray-500">Yearly recurring</p>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Subscriptions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {subscriptions.map((subscription) => (
            <div key={subscription.id} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{subscription.packageName}</h3>
                    <p className="text-sm text-gray-500">{subscription.shopName}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      {getStatusIcon(subscription.status)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(subscription.status)}`}>
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">
                        {getBillingCycleText(subscription.billingCycle)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(subscription.amount)}/{subscription.billingCycle.slice(0, -2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {subscription.cancelAtPeriodEnd
                      ? `Cancels ${formatDate(subscription.currentPeriodEnd)}`
                      : `Renews ${formatDate(subscription.nextBillingDate)}`
                    }
                  </p>
                  {subscription.trialEnd && getDaysUntil(subscription.trialEnd) > 0 && (
                    <p className="text-xs text-blue-600 mt-1">
                      Trial ends in {getDaysUntil(subscription.trialEnd)} days
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method */}
              {subscription.paymentMethod && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-5 bg-gray-800 rounded flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {subscription.paymentMethod.brand.toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          •••• {subscription.paymentMethod.last4}
                        </p>
                        <p className="text-xs text-gray-500">
                          Expires {subscription.paymentMethod.expiresMonth}/{subscription.paymentMethod.expiresYear}
                        </p>
                      </div>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Update
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <a
                    href={`/shop/${subscription.shopSlug}`}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Visit Shop
                  </a>
                  <button className="text-sm text-blue-600 hover:text-blue-700 flex items-center">
                    <Settings className="w-4 h-4 mr-1" />
                    Manage
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                    <>
                      <button
                        onClick={() => handlePauseSubscription(subscription.id)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100"
                      >
                        Pause
                      </button>
                      <button
                        onClick={() => handleCancelSubscription(subscription.id)}
                        className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  {subscription.status === 'cancelled' && (
                    <button className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50">
                      Reactivate
                    </button>
                  )}
                  {subscription.status === 'paused' && (
                    <button className="px-3 py-1 text-sm text-green-600 border border-green-300 rounded-lg hover:bg-green-50">
                      <Play className="w-4 h-4 mr-1" />
                      Resume
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <X className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Subscription</h3>
                <p className="text-sm text-gray-500">Are you sure you want to cancel this subscription?</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                You'll continue to have access until the end of your current billing period on{' '}
                {selectedSubscription && formatDate(
                  subscriptions.find(s => s.id === selectedSubscription)?.currentPeriodEnd || ''
                )}.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Keep Subscription
              </button>
              <button
                onClick={confirmCancelSubscription}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pause Confirmation Modal */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <Pause className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pause Subscription</h3>
                <p className="text-sm text-gray-500">Temporarily pause your subscription</p>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Your subscription will be paused and you won't be charged during this time.
                You can resume it at any point.
              </p>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="1">Pause for 1 month</option>
                <option value="3">Pause for 3 months</option>
                <option value="6">Pause for 6 months</option>
                <option value="indefinite">Pause indefinitely</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowPauseModal(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100"
              >
                Never Mind
              </button>
              <button
                onClick={confirmPauseSubscription}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Pause Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}