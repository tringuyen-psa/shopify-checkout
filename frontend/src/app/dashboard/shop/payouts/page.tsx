'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { DollarSign, Calendar, ExternalLink, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { DashboardNav } from '@/components/dashboard/DashboardNav';

interface Payout {
  id: string;
  amount: number;
  status: 'pending' | 'in_transit' | 'paid' | 'failed';
  arrivalDate: string;
  createdAt: string;
  description?: string;
}

interface PayoutSummary {
  availableBalance: number;
  pendingBalance: number;
  lifetimePayouts: number;
  nextPayoutDate?: string;
}

export default function ShopPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<PayoutSummary>({
    availableBalance: 0,
    pendingBalance: 0,
    lifetimePayouts: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock shop ID - in real app, get from auth context
  const shopId = 'user-shop-id';

  useEffect(() => {
    loadPayouts();
  }, [shopId]);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      // In real app, fetch from API
      // const [payoutsData, summaryData] = await Promise.all([
      //   ShopAPI.getPayouts(shopId),
      //   ShopAPI.getPayoutSummary(shopId)
      // ]);
      // setPayouts(payoutsData);
      // setSummary(summaryData);

      // Mock data for now
      setPayouts([
        {
          id: 'payout_1',
          amount: 1245.50,
          status: 'paid',
          arrivalDate: '2024-01-15',
          createdAt: '2024-01-13',
          description: 'Monthly payout for January'
        },
        {
          id: 'payout_2',
          amount: 2341.20,
          status: 'in_transit',
          arrivalDate: '2024-02-15',
          createdAt: '2024-02-13',
          description: 'Monthly payout for February'
        },
        {
          id: 'payout_3',
          amount: 1876.80,
          status: 'pending',
          arrivalDate: '2024-03-15',
          createdAt: '2024-03-01',
          description: 'Monthly payout for March'
        }
      ]);

      setSummary({
        availableBalance: 543.20,
        pendingBalance: 1876.80,
        lifetimePayouts: 3586.70,
        nextPayoutDate: '2024-03-15'
      });
    } catch (error) {
      console.error('Error loading payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_transit':
        return <ExternalLink className="w-4 h-4 text-blue-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: {
        label: 'Paid',
        className: 'bg-green-100 text-green-800'
      },
      in_transit: {
        label: 'In Transit',
        className: 'bg-blue-100 text-blue-800'
      },
      pending: {
        label: 'Pending',
        className: 'bg-yellow-100 text-yellow-800'
      },
      failed: {
        label: 'Failed',
        className: 'bg-red-100 text-red-800'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {getStatusIcon(status)}
        <span className="ml-1">{config.label}</span>
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <div className="w-64 bg-white shadow-sm">
          <DashboardNav shopId={shopId} />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-sm">
        <DashboardNav shopId={shopId} />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
            <p className="text-gray-600">Track your earnings and payout history</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-green-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.availableBalance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-yellow-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Balance</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.pendingBalance)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Lifetime Payouts</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(summary.lifetimePayouts)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Next Payout Info */}
          {summary.nextPayoutDate && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Next Payout Date</p>
                  <p className="text-sm text-blue-700">
                    {format(new Date(summary.nextPayoutDate), 'MMMM d, yyyy')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Payout History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Payout History</h2>
            </div>

            {payouts.length === 0 ? (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payouts yet</h3>
                <p className="text-gray-600">Your payout history will appear here once you start earning</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Arrival Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(payout.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payout.description || 'Payout'}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {payout.id.slice(0, 8)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(payout.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(payout.arrivalDate), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button className="text-blue-600 hover:text-blue-900 font-medium">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Payout Schedule Info */}
          <div className="mt-8 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Payout Schedule</h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Weekly Payouts</p>
                  <p className="text-sm text-gray-600">Payouts are processed weekly with a 7-day rolling period</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Processing Time</p>
                  <p className="text-sm text-gray-600">Pending payouts typically take 2-3 business days to process</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Minimum Payout</p>
                  <p className="text-sm text-gray-600">Minimum payout amount is $10.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}