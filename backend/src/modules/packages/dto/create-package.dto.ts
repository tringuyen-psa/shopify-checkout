import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  IsUrl,
  Min,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({
    description: 'Name of the digital package',
    example: 'Pro Digital Suite',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the package',
    example: 'Complete digital toolkit for professionals',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Base price of the package',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  basePrice: number;

  @ApiProperty({
    description: 'Weekly subscription price',
    example: 29.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  weeklyPrice: number;

  @ApiProperty({
    description: 'Monthly subscription price',
    example: 99.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  monthlyPrice: number;

  @ApiProperty({
    description: 'Yearly subscription price',
    example: 999.99,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  yearlyPrice: number;

  @ApiPropertyOptional({
    description: 'List of features included in the package',
    example: ['Feature 1', 'Feature 2', 'Feature 3'],
    isArray: true,
    maxItems: 20,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(20)
  features?: string[];

  @ApiPropertyOptional({
    description: 'Whether the package is currently active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'URL of the package image',
    example: 'https://example.com/image.jpg',
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imageUrl?: string;
}