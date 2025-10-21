import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserSeederService } from './user.seeder.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from './entities/user.entity';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userSeederService: UserSeederService,
  ) {}

  @Post('register')
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() loginUserDto: LoginUserDto) {
    return this.userService.login(loginUserDto);
  }

  @Post('seed-demo')
  @HttpCode(HttpStatus.OK)
  async seedDemoUser() {
    const user = await this.userSeederService.createDemoUser();
    const result = await this.userService.login({
      email: user.email,
      password: 'demo123',
    });

    return {
      message: 'Demo user created and logged in successfully',
      user: result.user,
      accessToken: result.accessToken,
      demoCredentials: {
        email: 'demo@example.com',
        password: 'demo123',
      }
    };
  }

  @Post('seed-test-users')
  @HttpCode(HttpStatus.OK)
  async seedTestUsers() {
    await this.userSeederService.createTestUsers();
    return {
      message: 'Test users created successfully',
      users: [
        { email: 'john@example.com', password: 'password123', role: 'customer' },
        { email: 'jane@example.com', password: 'password123', role: 'shop_owner' },
        { email: 'admin@example.com', password: 'admin123', role: 'platform_admin' },
      ]
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  findAll() {
    return this.userService.findAll();
  }

  @Get('shop-owners')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  getShopOwners() {
    return this.userService.getShopOwners();
  }

  @Get('customers')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  getCustomers() {
    return this.userService.getCustomers();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return this.userService.findOne(req.user.sub);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateUserDto: Partial<CreateUserDto>) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.PLATFORM_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}