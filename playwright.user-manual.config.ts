import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for User Manual Screenshot Capture
 */
export default defineConfig({
  testDir: './docs/user-manual',
  testMatch: '**/*.spec.ts',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report-user-manual' }],
  ],
  
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    viewport: { width: 1920, height: 1080 },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  timeout: 60000,
  expect: {
    timeout: 10000,
  },
});
