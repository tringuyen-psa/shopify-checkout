import { Package } from "./package";

export enum PurchaseStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  STRIPE_CARD = "stripe_card",
  PAYPAL = "paypal",
  STRIPE_POPUP = "stripe_popup",
}

export interface Purchase {
  id: string;
  packageId: string;
  userId: string;
  billingCycle: string;
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

export interface CreatePurchaseDto {
  packageId: string;
  userId: string;
  billingCycle: string;
  paymentMethod: PaymentMethod;
  customerEmail: string;
  customerName: string;
  isRecurring?: boolean;
  metadata?: Record<string, any>;
}

export interface PurchaseStats {
  total: number;
  active: number;
  expired: number;
  totalSpent: number;
}
