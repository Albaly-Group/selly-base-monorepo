# Testing Architecture

This document describes the testing strategy and architecture for the Selly Base application, following software testing best practices.

## Test Type Separation

This project follows a **proper test separation** strategy with four distinct test types:

```
┌──────────────────────────────────────────────────────────────────────┐
│                        Testing Pyramid                               │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│                           ▲ E2E Tests                                │
│                          ╱ ╲ (Slowest, Fewest)                      │
│                         ╱   ╲ Full Stack Testing                     │
│                        ╱─────╲                                       │
│                       ╱       ╲ Integration Tests                    │
│                      ╱ API Tests╲ (Medium Speed)                     │
│                     ╱────────────╲ Backend + Database                │
│                    ╱              ╲                                   │
│                   ╱  Unit Tests    ╲ Component Tests                 │
│                  ╱────────────────────╲ (Fastest, Most)              │
│                 ▕                      ▏                              │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

## 1. End-to-End (E2E) Tests

**Location**: `/e2e/`  
**Framework**: Playwright with Browser Automation  
**Purpose**: Test complete user workflows from frontend UI through backend API to database

### Scope
- Frontend UI interactions
- Backend API calls
- Database operations
- Complete user journeys

### When to Use
- Critical user flows (login, checkout, etc.)
- Smoke tests for deployments
- Regression testing of core features
- Cross-browser compatibility testing

### Example
```typescript
test('user can create a company', async ({ page }) => {
  await page.goto('/companies');
  await page.click('[data-testid="add-company"]');
  await page.fill('[name="companyName"]', 'Test Corp');
  await page.click('button:has-text("Save")');
  await expect(page.locator('text=Test Corp')).toBeVisible();
});
```

### Running E2E Tests
```bash
# From project root
npm run test:e2e
npm run test:e2e:ui        # Interactive mode
npm run test:e2e:report    # View report
```

### Configuration
- File: `/playwright.config.ts`
- Test Pattern: `**/*.e2e.spec.ts`
- Browsers: Chromium, Firefox, WebKit

---

## 2. Backend API Tests

**Location**: `/apps/api/test/api/`  
**Framework**: Playwright APIRequestContext  
**Purpose**: Test backend API endpoints in isolation (no UI, no database dependency)

### Scope
- HTTP endpoints
- Request/response validation
- API contracts
- Error handling

### When to Use
- Testing API endpoints independently
- Contract testing
- Fast feedback during development
- CI/CD pipeline checks

### Example
```typescript
test('should get companies list', async () => {
  const response = await apiHelper.get('/api/v1/companies', {
    query: { page: 1, limit: 10 },
  });
  
  apiHelper.assertStatus(response, 200);
  apiHelper.assertHasProperty(response, 'data');
});
```

### Running API Tests
```bash
# From apps/api directory
npm run test:api
npm run test:api:ui        # Interactive mode
npm run test:api:report    # View report
```

### Configuration
- File: `/apps/api/playwright.config.ts`
- Test Pattern: `**/*.playwright.spec.ts`
- Test Directory: `./test/api`

---

## 3. Backend Integration Tests

**Location**: `/apps/api/test/integration/`  
**Framework**: Jest + Supertest  
**Purpose**: Test backend with real database (no UI)

### Scope
- Backend business logic
- Database operations
- Data persistence
- Transaction handling

### When to Use
- Testing complex business logic
- Database interaction validation
- Data integrity checks
- Service layer testing

### Example
```typescript
it('should create company in database', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/v1/companies')
    .send({ name: 'Test Corp' })
    .expect(201);
    
  expect(response.body).toHaveProperty('id');
});
```

### Running Integration Tests
```bash
# From apps/api directory
npm run test:integration:setup    # Start database
npm run test:integration          # Run tests
npm run test:integration:cleanup  # Stop database
```

### Configuration
- File: `/apps/api/test/jest-e2e.json`
- Test Pattern: `.e2e-spec.ts$`
- Test Directory: `./test/integration`

---

## 4. Frontend Component Tests

**Location**: `/apps/web/__tests__/` (To be implemented)  
**Framework**: Jest + React Testing Library  
**Purpose**: Test frontend components in isolation (no backend)

### Scope
- Component rendering
- User interactions
- Props handling
- State management

### When to Use
- Testing UI components
- Form validation
- User interaction flows
- Component logic

### Example (To be implemented)
```typescript
test('CompanyForm validates required fields', () => {
  render(<CompanyForm />);
  fireEvent.click(screen.getByText('Save'));
  expect(screen.getByText('Company name is required')).toBeInTheDocument();
});
```

---

## Test Architecture Summary

| Test Type | Location | Framework | Scope | Speed | Count |
|-----------|----------|-----------|-------|-------|-------|
| **E2E** | `/e2e/` | Playwright (Browser) | Frontend + Backend + DB | Slow | Minimal |
| **API** | `/apps/api/test/api/` | Playwright (API) | Backend API only | Fast | Moderate |
| **Integration** | `/apps/api/test/integration/` | Jest + Supertest | Backend + DB | Medium | Many |
| **Component** | `/apps/web/__tests__/` | Jest + RTL | Frontend only | Fast | Many |

---

## File Naming Conventions

```
E2E Tests:           *.e2e.spec.ts
API Tests:           *.playwright.spec.ts
Integration Tests:   *.e2e-spec.ts (legacy naming)
Component Tests:     *.test.tsx or *.spec.tsx
```

---

## Running All Tests

```bash
# E2E Tests (Full stack)
npm run test:e2e

