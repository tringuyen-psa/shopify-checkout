import { IsString, IsEnum, IsOptional, IsNumber, Min, IsEmail } from 'class-validator';
import { BillingCycle } from '../../../common/enums/billing-cycle.enum';

export class CreateCheckoutSessionDto {
  @IsString()
  packageId: string;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  customAmount?: number; // Override default price

  @IsOptional()
  @IsString()
  successUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}