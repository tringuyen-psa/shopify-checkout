'use client';

import { useState, useEffect } from 'react';
import {
  BarChart3,
  Package,
  Users,
  DollarSign,
  TrendingUp,
  Plus,
  Settings,
  CreditCard,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { ShopDashboardAPI, DashboardStats, TopPackage, SubscriptionMetrics } from '@/lib/api/shop-dashboard';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { TopPackagesChart } from '@/components/dashboard/TopPackagesChart';
import { RecentSalesTable } from '@/components/dashboard/RecentSalesTable';
import { PackageManagement } from '@/components/dashboard/PackageManagement';
import { SubscriptionMetrics as SubscriptionMetricsComponent } from '@/components/dashboard/SubscriptionMetrics';

export default function ShopDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topPackages, setTopPackages] = useState<TopPackage[]>([]);
  const [subscriptionMetrics, setSubscriptionMetrics] = useState<SubscriptionMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'packages' | 'analytics'>('overview');

  // Mock shop ID - in real app, get from auth context
  const shopId = 'user-shop-id';

  useEffect(() => {
    loadDashboardData();
  }, [shopId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsData, topPackagesData, subscriptionData] = await Promise.all([
        ShopDashboardAPI.getDashboardStats(shopId),
        ShopDashboardAPI.getTopPackages(shopId),
        ShopDashboardAPI.getSubscriptionMetrics(shopId)
      ]);

      setStats(statsData);
      setTopPackages(topPackagesData);
      setSubscriptionMetrics(subscriptionData);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
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
              <h1 className="text-2xl font-bold text-gray-900">Shop Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </button>
              <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Payouts
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'packages', label: 'Packages', icon: Package },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats?.revenue.total.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${stats?.revenue.net.toFixed(2) || '0.00'} after fees
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Subscriptions</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.subscriptions.active || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stats?.subscriptions.total || 0} total
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Package className="w-4 h-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Packages</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats?.packages.active || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {stats?.packages.total || 0} total
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-yellow-600" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Platform Fees</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${stats?.revenue.platformFees.toFixed(2) || '0.00'}
                    </p>
                    <p className="text-xs text-gray-500">This month</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                <RevenueChart data={stats?.revenue.monthly || []} />
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Packages</h3>
                <TopPackagesChart data={topPackages} />
              </div>
            </div>

            {/* Recent Sales */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
              <RecentSalesTable sales={stats?.recentSales || []} />
            </div>
          </div>
        )}

        {activeTab === 'packages' && (
          <PackageManagement shopId={shopId} onPackageUpdated={loadDashboardData} />
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SubscriptionMetricsComponent metrics={subscriptionMetrics} />
              <TopPackagesChart data={topPackages} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}