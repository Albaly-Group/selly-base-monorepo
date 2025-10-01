import {
  Injectable,
  UnauthorizedException,
  Optional,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as argon2 from 'argon2';
import { Users, Organizations, Users as User, Organizations as Organization } from '../../entities';

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
    roles?: Array<{
      id: string;
      name: string;
      description?: string;
    }>;
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
    passwordHash:
      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
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
    passwordHash:
      '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
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
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @Optional()
    @InjectRepository(Users)
    private userRepository?: Repository<Users>,
    @Optional()
    @InjectRepository(Organizations)
    private organizationRepository?: Repository<Organizations>,
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

    // Map roles from the user entity
    const roles =
      user.roles?.map((userRole: any) => ({
        id: userRole.role.id,
        name: userRole.role.name,
        description: userRole.role.description,
      })) || [];

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        organizationId: user.organizationId,
        organization: user.organization,
        roles: roles,
      },
    };
  }

  private async validateUserFromDatabase(
    email: string,
    password: string,
  ): Promise<any> {
    try {
      const user = await this.userRepository!.createQueryBuilder('user')
        .leftJoinAndSelect('user.organization', 'organization')
        .leftJoinAndSelect('user.roles', 'userRole')
        .leftJoinAndSelect('userRole.role', 'role')
        .where('user.email = :email', { email })
        .andWhere('user.status = :status', { status: 'active' })
        .getOne();

      if (!user) {
        return null;
      }

      const isPasswordValid = await this.verifyPassword(
        password,
        user.passwordHash,
      );
      if (!isPasswordValid) {
        return null;
      }

      return user;
    } catch (error) {
      // Handle database errors gracefully
      if (
        error.message?.includes('does not exist') &&
        error.message?.includes('relation')
      ) {
        this.logger.error(
          '❌ Database tables not found. Please initialize schema: psql -U postgres -d selly_base -f selly-base-optimized-schema.sql',
        );
        this.logger.warn(
          '💡 Falling back to mock authentication. This is not suitable for production!',
        );
        // Fall back to mock data instead of failing
        return await this.validateUserFromMockData(email, password);
      }
      // For other database errors, log and rethrow
      this.logger.error('Database query failed:', error.message);
      throw error;
    }
  }

  private async validateUserFromMockData(
    email: string,
    password: string,
  ): Promise<any> {
    const user = MOCK_USERS.find(
      (u) => u.email === email && u.status === 'active',
    );

    if (!user) {
      return null;
    }

    const isPasswordValid = await this.verifyPassword(
      password,
      user.passwordHash,
    );
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
        .leftJoinAndSelect('user.roles', 'userRole')
        .leftJoinAndSelect('userRole.role', 'role')
        .where('user.id = :userId', { userId })
        .andWhere('user.status = :status', { status: 'active' })
        .getOne();
    }

    // Use mock data
    return MOCK_USERS.find((u) => u.id === userId && u.status === 'active');
  }

  async hashPassword(password: string): Promise<string> {
    // Use argon2 for new password hashes to match database storage format
    return await argon2.hash(password);
  }

  /**
   * Verify password against hash, supporting both bcrypt and argon2 formats
   * @param password Plain text password
   * @param hash Hashed password (either bcrypt or argon2)
   * @returns Promise<boolean> indicating if password is valid
   */
  private async verifyPassword(
    password: string,
    hash: string,
  ): Promise<boolean> {
    try {
      // Check if it's an argon2 hash (starts with $argon2)
      if (hash.startsWith('$argon2')) {
        return await argon2.verify(hash, password);
      }

      // Check if it's a bcrypt hash (starts with $2a$, $2b$, or $2y$)
      if (
        hash.startsWith('$2a$') ||
        hash.startsWith('$2b$') ||
        hash.startsWith('$2y$')
      ) {
        return await bcrypt.compare(password, hash);
      }

      // If we can't identify the hash type, try bcrypt first (for backward compatibility)
      try {
        return await bcrypt.compare(password, hash);
      } catch {
        // If bcrypt fails, try argon2
        return await argon2.verify(hash, password);
      }
    } catch (error) {
      // If all verification attempts fail, return false
      return false;
    }
  }
}
