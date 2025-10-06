import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for True E2E Testing
 * 
 * This configuration is for end-to-end tests that test the entire application stack:
 * Frontend (UI) -> Backend (API) -> Database
 * 
 * Test Architecture:
 * - E2E Tests (this config): Full stack from frontend UI to database
 * - Backend API Tests: Backend API endpoints only (apps/api/playwright.config.ts)
 * - Integration Tests: Backend with database using Jest/Supertest
 * - Frontend Component Tests: Frontend components in isolation
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

  /* Run local dev server before starting tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
