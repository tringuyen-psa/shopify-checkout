import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { CheckoutSession } from './entities/checkout-session.entity';
import { PackageModule } from '../packages/package.module';
import { ShopModule } from '../shops/shop.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CheckoutSession]),
    PackageModule,
    ShopModule,
  ],
  controllers: [CheckoutController],
  providers: [CheckoutService],
  exports: [CheckoutService],
})
export class CheckoutModule {}