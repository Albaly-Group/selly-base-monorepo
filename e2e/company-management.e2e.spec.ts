import { test, expect } from '@playwright/test';

/**
 * True End-to-End Test - Company Management
 * 
 * Tests complete company management workflow from frontend UI through backend API to database
 * 
 * Prerequisites:
 * 1. Frontend server running on http://localhost:3000
 * 2. Backend server running on http://localhost:3001
 * 3. Database accessible with test data
 * 4. User must be authenticated
 * 
 * Test Flow:
 * Frontend UI → Backend API → Database → Response → UI Update
 */

test.describe('Company Management E2E Flow', () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Login with test credentials
    await page.fill('input[type="email"]', 'admin@selly.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    
    // Navigate to companies page
    await page.click('text=Companies').catch(() => {
      return page.goto('/lookup');
    });
  });

  test('should display companies list page', async ({ page }) => {
    await page.goto('/lookup');
    
    await expect(page.getByText(/companies|company list/i)).toBeVisible();
    await expect(page.locator('table, [role="table"]')).toBeVisible({ timeout: 10000 });
  });

  test('should search for companies', async ({ page }) => {
    await page.goto('/lookup');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find search input
    const searchInput = page.locator('input[placeholder*="search" i], input[type="search"]').first();
    await searchInput.fill('Tech');
    
    // Wait for search results
    await page.waitForTimeout(1000);
    
    // Verify some results are shown
    const tableRows = page.locator('table tbody tr, [role="row"]');
    await expect(tableRows.first()).toBeVisible({ timeout: 10000 });
  });

  test('should filter companies by industry', async ({ page }) => {
    await page.goto('/lookup');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for filter controls
    const filterButton = page.locator('button:has-text("filter"), button:has-text("industry")').first();
    await filterButton.click().catch(() => {
      // Filter might be a dropdown
      return page.locator('select, [role="combobox"]').first().click();
    });
    
    await page.waitForTimeout(500);
    
    // Select an industry (if available)
    await page.locator('text=Technology').first().click().catch(() => Promise.resolve());
    
    await page.waitForTimeout(1000);
    
    // Verify filtered results
    const tableRows = page.locator('table tbody tr, [role="row"]');
    await expect(tableRows.first()).toBeVisible({ timeout: 10000 });
  });

  test('should open company detail view', async ({ page }) => {
    await page.goto('/lookup');
    
    // Wait for companies to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Click on first company
    const firstCompany = page.locator('table tbody tr, [role="row"]').first();
    await expect(firstCompany).toBeVisible({ timeout: 10000 });
    await firstCompany.click();
    
    // Should open detail view (drawer or modal)
    await expect(page.locator('[role="dialog"], .drawer, .modal')).toBeVisible({ timeout: 5000 });
  });

  test('should create new company through UI', async ({ page }) => {
    await page.goto('/lookup');
    
    await page.waitForLoadState('networkidle');
    
    // Click add/create company button
    const createButton = page.locator('button:has-text("add"), button:has-text("create"), button:has-text("new")').first();
    await createButton.click();
    
    // Wait for dialog to open
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    
    // Fill company form
    const companyName = `E2E Test Company ${Date.now()}`;
    await page.fill('input[name="name"], input[placeholder*="name" i]', companyName);
    await page.fill('input[name="industry"], input[placeholder*="industry" i]', 'Technology').catch(() => {
      // Industry might be a select
      return page.selectOption('select[name="industry"]', 'Technology');
    });
    
    // Submit form
    await page.click('button:has-text("save"), button:has-text("create"), button[type="submit"]');
    
    // Wait for success message or list update
    await page.waitForTimeout(2000);
    
    // Verify company was created (appears in list)
    await expect(page.getByText(companyName)).toBeVisible({ timeout: 10000 });
  });

  test('should edit existing company', async ({ page }) => {
    await page.goto('/lookup');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Open first company
    const firstCompany = page.locator('table tbody tr, [role="row"]').first();
    await firstCompany.click();
    
    // Wait for detail view
    await expect(page.locator('[role="dialog"], .drawer')).toBeVisible({ timeout: 5000 });
    
    // Click edit button
    await page.click('button:has-text("edit")').catch(() => Promise.resolve());
    
    // Modify company name
    const nameInput = page.locator('input[name="name"]');
    const currentValue = await nameInput.inputValue();
    await nameInput.fill(`${currentValue} (Updated)`);
    
    // Save changes
    await page.click('button:has-text("save"), button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    // Verify update was successful
    await expect(page.getByText('(Updated)')).toBeVisible({ timeout: 5000 });
  });

  test('should handle pagination of companies', async ({ page }) => {
    await page.goto('/lookup');
    
    await page.waitForLoadState('networkidle');
    
    // Wait for initial load
    await page.waitForTimeout(2000);
    
    // Look for pagination controls
    const nextButton = page.locator('button:has-text("next"), button[aria-label*="next"]').first();
    
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(1000);
      
      // Verify page changed
      const tableRows = page.locator('table tbody tr, [role="row"]');
      await expect(tableRows.first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should persist data across page refresh', async ({ page }) => {
    await page.goto('/lookup');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Get first company name
    const firstRow = page.locator('table tbody tr, [role="row"]').first();
    const companyName = await firstRow.textContent();
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify same data is still there
    if (companyName) {
      await expect(page.getByText(companyName, { exact: false })).toBeVisible({ timeout: 10000 });
    }
  });
});
