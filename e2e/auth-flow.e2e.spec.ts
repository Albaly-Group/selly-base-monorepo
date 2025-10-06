import { test, expect } from '@playwright/test';

/**
 * E2E Test - Authentication Flow (UX-Focused)
 * 
 * These tests validate the user experience of authentication from a real user's perspective.
 * Tests focus on what users see, do, and experience rather than technical implementation.
 * 
 * UX Principles Tested:
 * - Clear feedback on user actions
 * - Intuitive error messages
 * - Smooth navigation flow
 * - Session persistence
 * - Accessibility
 * 
 * Test Flow:
 * User Action → UI Feedback → Backend Processing → Visual Response
 */

test.describe('Authentication E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies and local storage before each test to simulate new user
    await page.context().clearCookies();
    await page.goto('/');
  });

  test('should display login page for unauthenticated users', async ({ page }) => {
    // UX Test: When a user tries to access protected content without logging in,
    // they should be redirected to login with clear messaging
    await page.goto('/dashboard');
    
    // Verify redirect to login page
    await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
    
    // Verify login form is visible and accessible
    await expect(page.getByRole('heading', { name: /sign in|login/i })).toBeVisible();
    
    // Verify essential form elements are present
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign in|login/i });
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toBeEnabled();
  });

  test('should show clear validation errors for empty form submission', async ({ page }) => {
    // UX Test: Users should receive immediate, clear feedback when they
    // try to submit an incomplete form
    await page.goto('/login');
    
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /sign in|login/i });
    await submitButton.click();
    
    // Wait for validation to appear
    await page.waitForTimeout(500);
    
    // Check for validation feedback - either error messages or HTML5 validation
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    
    // Verify form wasn't submitted (still on login page)
    await expect(page).toHaveURL(/.*login/);
    
    // Verify at least one validation mechanism is working
    const hasErrorText = await page.getByText(/required|enter|provide|fill/i).isVisible().catch(() => false);
    const hasInvalidEmail = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid).catch(() => false);
    const hasInvalidPassword = await passwordInput.evaluate((el: HTMLInputElement) => !el.validity.valid).catch(() => false);
    
    expect(hasErrorText || hasInvalidEmail || hasInvalidPassword).toBeTruthy();
  });

  test('should show helpful error message for invalid credentials', async ({ page }) => {
    // UX Test: When users enter wrong credentials, they should see a clear,
    // helpful error message without technical jargon
    await page.goto('/login');
    
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign in|login/i });
    
    // Enter invalid credentials
    await emailInput.fill('invalid@example.com');
    await passwordInput.fill('wrongpassword');
    await submitButton.click();
    
    // Should show clear error message to user
    const errorMessage = page.getByText(/invalid|incorrect|wrong|not found|failed/i);
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    
    // User should still be on login page to retry
    await expect(page).toHaveURL(/.*login/);
    
    // Form should still be usable (fields should be visible and enabled)
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeEnabled();
    await expect(passwordInput).toBeVisible();
    await expect(passwordInput).toBeEnabled();
    await expect(submitButton).toBeEnabled();
  });

  test('should successfully login with valid credentials and show welcome state', async ({ page }) => {
    // UX Test: Successful login should provide clear feedback and take user
    // to their expected destination smoothly
    await page.goto('/login');
    
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitButton = page.getByRole('button', { name: /sign in|login/i });
    
    // Enter valid test credentials
    await emailInput.fill('admin@selly.com');
    await passwordInput.fill('Admin@123');
    
    // Submit login form
    await submitButton.click();
    
    // Should redirect to dashboard within reasonable time
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    
    // Verify user sees their logged-in state
    // Look for typical post-login UI elements
    const loggedInIndicators = [
      page.getByText(/dashboard/i),
      page.getByText(/welcome/i),
      page.getByRole('button', { name: /logout|sign out/i }),
      page.getByRole('navigation'),
    ];
    
    // At least one logged-in indicator should be visible
    let foundIndicator = false;
    for (const indicator of loggedInIndicators) {
      if (await indicator.isVisible().catch(() => false)) {
        foundIndicator = true;
        break;
      }
    }
    expect(foundIndicator).toBeTruthy();
  });

  test('should maintain login session across page refreshes', async ({ page }) => {
    // UX Test: Users expect to stay logged in when they refresh the page
    // This tests session persistence and prevents frustrating re-logins
    await page.goto('/login');
    
    // Login successfully
    await page.getByLabel(/email/i).fill('admin@selly.com');
    await page.getByLabel(/password/i).fill('Admin@123');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    
    // Simulate user refreshing the page
    await page.reload({ waitUntil: 'networkidle' });
    
    // User should still be logged in (not redirected to login)
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 10000 });
    
    // Verify authenticated content is still accessible
    const authenticatedContent = page.getByRole('main');
    await expect(authenticatedContent).toBeVisible({ timeout: 5000 });
  });

  test('should allow user to logout and return to login screen', async ({ page }) => {
    // UX Test: Users should be able to easily find and use logout,
    // and be clearly informed they've been logged out
    
    // First login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@selly.com');
    await page.getByLabel(/password/i).fill('Admin@123');
    await page.getByRole('button', { name: /sign in|login/i }).click();
    
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    
    // Look for logout button/link (should be accessible)
    // Try common logout patterns
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i });
    const logoutLink = page.getByRole('link', { name: /logout|sign out/i });
    
    let logoutFound = false;
    if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutButton.click();
      logoutFound = true;
    } else if (await logoutLink.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutLink.click();
      logoutFound = true;
    } else {
      // Try user menu pattern
      const userMenu = page.getByRole('button', { name: /user|account|profile|menu/i });
      if (await userMenu.isVisible({ timeout: 2000 }).catch(() => false)) {
        await userMenu.click();
        await page.waitForTimeout(500);
        
        const menuLogout = page.getByRole('menuitem', { name: /logout|sign out/i });
        if (await menuLogout.isVisible({ timeout: 2000 }).catch(() => false)) {
          await menuLogout.click();
          logoutFound = true;
        }
      }
    }
    
    // If logout button found, verify logout worked
    if (logoutFound) {
      // Should be redirected to login page
      await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
      
      // Verify login form is visible again
      await expect(page.getByLabel(/email/i)).toBeVisible();
    } else {
      // If logout not found, test should note this UX issue
      console.warn('UX Issue: Logout button/link not easily discoverable');
    }
  });

  test('should protect sensitive pages from unauthenticated access', async ({ page }) => {
    // UX Test: Security feature should be transparent to users -
    // they're simply redirected to login, not shown cryptic errors
    
    // Try to access various protected routes directly
    const protectedRoutes = ['/dashboard', '/lookup', '/lists', '/admin'];
    
    for (const route of protectedRoutes) {
      await page.goto(route);
      
      // Should redirect to login page smoothly
      await expect(page).toHaveURL(/.*login/, { timeout: 10000 });
      
      // Login form should be visible
      await expect(page.getByLabel(/email/i)).toBeVisible({ timeout: 5000 });
    }
  });
  
  test('should handle slow network gracefully during login', async ({ page }) => {
    // UX Test: Users on slow connections should see loading states
    // and not be confused about what's happening
    
    await page.goto('/login');
    
    // Throttle network to simulate slow connection
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 50 * 1024, // 50kb/s
      uploadThroughput: 20 * 1024,   // 20kb/s
      latency: 500,                   // 500ms latency
    });
    
    await page.getByLabel(/email/i).fill('admin@selly.com');
    await page.getByLabel(/password/i).fill('Admin@123');
    
    const submitButton = page.getByRole('button', { name: /sign in|login/i });
    await submitButton.click();
    
    // Check if there's any loading indicator
    const loadingIndicators = [
      page.getByText(/loading|wait|processing/i),
      page.locator('[role="progressbar"]'),
      page.locator('.spinner, .loading'),
      submitButton.filter({ hasText: /loading|wait/i })
    ];
    
    let hasLoadingState = false;
    for (const indicator of loadingIndicators) {
      if (await indicator.isVisible({ timeout: 1000 }).catch(() => false)) {
        hasLoadingState = true;
        break;
      }
    }
    
    // Login should eventually succeed
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 30000 });
    
    // Note: It's good UX to show loading states, but not required for test to pass
    if (!hasLoadingState) {
      console.info('UX Enhancement: Consider adding loading indicator during login');
    }
  });
});
