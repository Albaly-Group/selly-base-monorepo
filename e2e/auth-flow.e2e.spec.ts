import { test, expect } from '@playwright/test';

/**
 * True End-to-End Test - Authentication Flow
 * 
 * Tests complete authentication workflow from frontend UI through backend API to database
 * 
 * Prerequisites:
 * 1. Frontend server running on http://localhost:3000
 * 2. Backend server running on http://localhost:3001
 * 3. Database accessible with test data
 * 
 * Test Flow:
 * Frontend UI → Backend API → Database → Response → UI Update
 */

test.describe('Authentication E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and local storage before each test
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText(/sign in/i)).toBeVisible();
  });

  test('should show validation errors for invalid login credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=required')).toBeVisible({ timeout: 5000 }).catch(() => {
      // Alternative: check for invalid input states
      return expect(page.locator('input[type="email"]:invalid')).toBeVisible();
    });
  });

  test('should reject login with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.getByText(/invalid credentials|login failed/i)).toBeVisible({ timeout: 10000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Use test credentials (should exist in database)
    await page.fill('input[type="email"]', 'admin@selly.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();
  });

  test('should persist login state across page reloads', async ({ page }) => {
    await page.goto('/login');
    
    // Login
    await page.fill('input[type="email"]', 'admin@selly.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    
    // Reload page
    await page.reload();
    
    // Should still be logged in
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText(/dashboard|welcome/i)).toBeVisible();
  });

  test('should successfully logout user', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@selly.com');
    await page.fill('input[type="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    
    // Find and click logout button
    await page.click('[data-testid="user-menu"]').catch(() => {
      // Alternative: look for logout link
      return page.click('text=logout');
    });
    
    await page.click('text=logout', { timeout: 5000 }).catch(() => {
      // If already on logout page
      return Promise.resolve();
    });
    
    // Should redirect to login page
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });

  test('should prevent access to protected routes when not authenticated', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
  });
});
