import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Headers,
  Res,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { StripeService } from './stripe.service';
import { PurchaseService } from '../../purchases/purchase.service';
import { raw } from 'express';
import Stripe from 'stripe';

@ApiTags('payments/stripe')
@Controller('payments/stripe')
export class StripeController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly purchaseService: PurchaseService,
  ) {}

  @Post('create-checkout')
  @ApiOperation({ summary: 'Create a Stripe checkout session' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['packageName', 'price', 'customerEmail'],
      properties: {
        packageName: { type: 'string', example: 'Professional Digital Suite' },
        price: { type: 'number', example: 99.99 },
        customerEmail: { type: 'string', example: 'customer@example.com' },
        successUrl: { type: 'string', example: 'http://localhost:3000/success' },
        cancelUrl: { type: 'string', example: 'http://localhost:3000/cancel' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Checkout session created successfully.',
    schema: {
      type: 'object',
      properties: {
        sessionId: { type: 'string' },
        checkoutUrl: { type: 'string' },
      },
    },
  })
  async createCheckoutSession(@Body() body: {
    packageName: string;
    price: number;
    customerEmail: string;
    successUrl?: string;
    cancelUrl?: string;
  }) {
    const { packageName, price, customerEmail, successUrl, cancelUrl } = body;

    const defaultSuccessUrl = `${process.env.FRONTEND_URL}/success`;
    const defaultCancelUrl = `${process.env.FRONTEND_URL}/cancel`;

    return this.stripeService.createCheckoutSession(
      packageName,
      price,
      customerEmail,
      successUrl || defaultSuccessUrl,
      cancelUrl || defaultCancelUrl,
    );
  }

  @Post('create-payment-intent')
  @ApiOperation({ summary: 'Create a Stripe payment intent' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['amount'],
      properties: {
        amount: { type: 'number', example: 99.99 },
        currency: { type: 'string', example: 'usd' },
        customerEmail: { type: 'string', example: 'customer@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payment intent created successfully.',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        client_secret: { type: 'string' },
        amount: { type: 'number' },
        currency: { type: 'string' },
      },
    },
  })
  async createPaymentIntent(@Body() body: {
    amount: number;
    currency?: string;
    customerEmail?: string;
  }) {
    return this.stripeService.createPaymentIntent(
      body.amount,
      body.currency,
      body.customerEmail,
    );
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Handle Stripe webhooks' })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature',
    required: true,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully.',
  })
  async handleWebhook(
    @Body() payload: string,
    @Headers('stripe-signature') signature: string,
  ) {
    try {
      const event = await this.stripeService.constructEvent(payload, signature);

      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event);
          break;
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event);
          break;
        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      return { received: true };
    } catch (error) {
      throw new BadRequestException(`Webhook error: ${error.message}`);
    }
  }

  @Get('retrieve-session/:sessionId')
  @ApiOperation({ summary: 'Retrieve a checkout session' })
  @ApiResponse({
    status: 200,
    description: 'Session retrieved successfully.',
  })
  async retrieveSession(@Param('sessionId') sessionId: string) {
    return this.stripeService.retrieveCheckoutSession(sessionId);
  }

  @Get('retrieve-payment-intent/:paymentIntentId')
  @ApiOperation({ summary: 'Retrieve a payment intent' })
  @ApiResponse({
    status: 200,
    description: 'Payment intent retrieved successfully.',
  })
  async retrievePaymentIntent(@Param('paymentIntentId') paymentIntentId: string) {
    return this.stripeService.retrievePaymentIntent(paymentIntentId);
  }

  @Post('confirm-payment/:paymentIntentId')
  @ApiOperation({ summary: 'Confirm a payment intent' })
  @ApiResponse({
    status: 200,
    description: 'Payment confirmed successfully.',
  })
  async confirmPayment(@Param('paymentIntentId') paymentIntentId: string) {
    return this.stripeService.confirmPaymentIntent(paymentIntentId);
  }

  @Post('cancel-payment/:paymentIntentId')
  @ApiOperation({ summary: 'Cancel a payment intent' })
  @ApiResponse({
    status: 200,
    description: 'Payment cancelled successfully.',
  })
  async cancelPayment(@Param('paymentIntentId') paymentIntentId: string) {
    return this.stripeService.cancelPaymentIntent(paymentIntentId);
  }

  @Post('refund/:paymentIntentId')
  @ApiOperation({ summary: 'Create a refund' })
  @ApiResponse({
    status: 200,
    description: 'Refund created successfully.',
  })
  async createRefund(
    @Param('paymentIntentId') paymentIntentId: string,
    @Body('amount') amount?: number,
  ) {
    return this.stripeService.createRefund(paymentIntentId, amount);
  }

  @Get('config')
  @ApiOperation({ summary: 'Get Stripe configuration' })
  @ApiResponse({
    status: 200,
    description: 'Stripe configuration.',
    schema: {
      type: 'object',
      properties: {
        publishableKey: { type: 'string' },
      },
    },
  })
  getConfig() {
    return {
      publishableKey: this.stripeService.getPublishableKey(),
    };
  }

  private async handleCheckoutSessionCompleted(event: Stripe.Event) {
    const session = event.data.object as Stripe.Checkout.Session;

    // Extract purchase ID from metadata if available
    const purchaseId = session.metadata?.purchaseId;
    if (purchaseId) {
      await this.purchaseService.completePurchase(purchaseId, session.payment_intent as string);
    }

    console.log(`Checkout session completed: ${session.id}`);
  }

  private async handlePaymentIntentSucceeded(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    // Extract purchase ID from metadata if available
    const purchaseId = paymentIntent.metadata?.purchaseId;
    if (purchaseId) {
      await this.purchaseService.completePurchase(purchaseId, paymentIntent.id);
    }

    console.log(`Payment intent succeeded: ${paymentIntent.id}`);
  }

  private async handlePaymentIntentFailed(event: Stripe.Event) {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    // Extract purchase ID from metadata if available
    const purchaseId = paymentIntent.metadata?.purchaseId;
    if (purchaseId) {
      // You might want to update the purchase status to failed
      // or send a notification to the user
      console.log(`Payment failed for purchase: ${purchaseId}`);
    }

    console.log(`Payment intent failed: ${paymentIntent.id}`);
  }
}