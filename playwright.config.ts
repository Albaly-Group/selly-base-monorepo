import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for True E2E Testing in Real Environment
 * 
 * This configuration runs end-to-end tests against a real PostgreSQL database
 * instead of mock data, providing more realistic test conditions.
 * 
 * Test Architecture:
 * - PostgreSQL database in Docker (automatically started by globalSetup)
 * - Backend API running locally with real database connection
 * - Frontend running locally
 * - E2E Tests: Full stack from frontend UI to database
 * 
 * Environment Setup:
 * - Database: PostgreSQL in Docker (port 5433)
 * - Backend: Local with DATABASE_URL configured
 * - Frontend: Local development server
 * 
 * To run with mock data (faster, no database needed):
 *   USE_MOCK_DATA=true npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: '**/*.e2e.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-e2e' }],
  ],
  
  // Global setup to start database
  globalSetup: process.env.USE_MOCK_DATA === 'true' ? undefined : require.resolve('./e2e/setup/global-setup.js'),
  globalTeardown: process.env.USE_MOCK_DATA === 'true' ? undefined : require.resolve('./e2e/setup/global-teardown.js'),
  
  use: {
    baseURL: process.env.WEB_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  /* Run dev servers before starting tests */
  webServer: {
    command: process.env.USE_MOCK_DATA === 'true' 
      ? 'npm run dev' 
      : 'DATABASE_URL=postgresql://postgres:postgres@localhost:5433/selly_base_e2e SKIP_DATABASE=false npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: process.env.USE_MOCK_DATA === 'true' ? {} : {
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5433/selly_base_e2e',
      SKIP_DATABASE: 'false',
      JWT_SECRET: 'test-secret-key-for-e2e',
      JWT_EXPIRES_IN: '7d',
    },
  },
});
