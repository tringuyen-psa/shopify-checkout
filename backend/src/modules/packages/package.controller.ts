import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PackageService } from './package.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { Package } from './entities/package.entity';
import { BillingCycle } from '../../common/enums/billing-cycle.enum.js';

@ApiTags('packages')
@Controller('packages')
export class PackageController {
  constructor(private readonly packageService: PackageService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new package' })
  @ApiResponse({
    status: 201,
    description: 'The package has been successfully created.',
    type: Package,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async create(@Body() createPackageDto: CreatePackageDto): Promise<Package> {
    return this.packageService.create(createPackageDto);
  }

  @Post('seed')
  @ApiOperation({ summary: 'Create sample packages (for development)' })
  @ApiResponse({
    status: 201,
    description: 'Sample packages have been created.',
    type: [Package],
  })
  async createSamplePackages(): Promise<Package[]> {
    return this.packageService.createSamplePackages();
  }

  @Get()
  @ApiOperation({ summary: 'Get all active packages' })
  @ApiResponse({
    status: 200,
    description: 'List of all active packages.',
    type: [Package],
  })
  async findAll(): Promise<Package[]> {
    return this.packageService.findAll();
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular packages' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of packages to return',
  })
  @ApiResponse({
    status: 200,
    description: 'List of popular packages.',
    type: [Package],
  })
  async findPopular(@Query('limit') limit?: number): Promise<Package[]> {
    return this.packageService.findPopularPackages(limit ? parseInt(limit.toString()) : 5);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search packages by name or description' })
  @ApiQuery({
    name: 'q',
    required: true,
    type: String,
    description: 'Search query',
  })
  @ApiResponse({
    status: 200,
    description: 'List of packages matching the search query.',
    type: [Package],
  })
  async search(@Query('q') query: string): Promise<Package[]> {
    if (!query) {
      throw new Error('Search query is required');
    }
    return this.packageService.searchPackages(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a package by ID' })
  @ApiParam({
    name: 'id',
    description: 'Package ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'The found package.',
    type: Package,
  })
  @ApiResponse({ status: 404, description: 'Package not found.' })
  async findOne(@Param('id') id: string): Promise<Package> {
    return this.packageService.findOne(id);
  }

  @Get(':id/price/:cycle')
  @ApiOperation({ summary: 'Get package price by billing cycle' })
  @ApiParam({
    name: 'id',
    description: 'Package ID',
  })
  @ApiParam({
    name: 'cycle',
    description: 'Billing cycle (weekly, monthly, yearly)',
    enum: ['weekly', 'monthly', 'yearly'],
  })
  @ApiResponse({
    status: 200,
    description: 'Package price for the specified billing cycle.',
    schema: {
      type: 'object',
      properties: {
        price: { type: 'number', example: 99.99 },
        currency: { type: 'string', example: 'USD' },
      },
    },
  })
  async getPriceByCycle(
    @Param('id') id: string,
    @Param('cycle') cycle: string,
  ): Promise<{ price: number; currency: string }> {
    const price = await this.packageService.getPriceByPackageAndCycle(
      id,
      cycle as any,
    );
    return { price, currency: 'USD' };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a package' })
  @ApiParam({
    name: 'id',
    description: 'Package ID',
  })
  @ApiResponse({
    status: 200,
    description: 'The package has been successfully updated.',
    type: Package,
  })
  @ApiResponse({ status: 404, description: 'Package not found.' })
  async update(
    @Param('id') id: string,
    @Body() updatePackageDto: UpdatePackageDto,
  ): Promise<Package> {
    return this.packageService.update(id, updatePackageDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete a package' })
  @ApiParam({
    name: 'id',
    description: 'Package ID',
  })
  @ApiResponse({ status: 204, description: 'Package has been successfully deleted.' })
  @ApiResponse({ status: 404, description: 'Package not found.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.packageService.remove(id);
  }

  @Get('stats/count')
  @ApiOperation({ summary: 'Get count of active packages' })
  @ApiResponse({
    status: 200,
    description: 'Number of active packages.',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 10 },
      },
    },
  })
  async getActivePackagesCount(): Promise<{ count: number }> {
    const count = await this.packageService.getActivePackagesCount();
    return { count };
  }
}