import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './database.config';

describe('Database Configuration', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          load: [databaseConfig],
        }),
      ],
    }).compile();
  });

  afterEach(async () => {
    await module.close();
  });

  describe('DATABASE_URL parsing', () => {
    it('should parse DATABASE_URL correctly', () => {
      // Set DATABASE_URL for this test
      process.env.DATABASE_URL = 'postgresql://testuser:testpass@testhost:5433/testdb';
      process.env.SKIP_DATABASE = 'false';
      
      // Clear individual env vars to ensure URL is used
      delete process.env.DATABASE_HOST;
      delete process.env.DATABASE_PORT;
      delete process.env.DATABASE_USER;
      delete process.env.DATABASE_PASSWORD;
      delete process.env.DATABASE_NAME;

      const config = databaseConfig();
      
      expect(config.host).toBe('testhost');
      expect(config.port).toBe(5433);
      expect(config.username).toBe('testuser');
      expect(config.password).toBe('testpass');
      expect(config.database).toBe('testdb');
    });

    it('should parse common cloud provider DATABASE_URL formats', () => {
      // Test with a realistic Heroku/Supabase/Railway-style URL
      process.env.DATABASE_URL = 'postgresql://user123:pass456@ec2-1-2-3-4.compute-1.amazonaws.com:5432/d1a2b3c4d5e6f7';
      process.env.SKIP_DATABASE = 'false';
      
      // Clear individual env vars to ensure URL is used
      delete process.env.DATABASE_HOST;
      delete process.env.DATABASE_PORT;
      delete process.env.DATABASE_USER;
      delete process.env.DATABASE_PASSWORD;
      delete process.env.DATABASE_NAME;

      const config = databaseConfig();
      
      expect(config.host).toBe('ec2-1-2-3-4.compute-1.amazonaws.com');
      expect(config.port).toBe(5432);
      expect(config.username).toBe('user123');
      expect(config.password).toBe('pass456');
      expect(config.database).toBe('d1a2b3c4d5e6f7');
    });

    it('should fallback to individual environment variables when DATABASE_URL is not set', () => {
      // Clear DATABASE_URL
      delete process.env.DATABASE_URL;
      process.env.SKIP_DATABASE = 'false';
      
      // Set individual env vars
      process.env.DATABASE_HOST = 'fallback-host';
      process.env.DATABASE_PORT = '5434';
      process.env.DATABASE_USER = 'fallback-user';
      process.env.DATABASE_PASSWORD = 'fallback-pass';
      process.env.DATABASE_NAME = 'fallback-db';

      const config = databaseConfig();
      
      expect(config.host).toBe('fallback-host');
      expect(config.port).toBe(5434);
      expect(config.username).toBe('fallback-user');
      expect(config.password).toBe('fallback-pass');
      expect(config.database).toBe('fallback-db');
    });

    it('should use defaults when neither DATABASE_URL nor individual vars are set', () => {
      // Clear all database env vars
      delete process.env.DATABASE_URL;
      delete process.env.DATABASE_HOST;
      delete process.env.DATABASE_PORT;
      delete process.env.DATABASE_USER;
      delete process.env.DATABASE_PASSWORD;
      delete process.env.DATABASE_NAME;
      process.env.SKIP_DATABASE = 'false';

      const config = databaseConfig();
      
      expect(config.host).toBe('localhost');
      expect(config.port).toBe(5432);
      expect(config.username).toBe('postgres');
      expect(config.password).toBe('postgres');
      expect(config.database).toBe('selly_base');
    });

    it('should parse DATABASE_URL with SSL parameters', () => {
      // Test with SSL mode require
      process.env.DATABASE_URL = 'postgresql://user123:pass456@testhost:5432/testdb?sslmode=require';
      process.env.SKIP_DATABASE = 'false';
      process.env.NODE_ENV = 'production';
      
      // Clear individual env vars to ensure URL is used
      delete process.env.DATABASE_HOST;
      delete process.env.DATABASE_PORT;
      delete process.env.DATABASE_USER;
      delete process.env.DATABASE_PASSWORD;
      delete process.env.DATABASE_NAME;

      const config = databaseConfig();
      
      expect(config.host).toBe('testhost');
      expect(config.port).toBe(5432);
      expect(config.username).toBe('user123');
      expect(config.password).toBe('pass456');
      expect(config.database).toBe('testdb');
      expect(config.ssl).toEqual({ rejectUnauthorized: false });
    });

    it('should parse DATABASE_URL with ssl=true parameter', () => {
      // Test with ssl=true parameter
      process.env.DATABASE_URL = 'postgresql://user123:pass456@testhost:5432/testdb?ssl=true';
      process.env.SKIP_DATABASE = 'false';
      process.env.NODE_ENV = 'development';
      
      // Clear individual env vars to ensure URL is used
      delete process.env.DATABASE_HOST;
      delete process.env.DATABASE_PORT;
      delete process.env.DATABASE_USER;
      delete process.env.DATABASE_PASSWORD;
      delete process.env.DATABASE_NAME;

      const config = databaseConfig();
      
      expect(config.host).toBe('testhost');
      expect(config.ssl).toEqual({ rejectUnauthorized: false });
    });

    it('should not use SSL when no SSL parameters in DATABASE_URL and not production', () => {
      // Test without SSL parameters in development
      process.env.DATABASE_URL = 'postgresql://user123:pass456@testhost:5432/testdb';
      process.env.SKIP_DATABASE = 'false';
      process.env.NODE_ENV = 'development';
      
      // Clear individual env vars to ensure URL is used
      delete process.env.DATABASE_HOST;
      delete process.env.DATABASE_PORT;
      delete process.env.DATABASE_USER;
      delete process.env.DATABASE_PASSWORD;
      delete process.env.DATABASE_NAME;

      const config = databaseConfig();
      
      expect(config.ssl).toBe(false);
    });

    it('should skip database when SKIP_DATABASE is true', () => {
      process.env.DATABASE_URL = 'postgresql://testuser:testpass@testhost:5433/testdb';
      process.env.SKIP_DATABASE = 'true';

      const config = databaseConfig();
      
      expect(config.entities).toEqual([]);
      expect(config.autoLoadEntities).toBe(false);
      expect(config.retryAttempts).toBe(0);
    });
  });
});