# Backend API Tests (API only)
cd apps/api && npm run test:api

# Backend Integration Tests (Backend + DB)
cd apps/api && npm run test:integration

# Frontend Component Tests (To be implemented)
cd apps/web && npm test
```

---

## Test Data Management

### E2E Tests
- Use test database with seed data
- Clean up after each test
- Use realistic test data

### API Tests
- Mock external dependencies
- Use minimal test data
- Focus on API contracts

### Integration Tests
- Use test database in Docker
- Maintain data isolation
- Test data persistence

### Component Tests
- Mock API calls
- Use minimal props
- Test component behavior

---

## Best Practices

### E2E Tests
1. Keep tests minimal - they're expensive
2. Test critical user journeys only
3. Use Page Object Model pattern
4. Avoid implementation details
5. Clean up test data

### API Tests
1. Test API contracts
2. Validate request/response schemas
3. Test error cases
4. Keep tests independent
5. Use helper utilities

### Integration Tests
1. Test business logic thoroughly
2. Validate data persistence
3. Test error handling
4. Use transactions where appropriate
5. Clean up after tests

### Component Tests
1. Test user interactions
2. Test component behavior, not implementation
3. Mock external dependencies
4. Test edge cases
5. Keep tests focused

---

## CI/CD Integration

```yaml
# Example GitHub Actions workflow
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Component Tests
        run: npm test
        
      - name: API Tests
        run: cd apps/api && npm run test:api
        
      - name: Integration Tests
        run: |
          cd apps/api
          npm run test:integration:setup
          npm run test:integration
          
      - name: E2E Tests
        run: |
          npm run dev &
          npm run test:e2e
```

---

## Migration from Old Structure

### Before (Incorrect)
```
apps/api/test/
├── docker-e2e-spec.ts           ❌ Called "e2e" but only tests API
├── api-endpoints.e2e-spec.ts    ❌ Called "e2e" but only tests API
└── platform-admin.e2e-spec.ts   ❌ Called "e2e" but only tests API
```

### After (Correct)
```
/e2e/                              ✅ True E2E tests (Frontend->Backend->DB)
├── example.e2e.spec.ts
└── README.md

apps/api/test/
├── api/                           ✅ API tests (Backend only)
│   ├── api-endpoints.playwright.spec.ts
│   ├── docker-api.playwright.spec.ts
│   └── platform-admin.playwright.spec.ts
│
├── integration/                   ✅ Integration tests (Backend + DB)
│   ├── docker-e2e-spec.ts
│   ├── api-endpoints.e2e-spec.ts
│   └── platform-admin.e2e-spec.ts
│
└── helpers/
    └── api-test-helpers.ts
```

---

## Future Enhancements

- [ ] Implement frontend component tests
- [ ] Add visual regression testing
- [ ] Add performance testing
- [ ] Add accessibility testing
- [ ] Add API contract testing
- [ ] Add load testing
- [ ] Add security testing

---

## Resources

- [Testing Best Practices](https://martinfowler.com/testing/)
- [Testing Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Playwright Documentation](https://playwright.dev/)
- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
