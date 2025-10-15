import { useState, useEffect } from 'react';
import { purchaseApi } from '@/lib/api';
import { Purchase, PurchaseStats, BillingCycle } from '@/types/package';

export const usePurchases = (userId: string) => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [activePurchases, setActivePurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await purchaseApi.getByUserId(userId);
      setPurchases(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch purchases');
      console.error('Error fetching purchases:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivePurchases = async () => {
    try {
      const response = await purchaseApi.getActivePurchases(userId);
      setActivePurchases(response.data);
    } catch (err) {
      console.error('Error fetching active purchases:', err);
    }
  };

  const renewPurchase = async (purchaseId: string) => {
    try {
      const response = await purchaseApi.renew(purchaseId);
      // Update the purchase in the local state
      setPurchases(prev =>
        prev.map(p => p.id === purchaseId ? response.data : p)
      );
      return response.data;
    } catch (err) {
      console.error('Error renewing purchase:', err);
      throw err;
    }
  };

  const cancelPurchase = async (purchaseId: string) => {
    try {
      const response = await purchaseApi.cancel(purchaseId);
      // Update the purchase in the local state
      setPurchases(prev =>
        prev.map(p => p.id === purchaseId ? response.data : p)
      );
      return response.data;
    } catch (err) {
      console.error('Error cancelling purchase:', err);
      throw err;
    }
  };

  const extendPurchase = async (purchaseId: string, days: number) => {
    try {
      const response = await purchaseApi.extend(purchaseId, days);
      // Update the purchase in the local state
      setPurchases(prev =>
        prev.map(p => p.id === purchaseId ? response.data : p)
      );
      return response.data;
    } catch (err) {
      console.error('Error extending purchase:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPurchases();
      fetchActivePurchases();
    }
  }, [userId]);

  return {
    purchases,
    activePurchases,
    loading,
    error,
    refetch: fetchPurchases,
    renewPurchase,
    cancelPurchase,
    extendPurchase,
  };
};

export const usePurchaseStats = (userId?: string) => {
  const [stats, setStats] = useState<PurchaseStats>({
    total: 0,
    active: 0,
    expired: 0,
    totalSpent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await purchaseApi.getStats(userId);
      setStats(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch purchase stats');
      console.error('Error fetching purchase stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Helper functions for purchase status and calculations
export const getPurchaseStatus = (purchase: Purchase): {
  status: 'active' | 'expired' | 'pending' | 'cancelled' | 'refunded';
  label: string;
  color: string;
  bgColor: string;
} => {
  const now = new Date();
  const endDate = new Date(purchase.endDate);

  if (purchase.status === 'cancelled') {
    return {
      status: 'cancelled',
      label: 'Cancelled',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    };
  }

  if (purchase.status === 'refunded') {
    return {
      status: 'refunded',
      label: 'Refunded',
      color: 'text-gray-600',
      bgColor: 'bg-gray-100',
    };
  }

  if (purchase.status === 'pending') {
    return {
      status: 'pending',
      label: 'Pending',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    };
  }

  if (endDate < now) {
    return {
      status: 'expired',
      label: 'Expired',
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    };
  }

  return {
    status: 'active',
    label: 'Active',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  };
};

export const getDaysRemaining = (endDate: string): number => {
  const now = new Date();
  const end = new Date(endDate);
  const diffTime = end.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getBillingCycleLabel = (cycle: BillingCycle): string => {
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
};

export const formatPrice = (price: number | string): string => {
  return `$${Number(price).toFixed(2)}`;
};