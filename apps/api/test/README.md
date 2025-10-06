# E2E Tests Directory

This directory contains both **original Jest/Supertest tests** and **new Playwright tests** for API endpoint testing.

## 🎭 Playwright Tests (NEW - Recommended)

**Why Playwright?**
- ✅ Standardized testing patterns
- ✅ Modern async/await support
- ✅ Better error messages and debugging
- ✅ Interactive UI mode
- ✅ HTML reports with traces

### Test Files

| File | Tests | Description |
|------|-------|-------------|
| `docker-e2e.playwright.spec.ts` | 40+ | Full e2e suite with Docker database |
| `api-endpoints.playwright.spec.ts` | 16 | Basic API endpoint tests |
| `platform-admin.playwright.spec.ts` | 9 | Platform admin API tests |

### Helper Utilities

- `helpers/api-test-helpers.ts` - Reusable helper classes:
  - `ApiTestHelper` - HTTP request wrapper
  - `AuthHelper` - Token management
  - `TestDataHelper` - Test state management

### Running Playwright Tests

```bash
# All Playwright tests
npm run test:playwright

# Specific file
npm run test:playwright:docker

# Interactive UI mode (best for debugging)
npm run test:playwright:ui

# View HTML report
npm run test:playwright:report
```

## 🧪 Original Jest Tests (Legacy)

**Preserved for backward compatibility**

### Test Files

| File | Description |
|------|-------------|
| `docker-e2e-spec.ts` | Original Docker e2e tests |
| `api-endpoints.e2e-spec.ts` | Original API endpoint tests |
| `platform-admin.e2e-spec.ts` | Original platform admin tests |

### Running Jest Tests

```bash
# All Jest e2e tests
npm run test:e2e

# Docker e2e tests
npm run test:e2e:docker
```

## 📊 Comparison

### Code Statistics

| Metric | Jest/Supertest | Playwright | Change |
|--------|---------------|------------|---------|
| Total lines | 1,344 | 1,165 | -13% (more concise) |
| Test files | 3 | 3 | Same |
| Total tests | 65+ | 65+ | Same coverage |
| Helper code | Inline | 184 lines | Reusable |

### Pattern Comparison

**Jest/Supertest Pattern:**
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

**Playwright Pattern:**
```typescript
test('should get companies', async () => {
  const response = await apiHelper.get('/api/v1/companies', {
    query: { page: 1, limit: 10 },
  });
  
  apiHelper.assertStatus(response, 200);
  apiHelper.assertHasProperty(response, 'data');
});
```

## 🚀 Quick Start

### 1. Setup Test Environment

```bash
# Install dependencies
npm install

# Setup test database (required for both)
npm run test:e2e:setup
```

### 2. Run Tests

```bash
# Recommended: Use Playwright
npm run test:playwright

# Or: Use original Jest tests
npm run test:e2e
```

### 3. Cleanup

```bash
# Stop test database
npm run test:e2e:cleanup
```

## 📖 Documentation

- **[PLAYWRIGHT_MIGRATION.md](./PLAYWRIGHT_MIGRATION.md)** - Detailed migration guide
- **[E2E_PLAYWRIGHT_TRANSFORMATION.md](../../../E2E_PLAYWRIGHT_TRANSFORMATION.md)** - Executive summary
- **[playwright.config.ts](../playwright.config.ts)** - Playwright configuration

## 🎯 Test Coverage

Both test suites cover the same modules:

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
