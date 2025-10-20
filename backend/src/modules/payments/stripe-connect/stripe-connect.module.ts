import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeConnectService } from './stripe-connect.service';
import { StripeConnectController } from './stripe-connect.controller';
import { Shop } from '../../shops/entities/shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shop])],
  controllers: [StripeConnectController],
  providers: [StripeConnectService],
  exports: [StripeConnectService],
})
export class StripeConnectModule {}