import { IsString, IsEmail, IsOptional, IsNumber, IsEnum, Min, Max } from 'class-validator';
import { ShopStatus } from '../entities/shop.entity';

export class CreateShopDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  ownerId: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  platformFeePercent?: number;

  @IsOptional()
  @IsEnum(ShopStatus)
  status?: ShopStatus;
}