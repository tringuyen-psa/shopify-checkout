import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Package } from '../../packages/entities/package.entity';
import { Shop } from '../../shops/entities/shop.entity';
import { BillingCycle } from '../../../common/enums/billing-cycle.enum';

export enum CheckoutSessionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
}

@Entity('checkout_sessions')
export class CheckoutSession {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sessionId: string; // Unique session identifier for URL

  @Column()
  packageId: string;

  @Column()
  shopId: string;

  // Customer info (optional before checkout)
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  name: string;

  // Pricing
  @Column({
    type: 'enum',
    enum: BillingCycle,
  })
  billingCycle: BillingCycle;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  platformFee: number;

  // Stripe
  @Column({ nullable: true })
  stripeCheckoutSessionId: string;

  @Column({
    type: 'enum',
    enum: CheckoutSessionStatus,
    default: CheckoutSessionStatus.PENDING,
  })
  status: CheckoutSessionStatus;

  @Column()
  expiresAt: Date;

  @Column({ nullable: true })
  customAmount: number; // For custom pricing

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Package, pkg => pkg.purchases)
  package: Package;

  @ManyToOne(() => Shop)
  shop: Shop;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}