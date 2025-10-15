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
    const response = await fetch(`${this.BASE_URL}/payments/stripe/create-checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create checkout session');
    }

    return response.json();
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

  static loadStripeScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Stripe) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Stripe script'));
      document.body.appendChild(script);
    });
  }
}