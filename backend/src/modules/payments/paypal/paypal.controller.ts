import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { PayPalService } from './paypal.service';
import { PurchaseService } from '../../purchases/purchase.service';

@ApiTags('payments/paypal')
@Controller('payments/paypal')
export class PayPalController {
  constructor(
    private readonly paypalService: PayPalService,
    private readonly purchaseService: PurchaseService,
  ) {}

  @Post('create-order')
  @ApiOperation({ summary: 'Create a PayPal order' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['packageName', 'price'],
      properties: {
        packageName: { type: 'string', example: 'Professional Digital Suite' },
        price: { type: 'number', example: 99.99 },
        returnUrl: { type: 'string', example: 'http://localhost:3000/success' },
        cancelUrl: { type: 'string', example: 'http://localhost:3000/cancel' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'PayPal order created successfully.',
    schema: {
      type: 'object',
      properties: {
        orderId: { type: 'string' },
        approvalUrl: { type: 'string' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'PayPal credentials not configured or order creation failed.' })
  async createOrder(@Body() body: {
    packageName: string;
    price: number;
    returnUrl?: string;
    cancelUrl?: string;
  }) {
    const { packageName, price, returnUrl, cancelUrl } = body;

    const defaultReturnUrl = `${process.env.FRONTEND_URL}/success?paypal=true`;
    const defaultCancelUrl = `${process.env.FRONTEND_URL}/cancel?paypal=true`;

    return this.paypalService.createOrder(
      packageName,
      price,
      returnUrl || defaultReturnUrl,
      cancelUrl || defaultCancelUrl,
    );
  }

  @Post(':orderId/capture')
  @ApiOperation({ summary: 'Capture a PayPal payment' })
  @ApiResponse({
    status: 200,
    description: 'Payment captured successfully.',
  })
  @ApiResponse({ status: 400, description: 'Payment capture failed.' })
  async captureOrder(@Param('orderId') orderId: string) {
    const result = await this.paypalService.captureOrder(orderId);

    // If capture is successful, update the purchase
    if (result.status === 'COMPLETED') {
      // Extract purchase ID from custom_id or other metadata
      const purchaseId = result.purchase_units?.[0]?.custom_id;
      if (purchaseId) {
        await this.purchaseService.completePurchase(purchaseId, orderId);
      }
    }

    return result;
  }

  @Get(':orderId/details')
  @ApiOperation({ summary: 'Get PayPal order details' })
  @ApiResponse({
    status: 200,
    description: 'Order details retrieved successfully.',
  })
  async getOrderDetails(@Param('orderId') orderId: string) {
    return this.paypalService.getOrderDetails(orderId);
  }

  @Post('refund/:captureId')
  @ApiOperation({ summary: 'Refund a PayPal payment' })
  @ApiResponse({
    status: 200,
    description: 'Refund created successfully.',
  })
  async refundPayment(
    @Param('captureId') captureId: string,
    @Body('amount') amount?: number,
  ) {
    return this.paypalService.refundPayment(captureId, amount);
  }

  @Post('payout')
  @ApiOperation({ summary: 'Create a PayPal payout' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['recipientEmail', 'amount'],
      properties: {
        recipientEmail: { type: 'string', example: 'recipient@example.com' },
        amount: { type: 'number', example: 50.00 },
        currency: { type: 'string', example: 'USD' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Payout created successfully.',
  })
  async createPayout(@Body() body: {
    recipientEmail: string;
    amount: number;
    currency?: string;
  }) {
    return this.paypalService.createPayout(
      body.recipientEmail,
      body.amount,
      body.currency,
    );
  }

  @Get('config')
  @ApiOperation({ summary: 'Get PayPal configuration' })
  @ApiResponse({
    status: 200,
    description: 'PayPal configuration.',
    schema: {
      type: 'object',
      properties: {
        clientId: { type: 'string' },
        environment: { type: 'string' },
        isConfigured: { type: 'boolean' },
      },
    },
  })
  getConfig() {
    return {
      clientId: this.paypalService.getClientId(),
      environment: this.paypalService.getEnvironment(),
      isConfigured: this.paypalService.isConfigured(),
    };
  }

  @Get('health')
  @ApiOperation({ summary: 'Check PayPal service health' })
  @ApiResponse({
    status: 200,
    description: 'PayPal service health status.',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string' },
        configured: { type: 'boolean' },
        environment: { type: 'string' },
      },
    },
  })
  async getHealth() {
    return {
      status: this.paypalService.isConfigured() ? 'healthy' : 'misconfigured',
      configured: this.paypalService.isConfigured(),
      environment: this.paypalService.getEnvironment(),
      baseUrl: this.paypalService.getBaseUrl(),
    };
  }

  @Post('test-payment')
  @ApiOperation({ summary: 'Create a test PayPal order (for development)' })
  @ApiQuery({
    name: 'purchaseId',
    required: false,
    description: 'Purchase ID to associate with the test order',
  })
  @ApiResponse({
    status: 200,
    description: 'Test order created successfully.',
  })
  async createTestOrder(
    @Query('purchaseId') purchaseId?: string,
  ) {
    if (!this.paypalService.isConfigured()) {
      throw new Error('PayPal is not configured');
    }

    return this.paypalService.createOrder(
      'Test Digital Package',
      1.00, // $1.00 test payment
      `${process.env.FRONTEND_URL}/success?paypal=true&test=true`,
      `${process.env.FRONTEND_URL}/cancel?paypal=true&test=true`,
    );
  }
}