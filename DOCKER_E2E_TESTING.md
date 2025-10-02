# Docker E2E Testing Guide

This guide explains how to run end-to-end tests with a real PostgreSQL database in Docker, ensuring all backend endpoints work correctly with actual database operations.

## Overview

The Docker E2E test suite validates:
- ✅ All API endpoints work with real database
- ✅ Data persistence and retrieval
- ✅ Business logic correctness
- ✅ CRUD operations integrity
- ✅ Multi-tenant isolation
- ✅ **Authentication and authorization with JWT tokens**
- ✅ Pagination and filtering
- ✅ Data relationships
- ✅ Error handling

**Latest Update (January 2025):** JWT authentication now properly configured for all protected endpoints. Tests use actual database-backed authentication with real JWT tokens.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed
- Dependencies installed (`npm install`)

## Quick Start

### 1. Setup Test Database

```bash
cd apps/api
npm run test:e2e:setup
```

This will:
- Start PostgreSQL container with pgvector extension
- Initialize database schema
- Load sample data
- Verify database health

**Expected Output:**
```
========================================
  Selly Base - Test Database Setup
========================================

✓ Docker is running
▶ Starting test database...
⏳ Waiting for database to be ready...
✓ Database is ready!

🔍 Verifying PostgreSQL extensions...
 vector    | 0.8.1 | vector data type and ivfflat/hnsw access
 citext    | 1.6   | case-insensitive character strings
 pg_trgm   | 1.6   | text similarity measurement
 pgcrypto  | 1.3   | cryptographic functions
 uuid-ossp | 1.1   | UUID generation
✓ All extensions verified

📊 Verifying database schema...
  Tables created: 19
✓ Sample data verified

========================================
  ✅ Test Database Ready!
========================================

Connection details:
  Host: localhost
  Port: 5432
  Database: selly_base_test
  User: postgres
  Password: postgres

To run tests: npm run test:e2e:docker
To stop database: docker compose -f docker-compose.test.yml down
```

### 2. Run E2E Tests

```bash
npm run test:e2e:docker
```

This runs comprehensive tests covering all modules with real database operations.

### 3. Cleanup

```bash
npm run test:e2e:cleanup
```

This stops the test database and removes all test data.

## Test Coverage

### Modules Tested

#### 1. Health Check Module
- Database connection verification
- Service health status

#### 2. Authentication & Authorization Module
- User login with credentials
- JWT token generation and validation
- User profile retrieval
- Invalid token rejection
- Authorization enforcement

#### 3. Companies Module
- List companies with pagination
- Search companies by keyword
- Filter by industry, location, etc.
- Get company by ID
- Create new company
- Update company details
- Data validation

#### 4. Company Lists Module
- Get all company lists
- Create new list
- Add companies to list
- Remove companies from list
- Get companies in list
- List metadata management

#### 5. Exports Module
- List export jobs
- Create export job
- Get export job details
- Filter by status
- Track export progress
- Organization scoping

#### 6. Imports Module
- List import jobs
- Create import job
- Validate import data
- Execute import
- Error handling
- Status tracking

#### 7. Staff Module
- List staff members
- Create staff member
- Update staff details
- Get staff by ID
- Department management
- Role assignment

#### 8. Reports Module
- Dashboard analytics
- Data quality metrics
- User activity tracking
- Export history
- Real-time statistics

#### 9. Admin Module
- Organization user management
- Organization policies
- Integration settings
- Activity logs
- Access control

#### 10. Data Integrity & Business Logic
- Cross-operation consistency
- Organization isolation
- Pagination correctness
- Data relationships
- Referential integrity

## Test Results

Running the full test suite should produce output like:

```
Backend API with Docker Database (e2e)
  1. Health Check
    ✓ should return healthy status with database connected (234ms)
  2. Authentication & Authorization
    ✓ should reject login with invalid credentials (123ms)
    ✓ should login with valid credentials (245ms)
    ✓ should get current user with valid token (89ms)
    ✓ should reject requests without token (45ms)
    ✓ should reject requests with invalid token (56ms)
  3. Companies Module
    ✓ should get companies list with pagination (156ms)
    ✓ should search companies by keyword (134ms)
    ✓ should filter companies by industry (142ms)
    ✓ should get company by ID (78ms)
    ✓ should create a new company (198ms)
    ✓ should update a company (145ms)
  4. Company Lists Module
    ✓ should get company lists (123ms)
    ✓ should create a new company list (176ms)
    ✓ should add company to list (134ms)
    ✓ should get companies in list (98ms)
  5. Exports Module
    ✓ should get export jobs (112ms)
    ✓ should create export job (187ms)
    ✓ should get export job by ID (76ms)
    ✓ should filter export jobs by status (145ms)
  6. Imports Module
    ✓ should get import jobs (119ms)
    ✓ should create import job (192ms)
    ✓ should get import job by ID (81ms)
    ✓ should validate import data (234ms)
  7. Staff Module
    ✓ should get staff members (108ms)
    ✓ should create staff member (178ms)
    ✓ should get staff member by ID (72ms)
    ✓ should update staff member (143ms)
  8. Reports Module
    ✓ should get dashboard analytics (167ms)
    ✓ should get data quality metrics (134ms)
    ✓ should get user activity reports (98ms)
    ✓ should get export history (112ms)
  9. Admin Module
    ✓ should get organization users (145ms)
    ✓ should get organization policies (89ms)
    ✓ should get integration settings (76ms)
    ✓ should get activity logs (123ms)
  10. Data Integrity & Business Logic
    ✓ should maintain data consistency across operations (234ms)
    ✓ should enforce organization isolation (156ms)
    ✓ should handle pagination correctly (178ms)

Test Suites: 1 passed, 1 total
Tests:       39 passed, 39 total
Snapshots:   0 total
Time:        8.456 s
```

