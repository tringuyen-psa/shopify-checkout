import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { CheckoutSession, CheckoutSessionStatus } from './entities/checkout-session.entity';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { StripeCheckoutDto } from './dto/stripe-checkout.dto';
import { PackageService } from '../packages/package.service';
import { ShopService } from '../shops/shop.service';
import { BillingCycle } from '../../common/enums/billing-cycle.enum';
import Stripe from 'stripe';
import * as crypto from 'crypto';
import { addHours } from 'date-fns';

@Injectable()
export class CheckoutService {
  private stripe: Stripe;

  constructor(
    @InjectRepository(CheckoutSession)
    private checkoutSessionRepository: Repository<CheckoutSession>,
    private packageService: PackageService,
    private shopService: ShopService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    });
  }

  async createCheckoutSession(createCheckoutSessionDto: CreateCheckoutSessionDto): Promise<{
    sessionId: string;
    checkoutUrl: string;
  }> {
    // Load package and shop
    const package_ = await this.packageService.findOne(createCheckoutSessionDto.packageId);
    const shop = await this.shopService.findOne(package_.shopId);

    // Validate shop is active and KYC done
    if (!shop.stripeChargesEnabled) {
      throw new BadRequestException('Shop has not completed KYC verification');
    }

    // Calculate price
    let price = this.getPriceByCycle(package_, createCheckoutSessionDto.billingCycle);
    if (createCheckoutSessionDto.customAmount) {
      price = createCheckoutSessionDto.customAmount;
    }

    const platformFee = price * (shop.platformFeePercent / 100);

    // Create checkout session
    const sessionId = crypto.randomUUID();
    const checkoutSession = this.checkoutSessionRepository.create({
      sessionId,
      packageId: package_.id,
      shopId: shop.id,
      billingCycle: createCheckoutSessionDto.billingCycle,
      price,
      platformFee,
      email: createCheckoutSessionDto.email,
      name: createCheckoutSessionDto.name,
      customAmount: createCheckoutSessionDto.customAmount,
      metadata: createCheckoutSessionDto.metadata || {},
      expiresAt: addHours(new Date(), 24), // Expires in 24 hours
    });

    await this.checkoutSessionRepository.save(checkoutSession);

    return {
      sessionId,
      checkoutUrl: `${process.env.FRONTEND_URL}/checkout/${sessionId}`,
    };
  }

  async getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
    const checkoutSession = await this.checkoutSessionRepository.findOne({
      where: { sessionId },
      relations: ['package', 'shop'],
    });

    if (!checkoutSession) {
      throw new NotFoundException('Checkout session not found');
    }

    // Check if expired
    if (checkoutSession.expiresAt < new Date() && checkoutSession.status === CheckoutSessionStatus.PENDING) {
      checkoutSession.status = CheckoutSessionStatus.EXPIRED;
      await this.checkoutSessionRepository.save(checkoutSession);
    }

    return checkoutSession;
  }

  async createStripeCheckout(sessionId: string, stripeCheckoutDto: StripeCheckoutDto): Promise<{ url: string }> {
    const checkoutSession = await this.getCheckoutSession(sessionId);
    const package_ = checkoutSession.package;
    const shop = checkoutSession.shop;

    if (checkoutSession.status !== CheckoutSessionStatus.PENDING) {
      throw new BadRequestException('Checkout session is not valid');
    }

    // Calculate amounts in cents
    const amount = Math.round(checkoutSession.price * 100);
    const platformFee = Math.round(checkoutSession.platformFee * 100);

    const lineItem = {
      price_data: {
        currency: 'usd',
        product_data: {
          name: package_.name,
          description: package_.description,
          images: package_.images || [],
        },
        unit_amount: amount,
        recurring: checkoutSession.billingCycle !== BillingCycle.ONE_TIME ? {
          interval: this.getStripeInterval(checkoutSession.billingCycle),
          trial_period_days: package_.trialDays || 0,
        } : undefined,
      },
      quantity: 1,
    };

    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      mode: checkoutSession.billingCycle === BillingCycle.ONE_TIME ? 'payment' : 'subscription',
      payment_method_types: ['card'],
      line_items: [lineItem],
      customer_email: stripeCheckoutDto.email,
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/${sessionId}`,
      metadata: {
        checkoutSessionId: sessionId,
        packageId: package_.id,
        shopId: shop.id,
      },
    };

    // Add Stripe Connect for non-subscription
    if (checkoutSession.billingCycle === BillingCycle.ONE_TIME) {
      checkoutParams.payment_intent_data = {
        application_fee_amount: platformFee,
        transfer_data: {
          destination: shop.stripeAccountId!,
        },
      };
    } else {
      // For subscriptions
      checkoutParams.subscription_data = {
        application_fee_percent: shop.platformFeePercent,
        transfer_data: {
          destination: shop.stripeAccountId!,
        },
        trial_period_days: package_.trialDays || 0,
      };
    }

    try {
      const stripeSession = await this.stripe.checkout.sessions.create(checkoutParams);

      // Update checkout session with Stripe session ID
      await this.checkoutSessionRepository.update(sessionId, {
        stripeCheckoutSessionId: stripeSession.id,
      });

      return { url: stripeSession.url };
    } catch (error) {
      throw new BadRequestException(`Failed to create Stripe checkout: ${error.message}`);
    }
  }

  async markSessionCompleted(sessionId: string): Promise<void> {
    await this.checkoutSessionRepository.update(sessionId, {
      status: CheckoutSessionStatus.COMPLETED,
    });
  }

  async cleanupExpiredSessions(): Promise<void> {
    const expiredSessions = await this.checkoutSessionRepository.find({
      where: {
        status: CheckoutSessionStatus.PENDING,
        expiresAt: LessThan(new Date()),
      },
    });

    for (const session of expiredSessions) {
      session.status = CheckoutSessionStatus.EXPIRED;
      await this.checkoutSessionRepository.save(session);
    }
  }

  private getPriceByCycle(package_: any, billingCycle: BillingCycle): number {
    switch (billingCycle) {
      case BillingCycle.WEEKLY:
        return package_.weeklyPrice;
      case BillingCycle.MONTHLY:
        return package_.monthlyPrice;
      case BillingCycle.YEARLY:
        return package_.yearlyPrice;
      default:
        return package_.basePrice;
    }
  }

  private getStripeInterval(billingCycle: BillingCycle): 'week' | 'month' | 'year' {
    switch (billingCycle) {
      case BillingCycle.WEEKLY:
        return 'week';
      case BillingCycle.MONTHLY:
        return 'month';
      case BillingCycle.YEARLY:
        return 'year';
      default:
        return 'month';
    }
  }
}