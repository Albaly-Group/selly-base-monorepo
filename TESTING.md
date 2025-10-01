# Testing Documentation

This document describes the comprehensive test suite for the Selly Base Frontend project, covering both backend and frontend testing.

## Backend Tests (NestJS/Jest)

### Running Tests

```bash
cd apps/api

# Run all unit tests
npm test

# Run tests with coverage
npm run test:cov

# Run tests in watch mode
npm run test:watch

# Run E2E tests (requires database setup)
npm run test:e2e
```

### Test Structure

The backend has comprehensive unit tests covering all major modules:

#### ✅ Auth Module (7 tests)
- Password verification (bcrypt and argon2 support)
- Password hashing
- Authentication service initialization

#### ✅ Companies Module (10 tests)
- Search companies with pagination
- Filter by keyword
- Get company by ID
- Create, update, and delete companies
- Permission-based access control

#### ✅ Exports Module (10 tests)
- Get export jobs with pagination
- Filter by status
- Get export job by ID
- Create export jobs
- Delete export jobs

#### ✅ Imports Module (8 tests)
- Get import jobs with pagination
- Filter by status  
- Get import job by ID
- Create import jobs
- Execute import jobs

#### ✅ Staff Module (4 tests)
- Get staff members with pagination
- Create staff members
- Update staff permissions

#### ✅ Reports Module (17 tests)
- Dashboard analytics
- Data quality metrics
- User activity reports
- Export history reports

#### ✅ Admin Module (15 tests)
- Organization user management
- Organization policies
- Integration settings
- User CRUD operations

#### ✅ Company Lists Module (6 tests)
- Search company lists
- Get list by ID
- Create lists
- Add/remove companies from lists

#### ✅ Additional Tests (16 tests)
- App controller
- CORS configuration
- Swagger configuration
- Database configuration

### Total Test Coverage

**93 unit tests passing** covering:
- Service layer business logic
- Controller endpoint handlers
- Configuration modules
- Mock data fallback functionality

### Test Features

1. **Mock Data Fallback Testing**: All services are tested with mock data to ensure they work without a database connection
2. **Permission Testing**: Tests verify role-based access control
3. **Pagination Testing**: Tests confirm pagination works correctly
4. **Error Handling**: Tests verify proper error responses for invalid inputs
5. **Data Validation**: Tests check DTO validation and transformation

## Frontend Tests

### Current Status

The frontend (Next.js) currently does not have a test setup. To add frontend testing:

### Recommended Setup

```bash
cd apps/web

# Install testing dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event jest jest-environment-jsdom

# Configure Jest for Next.js
# Create jest.config.js
```

### Suggested Test Structure

1. **Component Tests**
   - UI components (buttons, forms, cards)
   - Page components
   - Layout components

2. **API Client Tests**
   - Test `lib/api-client.ts` methods
   - Mock API responses
   - Test error handling

3. **Integration Tests**
   - Test user workflows
   - Test data flow from API to UI
   - Test state management

4. **E2E Tests (Optional)**
   - Use Playwright for full user journey testing
   - Test critical paths (login, search, export)

## Test Coverage Goals

### Current Coverage
- ✅ Backend Unit Tests: 93 tests passing
- ⏳ Frontend Tests: Not yet implemented
- ⏳ E2E Tests: Configuration needed

### Target Coverage
- Backend: 80% code coverage
- Frontend: 70% code coverage
- E2E: Critical paths covered

## Running Tests in CI/CD

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm install
        working-directory: apps/api
      - name: Run tests
        run: npm test
        working-directory: apps/api
```

## Mock Data Strategy

The backend uses mock data fallback to allow development and testing without a database:

- Each service checks if a repository is available
- If not, it falls back to mock data
- Mock data includes realistic sample records
- Pagination, filtering, and search work with mock data

This allows:
- ✅ Running tests without database
- ✅ Local development without Docker
- ✅ Quick onboarding for new developers
- ✅ Testing error scenarios easily

## Testing Best Practices

### For Backend Tests

1. **Test Services, Not Controllers**: Focus on business logic in services
2. **Use Mock Repositories**: Don't test database queries in unit tests
3. **Test Error Cases**: Verify proper error handling
4. **Test Permissions**: Ensure access control works
5. **Keep Tests Fast**: Unit tests should run in milliseconds

### For Frontend Tests (When Implemented)

1. **Test User Behavior**: Focus on what users see and do
2. **Mock API Calls**: Don't make real API requests in tests
3. **Test Accessibility**: Verify ARIA labels and keyboard navigation
4. **Test Loading States**: Verify spinners and placeholders
5. **Test Error States**: Verify error messages display correctly

## Debugging Failed Tests

### Common Issues

1. **Import Errors**
   - Check entity imports use correct names (plural: `Users`, `Organizations`)
   - Verify paths are correct

2. **Mock Data Mismatches**
   - Check test uses correct mock IDs
   - Verify mock user has correct organizationId

3. **Permission Errors**
   - Ensure test user has required permissions
   - Check organizationId matches data being accessed

4. **Type Errors**
   - Verify DTOs are imported correctly
   - Check parameter types match method signatures

## Future Improvements

- [ ] Add E2E tests with proper database setup
- [ ] Add frontend test suite
- [ ] Add visual regression testing
- [ ] Add performance testing
- [ ] Add API contract testing
- [ ] Add load testing for critical endpoints
- [ ] Set up test coverage reporting
- [ ] Integrate with CI/CD pipeline

## Resources

- [Jest Documentation](https://jestjs.io/)
- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Testing Library](https://testing-library.com/)
- [Supertest](https://github.com/visionmedia/supertest) for API testing

## Support

For questions about testing:
- Review existing tests in `apps/api/src/modules/*/**.spec.ts`
- Check test utilities in `apps/api/test/`
- Refer to NestJS testing documentation
