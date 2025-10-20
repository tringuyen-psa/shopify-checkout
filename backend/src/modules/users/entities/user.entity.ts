import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Shop } from '../../shops/entities/shop.entity';
import { Purchase } from '../../purchases/entities/purchase.entity';
import { Subscription } from '../../subscriptions/entities/subscription.entity';

export enum UserRole {
  CUSTOMER = 'customer',
  SHOP_OWNER = 'shop_owner',
  PLATFORM_ADMIN = 'platform_admin'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER
  })
  role: UserRole;

  @Column()
  passwordHash: string;

  // Customer info
  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  postalCode: string;

  // Stripe Customer ID (for recurring payments)
  @Column({ nullable: true })
  stripeCustomerId: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastLoginAt: Date;

  @OneToMany(() => Shop, shop => shop.ownerId)
  shops: Shop[];

  // Note: Purchase relationship removed due to userId being VARCHAR (not UUID)
  // This prevents foreign key constraint issues with non-UUID user identifiers
  // @OneToMany(() => Purchase, purchase => purchase.user)
  // purchases: Purchase[];

  @OneToMany(() => Subscription, subscription => subscription.user)
  subscriptions: Subscription[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}