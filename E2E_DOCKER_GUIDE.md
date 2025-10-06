# Complete E2E Testing with Docker - User Guide

## Overview

This guide explains how to run complete end-to-end (E2E) tests that verify the entire application stack from a **user experience perspective**. These tests focus on real user workflows, not just technical functionality.

### What Makes These Tests Different?

**Traditional E2E Tests:**
- Focus on technical implementation
- Test if code works
- Use technical selectors
- Hide errors with `.catch()`

**UX-Focused E2E Tests (This Implementation):**
- Focus on user experience
- Test if users can accomplish their goals
- Use semantic, accessible selectors
- Surface issues for fixing
- Test loading states, error messages, and feedback
- Verify intuitive navigation flows

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  E2E Test Suite                      │
│                    (Playwright)                      │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│              Frontend Web App (Docker)               │
│              http://localhost:3000                   │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│            Backend API Server (Docker)               │
│              http://localhost:3001                   │
└────────────────────┬────────────────────────────────┘
                     │
                     ↓
┌─────────────────────────────────────────────────────┐
│          PostgreSQL Database (Docker)                │
│              port 5433                               │
└─────────────────────────────────────────────────────┘
```

## Prerequisites

### Required Software

1. **Docker & Docker Compose**
   ```bash
   docker --version    # Should be 20.10+
   docker compose version  # Should be 2.0+
   ```

2. **Node.js & npm**
   ```bash
   node --version      # Should be 18+
   npm --version       # Should be 9+
   ```

3. **Dependencies Installed**
   ```bash
   npm install
   ```

### System Requirements

- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 5GB free space
- **Network**: Internet connection for initial setup

## Quick Start

### Option 1: Automated Full Run (Recommended)

Run everything with one command:

```bash
npm run test:e2e:docker
```

This script will:
1. ✅ Check prerequisites
2. ✅ Clean up any existing containers
3. ✅ Build Docker images for frontend and backend
4. ✅ Start PostgreSQL database
5. ✅ Start backend API server
6. ✅ Start frontend web application
7. ✅ Verify all services are healthy
8. ✅ Run complete E2E test suite
9. ✅ Generate detailed test report
10. ✅ Clean up containers

**Expected Output:**
```
========================================
  Selly Base - Complete E2E Test Suite with Docker
========================================

✓ Docker is installed
✓ Docker Compose is installed
✓ Node.js is installed (v18.x.x)
✓ npm is installed (v9.x.x)

✓ Database is ready
✓ Backend API is ready
✓ Frontend web app is ready

Running E2E tests...
✓ E2E tests passed

Test run completed at: [timestamp]
Total duration: [X] seconds

