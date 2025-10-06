import { DataSource } from 'typeorm';
import { seedReferenceData } from './reference-data.seed';
import databaseConfig from '../../config/database.config';

/**
 * Main seed runner
 * Runs all seed functions in order
 */

async function runSeeds() {
  console.log('🚀 Starting database seeding...\n');

  // Get database configuration
  const dbConfig = databaseConfig();

  // Create a sanitized Postgres options object to avoid passing
  // driver-specific complex properties into DataSource.
  const pgOptions: import('typeorm').DataSourceOptions = {
    type: 'postgres',
    host: String(
      (dbConfig as any).host ?? process.env.DATABASE_HOST ?? 'localhost',
    ),
    port: Number((dbConfig as any).port ?? process.env.DATABASE_PORT ?? 5432),
    username: String(
      (dbConfig as any).username ?? process.env.DATABASE_USER ?? 'postgres',
    ),
    password: String(
      (dbConfig as any).password ?? process.env.DATABASE_PASSWORD ?? 'postgres',
    ),
    database: String(
      (dbConfig as any).database ?? process.env.DATABASE_NAME ?? 'selly_base',
    ),
    entities: ['src/entities/*.ts'],
    migrations: ['src/database/migrations/*.ts'],
    synchronize: Boolean((dbConfig as any).synchronize),
    migrationsRun: Boolean((dbConfig as any).migrationsRun),
    logging: Boolean((dbConfig as any).logging),
    ssl: (dbConfig as any).ssl ?? false,
    extra: (dbConfig as any).extra ?? {},
  };

  const dataSource = new DataSource(pgOptions);

  try {
    // Initialize connection
    console.log('📡 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected\n');

    // Run all seed functions
    await seedReferenceData(dataSource);

    console.log('\n🎉 All seeds completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    // Close connection
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('📡 Database connection closed');
    }
  }
}

// Run seeds
runSeeds();
