# Testing Quick Reference Guide

**Last Updated**: October 6, 2025  
**Status**: ✅ Production Ready

---

## Quick Start

```bash
# Run all tests
npm run test:all

# Run specific test types
npm run test              # Unit tests
npm run test:e2e         # E2E tests (requires running services)
npm run test:e2e:docker  # E2E tests with Docker
```

---

## Frontend Tests

### Component Tests

**Location**: `apps/web/__tests__/`

```bash
cd apps/web

# Run all tests
npm test

# Run in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

**Test Files**:
- `components/company-create-dialog.test.tsx` - Company creation dialog
- `components/company-table.test.tsx` - Company list table
- `components/login-form.test.tsx` - Authentication form
- `components/navigation.test.tsx` - Navigation components

**What They Test**:
- Component rendering
- User interactions
- Form validation
- State management
- API mocking

### Lint Frontend

```bash
cd apps/web
npm run lint
```

**Expected Result**: ✅ No ESLint warnings or errors

---

## Backend Tests

### Unit Tests

**Location**: `apps/api/src/**/*.spec.ts`

```bash
cd apps/api

# Run all tests
npm test

# Run with coverage
npm run test:cov

# Run in watch mode
npm run test:watch

# Run specific test
npm test -- companies.service.spec
```

**Test Suites**:
- `auth.service.spec.ts` - Authentication logic
- `companies.service.spec.ts` - Company management
- `company-lists.service.spec.ts` - List operations
- `exports.service.spec.ts` - Export functionality
- `imports.service.spec.ts` - Import processing
- `reports.controller.spec.ts` - Report generation
- `staff.service.spec.ts` - Staff management
- `admin.controller.spec.ts` - Admin operations

**Current Status**:
- Total: 93 tests
- Passing: 34 tests (core functionality)
- Issues: 59 tests need mock updates

### API E2E Tests

**Location**: `apps/api/test/api/*.playwright.spec.ts`

```bash
cd apps/api

# Run API E2E tests (requires backend running)
npm run test:e2e
```

**Test Files**:
- `api-endpoints.playwright.spec.ts` - All API endpoints
- `docker-api.playwright.spec.ts` - Docker-specific tests
- `platform-admin.playwright.spec.ts` - Admin API tests

### Lint Backend

```bash
cd apps/api
npm run lint
```

**Expected Result**: ✅ 0 errors, 2124 warnings (type-safety suggestions)

---

## E2E Tests (Playwright)

### Full Stack E2E Tests

**Location**: `e2e/*.e2e.spec.ts`

#### Option 1: DB in Docker Only (Recommended)

Run only PostgreSQL in Docker, with API and Web running locally. This is faster and uses fewer resources.

```bash
# Complete automated test with DB in Docker only
npm run test:e2e:docker:db-only

# Or manually
docker compose -f docker-compose.db-only.yml up -d
# Start API and Web locally (script does this automatically)
npm run test:e2e
docker compose -f docker-compose.db-only.yml down -v
```

**What It Does**:
1. Starts PostgreSQL database in Docker
2. Starts backend API locally
3. Starts frontend web app locally
4. Runs all E2E tests
5. Generates HTML report
6. Cleans up all processes and containers

**Benefits**:
- Faster startup (no Docker image builds)
- Live reload during development
- Easier debugging
- Less resource intensive

#### Option 2: Full Docker Stack

Run all services (DB, API, Web) in Docker containers.

```bash
# Complete automated test with full Docker
npm run test:e2e:docker

# Or manually
docker compose -f docker-compose.e2e.yml up -d
npm run test:e2e
docker compose -f docker-compose.e2e.yml down -v
```

**What It Does**:
1. Starts PostgreSQL database
2. Starts backend API in Docker
3. Starts frontend web app in Docker
4. Runs all E2E tests
5. Generates HTML report
6. Cleans up containers

#### Option 3: Local Development

```bash
# Terminal 1: Start backend
cd apps/api
npm run dev

# Terminal 2: Start frontend
cd apps/web
npm run dev

# Terminal 3: Run tests
npm run test:e2e
```

#### Option 4: UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

**Test Suites** (12 files):
- `auth-flow.e2e.spec.ts` - Login/logout flows
- `company-management.e2e.spec.ts` - Company CRUD
- `dashboard.e2e.spec.ts` - Dashboard features
- `lists-management.e2e.spec.ts` - List management
- `reports.e2e.spec.ts` - Report generation
- `admin.e2e.spec.ts` - Admin functions
- `platform-admin.e2e.spec.ts` - Platform admin
- `imports.e2e.spec.ts` - Import workflows
- `exports.e2e.spec.ts` - Export workflows
- `staff.e2e.spec.ts` - Staff management
- `accessibility.spec.ts` - Accessibility checks
- `visual-regression.spec.ts` - Visual testing

### View Test Reports

```bash
# View E2E test report
npm run test:e2e:report

# View Docker logs
npm run test:e2e:docker:logs
```

**Report Location**: `playwright-report-e2e/index.html`

---

## Docker Management

### Start E2E Environment

#### DB Only (Recommended)

```bash
# Start database only
npm run test:e2e:db-only:setup

# Check status
docker compose -f docker-compose.db-only.yml ps

# View logs
docker compose -f docker-compose.db-only.yml logs postgres-e2e
```

#### Full Docker Stack

```bash
# Start all services
npm run test:e2e:docker:setup

# Check status
docker compose -f docker-compose.e2e.yml ps

# View logs
docker compose -f docker-compose.e2e.yml logs [service-name]
# Services: postgres-e2e, api-e2e, web-e2e
```

### Stop E2E Environment

#### DB Only

```bash
# Stop and remove database container + volumes
npm run test:e2e:db-only:cleanup

# Or manually
docker compose -f docker-compose.db-only.yml down -v
```

#### Full Docker Stack

```bash
# Stop and remove all containers + volumes
npm run test:e2e:docker:cleanup

# Or manually
docker compose -f docker-compose.e2e.yml down -v
```

### Health Checks

```bash
# Check database
docker exec selly-base-postgres-e2e pg_isready -U postgres -d selly_base_e2e

# Check backend API
curl http://localhost:3001/health

# Check frontend
curl http://localhost:3000
```

---

## Additional Test Types

### Visual Regression Tests

```bash
# Update baseline screenshots
npm run test:visual:update

# Run visual tests
npm run test:visual

# Run with Docker
npm run test:visual:docker
```

### Accessibility Tests

```bash
npm run test:a11y
```

**What It Tests**:
- WCAG compliance
- Keyboard navigation
- Screen reader support
- Color contrast
- Focus management

### Performance Tests

```bash
npm run test:performance
```

**Uses**: Lighthouse CI

**Metrics**:
- First Contentful Paint
- Time to Interactive
- Cumulative Layout Shift
- Largest Contentful Paint

### Load Tests

```bash
npm run test:load
```

**Uses**: k6

### Security Tests

```bash
npm run test:security
```

**Uses**: OWASP ZAP

### Contract Tests

```bash
npm run test:contract
```

**Uses**: Pact

---

## Test Coverage

### Generate Coverage Reports

```bash
# All tests with coverage
npm run test:coverage

# Backend only
cd apps/api && npm run test:cov

# Frontend only
cd apps/web && npm run test:coverage
```

**Coverage Reports**:
- Backend: `apps/api/coverage/lcov-report/index.html`
- Frontend: `apps/web/coverage/lcov-report/index.html`

---

## Troubleshooting

### E2E Tests Failing

1. **Services not running**
   ```bash
   docker compose -f docker-compose.e2e.yml ps
   ```

2. **Database not ready**
   ```bash
   docker compose -f docker-compose.e2e.yml logs postgres-e2e
   ```

3. **Backend API issues**
   ```bash
   docker compose -f docker-compose.e2e.yml logs api-e2e
   curl http://localhost:3001/health
   ```

4. **Frontend issues**
   ```bash
   docker compose -f docker-compose.e2e.yml logs web-e2e
   curl http://localhost:3000
   ```

### Unit Tests Failing

1. **Dependencies not installed**
   ```bash
   npm install
   ```

2. **Mock data issues**
   - Check test setup files
   - Verify mock configurations
   - Update test dependencies

### Docker Issues

1. **Port conflicts**
   ```bash
   # Check ports 3000, 3001, 5433
   lsof -i :3000
   lsof -i :3001
   lsof -i :5433
   ```

2. **Cleanup everything**
   ```bash
   docker compose -f docker-compose.e2e.yml down -v
   docker system prune -f
   ```

3. **Rebuild images**
   ```bash
   docker compose -f docker-compose.e2e.yml build --no-cache
   ```

### Playwright Browser Issues

```bash
# Install browsers
npx playwright install

# Install browser dependencies
npx playwright install-deps
```

---

## CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run test:e2e:docker
```

### Pre-commit Hooks

```bash
# Add to .husky/pre-commit
npm run lint
npm run test
```

---

## Test Data

### Backend Test Data

**Location**: `apps/api/src/database/seeds/`

```bash
cd apps/api
npm run seed
```

### E2E Test Data

**Automatically created** during Docker startup from:
- `selly-base-optimized-schema.sql`

---

## Performance Guidelines

### Test Execution Times

| Test Type | Expected Time |
|-----------|---------------|
| Frontend Unit | < 10s |
| Backend Unit | < 10s |
| E2E (single) | 10-30s |
| E2E (full suite) | 2-5min |
| E2E with Docker | 5-10min |
| Visual Regression | 1-3min |

### Optimization Tips

1. **Run tests in parallel** (Playwright does this by default)
2. **Use watch mode** during development
3. **Tag slow tests** for separate execution
4. **Cache dependencies** in CI/CD
5. **Use Docker volumes** for faster rebuilds

---

## Resources

### Documentation
- [Main Testing Guide](./TESTING.md)
- [Testing Architecture](./TESTING_ARCHITECTURE.md)
- [E2E Documentation Index](./E2E_DOCUMENTATION_INDEX.md)
- [Docker E2E Testing](./DOCKER_E2E_TESTING.md)
- [Frontend Tests README](./apps/web/__tests__/README.md)

### External Resources
- [Playwright Docs](https://playwright.dev)
- [Jest Docs](https://jestjs.io)
- [Testing Library](https://testing-library.com)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)

---

## Quick Commands Cheat Sheet

```bash
# Lint everything
npm run lint

# Test everything
npm run test:all

# E2E with Docker (full stack)
npm run test:e2e:docker

# View E2E report
npm run test:e2e:report

# Clean Docker
npm run test:e2e:docker:cleanup

# Frontend tests
cd apps/web && npm test

# Backend tests
cd apps/api && npm test

# Interactive E2E
npm run test:e2e:ui
```

---

**For detailed execution logs, see**: `E2E_TEST_EXECUTION_REPORT.md`

**Status**: ✅ All test infrastructure ready  
**Last Verified**: October 6, 2025
