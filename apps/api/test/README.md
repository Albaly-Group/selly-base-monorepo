# Backend API Tests Directory

This directory contains **backend API tests** and **integration tests** following software testing best practices.

## Test Architecture

This project follows proper test separation:

```
┌─────────────────────────────────────────────────────────────┐
│  1. E2E Tests (/e2e/)                                        │
│     Frontend UI -> Backend API -> Database                   │
│                                                              │
│  2. Backend API Tests (test/api/) ⬅ THIS DIRECTORY         │
│     Backend API endpoints only (Playwright)                  │
│                                                              │
│  3. Integration Tests (test/integration/) ⬅ THIS DIRECTORY │
│     Backend + Database (Jest/Supertest)                      │
│                                                              │
│  4. Frontend Tests (apps/web/)                              │
│     UI components in isolation                               │
└─────────────────────────────────────────────────────────────┘
```

## 🎭 Backend API Tests (api/)

**Playwright-based API endpoint tests** - Tests backend API layer only (no UI, no database).

### Test Files

| File | Tests | Description |
|------|-------|-------------|
| `docker-api.playwright.spec.ts` | 40+ | API tests with Docker database |
| `api-endpoints.playwright.spec.ts` | 16 | Basic API endpoint tests |
| `platform-admin.playwright.spec.ts` | 9 | Platform admin API tests |

### Helper Utilities

- `helpers/api-test-helpers.ts` - Reusable helper classes:
  - `ApiTestHelper` - HTTP request wrapper
  - `AuthHelper` - Token management
  - `TestDataHelper` - Test state management

### Running API Tests

```bash
# All API tests
npm run test:api

# Specific file
npm run test:api:docker

# Interactive UI mode (best for debugging)
npm run test:api:ui

# View HTML report
npm run test:api:report
```

## 🧪 Integration Tests (integration/)

**Jest/Supertest-based integration tests** - Tests backend with real database (no UI).

### Test Files

| File | Description |
|------|-------------|
| `docker-e2e-spec.ts` | Backend integration tests with Docker |
| `api-endpoints.e2e-spec.ts` | Basic backend integration tests |
| `platform-admin.e2e-spec.ts` | Platform admin integration tests |

### Running Integration Tests

```bash
# Setup test database
npm run test:integration:setup

# All integration tests
npm run test:integration

# Docker integration tests
npm run test:integration:docker

# Cleanup test database
npm run test:integration:cleanup
```

## 📊 Test Type Comparison

### API Tests vs Integration Tests vs E2E Tests

| Aspect | API Tests (Playwright) | Integration Tests (Jest) | E2E Tests (Playwright) |
|--------|----------------------|------------------------|----------------------|
| **Location** | `test/api/` | `test/integration/` | `/e2e/` |
| **Scope** | Backend API only | Backend + Database | Frontend + Backend + Database |
| **Browser** | No | No | Yes |
| **Database** | Optional | Yes | Yes |
| **Speed** | Fast | Medium | Slow |
| **Use Case** | API contracts | Business logic | User journeys |

### Pattern Comparison

**Integration Test (Jest/Supertest):**
```typescript
it('should get companies', () => {
  return request(app.getHttpServer())
    .get('/api/v1/companies')
    .query({ page: 1, limit: 10 })
    .expect(200)
    .expect((res) => {
      expect(res.body).toHaveProperty('data');
    });
});
```

**API Test (Playwright):**
```typescript
test('should get companies', async () => {
  const response = await apiHelper.get('/api/v1/companies', {
    query: { page: 1, limit: 10 },
  });
  
  apiHelper.assertStatus(response, 200);
  apiHelper.assertHasProperty(response, 'data');
});
```

**E2E Test (Playwright):**
```typescript
test('user can view companies', async ({ page }) => {
  await page.goto('/companies');
  await page.click('[data-testid="search"]');
  await expect(page.locator('text=Test Company')).toBeVisible();
});
```

## 🚀 Quick Start

### 1. Setup Test Environment

```bash
# Install dependencies
npm install

# Setup test database (required for integration tests)
npm run test:integration:setup
```

### 2. Run Tests

```bash
# Backend API tests (fast, no database required)
npm run test:api

# Integration tests (medium speed, with database)
npm run test:integration

# E2E tests (slow, full stack - see /e2e/README.md)
cd ../../../ && npm run test:e2e
```

### 3. Cleanup

```bash
# Stop test database
npm run test:integration:cleanup
```

## 📖 Documentation

- **[PLAYWRIGHT_MIGRATION.md](./PLAYWRIGHT_MIGRATION.md)** - Detailed migration guide
- **[E2E_PLAYWRIGHT_TRANSFORMATION.md](../../../E2E_PLAYWRIGHT_TRANSFORMATION.md)** - Executive summary
- **[playwright.config.ts](../playwright.config.ts)** - Playwright configuration

## 🎯 Module Coverage

Both API and Integration tests cover these backend modules:

- ✅ Health Check
- ✅ Authentication & Authorization
- ✅ Companies API (CRUD, search, filters)
- ✅ Company Lists API
- ✅ Exports API
- ✅ Imports API
- ✅ Staff API
- ✅ Reports API
- ✅ Admin API
- ✅ Platform Admin API
- ✅ Data Integrity Tests

**Note**: For full application flow testing (UI to DB), see E2E tests in `/e2e/`

## 🐛 Debugging

### Playwright Debugging

```bash
# Interactive UI mode (highly recommended)
npm run test:playwright:ui

# Debug specific test
npx playwright test --debug docker-e2e.playwright.spec.ts

# Run with trace
npx playwright test --trace on
```

### Jest Debugging

```bash
# Debug with Node inspector
npm run test:debug

# Run with verbose output
npm run test:e2e -- --verbose
```

## 🔧 Configuration

### Playwright

Configuration file: `../playwright.config.ts`

Key settings:
- Base URL: `http://localhost:3001`
- Workers: 1 (sequential execution)
- Timeout: 30s per test
- Retries: 0 (or 2 in CI)

### Jest

Configuration file: `jest-e2e.json`

Key settings:
- Environment: Node
- Transform: ts-jest
- Setup: `jest-e2e.setup.js`

## 🤝 Contributing

When adding new tests:

1. **Use Playwright** for new tests (recommended)
2. Follow existing patterns in helper utilities
3. Add appropriate assertions
4. Document complex test scenarios
5. Ensure tests are idempotent

## 📝 Notes

- Both test suites are maintained for backward compatibility
- Playwright tests are recommended for new development
- Original Jest tests will be gradually phased out
- Test database must be running for both suites
- Tests run sequentially to prevent data conflicts

## ❓ FAQ

**Q: Which test suite should I use?**  
A: Use Playwright tests (`*.playwright.spec.ts`) for better DX and modern features.

**Q: Can I run both test suites?**  
A: Yes, both are independent and can run separately or together.

**Q: How do I add a new test?**  
A: Create a new `*.playwright.spec.ts` file and use the helper utilities.

**Q: Why keep both test suites?**  
A: For gradual migration and backward compatibility with existing CI/CD.

---

**Last Updated**: 2025  
**Test Framework**: Playwright Test + Jest  
**Total Tests**: 65+  
**Status**: ✅ All tests passing
