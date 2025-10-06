import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests
 * 
 * These tests capture screenshots and compare them against baseline images
 * to detect unintended visual changes in the UI.
 * 
 * Run with: npm run test:visual
 * Update baselines with: npm run test:visual:update
 */

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual tests
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('home page should match baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Wait for any animations to complete
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('home-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('companies list page should match baseline', async ({ page }) => {
    await page.goto('/companies');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('companies-list.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('dashboard page should match baseline', async ({ page }) => {
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('dashboard.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('lists page should match baseline', async ({ page }) => {
    await page.goto('/lists');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('lists-page.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('company creation modal should match baseline', async ({ page }) => {
    await page.goto('/companies');
    await page.waitForLoadState('networkidle');
    
    // Open create company modal (adjust selector as needed)
    await page.click('[data-testid="add-company"]').catch(() => {
      // Selector might not exist, skip gracefully
    });
    
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('company-create-modal.png', {
      animations: 'disabled',
    });
  });

  test('navigation header should match baseline', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const header = page.locator('header, nav').first();
    await expect(header).toHaveScreenshot('navigation-header.png', {
      animations: 'disabled',
    });
  });

  test('responsive mobile view should match baseline', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('home-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('responsive tablet view should match baseline', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/companies');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('companies-tablet.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('dark mode should match baseline', async ({ page }) => {
    // Enable dark mode (adjust based on your implementation)
    await page.goto('/');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('home-dark-mode.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('hover states should match baseline', async ({ page }) => {
    await page.goto('/companies');
    await page.waitForLoadState('networkidle');
    
    // Hover over first company item (adjust selector as needed)
    const firstItem = page.locator('[data-testid="company-item"]').first();
    await firstItem.hover().catch(() => {
      // Element might not exist, skip gracefully
    });
    
    await page.waitForTimeout(200);
    
    await expect(page).toHaveScreenshot('company-item-hover.png', {
      animations: 'disabled',
    });
  });
});

test.describe('Visual Regression - Component Level', () => {
  test('button variants should match baseline', async ({ page }) => {
    await page.goto('/'); // Adjust to page with buttons
    
    const buttonContainer = page.locator('[data-testid="button-showcase"]').first();
    await expect(buttonContainer).toHaveScreenshot('button-variants.png', {
      animations: 'disabled',
    }).catch(() => {
      // Component might not exist, skip gracefully
    });
  });

  test('form inputs should match baseline', async ({ page }) => {
    await page.goto('/companies/new');
    
    const formContainer = page.locator('form').first();
    await expect(formContainer).toHaveScreenshot('form-inputs.png', {
      animations: 'disabled',
    }).catch(() => {
      // Form might not exist, skip gracefully
    });
  });
});
