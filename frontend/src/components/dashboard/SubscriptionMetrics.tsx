'use client';

import { Users, CreditCard, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface SubscriptionMetrics {
  total: number;
  active: number;
  canceled: number;
  pastDue: number;
  trial: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

interface SubscriptionMetricsProps {
  metrics: SubscriptionMetrics | null;
}

export function SubscriptionMetrics({ metrics }: SubscriptionMetricsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(value);
  };

  if (!metrics) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Metrics</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const statusCards = [
    {
      label: 'Active',
      value: metrics.active,
      color: 'green',
      icon: CheckCircle,
      description: 'Currently paying subscribers'
    },
    {
      label: 'Trial',
      value: metrics.trial,
      color: 'blue',
      icon: Users,
      description: 'Free trial users'
    },
    {
      label: 'Past Due',
      value: metrics.pastDue,
      color: 'yellow',
      icon: AlertTriangle,
      description: 'Payment issues'
    },
    {
      label: 'Canceled',
      value: metrics.canceled,
      color: 'red',
      icon: CreditCard,
      description: 'Former subscribers'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        border: 'border-green-200'
      },
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        border: 'border-blue-200'
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        border: 'border-yellow-200'
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        border: 'border-red-200'
      }
    };
    return colors[color as keyof typeof colors] || colors.green;
  };

  const totalRevenue = metrics.monthlyRevenue + (metrics.yearlyRevenue / 12);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Subscription Metrics</h3>

      {/* Status Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {statusCards.map((card) => {
          const colors = getColorClasses(card.color);
          return (
            <div
              key={card.label}
              className={`border rounded-lg p-4 ${colors.border} ${colors.bg}`}
            >
              <div className="flex items-center">
                <card.icon className={`w-5 h-5 ${colors.text} mr-3`} />
                <div>
                  <p className="text-sm text-gray-600">{card.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Section */}
      <div className="border-t pt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-4">Monthly Recurring Revenue (MRR)</h4>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Monthly Subscriptions</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(metrics.monthlyRevenue)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Yearly Subscriptions (Monthly Equivalent)</span>
            <span className="text-sm font-medium text-gray-900">
              {formatCurrency(metrics.yearlyRevenue / 12)}
            </span>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-900">Total MRR</span>
              <span className="text-lg font-bold text-green-600">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Summary */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
          <p className="text-sm text-gray-600">Total Subscriptions</p>
        </div>

        <div className="text-center">
          <div className="flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-green-500 mr-1" />
            <p className="text-2xl font-bold text-gray-900">
              {metrics.total > 0 ? Math.round((metrics.active / metrics.total) * 100) : 0}%
            </p>
          </div>
          <p className="text-sm text-gray-600">Retention Rate</p>
        </div>
      </div>
    </div>
  );
}