import { IsString, IsOptional, IsDateString } from 'class-validator';

export class ShopDashboardStatsDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class CreatePackageDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  category?: string;

  @IsOptional()
  images?: string[];

  @IsOptional()
  isSubscription?: boolean = false;

  @IsOptional()
  trialDays?: number = 0;

  @IsOptional()
  basePrice?: number;

  @IsOptional()
  weeklyPrice?: number;

  @IsOptional()
  monthlyPrice?: number;

  @IsOptional()
  yearlyPrice?: number;

  @IsOptional()
  features?: string[];

  @IsOptional()
  maxActiveUsers?: number;

  @IsOptional()
  isActive?: boolean = true;
}

export class UpdatePackageDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  images?: string[];

  @IsOptional()
  isSubscription?: boolean;

  @IsOptional()
  trialDays?: number;

  @IsOptional()
  basePrice?: number;

  @IsOptional()
  weeklyPrice?: number;

  @IsOptional()
  monthlyPrice?: number;

  @IsOptional()
  yearlyPrice?: number;

  @IsOptional()
  features?: string[];

  @IsOptional()
  maxActiveUsers?: number;

  @IsOptional()
  isActive?: boolean;
}