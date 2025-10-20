'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Home, Package, BarChart3, Settings, CreditCard, LogOut } from 'lucide-react';

interface DashboardNavProps {
  shopId: string;
}

export function DashboardNav({ shopId }: DashboardNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Overview',
      href: `/dashboard/shop`,
      icon: Home,
      current: pathname === '/dashboard/shop'
    },
    {
      name: 'Packages',
      href: `/dashboard/shop?tab=packages`,
      icon: Package,
      current: pathname === '/dashboard/shop' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'packages'
    },
    {
      name: 'Analytics',
      href: `/dashboard/shop?tab=analytics`,
      icon: BarChart3,
      current: pathname === '/dashboard/shop' && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('tab') === 'analytics'
    },
    {
      name: 'Settings',
      href: `/dashboard/shop/settings`,
      icon: Settings,
      current: pathname === '/dashboard/shop/settings'
    },
    {
      name: 'Payouts',
      href: `/dashboard/shop/payouts`,
      icon: CreditCard,
      current: pathname === '/dashboard/shop/payouts'
    }
  ];

  const handleLogout = () => {
    // Handle logout logic here
    router.push('/login');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="ml-2 text-xl font-bold text-gray-900">Shopify</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <button
            key={item.name}
            onClick={() => router.push(item.href)}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
              item.current
                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
          </button>
        ))}
      </nav>

      {/* User Menu */}
      <div className="border-t border-gray-200 p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}