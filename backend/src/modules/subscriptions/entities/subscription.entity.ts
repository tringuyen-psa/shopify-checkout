import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Purchase } from '../../purchases/entities/purchase.entity';
import { Package } from '../../packages/entities/package.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { User } from '../../users/entities/user.entity';
import { BillingCycle } from '../../../common/enums/billing-cycle.enum';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid',
  TRIALING = 'trialing',
}

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  purchaseId: string;

  @Column()
  packageId: string;

  @Column()
  shopId: string;

  @Column()
  userId: string;

  // Stripe
  @Column()
  stripeSubscriptionId: string;

  @Column()
  stripeCustomerId: string;

  // Billing
  @Column({
    type: 'enum',
    enum: BillingCycle,
  })
  billingCycle: BillingCycle;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  platformFee: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  shopRevenue: number;

  // Status
  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.ACTIVE,
  })
  status: SubscriptionStatus;

  @Column()
  currentPeriodStart: Date;

  @Column()
  currentPeriodEnd: Date;

  @Column({ default: false })
  cancelAtPeriodEnd: boolean;

  @Column({ nullable: true })
  cancelledAt: Date;

  @Column({ nullable: true })
  trialStart: Date;

  @Column({ nullable: true })
  trialEnd: Date;

  @ManyToOne(() => Purchase, purchase => purchase.subscription)
  purchase: Purchase;

  @ManyToOne(() => Package, pkg => pkg.subscriptions)
  package: Package;

  @ManyToOne(() => Shop)
  shop: Shop;

  @ManyToOne(() => User, user => user.subscriptions)
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}