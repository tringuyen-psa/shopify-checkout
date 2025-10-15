import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { ApiProperty } from "@nestjs/swagger";
import { Purchase } from "../../purchases/entities/purchase.entity";
import { BillingCycle } from "../../../common/enums/billing-cycle.enum.js";

@Entity("packages")
export class Package {
  @ApiProperty({
    description: "Unique identifier for the package",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ApiProperty({
    description: "Name of the digital package",
    example: "Pro Digital Suite",
  })
  @Column({ type: "varchar", length: 255 })
  name: string;

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
    description: "Whether the package is currently active",
    example: true,
    default: true,
  })
  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @ApiProperty({
    description: "URL of the package image",
    example: "https://example.com/image.jpg",
    required: false,
  })
  @Column({ type: "varchar", length: 500, nullable: true })
  imageUrl: string;

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

  @OneToMany(() => Purchase, (purchase) => purchase.package)
  purchases: Purchase[];

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
