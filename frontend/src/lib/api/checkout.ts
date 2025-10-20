import { apiClient } from './client';

export interface CheckoutSession {
  id: string;
  sessionId: string;
  packageId: string;
  shopId: string;
  email?: string;
  name?: string;
  billingCycle: string;
  price: number;
  platformFee: number;
  status: 'pending' | 'completed' | 'expired';
  expiresAt: string;
  stripeCheckoutSessionId?: string;
  package?: {
    id: string;
    name: string;
    description: string;
    isSubscription: boolean;
  };
  shop?: {
    id: string;
    name: string;
    platformFeePercent: number;
  };
}

export interface CreateCheckoutSessionRequest {
  packageId: string;
  billingCycle: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export interface CreateStripeCheckoutRequest {
  email: string;
  name: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
}

export class CheckoutAPI {
  static async getCheckoutSession(sessionId: string): Promise<CheckoutSession | null> {
    try {
      const response = await apiClient.get(`/checkout/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching checkout session:', error);
      return null;
    }
  }

  static async createCheckoutSession(data: CreateCheckoutSessionRequest): Promise<{
    sessionId: string;
    checkoutUrl: string;
  }> {
    const response = await apiClient.post('/checkout/create-session', data);
    return response.data;
  }

  static async createStripeCheckout(
    sessionId: string,
    data: CreateStripeCheckoutRequest
  ): Promise<{ url: string }> {
    const response = await apiClient.post(`/checkout/${sessionId}/stripe`, data);
    return response.data;
  }
}