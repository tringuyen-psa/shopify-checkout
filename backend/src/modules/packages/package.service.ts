import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Package } from "./entities/package.entity";
import { CreatePackageDto } from "./dto/create-package.dto";
import { UpdatePackageDto } from "./dto/update-package.dto";
import { BillingCycle } from "../../common/enums/billing-cycle.enum.js";

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(Package)
    private packageRepository: Repository<Package>
  ) {}

  async create(createPackageDto: CreatePackageDto): Promise<Package> {
    const newPackage = this.packageRepository.create(createPackageDto);
    return this.packageRepository.save(newPackage);
  }

  async findAll(): Promise<Package[]> {
    return this.packageRepository.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Package> {
    const packageEntity = await this.packageRepository.findOne({
      where: { id },
    });

    if (!packageEntity) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }

    return packageEntity;
  }

  async update(
    id: string,
    updatePackageDto: UpdatePackageDto
  ): Promise<Package> {
    const packageEntity = await this.findOne(id);

    Object.assign(packageEntity, updatePackageDto);
    return this.packageRepository.save(packageEntity);
  }

  async remove(id: string): Promise<void> {
    const packageEntity = await this.findOne(id);

    // Soft delete by setting isActive to false
    packageEntity.isActive = false;
    await this.packageRepository.save(packageEntity);
  }

  async getPriceByPackageAndCycle(
    packageId: string,
    cycle: BillingCycle
  ): Promise<number> {
    const packageEntity = await this.findOne(packageId);
    return packageEntity.getPriceByCycle(cycle);
  }

  async getActivePackagesCount(): Promise<number> {
    return this.packageRepository.count({
      where: { isActive: true },
    });
  }

  async findPopularPackages(limit: number = 5): Promise<Package[]> {
    // This is a simplified version - in a real app, you'd join with purchases
    // and count by packageId to get actual popularity
    return this.packageRepository.find({
      where: { isActive: true },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  async searchPackages(query: string): Promise<Package[]> {
    return this.packageRepository
      .createQueryBuilder("package")
      .where("package.isActive = :isActive", { isActive: true })
      .andWhere(
        "(package.name ILIKE :query OR package.description ILIKE :query)",
        { query: `%${query}%` }
      )
      .orderBy("package.name", "ASC")
      .getMany();
  }

  async validatePackageExists(packageId: string): Promise<boolean> {
    const count = await this.packageRepository.count({
      where: { id: packageId, isActive: true },
    });
    return count > 0;
  }

  async createSamplePackages(): Promise<Package[]> {
    const samplePackages: CreatePackageDto[] = [
      {
        name: "Starter Digital Pack",
        description:
          "Perfect for individuals just starting their digital journey",
        basePrice: 29.99,
        weeklyPrice: 9.99,
        monthlyPrice: 29.99,
        yearlyPrice: 299.99,
        features: [
          "Basic digital tools",
          "Email support",
          "1GB cloud storage",
          "Access to templates",
        ],
        isActive: true,
        imageUrl:
          "https://via.placeholder.com/300x200/4F46E5/FFFFFF?text=Starter",
      },
      {
        name: "Professional Digital Suite",
        description:
          "Complete digital toolkit for professionals and small businesses",
        basePrice: 99.99,
        weeklyPrice: 29.99,
        monthlyPrice: 99.99,
        yearlyPrice: 999.99,
        features: [
          "Advanced digital tools",
          "Priority support",
          "50GB cloud storage",
          "Premium templates",
          "Analytics dashboard",
          "Team collaboration",
        ],
        isActive: true,
        imageUrl:
          "https://via.placeholder.com/300x200/10B981/FFFFFF?text=Professional",
      },
      {
        name: "Enterprise Digital Platform",
        description:
          "Enterprise-grade digital solution for large organizations",
        basePrice: 299.99,
        weeklyPrice: 89.99,
        monthlyPrice: 299.99,
        yearlyPrice: 2999.99,
        features: [
          "All Professional features",
          "Unlimited cloud storage",
          "Dedicated support",
          "Custom integrations",
          "Advanced analytics",
          "SLA guarantee",
          "Custom training",
          "API access",
        ],
        isActive: true,
        imageUrl:
          "https://via.placeholder.com/300x200/8B5CF6/FFFFFF?text=Enterprise",
      },
    ];

    const createdPackages: Package[] = [];

    for (const packageData of samplePackages) {
      const existingPackage = await this.packageRepository.findOne({
        where: { name: packageData.name },
      });

      if (!existingPackage) {
        const newPackage = this.packageRepository.create(packageData);
        createdPackages.push(await this.packageRepository.save(newPackage));
      } else {
        createdPackages.push(existingPackage);
      }
    }

    return createdPackages;
  }
}
