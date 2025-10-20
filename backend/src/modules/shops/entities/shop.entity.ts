import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Package } from '../../packages/entities/package.entity';
import { Purchase } from '../../purchases/entities/purchase.entity';

export enum ShopStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected'
}

@Entity('shops')
export class Shop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column()
  ownerId: string;

  // Stripe Connect
  @Column({ nullable: true })
  stripeAccountId: string | null;

  @Column({ default: false })
  stripeOnboardingComplete: boolean;

  @Column({ default: false })
  stripeChargesEnabled: boolean;

  @Column({ default: false })
  stripePayoutsEnabled: boolean;

  // Shop info
  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  website: string;

  // Platform settings
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 15.00 })
  platformFeePercent: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: ShopStatus,
    default: ShopStatus.PENDING
  })
  status: ShopStatus;

  @OneToMany(() => Package, pkg => pkg.shop)
  packages: Package[];

  @OneToMany(() => Purchase, purchase => purchase.shop)
  purchases: Purchase[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}