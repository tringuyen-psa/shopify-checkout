export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'shop_owner' | 'platform_admin';
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  stripeCustomerId?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Shop {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  stripeAccountId: string | null;
  stripeOnboardingComplete: boolean;
  stripeChargesEnabled: boolean;
  stripePayoutsEnabled: boolean;
  description?: string;
  logo?: string;
  email: string;
  phone?: string;
  website?: string;
  platformFeePercent: number;
  isActive: boolean;
  status: 'pending' | 'active' | 'suspended' | 'rejected';
  createdAt: string;
  updatedAt: string;
  packages?: Package[];
}

export interface Package {
  id: string;
  shopId: string;
  name: string;
  slug: string;
  description?: string;
  features?: string[];
  images?: string[];
  category?: string;
  isSubscription: boolean;
  trialDays?: number;
  basePrice: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  shop?: Shop;
  purchases?: Purchase[];
  subscriptions?: Subscription[];
}

export interface Purchase {
  id: string;
  packageId: string;
  shopId: string;
  userId: string;
  billingCycle: 'one_time' | 'weekly' | 'monthly' | 'yearly';
  price: number;
  platformFee: number;
  status: 'pending' | 'completed' | 'cancelled' | 'expired' | 'refunded';
  paymentMethod: 'stripe_card' | 'stripe_popup' | 'paypal' | 'stripe';
  paymentId?: string;
  customerEmail: string;
  customerName: string;
  startDate: string;
  endDate: string;
  isRecurring: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  package?: Package;
  user?: User;
  shop?: Shop;
  subscription?: Subscription;
}

export interface Subscription {
  id: string;
  purchaseId: string;
  packageId: string;
  shopId: string;
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  billingCycle: 'weekly' | 'monthly' | 'yearly';
  price: number;
  platformFee: number;
  shopRevenue: number;
  status: 'active' | 'cancelled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  cancelledAt?: string;
  trialStart?: string;
  trialEnd?: string;
  createdAt: string;
  updatedAt: string;
  purchase?: Purchase;
  package?: Package;
  shop?: Shop;
  user?: User;
}

export interface CheckoutSession {
  id: string;
  sessionId: string;
  packageId: string;
  shopId: string;
  email?: string;
  name?: string;
  billingCycle: 'one_time' | 'weekly' | 'monthly' | 'yearly';
  price: number;
  platformFee: number;
  stripeCheckoutSessionId?: string;
  status: 'pending' | 'completed' | 'expired';
  expiresAt: string;
  customAmount?: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  package?: Package;
  shop?: Shop;
}

export interface BillingCycle {
  value: 'one_time' | 'weekly' | 'monthly' | 'yearly';
  label: string;
  price: number;
  description?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateShopDto {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  email: string;
  phone?: string;
  website?: string;
  platformFeePercent?: number;
}

export interface CreatePackageDto {
  shopId: string;
  name: string;
  slug: string;
  description?: string;
  features?: string[];
  images?: string[];
  category?: string;
  isSubscription: boolean;
  trialDays?: number;
  basePrice: number;
  weeklyPrice?: number;
  monthlyPrice?: number;
  yearlyPrice?: number;
}

export interface CreateCheckoutSessionDto {
  packageId: string;
  billingCycle: 'one_time' | 'weekly' | 'monthly' | 'yearly';
  email?: string;
  name?: string;
  customAmount?: number;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, any>;
}