import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs('database', (): TypeOrmModuleOptions => {
  // For development without actual database, return a mock configuration
  const isDevelopment = process.env.NODE_ENV !== 'production';
  const skipDatabase = process.env.SKIP_DATABASE === 'true';
  
  if (isDevelopment && skipDatabase) {
    return {
      type: 'postgres',
      synchronize: false,
      logging: false,
      entities: [],
      autoLoadEntities: false,
      retryAttempts: 0,
    } as TypeOrmModuleOptions;
  }

  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'postgres',
    database: process.env.DATABASE_NAME || 'selly_base',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: process.env.NODE_ENV !== 'production',
    logging: process.env.NODE_ENV === 'development',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    extra: {
      connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || '10', 10),
    },
  };
});