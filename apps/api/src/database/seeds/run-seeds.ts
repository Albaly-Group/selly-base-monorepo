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
  
  // Create data source
  const dataSource = new DataSource({
    ...dbConfig,
    entities: ['src/entities/*.ts'],
    migrations: ['src/database/migrations/*.ts'],
  });

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
