import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY'), {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createCheckoutSession(
    packageName: string,
    price: number,
    customerEmail: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ sessionId: string; checkoutUrl: string }> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: packageName,
              },
              unit_amount: Math.round(price * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        customer_email: customerEmail,
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          packageName,
        },
      });

      return {
        sessionId: session.id,
        checkoutUrl: session.url,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to create Stripe session: ${error.message}`);
    }
  }

  async retrieveCheckoutSession(sessionId: string): Promise<Stripe.Checkout.Session> {
    try {
      return await this.stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve Stripe session: ${error.message}`);
    }
  }

  async constructEvent(
    payload: string,
    signature: string,
  ): Promise<Stripe.Event> {
    try {
      const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
      return this.stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      throw new BadRequestException(`Invalid webhook signature: ${error.message}`);
    }
  }

  async createPaymentIntent(
    amount: number,
    currency: string = 'usd',
    customerEmail?: string,
  ): Promise<Stripe.PaymentIntent> {
    try {
      const params: Stripe.PaymentIntentCreateParams = {
        amount: Math.round(amount * 100),
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      };

      if (customerEmail) {
        params.receipt_email = customerEmail;
      }

      return await this.stripe.paymentIntents.create(params);
    } catch (error) {
      throw new BadRequestException(`Failed to create payment intent: ${error.message}`);
    }
  }

  async retrievePaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      throw new BadRequestException(`Failed to retrieve payment intent: ${error.message}`);
    }
  }

  async confirmPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.confirm(paymentIntentId);
    } catch (error) {
      throw new BadRequestException(`Failed to confirm payment intent: ${error.message}`);
    }
  }

  async cancelPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.cancel(paymentIntentId);
    } catch (error) {
      throw new BadRequestException(`Failed to cancel payment intent: ${error.message}`);
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
  ): Promise<Stripe.Refund> {
    try {
      const params: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        params.amount = Math.round(amount * 100);
      }

      return await this.stripe.refunds.create(params);
    } catch (error) {
      throw new BadRequestException(`Failed to create refund: ${error.message}`);
    }
  }

  getPublishableKey(): string {
    return this.configService.get<string>('STRIPE_PUBLISHABLE_KEY');
  }
}