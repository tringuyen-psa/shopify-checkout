import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserSeederService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createDemoUser(): Promise<User> {
    // Check if demo user already exists
    const existingDemoUser = await this.userRepository.findOne({
      where: { email: 'demo@example.com' }
    });

    if (existingDemoUser) {
      console.log('Demo user already exists');
      return existingDemoUser;
    }

    // Create demo user
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash('demo123', saltRounds);

    const demoUser = this.userRepository.create({
      name: 'Demo User',
      email: 'demo@example.com',
      passwordHash,
      role: UserRole.CUSTOMER,
      isActive: true,
    });

    const savedUser = await this.userRepository.save(demoUser);
    console.log('Demo user created successfully');
    return savedUser;
  }

  async createTestUsers(): Promise<void> {
    const testUsers = [
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: UserRole.CUSTOMER,
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: UserRole.SHOP_OWNER,
      },
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123',
        role: UserRole.PLATFORM_ADMIN,
      },
    ];

    const saltRounds = 10;

    for (const userData of testUsers) {
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email }
      });

      if (!existingUser) {
        const passwordHash = await bcrypt.hash(userData.password, saltRounds);
        const user = this.userRepository.create({
          ...userData,
          passwordHash,
          isActive: true,
        });
        await this.userRepository.save(user);
        console.log(`Created test user: ${userData.email}`);
      }
    }
  }
}