export enum BillingCycle {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export interface Package {
  id: string;
  name: string;
  description?: string;
  basePrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  features?: string[];
  isActive: boolean;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackageDto {
  name: string;
  description?: string;
  basePrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  yearlyPrice: number;
  features?: string[];
  isActive?: boolean;
  imageUrl?: string;
}

export enum PurchaseStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
}

export enum PaymentMethod {
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

export interface Purchase {
  id: string;
  packageId: string;
  userId: string;
  billingCycle: BillingCycle;
  price: number;
  status: PurchaseStatus;
  paymentMethod: PaymentMethod;
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
}

export interface PurchaseStats {
  total: number;
  active: number;
  expired: number;
  totalSpent: number;
}