import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Backend API Testing
 * 
 * This configuration is specifically for backend API endpoint testing using Playwright's
 * APIRequestContext. These are NOT true E2E tests - they only test the backend API layer.
 * 
 * Test Architecture:
 * - API Tests (this config): Backend API endpoints only
 * - Integration Tests: Backend with database (Jest/Supertest)
 * - E2E Tests: Frontend -> Backend -> Database (separate config)
 */
export default defineConfig({
  testDir: './test/api',
  testMatch: '**/*.playwright.spec.ts',
  fullyParallel: false, // Run tests sequentially to maintain data consistency
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Use single worker for API tests to avoid data conflicts
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
  ],
  
  use: {
    baseURL: process.env.API_BASE_URL || 'http://localhost:3001',
    extraHTTPHeaders: {
      'Accept': 'application/json',
    },
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'Backend API Tests',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
