import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for API Testing
 * 
 * This configuration is specifically for API endpoint testing using Playwright's
 * APIRequestContext instead of traditional supertest approach.
 */
export default defineConfig({
  testDir: './test',
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
      name: 'API Tests',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
