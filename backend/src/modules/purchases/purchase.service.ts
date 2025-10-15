import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThan } from 'typeorm';
import { Purchase, PurchaseStatus, PaymentMethod } from './entities/purchase.entity';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PackageService } from '../packages/package.service';
import { BillingCycle } from '../../common/enums/billing-cycle.enum.js';

@Injectable()
export class PurchaseService {
  constructor(
    @InjectRepository(Purchase)
    private purchaseRepository: Repository<Purchase>,
    private packageService: PackageService,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    // Validate package exists
    const packageExists = await this.packageService.validatePackageExists(
      createPurchaseDto.packageId,
    );
    if (!packageExists) {
      throw new NotFoundException('Package not found');
    }

    // Get price based on billing cycle
    const price = await this.packageService.getPriceByPackageAndCycle(
      createPurchaseDto.packageId,
      createPurchaseDto.billingCycle,
    );

    // Calculate dates
    const startDate = new Date();
    const endDate = this.calculateEndDate(startDate, createPurchaseDto.billingCycle);

    const purchase = this.purchaseRepository.create({
      ...createPurchaseDto,
      price,
      startDate,
      endDate,
      status: PurchaseStatus.PENDING,
    });

    return this.purchaseRepository.save(purchase);
  }

  async findAll(): Promise<Purchase[]> {
    return this.purchaseRepository.find({
      relations: ['package'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByUserId(userId: string): Promise<Purchase[]> {
    return this.purchaseRepository.find({
      where: { userId },
      relations: ['package'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActivePurchases(userId: string): Promise<Purchase[]> {
    const now = new Date();
    return this.purchaseRepository.find({
      where: {
        userId,
        status: PurchaseStatus.COMPLETED,
        startDate: LessThanOrEqual(now),
        endDate: MoreThan(now),
      },
      relations: ['package'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Purchase> {
    const purchase = await this.purchaseRepository.findOne({
      where: { id },
      relations: ['package'],
    });

    if (!purchase) {
      throw new NotFoundException(`Purchase with ID ${id} not found`);
    }

    return purchase;
  }

  async updateStatus(
    id: string,
    status: PurchaseStatus,
    paymentId?: string,
  ): Promise<Purchase> {
    const purchase = await this.findOne(id);
    purchase.status = status;
    if (paymentId) {
      purchase.paymentId = paymentId;
    }
    return this.purchaseRepository.save(purchase);
  }

  async completePurchase(id: string, paymentId: string): Promise<Purchase> {
    return this.updateStatus(id, PurchaseStatus.COMPLETED, paymentId);
  }

  async cancelPurchase(id: string): Promise<Purchase> {
    return this.updateStatus(id, PurchaseStatus.CANCELLED);
  }

  async refundPurchase(id: string): Promise<Purchase> {
    return this.updateStatus(id, PurchaseStatus.REFUNDED);
  }

  async renewPurchase(id: string): Promise<Purchase> {
    const purchase = await this.findOne(id);

    if (!purchase.isActive()) {
      throw new BadRequestException('Cannot renew expired or inactive purchase');
    }

    // Calculate new end date
    const currentEndDate = new Date(purchase.endDate);
    const newEndDate = this.calculateEndDate(currentEndDate, purchase.billingCycle);

    purchase.endDate = newEndDate;
    return this.purchaseRepository.save(purchase);
  }

  async extendPurchase(id: string, days: number): Promise<Purchase> {
    const purchase = await this.findOne(id);

    if (purchase.status !== PurchaseStatus.COMPLETED) {
      throw new BadRequestException('Can only extend completed purchases');
    }

    const currentEndDate = new Date(purchase.endDate);
    currentEndDate.setDate(currentEndDate.getDate() + days);
    purchase.endDate = currentEndDate;

    return this.purchaseRepository.save(purchase);
  }

  async getPurchaseStats(userId?: string): Promise<{
    total: number;
    active: number;
    expired: number;
    totalSpent: number;
  }> {
    const whereClause = userId ? { userId } : {};

    const purchases = await this.purchaseRepository.find({
      where: whereClause,
    });

    const now = new Date();
    const active = purchases.filter(
      (p) => p.status === PurchaseStatus.COMPLETED && p.endDate > now,
    ).length;
    const expired = purchases.filter(
      (p) => p.status === PurchaseStatus.COMPLETED && p.endDate <= now,
    ).length;
    const totalSpent = purchases
      .filter((p) => p.status === PurchaseStatus.COMPLETED)
      .reduce((sum, p) => sum + Number(p.price), 0);

    return {
      total: purchases.length,
      active,
      expired,
      totalSpent,
    };
  }

  async getExpiringPurchases(daysAhead: number = 7): Promise<Purchase[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysAhead);

    return this.purchaseRepository.find({
      where: {
        status: PurchaseStatus.COMPLETED,
        endDate: Between(now, futureDate),
      },
      relations: ['package'],
      order: { endDate: 'ASC' },
    });
  }

  async getPurchasesByDateRange(
    startDate: Date,
    endDate: Date,
  ): Promise<Purchase[]> {
    return this.purchaseRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      relations: ['package'],
      order: { createdAt: 'DESC' },
    });
  }

  private calculateEndDate(startDate: Date, cycle: BillingCycle): Date {
    const endDate = new Date(startDate);

    switch (cycle) {
      case BillingCycle.WEEKLY:
        endDate.setDate(startDate.getDate() + 7);
        break;
      case BillingCycle.MONTHLY:
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      case BillingCycle.YEARLY:
        endDate.setFullYear(startDate.getFullYear() + 1);
        break;
      default:
        throw new BadRequestException('Invalid billing cycle');
    }

    return endDate;
  }

  async createSamplePurchase(userId: string, packageId: string): Promise<Purchase> {
    const samplePurchase: CreatePurchaseDto = {
      packageId,
      userId,
      billingCycle: BillingCycle.MONTHLY,
      paymentMethod: PaymentMethod.STRIPE,
      customerEmail: 'sample@example.com',
      customerName: 'Sample User',
      isRecurring: true,
      metadata: { source: 'sample' },
    };

    const purchase = await this.create(samplePurchase);

    // Auto-complete the sample purchase
    return this.completePurchase(purchase.id, 'sample_payment_id');
  }
}