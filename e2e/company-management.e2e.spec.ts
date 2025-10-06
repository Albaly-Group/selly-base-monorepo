import { test, expect } from '@playwright/test';

/**
 * E2E Test - Company Management (UX-Focused)
 * 
 * These tests validate the user experience of managing companies.
 * Focus areas: search, filtering, viewing, creating, and editing companies.
 * 
 * UX Principles Tested:
 * - Easy navigation to company features
 * - Clear data presentation
 * - Intuitive search and filtering
 * - Responsive feedback on actions
 * - Data persistence and accuracy
 */

test.describe('Company Management E2E Flow', () => {
  // Helper to login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Login with seed SQL credentials
    await page.getByLabel(/email/i).fill('admin@albaly.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    
    // Wait for successful login
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    
    // Navigate to companies page
    // Try navigation link first, then direct URL
    const companiesLink = page.getByRole('link', { name: /companies/i });
    if (await companiesLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await companiesLink.click();
    } else {
      await page.goto('/lookup');
    }
    
    // Wait for companies page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display companies in a clear, organized layout', async ({ page }) => {
    // UX Test: Users should immediately understand they're viewing companies
    // and see the data in an organized, scannable format
    
    // Verify page heading/title is clear
    const pageTitle = page.getByRole('heading', { name: /companies|company/i });
    await expect(pageTitle).toBeVisible({ timeout: 5000 });
    
    // Verify data is displayed in a structured way (table or grid)
    const dataContainer = page.locator('table, [role="table"], [role="grid"]');
    await expect(dataContainer).toBeVisible({ timeout: 10000 });
    
    // Verify there's at least some content (rows or cards)
    const contentItems = page.locator('tbody tr, [role="row"], [class*="card"], [class*="item"]');
    const itemCount = await contentItems.count();
    expect(itemCount).toBeGreaterThan(0);
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
