'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CustomerStats } from '@/components/dashboard/CustomerStats';
import { PurchaseHistory } from '@/components/dashboard/PurchaseHistory';
import { SubscriptionManager } from '@/components/dashboard/SubscriptionManager';
import {
  ShoppingBag,
  CreditCard,
  Package,
  Settings,
  User,
  Download,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface Purchase {
  id: string;
  packageName: string;
  shopName: string;
  shopSlug: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
  type: 'one_time' | 'subscription';
  billingCycle?: string;
  nextBillingDate?: string;
  downloadUrl?: string;
  invoiceUrl?: string;
}

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

export default function CustomerDashboard() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'purchases' | 'subscriptions'>('overview');

  useEffect(() => {
    // Simulate loading customer data
    setTimeout(() => {
      setPurchases([
        {
          id: '1',
          packageName: 'Premium Analytics Suite',
          shopName: 'DataPro Analytics',
          shopSlug: 'datapro-analytics',
          amount: 99.99,
          status: 'completed',
          date: '2024-01-15',
          type: 'subscription',
          billingCycle: 'monthly',
          nextBillingDate: '2024-02-15',
          downloadUrl: 'https://example.com/download/1',
          invoiceUrl: 'https://example.com/invoice/1'
        },
        {
          id: '2',
          packageName: 'Marketing Template Pack',
          shopName: 'Creative Templates',
          shopSlug: 'creative-templates',
          amount: 49.99,
          status: 'completed',
          date: '2024-01-10',
          type: 'one_time',
          downloadUrl: 'https://example.com/download/2',
          invoiceUrl: 'https://example.com/invoice/2'
        },
        {
          id: '3',
          packageName: 'SEO Tools Bundle',
          shopName: 'SEO Masters',
          shopSlug: 'seo-masters',
          amount: 149.99,
          status: 'pending',
          date: '2024-01-20',
          type: 'subscription',
          billingCycle: 'yearly',
          nextBillingDate: '2025-01-20'
        }
      ]);

      setSubscriptions([
        {
          id: '1',
          packageName: 'Premium Analytics Suite',
          shopName: 'DataPro Analytics',
          shopSlug: 'datapro-analytics',
          amount: 99.99,
          status: 'active',
          billingCycle: 'monthly',
          currentPeriodStart: '2024-01-15',
          currentPeriodEnd: '2024-02-15',
          nextBillingDate: '2024-02-15',
          cancelAtPeriodEnd: false,
          paymentMethod: {
            brand: 'visa',
            last4: '4242',
            expiresMonth: 12,
            expiresYear: 2024
          }
        },
        {
          id: '3',
          packageName: 'SEO Tools Bundle',
          shopName: 'SEO Masters',
          shopSlug: 'seo-masters',
          amount: 149.99,
          status: 'past_due',
          billingCycle: 'yearly',
          currentPeriodStart: '2024-01-20',
          currentPeriodEnd: '2025-01-20',
          nextBillingDate: '2025-01-20',
          cancelAtPeriodEnd: false,
          paymentMethod: {
            brand: 'mastercard',
            last4: '5555',
            expiresMonth: 8,
            expiresYear: 2025
          }
        }
      ]);

      setIsLoading(false);
    }, 1000);
  }, []);

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
      case 'past_due':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'past_due':
        return 'bg-orange-100 text-orange-800';
      case 'failed':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalSpent = purchases
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const activeSubscriptionsCount = subscriptions.filter(s => s.status === 'active').length;
  const monthlySpending = subscriptions
    .filter(s => s.status === 'active' && s.billingCycle === 'monthly')
    .reduce((sum, s) => sum + s.amount, 0);

  const savedAmount = 249.99; // Example savings from deals and discounts
  const memberSince = '2022-01-15';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Customer Dashboard</h1>
              <p className="text-gray-500">Manage your purchases and subscriptions</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="text-gray-500 hover:text-gray-700"
              >
                Browse Packages
              </Link>
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Settings className="w-4 h-4" />
                <span>Account Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <CustomerStats
          totalSpent={totalSpent}
          totalPurchases={purchases.length}
          activeSubscriptions={activeSubscriptionsCount}
          monthlySpending={monthlySpending}
          savedAmount={savedAmount}
          memberSince={memberSince}
        />

        {/* Navigation Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'purchases'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Purchase History ({purchases.length})
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'subscriptions'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Subscriptions ({subscriptions.length})
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Purchases */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Purchases</h2>
              </div>
              <div className="p-6">
                {purchases.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No purchases yet</p>
                    <Link
                      href="/"
                      className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Browse Packages
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {purchases.slice(0, 3).map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{purchase.packageName}</p>
                            <p className="text-sm text-gray-500">{purchase.shopName}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(purchase.amount)}</p>
                          <div className="flex items-center justify-end space-x-1 mt-1">
                            {getStatusIcon(purchase.status)}
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(purchase.status)}`}>
                              {purchase.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {purchases.length > 3 && (
                      <button
                        onClick={() => setActiveTab('purchases')}
                        className="w-full py-2 text-center text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View All Purchases →
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Active Subscriptions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Active Subscriptions</h2>
              </div>
              <div className="p-6">
                {subscriptions.filter(s => s.status === 'active').length === 0 ? (
                  <div className="text-center py-8">
                    <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No active subscriptions</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscriptions.filter(s => s.status === 'active').map((subscription) => (
                      <div key={subscription.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{subscription.packageName}</p>
                            <p className="text-sm text-gray-500">{subscription.shopName} • {subscription.billingCycle}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(subscription.amount)}/{subscription.billingCycle.slice(0, -2)}</p>
                          <p className="text-sm text-gray-500">Next: {formatDate(subscription.nextBillingDate)}</p>
                        </div>
                      </div>
                    ))}
                    <button
                      onClick={() => setActiveTab('subscriptions')}
                      className="w-full py-2 text-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Manage All Subscriptions →
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'purchases' && (
          <PurchaseHistory purchases={purchases} />
        )}

        {activeTab === 'subscriptions' && (
          <SubscriptionManager
            subscriptions={subscriptions}
            onManageSubscription={(subscriptionId, action) => {
              console.log(`Managing subscription ${subscriptionId} with action: ${action}`);
              // Handle subscription management
            }}
          />
        )}
      </div>
    </div>
  );
}