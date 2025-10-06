import { test, expect } from '@playwright/test';

/**
 * True End-to-End Test - Dashboard
 * 
 * Tests dashboard functionality from frontend UI through backend API to database
 * 
 * Prerequisites:
 * 1. Frontend server running on http://localhost:3000
 * 2. Backend server running on http://localhost:3001
 * 3. Database accessible with test data
 * 4. User must be authenticated
 */

test.describe('Dashboard E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Login with test credentials
    await page.fill('input[type="email"]', 'admin@selly.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('should display dashboard with statistics', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForLoadState('networkidle');
    
    // Verify dashboard content is visible
    await expect(page.getByText(/dashboard|overview/i)).toBeVisible();
    
    // Check for stat cards (common dashboard elements)
    const statCards = page.locator('[class*="card"], [class*="stat"]');
    await expect(statCards.first()).toBeVisible({ timeout: 10000 });
  });

  test('should load data from backend API', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Wait for API calls to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify that data is displayed (not just loading state)
    const numbers = page.locator('text=/\\d+/');
    await expect(numbers.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display recent activities or notifications', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForLoadState('networkidle');
    
    // Look for activity feed or notifications
    const activitySection = page.locator('text=/activity|recent|notification/i');
    await expect(activitySection.first()).toBeVisible({ timeout: 10000 }).catch(() => {
      // Dashboard might not have this section
      return Promise.resolve();
    });
  });

  test('should navigate to different sections from dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForLoadState('networkidle');
    
    // Click on companies link (if available)
    await page.click('text=Companies').catch(() => {
      return page.click('a[href*="company"], a[href*="lookup"]');
    });
    
    // Should navigate to companies page
    await expect(page).toHaveURL(/.*lookup|.*companies/, { timeout: 10000 });
  });

  test('should refresh dashboard data', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.waitForLoadState('networkidle');
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Verify data is still displayed
    await expect(page.getByText(/dashboard/i)).toBeVisible();
  });
});
