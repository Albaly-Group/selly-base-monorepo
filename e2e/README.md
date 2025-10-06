# End-to-End (E2E) Tests

This directory contains **true end-to-end tests** that test the entire application stack from frontend UI through backend API to the database.

## Test Architecture Overview

This project follows software testing best practices with proper separation of test types:

```
┌─────────────────────────────────────────────────────────────┐
│                    Test Architecture                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. E2E Tests (this directory)                              │
│     - Tests: Frontend UI -> Backend API -> Database         │
│     - Tool: Playwright with browser automation              │
│     - Scope: Full application flow                          │
│     - Location: /e2e/                                        │
│                                                              │
│  2. Backend API Tests                                        │
│     - Tests: Backend API endpoints only                     │
│     - Tool: Playwright APIRequestContext                    │
│     - Scope: API layer (no UI)                              │
│     - Location: /apps/api/test/api/                         │
│                                                              │
│  3. Backend Integration Tests                               │
│     - Tests: Backend API with database                      │
│     - Tool: Jest + Supertest                                │
│     - Scope: Backend + Database (no UI)                     │
│     - Location: /apps/api/test/integration/                 │
│                                                              │
│  4. Frontend Component Tests                                │
│     - Tests: Frontend components in isolation               │
│     - Tool: Jest + React Testing Library                    │
│     - Scope: UI components only (no backend)                │
│     - Location: /apps/web/__tests__/ (to be added)          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## What are E2E Tests?

E2E (End-to-End) tests simulate real user interactions with the application:

1. **User opens browser** → Frontend loads
2. **User interacts with UI** → Form submissions, button clicks, navigation
3. **Frontend calls API** → HTTP requests to backend
4. **Backend processes request** → Business logic execution
5. **Database operations** → Data persistence
6. **Response flows back** → Through backend to frontend to UI

## Running E2E Tests

### Prerequisites

Both frontend and backend servers must be running:

```bash
# Terminal 1: Start backend (with database)
cd apps/api
npm run dev

# Terminal 2: Start frontend
cd apps/web
npm run dev
```

### Run Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run in UI mode (recommended for development)
npm run test:e2e:ui

# Run specific browser
npx playwright test --project=chromium

# View test report
npm run test:e2e:report
```

## Writing E2E Tests

E2E tests should:
- Test complete user workflows
- Use real browser interactions
- Test critical user journeys
- Verify data persistence across the full stack

### Example E2E Test

```typescript
import { test, expect } from '@playwright/test';

test.describe('Company Management E2E', () => {
  test('user can create and view a company', async ({ page }) => {
    // 1. Navigate to the application
    await page.goto('/');
    
    // 2. Login
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // 3. Navigate to companies page
    await page.click('text=Companies');
    await expect(page).toHaveURL('/companies');
    
    // 4. Create new company
    await page.click('text=Add Company');
    await page.fill('[name="companyName"]', 'Test Corp');
    await page.fill('[name="description"]', 'Test company description');
    await page.click('button:has-text("Save")');
    
    // 5. Verify company appears in list
    await expect(page.locator('text=Test Corp')).toBeVisible();
    
    // 6. Verify data persisted (refresh and check)
    await page.reload();
    await expect(page.locator('text=Test Corp')).toBeVisible();
  });
});
```

## Test Organization

```
e2e/
├── README.md                      # This file
├── auth/                          # Authentication flows
│   ├── login.e2e.spec.ts
│   └── signup.e2e.spec.ts
├── companies/                     # Company management
│   ├── create-company.e2e.spec.ts
│   └── search-companies.e2e.spec.ts
├── reports/                       # Reporting features
│   └── dashboard.e2e.spec.ts
└── fixtures/                      # Test data and helpers
    └── test-data.ts
```

## Difference from Other Test Types

### E2E Tests (This Directory)
- **What**: Tests entire application from UI to database
- **When**: Critical user journeys, smoke tests
- **Speed**: Slowest (browser automation)
- **Scope**: Frontend + Backend + Database

### Backend API Tests (`apps/api/test/api/`)
- **What**: Tests API endpoints only
- **When**: API contract validation, endpoint testing
- **Speed**: Fast (no browser)
- **Scope**: Backend API only (no UI, no database)

### Backend Integration Tests (`apps/api/test/integration/`)
- **What**: Tests backend with real database
- **When**: Business logic, data operations
- **Speed**: Medium (database operations)
- **Scope**: Backend + Database (no UI)

### Frontend Component Tests (To be added)
- **What**: Tests UI components in isolation
- **When**: Component behavior, rendering
- **Speed**: Fast (no backend)
- **Scope**: Frontend only (mocked backend)

## Best Practices

1. **Keep E2E tests minimal** - They're slow, focus on critical paths
2. **Use data-testid attributes** - For stable selectors
3. **Clean up test data** - Use beforeEach/afterEach hooks
4. **Test user workflows** - Not individual functions
5. **Use Page Object Model** - For maintainability
6. **Avoid implementation details** - Test what users see

## Implemented E2E Tests

- [x] Authentication flow (login, logout, session persistence)
- [x] Company management (list, search, filter, create, edit)
- [x] Dashboard (statistics, navigation)
- [x] Company lists management (create, view, add companies, delete)

## Future Enhancements

- [ ] Add reporting E2E tests
- [ ] Add import/export E2E tests
- [ ] Add staff management E2E tests
- [ ] Add mobile device testing
- [ ] Add visual regression testing
- [ ] Add performance monitoring

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [E2E Testing Best Practices](https://playwright.dev/docs/best-practices)
- [Test Architecture Guide](../docs/testing-architecture.md)
