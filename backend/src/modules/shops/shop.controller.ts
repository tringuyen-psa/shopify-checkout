import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { ShopService } from './shop.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { ShopDashboardStatsDto, CreatePackageDto, UpdatePackageDto } from './dto/shop-dashboard.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('shops')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createShopDto: CreateShopDto) {
    return this.shopService.create(createShopDto);
  }

  @Get()
  findAll() {
    return this.shopService.findAll();
  }

  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.shopService.findBySlug(slug);
  }

  @Get('owner/:ownerId')
  @UseGuards(JwtAuthGuard)
  findByOwner(@Param('ownerId') ownerId: string) {
    return this.shopService.findByOwner(ownerId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
    return this.shopService.update(id, updateShopDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.shopService.remove(id);
  }

  // Dashboard endpoints
  @Get(':id/dashboard/stats')
  @UseGuards(JwtAuthGuard)
  getDashboardStats(
    @Param('id') id: string,
    @Query() statsDto?: ShopDashboardStatsDto,
    @Req() req?: any
  ) {
    // Ensure user can only access their own shop's dashboard
    if (req.user.id !== id) {
      throw new Error('Unauthorized');
    }
    return this.shopService.getDashboardStats(id, statsDto);
  }

  @Get(':id/dashboard/packages')
  @UseGuards(JwtAuthGuard)
  getShopPackages(@Param('id') id: string, @Req() req?: any) {
    if (req.user.id !== id) {
      throw new Error('Unauthorized');
    }
    return this.shopService.getShopPackages(id);
  }

  @Post(':id/dashboard/packages')
  @UseGuards(JwtAuthGuard)
  createShopPackage(
    @Param('id') id: string,
    @Body() createPackageDto: CreatePackageDto,
    @Req() req?: any
  ) {
    if (req.user.id !== id) {
      throw new Error('Unauthorized');
    }
    return this.shopService.createShopPackage(id, createPackageDto);
  }

  @Patch(':id/dashboard/packages/:packageId')
  @UseGuards(JwtAuthGuard)
  updateShopPackage(
    @Param('id') id: string,
    @Param('packageId') packageId: string,
    @Body() updatePackageDto: UpdatePackageDto,
    @Req() req?: any
  ) {
    if (req.user.id !== id) {
      throw new Error('Unauthorized');
    }
    return this.shopService.updateShopPackage(id, packageId, updatePackageDto);
  }

  @Delete(':id/dashboard/packages/:packageId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteShopPackage(
    @Param('id') id: string,
    @Param('packageId') packageId: string,
    @Req() req?: any
  ) {
    if (req.user.id !== id) {
      throw new Error('Unauthorized');
    }
    return this.shopService.deleteShopPackage(id, packageId);
  }

  @Get(':id/dashboard/analytics/top-packages')
  @UseGuards(JwtAuthGuard)
  getTopPackages(
    @Param('id') id: string,
    @Query('limit') limit?: string,
    @Req() req?: any
  ) {
    if (req.user.id !== id) {
      throw new Error('Unauthorized');
    }
    return this.shopService.getTopPackages(id, limit ? parseInt(limit) : 5);
  }

  @Get(':id/dashboard/analytics/subscriptions')
  @UseGuards(JwtAuthGuard)
  getSubscriptionMetrics(@Param('id') id: string, @Req() req?: any) {
    if (req.user.id !== id) {
      throw new Error('Unauthorized');
    }
    return this.shopService.getSubscriptionMetrics(id);
  }
}