import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  Headers,
} from '@nestjs/common';
import { StripeConnectService } from './stripe-connect.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RawBodyRequest } from '@nestjs/common';
import Stripe from 'stripe';

@Controller('stripe-connect')
export class StripeConnectController {
  constructor(private readonly stripeConnectService: StripeConnectService) {}

  @Post('shops/:shopId/account')
  @UseGuards(JwtAuthGuard)
  async createConnectedAccount(@Param('shopId') shopId: string) {
    return this.stripeConnectService.createConnectedAccount(shopId);
  }

  @Post('shops/:shopId/onboard')
  @UseGuards(JwtAuthGuard)
  async createAccountLink(@Param('shopId') shopId: string) {
    return this.stripeConnectService.createAccountLink(shopId);
  }

  @Get('shops/:shopId/login')
  @UseGuards(JwtAuthGuard)
  async createLoginLink(@Param('shopId') shopId: string) {
    return this.stripeConnectService.createLoginLink(shopId);
  }

  @Get('shops/:shopId/status')
  @UseGuards(JwtAuthGuard)
  async getAccountStatus(@Param('shopId') shopId: string) {
    return this.stripeConnectService.getAccountStatus(shopId);
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    });

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        process.env.STRIPE_CONNECT_WEBHOOK_SECRET,
      );
    } catch (error) {
      throw new Error(`Webhook signature verification failed: ${error.message}`);
    }

    await this.stripeConnectService.processWebhook(event);

    return { received: true };
  }
}