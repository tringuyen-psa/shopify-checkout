import { Module } from '@nestjs/common';
import { PayPalService } from './paypal.service';
import { PayPalController } from './paypal.controller';
import { PurchaseModule } from '../../purchases/purchase.module';

@Module({
  imports: [PurchaseModule],
  controllers: [PayPalController],
  providers: [PayPalService],
  exports: [PayPalService],
})
export class PayPalModule {}