## Configuration Files

### Test Environment Configuration

File: `apps/api/.env.test`

```env
# Database Configuration
SKIP_DATABASE=false
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/selly_base_test
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=selly_base_test

# JWT Configuration
JWT_SECRET=test-secret-key-for-e2e-tests
JWT_EXPIRES_IN=1d

# API Configuration
PORT=3002
NODE_ENV=test
```

### Docker Compose Configuration

File: `docker-compose.test.yml`

Sets up a PostgreSQL container with:
- pgvector extension
- Sample data
- Health checks
- Network isolation

## Troubleshooting

### Database Not Starting

```bash
# Check Docker is running
docker info

# View database logs
npm run test:e2e:logs

# Manual cleanup and restart
npm run test:e2e:cleanup
npm run test:e2e:setup
```

### Tests Failing

1. **Verify database is running:**
   ```bash
   docker ps | grep postgres-test
   ```

2. **Check database connection:**
   ```bash
   docker compose -f ../../docker-compose.test.yml exec postgres-test \
     psql -U postgres -d selly_base_test -c "SELECT 1"
   ```

3. **Verify sample data:**
   ```bash
   docker compose -f ../../docker-compose.test.yml exec postgres-test \
     psql -U postgres -d selly_base_test -c "\
     SELECT 'users: ' || COUNT(*) FROM users \
     UNION ALL SELECT 'organizations: ' || COUNT(*) FROM organizations"
   ```

4. **Check environment:**
   ```bash
   cat apps/api/.env.test
   ```

### Port Conflicts

If port 5432 is already in use:

1. Stop other PostgreSQL instances
2. Or modify `docker-compose.test.yml` to use different port
3. Update `.env.test` accordingly

### Cleaning Up

To completely reset:

```bash
# Stop and remove everything
npm run test:e2e:cleanup

# Remove all test containers and volumes
docker compose -f ../../docker-compose.test.yml down -v

# Restart fresh
npm run test:e2e:setup
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests with Docker

on: [push, pull_request]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: apps/api
        run: npm install
      
      - name: Setup test database
        working-directory: apps/api
        run: npm run test:e2e:setup
      
      - name: Run E2E tests
        working-directory: apps/api
        run: npm run test:e2e:docker
      
      - name: Cleanup
        if: always()
        working-directory: apps/api
        run: npm run test:e2e:cleanup
```

## Best Practices

### 1. Test Isolation
- Each test should be independent
- Tests clean up their own data
- Use unique identifiers for test data

### 2. Test Data Management
- Use sample data from schema initialization
- Create minimal additional data as needed
- Clean up created data when possible

### 3. Test Execution
- Run tests sequentially (`--runInBand`)
- Use descriptive test names
- Log important information for debugging

### 4. Assertions
- Test actual database state, not mocks
- Verify data persistence
- Check relationships and constraints
- Validate business logic

## Maintenance

### Updating Test Database Schema

If database schema changes:

1. Update `selly-base-optimized-schema.sql`
2. Cleanup existing test database:
   ```bash
   npm run test:e2e:cleanup
   ```
3. Setup fresh database:
   ```bash
   npm run test:e2e:setup
   ```
4. Run tests to verify:
   ```bash
   npm run test:e2e:docker
   ```

### Adding New Tests

1. Open `apps/api/test/docker-e2e-spec.ts`
2. Add test in appropriate describe block
3. Follow existing patterns
4. Test actual database operations
5. Verify results match expectations

## Performance Considerations

- Tests run sequentially to avoid conflicts
- Each test suite takes 8-10 seconds
- Database initialization takes 5-10 seconds
- Total time: ~15-20 seconds

## Security Notes

- Test database uses default credentials
- Only accessible on localhost
- Automatically cleaned up after tests
- No production data in tests
- Isolated network for test containers

## Resources

- [NestJS Testing Documentation](https://docs.nestjs.com/fundamentals/testing)
- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For issues with Docker E2E tests:

1. Check this documentation
2. Review test logs: `npm run test:e2e:logs`
3. Check Docker logs: `docker compose -f docker-compose.test.yml logs`
4. Verify database connection
5. Ensure all prerequisites are met

---

**Last Updated:** January 2025  
**Status:** ✅ Production Ready  
**Test Coverage:** 39 E2E tests covering all major modules
