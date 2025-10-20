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

