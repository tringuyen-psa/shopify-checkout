import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Purchase } from "../../purchases/entities/purchase.entity";
import { BillingCycle } from "../../../common/enums/billing-cycle.enum.js";
import { Shop } from "../../shops/entities/shop.entity";
import { Subscription } from "../../subscriptions/entities/subscription.entity";

@Entity("packages")
export class Package {
  @ApiProperty({
    description: "Unique identifier for the package",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({
    description: "Shop ID this package belongs to",
    example: "shop-uuid",
  })
  @Column({ nullable: true })
  shopId: string;

  @ApiProperty({
    description: "Name of the digital package",
    example: "Pro Digital Suite",
  })
  @Column({ type: "varchar", length: 255 })
  name: string;

  @ApiProperty({
    description: "URL-friendly name",
    example: "pro-digital-suite",
  })
  @Column({ nullable: true })
  slug: string;

  @ApiProperty({
    description: "Detailed description of the package",
    example: "Complete digital toolkit for professionals",
    required: false,
  })
  @Column({ type: "text", nullable: true })
  description: string;

  @ApiProperty({
    description: "Base price of the package",
    example: 99.99,
    minimum: 0,
  })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  basePrice: number;

  @ApiProperty({
    description: "Weekly subscription price",
    example: 29.99,
    minimum: 0,
  })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  weeklyPrice: number;

  @ApiProperty({
    description: "Monthly subscription price",
    example: 99.99,
    minimum: 0,
  })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  monthlyPrice: number;

  @ApiProperty({
    description: "Yearly subscription price",
    example: 999.99,
    minimum: 0,
  })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  yearlyPrice: number;

  @ApiProperty({
    description: "List of features included in the package",
    example: ["Feature 1", "Feature 2", "Feature 3"],
    required: false,
    isArray: true,
  })
  @Column("simple-array", { nullable: true })
  features: string[];

  @ApiProperty({
    description: "Package images URLs",
    example: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"],
    required: false,
    isArray: true,
  })
  @Column("simple-array", { nullable: true })
  images: string[];

  @ApiProperty({
    description: "Package category",
    example: "Software",
    required: false,
  })
  @Column({ nullable: true })
  category: string;

  @ApiProperty({
    description: "Whether this is a subscription package",
    example: true,
    default: false,
  })
  @Column({ default: false })
  isSubscription: boolean;

  @ApiProperty({
    description: "Number of trial days for subscription",
    example: 7,
    required: false,
  })
  @Column({ nullable: true })
  trialDays: number;

  @ApiProperty({
    description: "Whether the package is currently active",
    example: true,
    default: true,
  })
  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @ApiProperty({
    description: "When the package was created",
    example: "2023-12-01T10:00:00Z",
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: "When the package was last updated",
    example: "2023-12-01T10:00:00Z",
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Shop, shop => shop.packages)
  shop: Shop;

  @OneToMany(() => Purchase, (purchase) => purchase.package)
  purchases: Purchase[];

  @OneToMany(() => Subscription, (subscription) => subscription.package)
  subscriptions: Subscription[];

  // Helper method to get price based on billing cycle
  getPriceByCycle(cycle: BillingCycle): number {
    switch (cycle) {
      case BillingCycle.WEEKLY:
        return this.weeklyPrice;
      case BillingCycle.MONTHLY:
        return this.monthlyPrice;
      case BillingCycle.YEARLY:
        return this.yearlyPrice;
      default:
        return this.basePrice;
    }
  }
}
