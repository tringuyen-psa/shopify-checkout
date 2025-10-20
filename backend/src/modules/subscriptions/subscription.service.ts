import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';
import { BillingCycle } from '../../common/enums/billing-cycle.enum';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(subscriptionData: Partial<Subscription>): Promise<Subscription> {
    const subscription = this.subscriptionRepository.create(subscriptionData);
    return this.subscriptionRepository.save(subscription);
  }

  async findAll(): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      relations: ['user', 'package', 'shop', 'purchase'],
    });
  }

  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id },
      relations: ['user', 'package', 'shop', 'purchase'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID ${id} not found`);
    }

    return subscription;
  }

  async findByUser(userId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { userId },
      relations: ['package', 'shop'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByShop(shopId: string): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { shopId },
      relations: ['user', 'package'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByStripeSubscriptionId(stripeSubscriptionId: string): Promise<Subscription> {
    return this.subscriptionRepository.findOne({
      where: { stripeSubscriptionId },
      relations: ['user', 'package', 'shop'],
    });
  }

  async update(id: string, updateData: Partial<Subscription>): Promise<Subscription> {
    const subscription = await this.findOne(id);
    Object.assign(subscription, updateData);
    return this.subscriptionRepository.save(subscription);
  }

  async updateStatus(id: string, status: SubscriptionStatus): Promise<Subscription> {
    return this.update(id, { status });
  }

  async cancel(id: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
    const subscription = await this.findOne(id);

    if (cancelAtPeriodEnd) {
      subscription.cancelAtPeriodEnd = true;
    } else {
      subscription.status = SubscriptionStatus.CANCELLED;
      subscription.cancelledAt = new Date();
    }

    return this.subscriptionRepository.save(subscription);
  }

  async resume(id: string): Promise<Subscription> {
    return this.update(id, {
      status: SubscriptionStatus.ACTIVE,
      cancelAtPeriodEnd: false,
      cancelledAt: null,
    });
  }

  async updateBillingPeriod(
    id: string,
    currentPeriodStart: Date,
    currentPeriodEnd: Date
  ): Promise<Subscription> {
    return this.update(id, {
      currentPeriodStart,
      currentPeriodEnd,
    });
  }

  async getActiveSubscriptions(): Promise<Subscription[]> {
    return this.subscriptionRepository.find({
      where: { status: SubscriptionStatus.ACTIVE },
      relations: ['user', 'package', 'shop'],
    });
  }

  async getSubscriptionsExpiringSoon(daysAhead: number = 7): Promise<Subscription[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return this.subscriptionRepository.find({
      where: [
        {
          status: SubscriptionStatus.ACTIVE,
          cancelAtPeriodEnd: true,
          currentPeriodEnd: LessThan(futureDate),
        },
        {
          status: SubscriptionStatus.TRIALING,
          trialEnd: LessThan(futureDate),
        }
      ],
      relations: ['user', 'package'],
    });
  }

  async remove(id: string): Promise<void> {
    const subscription = await this.findOne(id);
    await this.subscriptionRepository.remove(subscription);
  }
}