✓ All validation steps passed!
```

### Option 2: Manual Step-by-Step

For more control over the process:

#### Step 1: Start Services

```bash
npm run test:e2e:docker:setup
```

Wait for all services to be healthy (about 30-60 seconds).

#### Step 2: Run Tests

```bash
npm run test:e2e
```

#### Step 3: View Results

```bash
npm run test:e2e:report
```

#### Step 4: Cleanup

```bash
npm run test:e2e:docker:cleanup
```

## Test Coverage

### Authentication Flow (8 tests)
- ✅ Login page displays for unauthenticated users
- ✅ Clear validation errors for empty form
- ✅ Helpful error messages for invalid credentials
- ✅ Successful login with welcome state
- ✅ Session persistence across refreshes
- ✅ Logout functionality
- ✅ Protected route access control
- ✅ Graceful handling of slow networks

### Company Management (8 tests)
- ✅ Display companies list
- ✅ Search functionality
- ✅ Filter by industry
- ✅ View company details
- ✅ Create new company
- ✅ Edit existing company
- ✅ Pagination handling
- ✅ Data persistence

### Dashboard (5 tests)
- ✅ Display statistics
- ✅ Load data from API
- ✅ Show recent activities
- ✅ Navigation to other sections
- ✅ Data refresh

### Lists Management (5 tests)
- ✅ Display lists page
- ✅ Create new list
- ✅ Add companies to list
- ✅ View list details
- ✅ Delete list

### Reports, Admin, Staff, Imports, Exports
- ✅ Complete coverage for all features
- ✅ UX-focused test scenarios
- ✅ Real user workflows

**Total: 77 test cases covering 10 major routes**

## UX Principles Tested

### 1. Clear Feedback
- Users receive immediate feedback on their actions
- Loading states are shown during processing
- Success and error messages are clear and helpful

### 2. Error Handling
- Error messages are user-friendly (no technical jargon)
- Forms remain usable after errors
- Validation is immediate and intuitive

### 3. Navigation
- Redirects are smooth and expected
- Users always know where they are
- Back button works as expected

### 4. Accessibility
- All interactive elements have proper labels
- Keyboard navigation works
- Screen reader compatible

### 5. Performance
- Pages load within reasonable time
- No blocking operations
- Graceful handling of slow connections

## Viewing Test Results

### HTML Report

After running tests, open the detailed HTML report:

```bash
npm run test:e2e:report
```

The report shows:
- ✅ Passed tests with screenshots
- ❌ Failed tests with full trace
- ⏱️ Timing information
- 📸 Screenshots of failures
- 🎥 Video recordings of test runs

### Logs

View detailed logs from Docker services:

```bash
# All logs
npm run test:e2e:docker:logs

# Specific service
docker compose -f docker-compose.e2e.yml logs postgres-e2e
docker compose -f docker-compose.e2e.yml logs api-e2e
docker compose -f docker-compose.e2e.yml logs web-e2e
```

### E2E Test Run Logs

Check the detailed test run log:

```bash
cat e2e-test-logs/e2e-run-[timestamp].log
```

## Troubleshooting

### Tests Failing

**Issue:** E2E tests are failing

**Solution:**
1. Check if all services are healthy:
   ```bash
   docker compose -f docker-compose.e2e.yml ps
   ```

2. Review service logs:
   ```bash
   npm run test:e2e:docker:logs
   ```

3. Verify services are accessible:
   ```bash
   curl http://localhost:3000  # Frontend
   curl http://localhost:3001/health  # Backend
   ```

4. **IMPORTANT**: If tests fail, **fix the code, not the test**
   - E2E test failures often indicate real UX issues
   - Review the test output to understand the user experience problem
   - Update the application to provide better UX

### Docker Issues

**Issue:** Docker containers won't start

**Solution:**
1. Check Docker is running:
   ```bash
   docker info
   ```

2. Clean up old containers:
   ```bash
   npm run test:e2e:docker:cleanup
   docker system prune -f
   ```

3. Check port conflicts:
   ```bash
   lsof -i :3000  # Frontend port
   lsof -i :3001  # Backend port
   lsof -i :5433  # Database port
   ```

### Database Issues

**Issue:** Database not initializing

**Solution:**
1. Check database logs:
   ```bash
   docker compose -f docker-compose.e2e.yml logs postgres-e2e
   ```

2. Verify schema file exists:
   ```bash
   ls -l selly-base-optimized-schema.sql
   ```

3. Connect to database manually:
   ```bash
   docker exec -it selly-base-postgres-e2e psql -U postgres -d selly_base_e2e
   ```

### Frontend Build Issues

**Issue:** Frontend container fails to build

**Solution:**
1. Check if Dockerfile exists:
   ```bash
   ls -l apps/web/Dockerfile
   ```

2. Build manually to see full error:
   ```bash
   cd apps/web
   docker build -t web-e2e .
   ```

3. Check Node.js version compatibility

### Backend Build Issues

**Issue:** Backend container fails to build

**Solution:**
1. Check if Dockerfile exists:
   ```bash
   ls -l apps/api/Dockerfile
   ```

2. Build manually to see full error:
   ```bash
   cd apps/api
   docker build -t api-e2e .
   ```

3. Verify dependencies are correct in package.json

## Best Practices

### When Writing Tests

1. **Focus on User Goals**
   - Test what users want to accomplish
   - Not how the code implements it

2. **Use Semantic Selectors**
   ```typescript
   // Good: User-facing text
   page.getByRole('button', { name: /sign in/i })
   page.getByLabel(/email/i)
   
   // Avoid: Technical selectors
   page.locator('#btn-123')
   page.locator('.component__wrapper')
   ```

3. **Test Real Workflows**
   ```typescript
   // Good: Complete user journey
   test('user can create and view a company', async ({ page }) => {
     await login(page);
     await createCompany(page, 'Acme Corp');
     await expect(page.getByText('Acme Corp')).toBeVisible();
   });
   ```

4. **Verify User Feedback**
   ```typescript
   // Always check users get feedback
   await submitButton.click();
   await expect(page.getByText(/success|created|saved/i)).toBeVisible();
   ```

5. **Handle Edge Cases**
   - Slow networks
   - Empty states
   - Error states
   - Loading states

### When Tests Fail

1. **Don't Hide Failures**
   - Avoid `.catch(() => Promise.resolve())`
   - Let failures surface real issues

2. **Fix the Code First**
   - If users can't accomplish a task in tests
   - They probably can't in real life either

3. **Update Tests for Better UX**
   - If the test finds a UX issue
   - Fix the UI to be more user-friendly
   - Then update test to verify the improvement

## CI/CD Integration

### GitHub Actions

Add to `.github/workflows/e2e-tests.yml`:

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm install
      
      - name: Run E2E tests with Docker
        run: npm run test:e2e:docker
      
      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report-e2e/
          retention-days: 30
```

