# E2E Tests Migration to Playwright

This document describes the migration of e2e tests from the traditional NestJS/Supertest approach to Playwright's standardized API testing framework.

## Overview

All e2e tests have been transformed to use Playwright's `APIRequestContext` for HTTP API testing, providing:

- **Standardized testing patterns** - Consistent API across all test types
- **Better async/await support** - Modern JavaScript promises
- **Built-in retry logic** - Automatic retry on failures
- **Enhanced debugging** - Better error messages and trace capabilities
- **Active maintenance** - Playwright is actively maintained by Microsoft

## Migration Summary

### Files Created

1. **Configuration**
   - `playwright.config.ts` - Playwright configuration for API testing

2. **Helper Utilities**
   - `test/helpers/api-test-helpers.ts` - Standardized API testing utilities including:
     - `ApiTestHelper` - Base class for making HTTP requests
     - `AuthHelper` - Authentication token management
     - `TestDataHelper` - Test state management

3. **Playwright Test Files**
   - `test/docker-e2e.playwright.spec.ts` - Full e2e tests with Docker database
   - `test/api-endpoints.playwright.spec.ts` - Basic API endpoint tests
   - `test/platform-admin.playwright.spec.ts` - Platform admin API tests

### Original Files (Preserved)

The original test files remain unchanged for backward compatibility:
- `test/docker-e2e-spec.ts` (Jest/Supertest)
- `test/api-endpoints.e2e-spec.ts` (Jest/Supertest)
- `test/platform-admin.e2e-spec.ts` (Jest/Supertest)

## Key Improvements

### 1. Standardized Request Patterns

**Before (Supertest):**
```typescript
await request(app.getHttpServer())
  .get('/api/v1/companies')
  .query({ page: 1, limit: 10 })
  .expect(200);
```

**After (Playwright):**
```typescript
const response = await apiHelper.get('/api/v1/companies', {
  query: { page: 1, limit: 10 },
});
apiHelper.assertStatus(response, 200);
```

### 2. Better Auth Token Management

**Before:**
```typescript
let authToken: string;
// Later in test
.set('Authorization', `Bearer ${authToken}`)
```

**After:**
```typescript
const authHelper = new AuthHelper();
authHelper.setToken(token);
// Later in test
headers: authHelper.getAuthHeader()
```

### 3. Improved Test Data Management

**Before:**
```typescript
let userId: string;
let organizationId: string;
let companyId: string;
// Manual variable management
```

**After:**
```typescript
const testData = new TestDataHelper();
testData.set('userId', userId);
testData.set('organizationId', orgId);
// Type-safe retrieval
const userId = testData.get<string>('userId');
```

### 4. Consistent Assertions

All assertion methods are centralized:
- `assertStatus(response, expectedStatus)`
- `assertHasProperty(response, property)`
- `assertPropertyValue(response, property, value)`
- `assertIsArray(response, property?)`

## Running the Tests

### Prerequisites

1. Install dependencies:
```bash
npm install
```

2. Setup test database:
```bash
npm run test:e2e:setup
```

### Running Playwright Tests

```bash
# Run all Playwright tests
npm run test:playwright

# Run specific test file
npm run test:playwright:docker

# Run with UI mode for debugging
npm run test:playwright:ui

# View test report
npm run test:playwright:report
```

### Running Original Jest Tests (Backward Compatible)

```bash
# Run all Jest e2e tests
npm run test:e2e

# Run Docker e2e tests
npm run test:e2e:docker
```

## Test Coverage

All modules have been fully migrated:

- ✅ Health Check
- ✅ Authentication & Authorization
- ✅ Companies Module (CRUD, search, filters)
- ✅ Company Lists Module
- ✅ Exports Module
- ✅ Imports Module
- ✅ Staff Module
- ✅ Reports Module (dashboard, quality, activity, history)
- ✅ Admin Module (users, policies, integrations, logs)
- ✅ Data Integrity & Business Logic
- ✅ Platform Admin (tenants, users, shared companies)

## Configuration

The Playwright configuration (`playwright.config.ts`) includes:

- **Test Directory**: `./test`
- **Test Pattern**: `**/*.playwright.spec.ts`
- **Parallel Execution**: Disabled (sequential) for data consistency
- **Workers**: 1 (single worker to avoid data conflicts)
- **Base URL**: `http://localhost:3001` (configurable via `API_BASE_URL` env var)
- **Reporters**: List and HTML

## Environment Variables

- `API_BASE_URL` - Base URL for API (default: `http://localhost:3001`)
- `SKIP_DATABASE` - Skip database requirement check (default: `false`)

## Benefits of Migration

1. **Modern Testing Framework** - Built on latest JavaScript features
2. **Better Error Messages** - More descriptive failure messages
3. **Automatic Retries** - Configurable retry logic for flaky tests
4. **Trace Files** - Detailed trace files for debugging failures
5. **HTML Reports** - Beautiful HTML reports with screenshots and traces
6. **Cross-Platform** - Works consistently across OS platforms
7. **API + UI Testing** - Can extend to UI testing with same framework

## Migration Guidelines for New Tests

When writing new tests, follow these patterns:

1. **Use Helper Classes**
   ```typescript
   const apiHelper = new ApiTestHelper(requestContext);
   const authHelper = new AuthHelper();
   const testData = new TestDataHelper();
   ```

2. **Consistent Response Handling**
   ```typescript
   const response = await apiHelper.get('/endpoint');
   apiHelper.assertStatus(response, 200);
   apiHelper.assertHasProperty(response, 'data');
   ```

3. **Test Data Management**
   ```typescript
   testData.set('key', value);
   const value = testData.get('key');
   ```

4. **Auth Headers**
   ```typescript
   headers: authHelper.getAuthHeader()
   ```

## Cleanup

After running tests:
```bash
npm run test:e2e:cleanup
```

This stops the test database and cleans up Docker resources.

## Troubleshooting

### Tests Failing to Connect
- Ensure the API server is running on the correct port
- Check `API_BASE_URL` environment variable
- Verify Docker database is running (`npm run test:e2e:setup`)

### Authentication Failures
- Verify test users exist in database
- Check credentials in test setup
- Review auth token generation

### Database Conflicts
- Tests run sequentially (workers: 1) to prevent conflicts
- Ensure previous test runs cleaned up properly
- Run `npm run test:e2e:cleanup` if needed

## Next Steps

1. **Deprecate Old Tests** - Once Playwright tests are verified, consider removing Jest/Supertest tests
2. **Add UI Tests** - Extend to include frontend UI tests using Playwright
3. **CI/CD Integration** - Add Playwright tests to CI/CD pipeline
4. **Performance Testing** - Consider adding performance benchmarks

## Documentation

- [Playwright Documentation](https://playwright.dev/)
- [Playwright API Testing](https://playwright.dev/docs/api-testing)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
