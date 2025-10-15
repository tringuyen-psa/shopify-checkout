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
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Purchase, PurchaseStatus } from './entities/purchase.entity';

@ApiTags('purchases')
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new purchase' })
  @ApiResponse({
    status: 201,
    description: 'The purchase has been successfully created.',
    type: Purchase,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  @ApiResponse({ status: 404, description: 'Package not found.' })
  async create(@Body() createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    return this.purchaseService.create(createPurchaseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all purchases' })
  @ApiResponse({
    status: 200,
    description: 'List of all purchases.',
    type: [Purchase],
  })
  async findAll(): Promise<Purchase[]> {
    return this.purchaseService.findAll();
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get purchases by user ID' })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    example: 'user123',
  })
  @ApiResponse({
    status: 200,
    description: 'List of purchases for the specified user.',
    type: [Purchase],
  })
  async findByUserId(@Param('userId') userId: string): Promise<Purchase[]> {
    return this.purchaseService.findByUserId(userId);
  }

  @Get('user/:userId/active')
  @ApiOperation({ summary: 'Get active purchases for a user' })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of active purchases for the specified user.',
    type: [Purchase],
  })
  async findActivePurchases(@Param('userId') userId: string): Promise<Purchase[]> {
    return this.purchaseService.findActivePurchases(userId);
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Get purchases expiring soon' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days ahead to check',
    example: 7,
  })
  @ApiResponse({
    status: 200,
    description: 'List of purchases expiring within the specified timeframe.',
    type: [Purchase],
  })
  async getExpiringPurchases(@Query('days') days?: number): Promise<Purchase[]> {
    return this.purchaseService.getExpiringPurchases(days ? parseInt(days.toString()) : 7);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get purchase statistics' })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'User ID to get stats for specific user',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase statistics.',
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number' },
        active: { type: 'number' },
        expired: { type: 'number' },
        totalSpent: { type: 'number' },
      },
    },
  })
  async getPurchaseStats(@Query('userId') userId?: string): Promise<{
    total: number;
    active: number;
    expired: number;
    totalSpent: number;
  }> {
    return this.purchaseService.getPurchaseStats(userId);
  }

  @Get('date-range')
  @ApiOperation({ summary: 'Get purchases within date range' })
  @ApiQuery({ name: 'start', description: 'Start date (ISO string)', required: true })
  @ApiQuery({ name: 'end', description: 'End date (ISO string)', required: true })
  @ApiResponse({
    status: 200,
    description: 'List of purchases within the specified date range.',
    type: [Purchase],
  })
  async getPurchasesByDateRange(
    @Query('start') startDate: string,
    @Query('end') endDate: string,
  ): Promise<Purchase[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return this.purchaseService.getPurchasesByDateRange(start, end);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a purchase by ID' })
  @ApiParam({
    name: 'id',
    description: 'Purchase ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @ApiResponse({
    status: 200,
    description: 'The found purchase.',
    type: Purchase,
  })
  @ApiResponse({ status: 404, description: 'Purchase not found.' })
  async findOne(@Param('id') id: string): Promise<Purchase> {
    return this.purchaseService.findOne(id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Complete a purchase with payment' })
  @ApiParam({
    name: 'id',
    description: 'Purchase ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase has been completed.',
    type: Purchase,
  })
  async completePurchase(
    @Param('id') id: string,
    @Body('paymentId') paymentId: string,
  ): Promise<Purchase> {
    if (!paymentId) {
      throw new Error('Payment ID is required');
    }
    return this.purchaseService.completePurchase(id, paymentId);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a purchase' })
  @ApiParam({
    name: 'id',
    description: 'Purchase ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase has been cancelled.',
    type: Purchase,
  })
  async cancelPurchase(@Param('id') id: string): Promise<Purchase> {
    return this.purchaseService.cancelPurchase(id);
  }

  @Patch(':id/refund')
  @ApiOperation({ summary: 'Refund a purchase' })
  @ApiParam({
    name: 'id',
    description: 'Purchase ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase has been refunded.',
    type: Purchase,
  })
  async refundPurchase(@Param('id') id: string): Promise<Purchase> {
    return this.purchaseService.refundPurchase(id);
  }

  @Patch(':id/renew')
  @ApiOperation({ summary: 'Renew a purchase (only for active purchases)' })
  @ApiParam({
    name: 'id',
    description: 'Purchase ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase has been renewed.',
    type: Purchase,
  })
  @ApiResponse({ status: 400, description: 'Cannot renew expired or inactive purchase.' })
  async renewPurchase(@Param('id') id: string): Promise<Purchase> {
    return this.purchaseService.renewPurchase(id);
  }

  @Patch(':id/renew-expired')
  @ApiOperation({ summary: 'Renew an expired purchase' })
  @ApiParam({
    name: 'id',
    description: 'Purchase ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Expired purchase has been renewed.',
    type: Purchase,
  })
  @ApiResponse({ status: 400, description: 'Can only renew completed purchases.' })
  async renewExpiredPurchase(@Param('id') id: string): Promise<Purchase> {
    return this.purchaseService.renewExpiredPurchase(id);
  }

  @Patch(':id/extend')
  @ApiOperation({ summary: 'Extend a purchase by days' })
  @ApiParam({
    name: 'id',
    description: 'Purchase ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Purchase has been extended.',
    type: Purchase,
  })
  async extendPurchase(
    @Param('id') id: string,
    @Body('days') days: number,
  ): Promise<Purchase> {
    if (!days || days <= 0) {
      throw new Error('Valid number of days is required');
    }
    return this.purchaseService.extendPurchase(id, days);
  }

  @Post('sample')
  @ApiOperation({ summary: 'Create a sample purchase (for development)' })
  @ApiResponse({
    status: 201,
    description: 'Sample purchase created.',
    type: Purchase,
  })
  async createSamplePurchase(
    @Body('userId') userId: string,
    @Body('packageId') packageId: string,
  ): Promise<Purchase> {
    if (!userId || !packageId) {
      throw new Error('userId and packageId are required');
    }
    return this.purchaseService.createSamplePurchase(userId, packageId);
  }

  @Post('sample/expired')
  @ApiOperation({ summary: 'Create a sample expired purchase (for development)' })
  @ApiResponse({
    status: 201,
    description: 'Sample expired purchase created.',
    type: Purchase,
  })
  async createExpiredSamplePurchase(
    @Body('userId') userId: string,
    @Body('packageId') packageId: string,
  ): Promise<Purchase> {
    if (!userId || !packageId) {
      throw new Error('userId and packageId are required');
    }
    return this.purchaseService.createExpiredSamplePurchase(userId, packageId);
  }
}