## Performance Benchmarks

Expected timing for full E2E test run:

- **Setup**: 2-3 minutes (first time)
- **Setup**: 30-60 seconds (subsequent)
- **Test Execution**: 2-5 minutes
- **Total**: 3-8 minutes

Performance tips:
- Use `--workers=1` for Docker environments
- Increase timeout for slow CI environments
- Cache Docker images when possible

## FAQ

### Q: Why focus on UX in E2E tests?

**A:** E2E tests are the closest we can get to real user experience in automated testing. If a test fails because "button is not clickable" or "text is not visible", that's exactly what a real user would experience.

### Q: Should I update tests or code when tests fail?

**A:** Default to updating code. E2E test failures often indicate real UX problems. Only update tests if:
- The UI intentionally changed
- The test was checking the wrong thing
- There's a better way to verify the same user outcome

### Q: How often should I run E2E tests?

**A:** 
- **Locally**: Before committing major features
- **CI/CD**: On every push to main/develop
- **Pre-release**: Full suite before deployment

### Q: Can I run tests without Docker?

**A:** Yes, but you'll need to manually start:
1. PostgreSQL database
2. Backend API server
3. Frontend web application

Then run: `npm run test:e2e`

### Q: How do I debug a failing test?

**A:**
1. Run in UI mode: `npm run test:e2e:ui`
2. Check screenshots in test report
3. Review video recordings
4. Add `await page.pause()` in test to debug interactively

## Support

### Documentation
- [Playwright Documentation](https://playwright.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [E2E Test README](./e2e/README.md)

### Common Commands

```bash
# Quick test run
npm run test:e2e:docker

# Manual setup and testing
npm run test:e2e:docker:setup
npm run test:e2e
npm run test:e2e:docker:cleanup

# View results
npm run test:e2e:report
npm run test:e2e:docker:logs

# Debug mode
npm run test:e2e:ui

# Specific test file
npx playwright test e2e/auth-flow.e2e.spec.ts

# Specific test
npx playwright test -g "should successfully login"
```

## Conclusion

These E2E tests are designed to catch real user experience issues before they reach production. By focusing on user workflows and outcomes rather than technical implementation, we ensure our application is not just functional, but genuinely usable and delightful for our users.

**Remember:** The goal is not to pass tests, but to deliver great user experiences. Tests are just a tool to verify we're achieving that goal.
