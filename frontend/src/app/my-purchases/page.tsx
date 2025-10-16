'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePurchases, usePurchaseStats } from '@/hooks/usePurchases';
import { PurchaseCard } from '@/components/PurchaseCard';
import { Button } from '@/components/ui/Button';
import { Package as PackageIcon, User, ArrowLeft, TrendingUp, Calendar, DollarSign, CheckCircle } from 'lucide-react';

// Mock user ID - in a real app, this would come from authentication
const CURRENT_USER_ID = 'sample-user-123';

function MyPurchasesPage() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'expired' | 'pending' | 'cancelled'>('all');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const {
    purchases,
    activePurchases,
    loading,
    error,
    refetch,
    renewPurchase,
    cancelPurchase,
    extendPurchase,
  } = usePurchases(CURRENT_USER_ID);

  const { stats, loading: statsLoading } = usePurchaseStats(CURRENT_USER_ID);

  // Debug: Log purchase data to investigate discrepancy
  useEffect(() => {
    if (purchases.length > 0 && stats.total > 0) {
      const activeCount = purchases.filter(p => {
        const now = new Date();
        const endDate = new Date(p.endDate);
        return p.status === 'completed' && endDate > now;
      }).length;

      console.log('=== Purchase Data Debug ===');
      console.log('Total purchases from API:', purchases.length);
      console.log('Stats from API:', stats);
      console.log('Calculated active count:', activeCount);
      console.log('Active purchases from hook:', activePurchases.length);
      console.log('All purchases:', purchases.map(p => ({
        id: p.id,
        status: p.status,
        endDate: p.endDate,
        packageName: p.package?.name
      })));
    }
  }, [purchases, stats, activePurchases]);

  // Check if user is coming from successful payment
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    if (sessionId) {
      setShowSuccessMessage(true);
      // Hide success message after 5 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const filteredPurchases = purchases.filter(purchase => {
    const now = new Date();
    const endDate = new Date(purchase.endDate);

    switch (activeTab) {
      case 'active':
        return purchase.status === 'completed' && endDate > now;
      case 'expired':
        return purchase.status === 'completed' && endDate <= now;
      case 'pending':
        return purchase.status === 'pending';
      case 'cancelled':
        return purchase.status === 'cancelled';
      default:
        return true;
    }
  });

  const handleBackToHome = () => {
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading your purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="bg-green-50 border-b border-green-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-green-800">Payment Successful!</h3>
                <p className="text-green-700">Your purchase has been completed and is now active.</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuccessMessage(false)}
                className="ml-auto text-green-600 hover:text-green-800"
              >
                ×
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={handleBackToHome}
                className="mr-4 p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                <User className="h-8 w-8 text-black mr-3" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">My Purchases</h1>
                  <p className="text-sm text-gray-600">Manage your digital packages and subscriptions</p>
                </div>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => window.location.href = '/'}
            >
              <PackageIcon className="h-4 w-4 mr-2" />
              Browse Packages
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Cards */}
      {!statsLoading && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <PackageIcon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-red-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Expired</p>
                  <p className="text-2xl font-bold text-red-600">{stats.expired}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center mb-8">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Purchases</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={refetch}>Try Again</Button>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('all')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Purchases ({purchases.length})
              </button>
              <button
                onClick={() => setActiveTab('active')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'active'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Active ({purchases.filter(p => {
                const now = new Date();
                const endDate = new Date(p.endDate);
                return p.status === 'completed' && endDate > now;
              }).length})
              </button>
              <button
                onClick={() => setActiveTab('expired')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'expired'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Expired ({purchases.filter(p => {
                  const now = new Date();
                  const endDate = new Date(p.endDate);
                  return p.status === 'completed' && endDate <= now;
                }).length})
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending ({purchases.filter(p => p.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab('cancelled')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'cancelled'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Cancelled ({purchases.filter(p => p.status === 'cancelled').length})
              </button>
            </nav>
          </div>
        </div>

        {/* Empty State */}
        {filteredPurchases.length === 0 && !error && (
          <div className="text-center py-16">
            <PackageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {activeTab === 'all' ? 'No purchases yet' :
               activeTab === 'active' ? 'No active purchases' :
               activeTab === 'expired' ? 'No expired purchases' :
               activeTab === 'pending' ? 'No pending purchases' :
               activeTab === 'cancelled' ? 'No cancelled purchases' :
               `No ${activeTab} purchases`}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all'
                ? 'Start by browsing our packages and making your first purchase.'
                : activeTab === 'active'
                ? 'You don\'t have any active purchases at the moment.'
                : activeTab === 'expired'
                ? 'You don\'t have any expired purchases.'
                : activeTab === 'pending'
                ? 'You don\'t have any pending purchases.'
                : activeTab === 'cancelled'
                ? 'You don\'t have any cancelled purchases.'
                : `You don't have any ${activeTab} purchases at the moment.`
              }
            </p>
            <Button onClick={() => window.location.href = '/'}>
              Browse Packages
            </Button>
          </div>
        )}

        {/* Purchases Grid */}
        {filteredPurchases.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPurchases.map((purchase) => (
              <PurchaseCard
                key={purchase.id}
                purchase={purchase}
                onRenew={renewPurchase}
                onCancel={cancelPurchase}
                onExtend={extendPurchase}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

// Wrapper component to handle Suspense for useSearchParams
function MyPurchasesPageWrapper() {
  return (
    <React.Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          <p className="mt-4 text-gray-600">Loading your purchases...</p>
        </div>
      </div>
    }>
      <MyPurchasesPage />
    </React.Suspense>
  );
}

export default MyPurchasesPageWrapper;