const { execSync } = require('child_process');

/**
 * Global Setup for E2E Tests
 * 
 * This script runs before all tests to set up the test environment:
 * 1. Starts PostgreSQL database in Docker
 * 2. Waits for database to be ready
 * 3. Database schema is automatically initialized via init script
 */
async function globalSetup() {
  console.log('🔧 Setting up test environment...');
  
  try {
    // Check if Docker is running
    console.log('📦 Checking Docker...');
    execSync('docker info', { stdio: 'ignore' });
    
    // Stop any existing database containers
    console.log('🧹 Cleaning up existing containers...');
    try {
      execSync('docker compose -f docker-compose.db-only.yml down -v', { 
        stdio: 'ignore',
        timeout: 10000 
      });
    } catch (error) {
      // Ignore errors if containers don't exist
    }
    
    // Start PostgreSQL database
    console.log('🚀 Starting PostgreSQL database...');
    execSync('docker compose -f docker-compose.db-only.yml up -d', {
      stdio: 'inherit',
    });
    
    // Wait for database to be ready
    console.log('⏳ Waiting for database to be ready...');
    const maxAttempts = 30;
    let attempt = 0;
    
    while (attempt < maxAttempts) {
      try {
        execSync(
          'docker exec selly-base-postgres-e2e pg_isready -U postgres -d selly_base_e2e',
          { stdio: 'ignore', timeout: 2000 }
        );
        console.log('✅ Database is ready!');
        break;
      } catch (error) {
        attempt++;
        if (attempt >= maxAttempts) {
          throw new Error('Database failed to start within timeout period');
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    console.log('✅ Test environment setup complete!');
    console.log('');
  } catch (error) {
    console.error('❌ Failed to set up test environment:', error);
    throw error;
  }
}

module.exports = globalSetup;
