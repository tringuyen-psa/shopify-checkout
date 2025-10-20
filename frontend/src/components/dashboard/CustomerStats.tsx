'use client';

import { TrendingUp, DollarSign, Package, Calendar, Users, Clock } from 'lucide-react';

interface CustomerStatsProps {
  totalSpent: number;
  totalPurchases: number;
  activeSubscriptions: number;
  monthlySpending: number;
  savedAmount: number;
  memberSince: string;
}

export function CustomerStats({
  totalSpent,
  totalPurchases,
  activeSubscriptions,
  monthlySpending,
  savedAmount,
  memberSince
}: CustomerStatsProps) {
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
    });
  };

  const stats = [
    {
      label: 'Total Spent',
      value: formatCurrency(totalSpent),
      icon: DollarSign,
      color: 'blue',
      trend: '+12% from last month',
      trendUp: true
    },
    {
      label: 'Total Purchases',
      value: totalPurchases.toString(),
      icon: Package,
      color: 'green',
      trend: '+3 this week',
      trendUp: true
    },
    {
      label: 'Active Subscriptions',
      value: activeSubscriptions.toString(),
      icon: Calendar,
      color: 'purple',
      trend: 'No change',
      trendUp: null
    },
    {
      label: 'Monthly Spending',
      value: formatCurrency(monthlySpending),
      icon: Clock,
      color: 'orange',
      trend: '-5% from last month',
      trendUp: false
    },
    {
      label: 'Total Saved',
      value: formatCurrency(savedAmount),
      icon: TrendingUp,
      color: 'emerald',
      trend: '+$25 this month',
      trendUp: true
    },
    {
      label: 'Member Since',
      value: formatDate(memberSince),
      icon: Users,
      color: 'indigo',
      trend: '2+ years',
      trendUp: null
    }
  ];

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-100 text-blue-600',
      green: 'bg-green-100 text-green-600',
      purple: 'bg-purple-100 text-purple-600',
      orange: 'bg-orange-100 text-orange-600',
      emerald: 'bg-emerald-100 text-emerald-600',
      indigo: 'bg-indigo-100 text-indigo-600',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${getColorClasses(stat.color)} rounded-lg flex items-center justify-center`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="text-right">
                {stat.trendUp !== null && (
                  <div className={`flex items-center text-sm ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${!stat.trendUp ? 'rotate-180' : ''}`} />
                    <span>{stat.trend}</span>
                  </div>
                )}
                {stat.trendUp === null && (
                  <span className="text-sm text-gray-500">{stat.trend}</span>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}