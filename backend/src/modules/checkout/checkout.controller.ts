import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { CreateCheckoutSessionDto } from './dto/create-checkout-session.dto';
import { StripeCheckoutDto } from './dto/stripe-checkout.dto';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('create-session')
  async createCheckoutSession(@Body() createCheckoutSessionDto: CreateCheckoutSessionDto) {
    return this.checkoutService.createCheckoutSession(createCheckoutSessionDto);
  }

  @Get(':sessionId')
  async getCheckoutSession(@Param('sessionId') sessionId: string) {
    return this.checkoutService.getCheckoutSession(sessionId);
  }

  @Post(':sessionId/stripe')
  @HttpCode(HttpStatus.OK)
  async createStripeCheckout(
    @Param('sessionId') sessionId: string,
    @Body() stripeCheckoutDto: StripeCheckoutDto,
  ) {
    return this.checkoutService.createStripeCheckout(sessionId, stripeCheckoutDto);
  }
}