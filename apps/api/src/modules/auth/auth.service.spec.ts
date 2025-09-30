import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User, Organization } from '../../entities';
import * as bcrypt from 'bcryptjs';
import * as argon2 from 'argon2';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Organization),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verifyPassword', () => {
    it('should verify bcrypt hash correctly', async () => {
      const password = 'testpassword';
      const bcryptHash = await bcrypt.hash(password, 10);

      // Access private method for testing
      const result = await (service as any).verifyPassword(
        password,
        bcryptHash,
      );
      expect(result).toBe(true);
    });

    it('should verify argon2 hash correctly', async () => {
      const password = 'testpassword';
      const argon2Hash = await argon2.hash(password);

      // Access private method for testing
      const result = await (service as any).verifyPassword(
        password,
        argon2Hash,
      );
      expect(result).toBe(true);
    });

    it('should return false for incorrect password with bcrypt hash', async () => {
      const password = 'testpassword';
      const wrongPassword = 'wrongpassword';
      const bcryptHash = await bcrypt.hash(password, 10);

      // Access private method for testing
      const result = await (service as any).verifyPassword(
        wrongPassword,
        bcryptHash,
      );
      expect(result).toBe(false);
    });

    it('should return false for incorrect password with argon2 hash', async () => {
      const password = 'testpassword';
      const wrongPassword = 'wrongpassword';
      const argon2Hash = await argon2.hash(password);

      // Access private method for testing
      const result = await (service as any).verifyPassword(
        wrongPassword,
        argon2Hash,
      );
      expect(result).toBe(false);
    });

    it('should handle invalid hash gracefully', async () => {
      const password = 'testpassword';
      const invalidHash = 'invalid-hash';

      // Access private method for testing
      const result = await (service as any).verifyPassword(
        password,
        invalidHash,
      );
      expect(result).toBe(false);
    });
  });

  describe('hashPassword', () => {
    it('should create argon2 hash for new passwords', async () => {
      const password = 'newpassword';
      const hash = await service.hashPassword(password);

      // Verify it's an argon2 hash
      expect(hash).toMatch(/^\$argon2id\$/);

      // Verify the hash can be verified with argon2
      const isValid = await argon2.verify(hash, password);
      expect(isValid).toBe(true);

      // Verify wrong password fails
      const isInvalid = await argon2.verify(hash, 'wrongpassword');
      expect(isInvalid).toBe(false);
    });
  });
});
