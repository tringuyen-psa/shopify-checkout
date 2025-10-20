import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { PackageModule } from './modules/packages/package.module';
import { PurchaseModule } from './modules/purchases/purchase.module';
import { PaymentModule } from './modules/payments/payment.module';
import { ShopModule } from './modules/shops/shop.module';
import { UserModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CheckoutModule } from './modules/checkout/checkout.module';
import { SubscriptionModule } from './modules/subscriptions/subscription.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
    }),
    AuthModule,
    UserModule,
    ShopModule,
    PackageModule,
    PurchaseModule,
    PaymentModule,
    CheckoutModule,
    SubscriptionModule,
  ],
  controllers: [AppController],
})
export class AppModule {}