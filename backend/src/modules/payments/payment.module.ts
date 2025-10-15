import { Module } from '@nestjs/common';
import { StripeModule } from './stripe/stripe.module';
import { PayPalModule } from './paypal/paypal.module';

@Module({
  imports: [StripeModule, PayPalModule],
  exports: [StripeModule, PayPalModule],
})
export class PaymentModule {}