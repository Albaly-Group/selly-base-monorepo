import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Get SSL configuration based on parsed URL and environment
 */
function getSslConfig(parsedUrl: { ssl?: boolean } | null) {
  // If DATABASE_URL explicitly specifies SSL requirement
  if (parsedUrl?.ssl) {
    return { rejectUnauthorized: false };
  }

  // Default production SSL behavior
  if (process.env.NODE_ENV === 'production') {
    return { rejectUnauthorized: false };
  }

  // No SSL for development
  return false;
}

/**
 * Parse DATABASE_URL format: postgresql://user:password@host:port/dbname?sslmode=require
 */
function parseDatabaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    const searchParams = new URLSearchParams(parsed.search);

    // Check for SSL requirements in URL parameters
    const sslMode = searchParams.get('sslmode');
    const ssl = searchParams.get('ssl');
    const requireSsl = sslMode === 'require' || ssl === 'true';

    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      username: parsed.username,
      password: parsed.password,
      database: parsed.pathname.slice(1), // Remove leading slash
      ssl: requireSsl,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    console.warn('Failed to parse DATABASE_URL:', errorMessage);
    return null;
  }
}

export default registerAs('database', (): TypeOrmModuleOptions => {
  // Skip database if explicitly requested (case-insensitive)
  const skipDatabase = process.env.SKIP_DATABASE?.toLowerCase() === 'true';

  if (skipDatabase) {
    return {
      type: 'postgres',
      synchronize: false,
      logging: false,
      entities: [],
      autoLoadEntities: false,
      retryAttempts: 0,
    } as TypeOrmModuleOptions;
  }

  // Parse DATABASE_URL if provided, otherwise use individual environment variables
  const databaseUrl = process.env.DATABASE_URL;
  const parsedUrl = databaseUrl ? parseDatabaseUrl(databaseUrl) : null;

  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    type: 'postgres',
    host: parsedUrl?.host || process.env.DATABASE_HOST || 'localhost',
    port: parsedUrl?.port || parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: parsedUrl?.username || process.env.DATABASE_USER || 'postgres',
    password:
      parsedUrl?.password || process.env.DATABASE_PASSWORD || 'postgres',
    database: parsedUrl?.database || process.env.DATABASE_NAME || 'selly_base',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    // Disable synchronize by default to prevent metadata table errors
    // Only enable if explicitly requested
    synchronize: process.env.DB_SYNC?.toLowerCase() === 'true',
    migrationsRun:
      isProduction || process.env.DB_AUTO_MIGRATE?.toLowerCase() === 'true',
    logging: isDevelopment,
    ssl: getSslConfig(parsedUrl),
    // Improve connection handling
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '3', 10),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '3000', 10),
    extra: {
      connectionLimit: parseInt(
        process.env.DATABASE_CONNECTION_LIMIT || '10',
        10,
      ),
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    },
  };
});
