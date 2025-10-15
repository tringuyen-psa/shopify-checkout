import {
  IsString,
  IsEmail,
  IsEnum,
  IsOptional,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BillingCycle } from '../../../common/enums/billing-cycle.enum.js';
import { PaymentMethod } from '../entities/purchase.entity';

export class CreatePurchaseDto {
  @ApiProperty({
    description: 'ID of the package to purchase',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  packageId: string;

  @ApiProperty({
    description: 'User ID making the purchase',
    example: 'user123',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Billing cycle selected',
    enum: BillingCycle,
    example: BillingCycle.MONTHLY,
  })
  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @ApiProperty({
    description: 'Payment method to use',
    enum: PaymentMethod,
    example: PaymentMethod.STRIPE,
  })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({
    description: 'Customer email address',
    example: 'customer@example.com',
    maxLength: 255,
  })
  @IsEmail()
  @MaxLength(255)
  customerEmail: string;

  @ApiProperty({
    description: 'Customer full name',
    example: 'John Doe',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  customerName: string;

  @ApiPropertyOptional({
    description: 'Whether this should be a recurring subscription',
    example: false,
    default: false,
  })
  @IsOptional()
  isRecurring?: boolean;

  @ApiPropertyOptional({
    description: 'Additional metadata for the purchase',
    example: { source: 'web', campaign: 'summer2023' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}