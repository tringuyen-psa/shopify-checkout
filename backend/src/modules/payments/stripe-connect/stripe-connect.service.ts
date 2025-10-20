import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shop } from '../../shops/entities/shop.entity';
import Stripe from 'stripe';

@Injectable()
export class StripeConnectService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createConnectedAccount(shopId: string): Promise<{ accountId: string }> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop) {
      throw new NotFoundException('Shop not found');
    }

    try {
      const account = await this.stripe.accounts.create({
        type: 'express',
        country: 'US',
        email: shop.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: 'individual',
        business_profile: {
          name: shop.name,
          url: shop.website || undefined,
          product_description: shop.description || 'Digital products',
        },
      });

      // Update shop with Stripe account ID
      await this.shopRepository.update(shopId, {
        stripeAccountId: account.id,
      });

      return { accountId: account.id };
    } catch (error) {
      throw new BadRequestException(`Failed to create Stripe account: ${error.message}`);
    }
  }

  async createAccountLink(shopId: string): Promise<{ url: string }> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop || !shop.stripeAccountId) {
      throw new NotFoundException('Shop or Stripe account not found');
    }

    try {
      const accountLink = await this.stripe.accountLinks.create({
        account: shop.stripeAccountId,
        refresh_url: `${process.env.FRONTEND_URL}/shops/${shopId}/connect/refresh`,
        return_url: `${process.env.FRONTEND_URL}/shops/${shopId}/connect/success`,
        type: 'account_onboarding',
      });

      return { url: accountLink.url };
    } catch (error) {
      throw new BadRequestException(`Failed to create account link: ${error.message}`);
    }
  }

  async createLoginLink(shopId: string): Promise<{ url: string }> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop || !shop.stripeAccountId) {
      throw new NotFoundException('Shop or Stripe account not found');
    }

    try {
      const loginLink = await this.stripe.accounts.createLoginLink(shop.stripeAccountId);
      return { url: loginLink.url };
    } catch (error) {
      throw new BadRequestException(`Failed to create login link: ${error.message}`);
    }
  }

  async getAccountStatus(shopId: string): Promise<{
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    requirements: any;
  }> {
    const shop = await this.shopRepository.findOne({ where: { id: shopId } });
    if (!shop || !shop.stripeAccountId) {
      throw new NotFoundException('Shop or Stripe account not found');
    }

    try {
      const account = await this.stripe.accounts.retrieve(shop.stripeAccountId);

      // Update shop status
      await this.shopRepository.update(shopId, {
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        stripeOnboardingComplete: account.charges_enabled,
      });

      return {
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        requirements: account.requirements,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to get account status: ${error.message}`);
    }
  }

  async processWebhook(event: Stripe.Event): Promise<void> {
    switch (event.type) {
      case 'account.updated':
        await this.handleAccountUpdated(event.data.object as Stripe.Account);
        break;
      case 'transfer.created':
        await this.handleTransferCreated(event.data.object as Stripe.Transfer);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleAccountUpdated(account: Stripe.Account): Promise<void> {
    const shop = await this.shopRepository.findOne({
      where: { stripeAccountId: account.id }
    });

    if (shop) {
      await this.shopRepository.update(shop.id, {
        stripeChargesEnabled: account.charges_enabled,
        stripePayoutsEnabled: account.payouts_enabled,
        stripeOnboardingComplete: account.charges_enabled,
      });
    }
  }

  private async handleTransferCreated(transfer: Stripe.Transfer): Promise<void> {
    console.log(`Transfer created: ${transfer.id} for amount: ${transfer.amount}`);
    // You can implement transfer tracking here
  }

  async createTransfer(
    destinationAccountId: string,
    amount: number,
    currency: string = 'usd',
    metadata?: any
  ): Promise<Stripe.Transfer> {
    try {
      const transfer = await this.stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        destination: destinationAccountId,
        metadata,
      });

      return transfer;
    } catch (error) {
      throw new BadRequestException(`Failed to create transfer: ${error.message}`);
    }
  }
}