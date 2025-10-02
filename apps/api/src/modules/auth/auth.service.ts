import {
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as argon2 from 'argon2';
import {
  Users,
  Organizations,
  Users as User,
  Organizations as Organization,
} from '../../entities';

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
      permissions?: Array<{
        id: string;
        key: string;
        description?: string;
        created_at: string;
        updated_at: string;
      }>;
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



@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Organizations)
    private readonly organizationRepository: Repository<Organizations>,
  ) {}

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const { email, password } = loginRequest;

    // Always use database - no mock data fallback
    const user = await this.validateUserFromDatabase(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      organizationId: user.organizationId,
    };

    const accessToken = this.jwtService.sign(payload);

    // Map roles from the user entity and transform permissions string[] to Permission[]
    const roles =
      user.userRoles2?.map((userRole: any) => ({
        id: userRole.role.id,
        name: userRole.role.name,
        description: userRole.role.description,
        permissions: (userRole.role.permissions || []).map((permissionKey: string, index: number) => ({
          id: `${userRole.role.id}-perm-${index}`,
          key: permissionKey,
          description: `Permission: ${permissionKey}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })),
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
      const user = await this.userRepository.createQueryBuilder('user')
        .leftJoinAndSelect('user.organization', 'organization')
        .leftJoinAndSelect('user.userRoles2', 'userRole')
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
      // Handle database errors - no mock data fallback
      if (
        error.message?.includes('does not exist') &&
        error.message?.includes('relation')
      ) {
        this.logger.error(
          '❌ Database tables not found. Please initialize schema: psql -U postgres -d selly_base -f selly-base-optimized-schema.sql',
        );
        throw new Error('Database schema not initialized. Please run the SQL schema file.');
      }
      // For other database errors, log and rethrow
      this.logger.error('Database query failed:', error.message);
      throw error;
    }
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
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.organization', 'organization')
      .leftJoinAndSelect('user.userRoles2', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .where('user.id = :userId', { userId })
      .andWhere('user.status = :status', { status: 'active' })
      .getOne();
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
