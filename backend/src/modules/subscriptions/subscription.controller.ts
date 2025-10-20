import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SubscriptionStatus } from './entities/subscription.entity';

enum UserRole {
  CUSTOMER = 'customer',
  SHOP_OWNER = 'shop_owner',
  PLATFORM_ADMIN = 'platform_admin'
}
import { BillingCycle } from '../../common/enums/billing-cycle.enum';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.subscriptionService.findAll();
  }

  @Get('my-subscriptions')
  @UseGuards(JwtAuthGuard)
  findMySubscriptions(@Request() req) {
    return this.subscriptionService.findByUser(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.subscriptionService.findOne(id);
  }

  @Post(':id/cancel')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  cancel(
    @Param('id') id: string,
    @Body() body: { cancelAtPeriodEnd?: boolean }
  ) {
    const { cancelAtPeriodEnd = true } = body;
    return this.subscriptionService.cancel(id, cancelAtPeriodEnd);
  }

  @Post(':id/resume')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  resume(@Param('id') id: string) {
    return this.subscriptionService.resume(id);
  }

  @Patch(':id/change-plan')
  @UseGuards(JwtAuthGuard)
  changePlan(
    @Param('id') id: string,
    @Body() body: { billingCycle: BillingCycle }
  ) {
    return this.subscriptionService.update(id, {
      billingCycle: body.billingCycle,
    });
  }

  @Get('shops/:shopId')
  @UseGuards(JwtAuthGuard)
  findShopSubscriptions(@Param('shopId') shopId: string) {
    return this.subscriptionService.findByShop(shopId);
  }

  @Get('admin/expiring-soon')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  getExpiringSoon() {
    return this.subscriptionService.getSubscriptionsExpiringSoon();
  }

  @Get('admin/active')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  getActiveSubscriptions() {
    return this.subscriptionService.getActiveSubscriptions();
  }
}