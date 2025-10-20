import { apiClient } from './client';

export interface DashboardStats {
  revenue: {
    total: number;
    net: number;
    platformFees: number;
    monthly: Array<{
      month: string;
      revenue: number;
    }>;
  };
  subscriptions: {
    active: number;
    total: number;
  };
  packages: {
    total: number;
    active: number;
  };
  recentSales: Array<{
    id: string;
    price: number;
    createdAt: string;
    package: {
      name: string;
    };
  }>;
}

export interface PackageFormData {
  name: string;
  description: string;
  category?: string;
  images?: string[];
  isSubscription?: boolean;
  trialDays?: number;
  basePrice?: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  features?: string[];
  maxActiveUsers?: number;
  isActive?: boolean;
}

export interface TopPackage {
  id: string;
  name: string;
  salesCount: number;
  totalRevenue: number;
}

export interface SubscriptionMetrics {
  total: number;
  active: number;
  canceled: number;
  pastDue: number;
  trial: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
}

export class ShopDashboardAPI {
  // Dashboard Stats
  static async getDashboardStats(
    shopId: string,
    startDate?: string,
    endDate?: string
  ): Promise<DashboardStats> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await apiClient.get(`/shops/${shopId}/dashboard/stats?${params}`);
    return response.data;
  }

  // Package Management
  static async getShopPackages(shopId: string) {
    const response = await apiClient.get(`/shops/${shopId}/dashboard/packages`);
    return response.data;
  }

  static async createShopPackage(shopId: string, packageData: PackageFormData) {
    const response = await apiClient.post(`/shops/${shopId}/dashboard/packages`, packageData);
    return response.data;
  }

  static async updateShopPackage(shopId: string, packageId: string, packageData: Partial<PackageFormData>) {
    const response = await apiClient.patch(`/shops/${shopId}/dashboard/packages/${packageId}`, packageData);
    return response.data;
  }

  static async deleteShopPackage(shopId: string, packageId: string) {
    await apiClient.delete(`/shops/${shopId}/dashboard/packages/${packageId}`);
  }

  // Analytics
  static async getTopPackages(shopId: string, limit: number = 5): Promise<TopPackage[]> {
    const response = await apiClient.get(`/shops/${shopId}/dashboard/analytics/top-packages?limit=${limit}`);
    return response.data;
  }

  static async getSubscriptionMetrics(shopId: string): Promise<SubscriptionMetrics> {
    const response = await apiClient.get(`/shops/${shopId}/dashboard/analytics/subscriptions`);
    return response.data;
  }
}