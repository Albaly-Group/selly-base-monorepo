import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Parse DATABASE_URL format: postgresql://user:password@host:port/dbname
 */
function parseDatabaseUrl(url: string) {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      username: parsed.username,
      password: parsed.password,
      database: parsed.pathname.slice(1), // Remove leading slash
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
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
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl:
      process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false }
        : false,
    extra: {
      connectionLimit: parseInt(
        process.env.DATABASE_CONNECTION_LIMIT || '10',
        10,
      ),
    },
  };
});
