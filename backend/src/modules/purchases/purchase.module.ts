import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { Purchase } from './entities/purchase.entity';
import { PackageModule } from '../packages/package.module';

@Module({
  imports: [TypeOrmModule.forFeature([Purchase]), PackageModule],
  controllers: [PurchaseController],
  providers: [PurchaseService],
  exports: [PurchaseService],
})
export class PurchaseModule {}