import { Injectable, UnauthorizedException, Optional } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, Organization } from '../../entities';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    organizationId: string;
    organization: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  organizationId: string;
  iat?: number;
  exp?: number;
}

// Mock users for development when database is not available
const MOCK_USERS = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    email: 'admin@albaly.com',
    name: 'Admin User',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    organizationId: '123e4567-e89b-12d3-a456-426614174001',
    organization: {
      id: '123e4567-e89b-12d3-a456-426614174001',
      name: 'Albaly Digital',
      slug: 'albaly-digital',
    },
    status: 'active',
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174010',
    email: 'test@example.com',
    name: 'Test User',
    passwordHash: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    organizationId: '123e4567-e89b-12d3-a456-426614174002',
    organization: {
      id: '123e4567-e89b-12d3-a456-426614174002',
      name: 'Example Corp',
      slug: 'example-corp',
    },
    status: 'active',
  },
];

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @Optional() @InjectRepository(User)
    private userRepository?: Repository<User>,
    @Optional() @InjectRepository(Organization)
    private organizationRepository?: Repository<Organization>,
  ) {}

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const { email, password } = loginRequest;
    
    // Use database if available, otherwise use mock data
    const user = this.userRepository 
      ? await this.validateUserFromDatabase(email, password)
      : await this.validateUserFromMockData(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
    };

    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
        organization: user.organization,
      },
    };
  }

  private async validateUserFromDatabase(email: string, password: string): Promise<any> {
    const user = await this.userRepository!
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .where('user.email = :email', { email })
      .andWhere('user.status = :status', { status: 'active' })
      .getOne();

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  private async validateUserFromMockData(email: string, password: string): Promise<any> {
    const user = MOCK_USERS.find(u => u.email === email && u.status === 'active');
    
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async validateToken(token: string): Promise<JwtPayload | null> {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      return null;
    }
  }

  async getUserById(userId: string): Promise<any> {
    if (this.userRepository) {
      return await this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.organization', 'organization')
        .where('user.id = :userId', { userId })
        .andWhere('user.status = :status', { status: 'active' })
        .getOne();
    }

    // Use mock data
    return MOCK_USERS.find(u => u.id === userId && u.status === 'active');
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }
}