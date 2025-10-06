import { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  pageShots: {
    pages: [
      { path: '/', name: 'home-page' },
      { path: '/companies', name: 'companies-list' },
      { path: '/dashboard', name: 'dashboard' },
      { path: '/lists', name: 'lists-page' },
    ],
    baseUrl: process.env.WEB_BASE_URL || 'http://localhost:3000',
  },
  
  // Configure comparison thresholds
  threshold: 0,
  
  // Path to save baseline and current screenshots
  imagePathBaseline: '.lostpixel/baseline',
  imagePathCurrent: '.lostpixel/current',
  imagePathDifference: '.lostpixel/difference',
  
  // Configure shot configuration
  shotConcurrency: 5,
  
  // Browser configuration
  browser: 'chromium',
  
  // Wait for network idle before taking screenshots
  waitBeforeScreenshot: 500,
  
  // Viewport configuration
  configureBrowser: (browser, page) => {
    page.setViewportSize({ width: 1280, height: 720 });
  },
  
  // Enable before and after hooks
  beforeScreenshot: async (page) => {
    // Wait for any animations to complete
    await page.waitForLoadState('networkidle');
  },
  
  // File name pattern
  generateOnly: false,
  failOnDifference: true,
};
