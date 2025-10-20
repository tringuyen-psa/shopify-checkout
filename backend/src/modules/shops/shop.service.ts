import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThan } from 'typeorm';
import { Shop, ShopStatus } from './entities/shop.entity';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopDashboardStatsDto, CreatePackageDto, UpdatePackageDto } from './dto/shop-dashboard.dto';
import { Package } from '../packages/entities/package.entity';
import { CheckoutSession, CheckoutSessionStatus } from '../checkout/entities/checkout-session.entity';
import { Subscription, SubscriptionStatus } from '../subscriptions/entities/subscription.entity';
import slugify from 'slugify';

@Injectable()
export class ShopService {
  constructor(
    @InjectRepository(Shop)
    private shopRepository: Repository<Shop>,
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(CheckoutSession)
    private checkoutSessionRepository: Repository<CheckoutSession>,
    @InjectRepository(Subscription)
    private subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(createShopDto: CreateShopDto): Promise<Shop> {
    // Check if slug already exists
    const existingShop = await this.shopRepository.findOne({
      where: { slug: createShopDto.slug }
    });

    if (existingShop) {
      throw new ConflictException('Shop with this slug already exists');
    }

    const shop = this.shopRepository.create(createShopDto);
    return this.shopRepository.save(shop);
  }

  async findAll(): Promise<Shop[]> {
    return this.shopRepository.find({
      where: { isActive: true },
      relations: ['packages']
    });
  }

  async findOne(id: string): Promise<Shop> {
    const shop = await this.shopRepository.findOne({
      where: { id },
      relations: ['packages']
    });

    if (!shop) {
      throw new NotFoundException(`Shop with ID ${id} not found`);
    }

    return shop;
  }

  async findBySlug(slug: string): Promise<Shop> {
    const shop = await this.shopRepository.findOne({
      where: { slug, isActive: true },
      relations: ['packages']
    });

    if (!shop) {
      throw new NotFoundException(`Shop with slug ${slug} not found`);
    }

    return shop;
  }

  async findByOwner(ownerId: string): Promise<Shop[]> {
    return this.shopRepository.find({
      where: { ownerId },
      relations: ['packages']
    });
  }

  async update(id: string, updateShopDto: UpdateShopDto): Promise<Shop> {
    const shop = await this.findOne(id);

    if (updateShopDto.name && !updateShopDto.slug) {
      // Auto-generate slug from name if not provided
      updateShopDto.slug = slugify(updateShopDto.name, { lower: true });
    }

    Object.assign(shop, updateShopDto);
    return this.shopRepository.save(shop);
  }

  async remove(id: string): Promise<void> {
    const shop = await this.findOne(id);
    shop.isActive = false;
    await this.shopRepository.save(shop);
  }

  async updateStripeInfo(id: string, stripeAccountId: string): Promise<Shop> {
    const shop = await this.findOne(id);
    shop.stripeAccountId = stripeAccountId;
    return this.shopRepository.save(shop);
  }

  async updateStripeStatus(id: string, status: Partial<{
    stripeOnboardingComplete: boolean;
    stripeChargesEnabled: boolean;
    stripePayoutsEnabled: boolean;
  }>): Promise<Shop> {
    const shop = await this.findOne(id);
    Object.assign(shop, status);

    // If charges enabled, set shop to active
    if (status.stripeChargesEnabled && shop.status === ShopStatus.PENDING) {
      shop.status = ShopStatus.ACTIVE;
    }

    return this.shopRepository.save(shop);
  }

  async approveShop(id: string): Promise<Shop> {
    const shop = await this.findOne(id);
    shop.status = ShopStatus.ACTIVE;
    return this.shopRepository.save(shop);
  }

  async suspendShop(id: string): Promise<Shop> {
    const shop = await this.findOne(id);
    shop.status = ShopStatus.SUSPENDED;
    return this.shopRepository.save(shop);
  }

  // Dashboard Methods
  async getDashboardStats(shopId: string, statsDto: ShopDashboardStatsDto) {
    const shop = await this.findOne(shopId);

    const startDate = statsDto.startDate ? new Date(statsDto.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const endDate = statsDto.endDate ? new Date(statsDto.endDate) : new Date();

    // Get total revenue
    const checkoutSessions = await this.checkoutSessionRepository.find({
      where: {
        shopId,
        status: CheckoutSessionStatus.COMPLETED,
        createdAt: Between(startDate, endDate)
      }
    });

    const totalRevenue = checkoutSessions.reduce((sum, session) => sum + (session.price || 0), 0);
    const platformFees = checkoutSessions.reduce((sum, session) => sum + (session.platformFee || 0), 0);
    const netRevenue = totalRevenue - platformFees;

    // Get active subscriptions
    const activeSubscriptions = await this.subscriptionRepository.count({
      where: {
        shopId,
        status: SubscriptionStatus.ACTIVE
      }
    });

    // Get total packages
    const totalPackages = await this.packageRepository.count({
      where: { shopId }
    });

    const activePackages = await this.packageRepository.count({
      where: { shopId, isActive: true }
    });

    // Get monthly revenue trend
    const monthlyRevenue = await this.getMonthlyRevenue(shopId, startDate, endDate);

    // Get recent sales
    const recentSales = await this.checkoutSessionRepository.find({
      where: { shopId },
      order: { createdAt: 'DESC' },
      take: 10,
      relations: ['package']
    });

    return {
      revenue: {
        total: totalRevenue,
        net: netRevenue,
        platformFees,
        monthly: monthlyRevenue
      },
      subscriptions: {
        active: activeSubscriptions,
        total: checkoutSessions.length
      },
      packages: {
        total: totalPackages,
        active: activePackages
      },
      recentSales
    };
  }

  private async getMonthlyRevenue(shopId: string, startDate: Date, endDate: Date) {
    const monthlyData = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const monthRevenue = await this.checkoutSessionRepository
        .createQueryBuilder('session')
        .select('SUM(session.price)', 'total')
        .where('session.shopId = :shopId', { shopId })
        .andWhere('session.status = :status', { status: CheckoutSessionStatus.COMPLETED })
        .andWhere('session.createdAt BETWEEN :start AND :end', { start: monthStart, end: monthEnd })
        .getRawOne();

      monthlyData.push({
        month: currentDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
        revenue: parseFloat(monthRevenue?.total || '0')
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return monthlyData;
  }

  // Package Management for Shop Dashboard
  async getShopPackages(shopId: string): Promise<Package[]> {
    return this.packageRepository.find({
      where: { shopId },
      order: { createdAt: 'DESC' }
    });
  }

  async createShopPackage(shopId: string, createPackageDto: CreatePackageDto): Promise<Package> {
    const shop = await this.findOne(shopId);

    const packageData = this.packageRepository.create({
      ...createPackageDto,
      shopId,
      slug: slugify(createPackageDto.name, { lower: true }) + '-' + Date.now()
    });

    return this.packageRepository.save(packageData);
  }

  async updateShopPackage(shopId: string, packageId: string, updatePackageDto: UpdatePackageDto): Promise<Package> {
    const packageData = await this.packageRepository.findOne({
      where: { id: packageId, shopId }
    });

    if (!packageData) {
      throw new NotFoundException('Package not found');
    }

    // Note: Slug cannot be updated in UpdatePackageDto as it's not defined there

    Object.assign(packageData, updatePackageDto);
    return this.packageRepository.save(packageData);
  }

  async deleteShopPackage(shopId: string, packageId: string): Promise<void> {
    const packageData = await this.packageRepository.findOne({
      where: { id: packageId, shopId }
    });

    if (!packageData) {
      throw new NotFoundException('Package not found');
    }

    await this.packageRepository.remove(packageData);
  }

  // Analytics Methods
  async getTopPackages(shopId: string, limit: number = 5): Promise<any[]> {
    return this.checkoutSessionRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.package', 'package')
      .select([
        'package.id',
        'package.name',
        'COUNT(session.id) as salesCount',
        'SUM(session.price) as totalRevenue'
      ])
      .where('session.shopId = :shopId', { shopId })
      .andWhere('session.status = :status', { status: CheckoutSessionStatus.COMPLETED })
      .groupBy('package.id')
      .orderBy('totalRevenue', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getSubscriptionMetrics(shopId: string): Promise<any> {
    const subscriptions = await this.subscriptionRepository.find({
      where: { shopId }
    });

    const metrics = {
      total: subscriptions.length,
      active: subscriptions.filter(s => s.status === SubscriptionStatus.ACTIVE).length,
      canceled: subscriptions.filter(s => s.status === SubscriptionStatus.CANCELLED).length,
      pastDue: subscriptions.filter(s => s.status === SubscriptionStatus.PAST_DUE).length,
      trial: subscriptions.filter(s => s.status === SubscriptionStatus.TRIALING).length,
      monthlyRevenue: subscriptions
        .filter(s => s.status === SubscriptionStatus.ACTIVE && s.billingCycle === 'monthly')
        .reduce((sum, s) => sum + (s.price || 0), 0),
      yearlyRevenue: subscriptions
        .filter(s => s.status === SubscriptionStatus.ACTIVE && s.billingCycle === 'yearly')
        .reduce((sum, s) => sum + (s.price || 0), 0)
    };

    return metrics;
  }
}