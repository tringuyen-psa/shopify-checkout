import { Injectable, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email }
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(createUserDto.password, saltRounds);

    const user = this.userRepository.create({
      ...createUserDto,
      passwordHash,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['shops', 'purchases', 'subscriptions']
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['shops', 'purchases', 'subscriptions']
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
      relations: ['shops', 'purchases', 'subscriptions']
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return user;
  }

  async update(id: string, updateUserDto: Partial<CreateUserDto>): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      // Hash new password
      const saltRounds = 10;
      updateUserDto['passwordHash'] = await bcrypt.hash(updateUserDto.password, saltRounds);
      delete updateUserDto.password;
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    user.isActive = false;
    await this.userRepository.save(user);
  }

  async validatePassword(email: string, password: string): Promise<User> {
    try {
      const user = await this.userRepository.findOne({
        where: { email, isActive: true }
      });

      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // Update last login
      user.lastLoginAt = new Date();
      await this.userRepository.save(user);

      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<{ user: User; accessToken: string }> {
    const user = await this.validatePassword(loginUserDto.email, loginUserDto.password);

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      user: {
        ...user,
        passwordHash: undefined, // Remove password from response
      } as any,
      accessToken,
    };
  }

  async updateStripeCustomerId(id: string, stripeCustomerId: string): Promise<User> {
    const user = await this.findOne(id);
    user.stripeCustomerId = stripeCustomerId;
    return this.userRepository.save(user);
  }

  async getShopOwners(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.SHOP_OWNER, isActive: true },
      relations: ['shops']
    });
  }

  async getCustomers(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.CUSTOMER, isActive: true },
      relations: ['purchases', 'subscriptions']
    });
  }
}