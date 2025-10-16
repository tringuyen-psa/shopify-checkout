export interface CreatePaymentIntentRequest {
  amount: number;
  currency?: string;
  customerEmail?: string;
}

export interface CreateCheckoutSessionRequest {
  packageName: string;
  price: number;
  customerEmail: string;
  successUrl?: string;
  cancelUrl?: string;
}

export interface PaymentIntent {
  id: string;
  client_secret: string;
  amount: number;
  currency: string;
}

export interface CheckoutSession {
  sessionId: string;
  checkoutUrl: string;
}

export class StripePaymentService {
  private static BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:29000';

  static async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntent> {
    const response = await fetch(`${this.BASE_URL}/payments/stripe/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create payment intent');
    }

    return response.json();
  }

  static async createCheckoutSession(data: CreateCheckoutSessionRequest): Promise<CheckoutSession> {
    console.log('Creating checkout session with data:', data);
    console.log('API URL:', `${this.BASE_URL}/payments/stripe/create-checkout`);

    const response = await fetch(`${this.BASE_URL}/payments/stripe/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      throw new Error(`Failed to create checkout session: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Checkout session response:', result);
    return result;
  }

  static async confirmPayment(paymentIntentId: string): Promise<any> {
    const response = await fetch(`${this.BASE_URL}/payments/stripe/confirm-payment/${paymentIntentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to confirm payment');
    }

    return response.json();
  }

  static async cancelPayment(paymentIntentId: string): Promise<any> {
    const response = await fetch(`${this.BASE_URL}/payments/stripe/cancel-payment/${paymentIntentId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to cancel payment');
    }

    return response.json();
  }

  static async getStripeConfig(): Promise<{ publishableKey: string }> {
    const response = await fetch(`${this.BASE_URL}/payments/stripe/config`);

    if (!response.ok) {
      throw new Error('Failed to get Stripe config');
    }

    return response.json();
  }

  // Note: loadStripeScript is no longer needed since we use react-stripe-js
  // This method is kept for backward compatibility
  static loadStripeScript(): Promise<void> {
    return Promise.resolve();
  }
}