import { CreatePurchaseDto, Purchase, PaymentMethod } from '@/types/purchase';
import { BillingCycle } from '@/types/package';

export interface PurchaseRequest extends Omit<CreatePurchaseDto, 'billingCycle'> {
  billingCycle: BillingCycle;
}

export class PurchaseService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:29000';

  static async createPurchase(data: PurchaseRequest): Promise<Purchase> {
    const response = await fetch(`${this.BASE_URL}/purchases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create purchase');
    }

    return response.json();
  }

  static async completePurchase(purchaseId: string, paymentId: string): Promise<Purchase> {
    const response = await fetch(`${this.BASE_URL}/purchases/${purchaseId}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ paymentId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete purchase');
    }

    return response.json();
  }

  static async getPurchase(purchaseId: string): Promise<Purchase> {
    const response = await fetch(`${this.BASE_URL}/purchases/${purchaseId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get purchase');
    }

    return response.json();
  }

  static async getUserPurchases(userId: string): Promise<Purchase[]> {
    const response = await fetch(`${this.BASE_URL}/purchases/user/${userId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user purchases');
    }

    return response.json();
  }

  static async cancelPurchase(purchaseId: string): Promise<Purchase> {
    const response = await fetch(`${this.BASE_URL}/purchases/${purchaseId}/cancel`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel purchase');
    }

    return response.json();
  }
}