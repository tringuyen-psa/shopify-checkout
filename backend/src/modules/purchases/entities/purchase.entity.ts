import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Package } from "../../packages/entities/package.entity";
import { BillingCycle } from "../../../common/enums/billing-cycle.enum";

export enum PurchaseStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  STRIPE_CARD = "stripe_card",
  STRIPE_POPUP = "stripe_popup",
  PAYPAL = "paypal",
  STRIPE = "stripe", // Legacy support
}

@Entity("purchases")
export class Purchase {
  @ApiProperty({
    description: "Unique identifier for the purchase",
    example: "123e4567-e89b-12d3-a456-426614174001",
  })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({
    description: "ID of the purchased package",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @Column({ type: "uuid" })
  packageId: string;

  @ApiProperty({
    description: "User ID who made the purchase",
    example: "user123",
  })
  @Column({ type: "varchar", length: 255 })
  userId: string;

  @ApiProperty({
    description: "Billing cycle selected",
    enum: BillingCycle,
    example: BillingCycle.MONTHLY,
  })
  @Column({
    type: "enum",
    enum: BillingCycle,
  })
  billingCycle: BillingCycle;

  @ApiProperty({
    description: "Price paid for this purchase",
    example: 99.99,
    minimum: 0,
  })
  @Column({ type: "decimal", precision: 10, scale: 2 })
  price: number;

  @ApiProperty({
    description: "Current status of the purchase",
    enum: PurchaseStatus,
    example: PurchaseStatus.COMPLETED,
  })
  @Column({
    type: "enum",
    enum: PurchaseStatus,
    default: PurchaseStatus.PENDING,
  })
  status: PurchaseStatus;

  @ApiProperty({
    description: "Payment method used",
    enum: PaymentMethod,
    example: PaymentMethod.STRIPE,
  })
  @Column({
    type: "enum",
    enum: PaymentMethod,
  })
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: "Payment gateway transaction ID",
    example: "pi_1234567890",
    required: false,
  })
  @Column({ type: "varchar", length: 255, nullable: true })
  paymentId: string;

  @ApiProperty({
    description: "Customer email",
    example: "customer@example.com",
  })
  @Column({ type: "varchar", length: 255 })
  customerEmail: string;

  @ApiProperty({
    description: "Customer name",
    example: "John Doe",
  })
  @Column({ type: "varchar", length: 255 })
  customerName: string;

  @ApiProperty({
    description: "When the purchase/subscription starts",
    example: "2023-12-01T10:00:00Z",
  })
  @Column({ type: "timestamp" })
  startDate: Date;

  @ApiProperty({
    description: "When the purchase/subscription ends",
    example: "2024-12-01T10:00:00Z",
  })
  @Column({ type: "timestamp" })
  endDate: Date;

  @ApiProperty({
    description: "Whether this is a recurring subscription",
    example: true,
    default: false,
  })
  @Column({ type: "boolean", default: false })
  isRecurring: boolean;

  @ApiProperty({
    description: "Metadata for additional information",
    example: '{"source": "web", "campaign": "summer2023"}',
    required: false,
  })
  @Column({ type: "json", nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({
    description: "When the purchase was created",
    example: "2023-12-01T10:00:00Z",
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: "When the purchase was last updated",
    example: "2023-12-01T10:00:00Z",
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Package, (pkg) => pkg.purchases, { eager: true })
  @JoinColumn({ name: "packageId" })
  package: Package;

  // Helper methods
  isActive(): boolean {
    const now = new Date();
    return (
      this.status === PurchaseStatus.COMPLETED &&
      this.startDate <= now &&
      this.endDate > now
    );
  }

  isExpired(): boolean {
    return new Date() > this.endDate;
  }

  getDaysRemaining(): number {
    const now = new Date();
    const diffTime = this.endDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
