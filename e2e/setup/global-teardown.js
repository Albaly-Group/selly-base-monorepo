const { execSync } = require('child_process');

/**
 * Global Teardown for E2E Tests
 * 
 * This script runs after all tests to clean up the test environment:
 * 1. Stops PostgreSQL database container
 * 2. Removes test data volumes (optional, based on CI environment)
 */
async function globalTeardown() {
  console.log('');
  console.log('🧹 Cleaning up test environment...');
  
  try {
    // In CI, completely remove volumes. Locally, keep them for faster reruns
    if (process.env.CI) {
      console.log('🗑️  Removing database containers and volumes...');
      execSync('docker compose -f docker-compose.db-only.yml down -v', {
        stdio: 'inherit',
        timeout: 30000,
      });
    } else {
      console.log('⏸️  Stopping database containers (keeping volumes for faster reruns)...');
      execSync('docker compose -f docker-compose.db-only.yml stop', {
        stdio: 'inherit',
        timeout: 30000,
      });
      console.log('💡 Tip: Run "docker compose -f docker-compose.db-only.yml down -v" to remove volumes');
    }
    
    console.log('✅ Test environment cleanup complete!');
  } catch (error) {
    console.error('⚠️  Warning: Failed to clean up test environment:', error);
    // Don't throw - cleanup failures shouldn't fail the test run
  }
}

module.exports = globalTeardown;
