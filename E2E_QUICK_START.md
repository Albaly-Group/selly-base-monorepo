# E2E Testing - Quick Start Guide

## 📊 Test Suite Overview

**Total**: 109 unique tests × 3 browsers (Chromium, Firefox, WebKit) = **327 test executions**

**Coverage**: 12 test suites covering authentication, CRUD operations, data consistency, imports/exports, reports, and admin functions.

## TL;DR - Just Run The Tests

```bash
# One command to rule them all
npm run test:e2e:docker
```

That's it! The script will:
1. ✅ Setup Docker environment (database, backend, frontend)
2. ✅ Run all 327 E2E tests
3. ✅ Generate HTML report
4. ✅ Clean up everything

**Expected time**: 3-8 minutes

## View Results

```bash
# Open HTML report in browser
npm run test:e2e:report
```

## Common Commands

```bash
# Full automated run
npm run test:e2e:docker

# Manual control
npm run test:e2e:docker:setup    # Start services
npm run test:e2e                 # Run tests
npm run test:e2e:docker:cleanup  # Stop services

# Debug mode
npm run test:e2e:ui              # Interactive mode

# Run specific test
npx playwright test e2e/auth-flow.e2e.spec.ts

# View logs
npm run test:e2e:docker:logs
```

## When Tests Fail

### Step 1: Check What Failed

```bash
npm run test:e2e:report
```

Look at:
- Screenshots of failure
- Error messages
- Video recording (if available)

### Step 2: Understand Why

Ask yourself:
- Would a real user experience this issue?
- Is this a UX problem?
- Is the error message clear?
- Does the UI provide proper feedback?

### Step 3: Fix The Right Thing

**If it's a real UX issue:**
```bash
# Fix the code (not the test!)
# Example: Add loading indicator, improve error message, fix button state
```

**If UI intentionally changed:**
```bash
# Update test to match new UX
# Make sure new UX is actually better for users
```

## Writing New Tests

### Template

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login if needed
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('admin@selly.com');
    await page.getByLabel(/password/i).fill('Admin@123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should [user goal in plain English]', async ({ page }) => {
    // UX Test: Describe what user experience we're validating
    
    // Navigate to feature
    await page.goto('/feature');
    
    // Find elements using semantic selectors
    const actionButton = page.getByRole('button', { name: /action/i });
    const inputField = page.getByLabel(/field name/i);
    
    // Perform user action
    await inputField.fill('value');
    await actionButton.click();
    
    // Verify user sees expected feedback
    await expect(page.getByText(/success/i)).toBeVisible();
    
    // Verify outcome
    await expect(page).toHaveURL(/expected-page/);
  });
});
```

### Good Selectors (Use These!)

```typescript
// ✅ Semantic selectors - how users find things
page.getByRole('button', { name: /sign in/i })
page.getByLabel(/email/i)
page.getByRole('heading', { name: /dashboard/i })
page.getByText(/welcome/i)
page.getByPlaceholder(/search/i)

// ❌ Technical selectors - fragile
page.locator('#login-btn')
page.locator('.form__input--email')
page.locator('[data-testid="submit"]')
```

### Test User Experience, Not Code

```typescript
// ❌ Bad: Testing implementation
test('API call returns 200', async ({ page }) => {
  // Users don't care about HTTP status codes
});

// ✅ Good: Testing user experience
test('user sees their data after login', async ({ page }) => {
  // Users care about seeing their information
});
```

## Troubleshooting

### Docker Issues

```bash
# Check if Docker is running
docker info

# Clean everything
npm run test:e2e:docker:cleanup
docker system prune -f

# Rebuild images
docker compose -f docker-compose.e2e.yml build --no-cache
```

### Port Conflicts

```bash
# Check what's using ports
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5433  # Database

# Kill processes if needed
kill -9 [PID]
```

### Test Timeouts

```bash
# Check service health
docker compose -f docker-compose.e2e.yml ps

# View service logs
npm run test:e2e:docker:logs

# Manually test services
curl http://localhost:3000
curl http://localhost:3001/health
```

### Tests Pass Locally But Fail in CI

Common causes:
1. Timing issues (add proper waits)
2. Different screen sizes (set viewport explicitly)
3. Network speed (test slow connections)
4. Resource constraints (reduce parallelism)

## Best Practices Checklist

When writing/updating tests:

- [ ] Test describes user goal, not technical action
- [ ] Uses semantic selectors (getByRole, getByLabel)
- [ ] Verifies user feedback (loading, errors, success)
- [ ] Tests complete workflow, not isolated action
- [ ] No `.catch(() => {})` hiding errors
- [ ] Includes accessibility considerations
- [ ] Has clear comments explaining UX being tested
- [ ] Would fail if UX is broken

## Resources

- Full Guide: [E2E_DOCKER_GUIDE.md](./E2E_DOCKER_GUIDE.md)
- Improvements: [E2E_UX_IMPROVEMENTS.md](./E2E_UX_IMPROVEMENTS.md)
- Playwright Docs: https://playwright.dev/
- UX Principles: https://www.nngroup.com/

## Getting Help

1. Check HTML test report for details
2. Review Docker service logs
3. Run in UI mode for debugging: `npm run test:e2e:ui`
4. Check if it's a real UX issue (fix code) or test issue (fix test)

## Quick Reference Card

```
┌─────────────────────────────────────────────┐
│         E2E Testing Commands                │
├─────────────────────────────────────────────┤
│ Run tests:     npm run test:e2e:docker     │
│ View report:   npm run test:e2e:report     │
│ Debug mode:    npm run test:e2e:ui         │
│ View logs:     npm run test:e2e:docker:logs│
│ Cleanup:       npm run test:e2e:docker:cleanup │
├─────────────────────────────────────────────┤
│         When Tests Fail                     │
├─────────────────────────────────────────────┤
│ 1. Check report: npm run test:e2e:report   │
│ 2. Is it real UX issue? → Fix code         │
│ 3. UI changed? → Update test               │
│ 4. Wrong test? → Rewrite test              │
└─────────────────────────────────────────────┘
```

## Philosophy

**Remember:** 
- Tests exist to catch UX problems
- Failing tests = users will have problems
- Fix code first, tests second
- Goal is great UX, not passing tests

Happy Testing! 🎭✨
