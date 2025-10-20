import { IsString, IsOptional } from 'class-validator';

export class KycVerificationDto {
  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  businessType?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  businessName?: string;

  @IsString()
  @IsOptional()
  businessUrl?: string;

  @IsString()
  @IsOptional()
  businessTaxId?: string;
}