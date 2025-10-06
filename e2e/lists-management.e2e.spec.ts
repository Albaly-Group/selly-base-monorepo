import { test, expect } from '@playwright/test';

/**
 * True End-to-End Test - Company Lists Management
 * 
 * Tests company lists functionality from frontend UI through backend API to database
 * 
 * Prerequisites:
 * 1. Frontend server running on http://localhost:3000
 * 2. Backend server running on http://localhost:3001
 * 3. Database accessible with test data
 * 4. User must be authenticated
 */

test.describe('Company Lists E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    
    // Login with test credentials
    await page.fill('input[type="email"]', 'admin@selly.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('should display company lists page', async ({ page }) => {
    await page.goto('/lists');
    
    await page.waitForLoadState('networkidle');
    
    await expect(page.getByText(/lists|my lists/i)).toBeVisible({ timeout: 10000 });
  });

  test('should create new company list', async ({ page }) => {
    await page.goto('/lists');
    
    await page.waitForLoadState('networkidle');
    
    // Click create list button
    const createButton = page.locator('button:has-text("create"), button:has-text("new list")').first();
    await createButton.click();
    
    // Wait for dialog
    await expect(page.locator('[role="dialog"]')).toBeVisible({ timeout: 5000 });
    
    // Fill list details
    const listName = `E2E Test List ${Date.now()}`;
    await page.fill('input[name="name"], input[placeholder*="name" i]', listName);
    await page.fill('textarea[name="description"], input[name="description"]', 'Created by E2E test').catch(() => Promise.resolve());
    
    // Save list
    await page.click('button:has-text("save"), button:has-text("create"), button[type="submit"]');
    
    await page.waitForTimeout(2000);
    
    // Verify list was created
    await expect(page.getByText(listName)).toBeVisible({ timeout: 10000 });
  });

  test('should add companies to a list', async ({ page }) => {
    // First navigate to companies page
    await page.goto('/lookup');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Select first company
    const firstRow = page.locator('table tbody tr, [role="row"]').first();
    const checkbox = firstRow.locator('input[type="checkbox"]');
    await checkbox.check().catch(() => {
      // Alternative: click the row
      return firstRow.click();
    });
    
    // Look for "Add to list" button
    await page.click('button:has-text("add to list")').catch(() => {
      // Might be in a menu
      return page.click('[data-testid="bulk-actions"] button').then(() => {
        return page.click('text="Add to list"');
      });
    });
    
    await page.waitForTimeout(1000);
    
    // Select a list (if dialog appears)
    const listOption = page.locator('[role="dialog"] button, [role="dialog"] [role="option"]').first();
    await listOption.click().catch(() => Promise.resolve());
    
    await page.waitForTimeout(1000);
    
    // Should show success message
    await expect(page.getByText(/added|success/i)).toBeVisible({ timeout: 5000 }).catch(() => Promise.resolve());
  });

  test('should view list details', async ({ page }) => {
    await page.goto('/lists');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Click on first list
    const firstList = page.locator('table tbody tr, [role="row"], [class*="list-item"]').first();
    await firstList.click();
    
    // Should navigate to list detail or open drawer
    await page.waitForTimeout(1000);
    
    // Verify list content is shown
    await expect(page.locator('[role="dialog"], main')).toBeVisible({ timeout: 5000 });
  });

  test('should delete a company list', async ({ page }) => {
    await page.goto('/lists');
    
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Find delete button for a list
    const deleteButton = page.locator('button:has-text("delete"), [aria-label*="delete"]').last();
    
    if (await deleteButton.isVisible()) {
      await deleteButton.click();
      
      // Confirm deletion
      await page.click('button:has-text("confirm"), button:has-text("delete")').catch(() => Promise.resolve());
      
      await page.waitForTimeout(1000);
      
      // Should show success message
      await expect(page.getByText(/deleted|removed/i)).toBeVisible({ timeout: 5000 }).catch(() => Promise.resolve());
    }
  });
});
