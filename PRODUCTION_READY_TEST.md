# Production-Ready Test Suite Documentation

## Overview

The Production-Ready Test Suite is a comprehensive validation framework designed to ensure the Selly Base application meets enterprise-grade production standards before deployment. It validates critical aspects of system security, performance, data integrity, and operational readiness.

## Purpose and Scope

### Purpose
- Validate production readiness before deployment
- Ensure security measures are properly implemented
- Verify performance meets acceptable baselines
- Confirm database integrity and data consistency
- Validate API contracts and error handling
- Test authentication and authorization mechanisms

### Scope
The test suite covers **21 comprehensive E2E tests** across **6 critical categories**:

1. **Security Validation** (4 tests)
2. **Performance Baselines** (3 tests)
3. **Database Integrity** (4 tests)
4. **API Contract Validation** (4 tests)
5. **Authentication & Authorization** (3 tests)
6. **Data Consistency & Validation** (4 tests)

## Test Categories

### Category 1: Security Validation (4 tests)

Tests that validate security measures are properly implemented to protect against common vulnerabilities.

#### SEC-001: SQL Injection Prevention
- **What it tests**: Input sanitization against SQL injection attacks
- **Why it matters**: Prevents unauthorized database access and data manipulation
- **Validation method**: Tests various SQL injection patterns against search and filter endpoints
- **Pass criteria**: All malicious inputs are either rejected or properly sanitized

#### SEC-002: XSS Prevention
- **What it tests**: Cross-site scripting (XSS) attack prevention
- **Why it matters**: Protects users from malicious scripts injected through user inputs
- **Validation method**: Tests XSS payloads in various input fields
- **Pass criteria**: All XSS attempts are properly escaped or rejected

#### SEC-003: HTTPS and Security Headers
- **What it tests**: Presence of security headers in API responses
- **Why it matters**: Ensures secure communication and prevents common web vulnerabilities
- **Validation method**: Checks for security headers in HTTP responses
- **Pass criteria**: Security headers are present and properly configured

#### SEC-004: JWT Token Validation
- **What it tests**: JWT token expiration and validation
- **Why it matters**: Prevents unauthorized access with expired or invalid tokens
- **Validation method**: Tests API access with invalid/expired tokens
- **Pass criteria**: Requests with invalid tokens are rejected with 401 status

### Category 2: Performance Baselines (3 tests)

Tests that ensure the application meets acceptable performance standards under normal and concurrent load.

#### PERF-001: List Endpoint Response Time
- **What it tests**: API response time for list endpoints
- **Why it matters**: Ensures responsive user experience for common operations
- **Validation method**: Measures response time for paginated list requests
- **Pass criteria**: Response time < 500ms

#### PERF-002: Single Record Response Time
- **What it tests**: API response time for single record retrieval
- **Why it matters**: Ensures fast access to individual records
- **Validation method**: Measures response time for single record GET requests
- **Pass criteria**: Response time < 200ms

#### PERF-003: Concurrent Request Handling
- **What it tests**: System's ability to handle multiple simultaneous requests
- **Why it matters**: Validates connection pool and concurrent user support
- **Validation method**: Sends 10 concurrent requests to health endpoint
- **Pass criteria**: All requests complete successfully in < 2 seconds

### Category 3: Database Integrity (4 tests)

Tests that validate database schema design, constraints, and data consistency.

#### DB-001: Foreign Key Constraints
- **What it tests**: Presence and enforcement of foreign key constraints
- **Why it matters**: Ensures referential integrity across related tables
- **Validation method**: Queries information_schema for foreign key constraints
- **Pass criteria**: At least one foreign key constraint exists

#### DB-002: Database Indexes
- **What it tests**: Presence of indexes on key columns
- **Why it matters**: Ensures query performance on frequently accessed columns
- **Validation method**: Queries pg_indexes for index count
- **Pass criteria**: More than 5 indexes exist on public schema tables

#### DB-003: Data Consistency
- **What it tests**: Consistency of data across related tables
- **Why it matters**: Validates that related records maintain proper relationships
- **Validation method**: Verifies companies have valid organization references
- **Pass criteria**: All records have valid foreign key references

#### DB-004: NOT NULL Constraints
- **What it tests**: Presence of NOT NULL constraints on critical fields
- **Why it matters**: Prevents null values in required fields at database level
- **Validation method**: Queries information_schema for NOT NULL columns
- **Pass criteria**: Critical fields (id, organization_id, created_at) have NOT NULL constraints

### Category 4: API Contract Validation (4 tests)

Tests that ensure API endpoints follow consistent contracts and return expected data structures.

#### API-001: Companies Schema Validation
- **What it tests**: Response schema for companies endpoint
- **Why it matters**: Ensures API returns data in expected format
- **Validation method**: Validates presence of data, total, and array structure
- **Pass criteria**: Response contains required properties with correct types

#### API-002: Error Response Format
- **What it tests**: Consistency of error response format
- **Why it matters**: Enables consistent error handling in frontend
- **Validation method**: Tests error responses from invalid requests
- **Pass criteria**: All errors return consistent format with message property

#### API-003: Pagination
- **What it tests**: Pagination functionality and parameters
- **Why it matters**: Ensures efficient data retrieval for large datasets
- **Validation method**: Tests limit and page parameters
- **Pass criteria**: Response respects limit parameter and includes pagination metadata

#### API-004: Health Check
- **What it tests**: System health endpoint functionality
- **Why it matters**: Enables monitoring and health checks in production
- **Validation method**: Calls health endpoint and validates response
- **Pass criteria**: Returns 200 status with "ok" status

### Category 5: Authentication & Authorization (3 tests)

Tests that validate authentication mechanisms and role-based access control.

#### AUTH-001: Protected Routes
- **What it tests**: Authentication enforcement on protected endpoints
- **Why it matters**: Prevents unauthorized access to sensitive data
- **Validation method**: Tests protected endpoints without authentication token
- **Pass criteria**: All protected endpoints return 401 without valid token

#### AUTH-002: Role-Based Access Control (RBAC)
- **What it tests**: Organization-level data isolation
- **Why it matters**: Ensures users can only access their organization's data
- **Validation method**: Verifies returned data belongs to user's organization
- **Pass criteria**: All returned records match user's organization ID

#### AUTH-003: Token Persistence
- **What it tests**: Token storage and persistence across page reloads
- **Why it matters**: Maintains user session without requiring re-authentication
- **Validation method**: Tests token retrieval after page reload
- **Pass criteria**: Token persists in localStorage across page reloads

### Category 6: Data Consistency & Validation (4 tests)

Tests that validate input validation, data type enforcement, and business rule compliance.

#### VAL-001: Required Fields
- **What it tests**: Enforcement of required field validation
- **Why it matters**: Prevents incomplete records from being created
- **Validation method**: Attempts to create record without required fields
- **Pass criteria**: Request is rejected with 400 status

#### VAL-002: Email Format Validation
- **What it tests**: Email format validation on email fields
- **Why it matters**: Ensures data quality and prevents invalid email addresses
- **Validation method**: Attempts to create record with invalid email
- **Pass criteria**: Request is rejected with 400 status

#### VAL-003: Data Type Validation
- **What it tests**: Enforcement of data type constraints
- **Why it matters**: Prevents type mismatches and data corruption
- **Validation method**: Attempts to submit wrong data type for field
- **Pass criteria**: Request is rejected with 400 status

#### VAL-004: Duplicate Prevention
- **What it tests**: Duplicate record prevention mechanisms
- **Why it matters**: Maintains data integrity and prevents duplicate entries
- **Validation method**: Attempts to create duplicate record
- **Pass criteria**: Duplicate is either rejected or allowed per business logic

## How to Run Tests

### Prerequisites

Ensure you have the following installed and configured:
- Docker and Docker Compose
- Node.js 18+
- npm
- Project dependencies installed (`npm install`)

### Running the Full Suite

Run all production-ready tests with the convenient shell script:

```bash
npm run test:production-ready
```

Or directly:

```bash
bash test-production-ready.sh
```

### Running Individual Tests

To run only the production-ready test spec:

```bash
npx playwright test e2e/production-ready.e2e.spec.ts
```

To run a specific test category:

```bash
npx playwright test e2e/production-ready.e2e.spec.ts -g "Security Validation"
npx playwright test e2e/production-ready.e2e.spec.ts -g "Performance"
npx playwright test e2e/production-ready.e2e.spec.ts -g "Database Integrity"
```

### Running in Different Browsers

```bash
npx playwright test e2e/production-ready.e2e.spec.ts --project=chromium
npx playwright test e2e/production-ready.e2e.spec.ts --project=firefox
npx playwright test e2e/production-ready.e2e.spec.ts --project=webkit
```

### Debug Mode

Run tests in debug mode with UI:

```bash
npx playwright test e2e/production-ready.e2e.spec.ts --ui
```

## Test Execution Flow

The `test-production-ready.sh` script follows this execution flow:

### Phase 1: Pre-flight Checks
1. Verify Docker is installed
2. Verify Docker Compose is available
3. Verify Node.js and npm are installed
4. Verify running from project root directory

### Phase 2: Environment Setup
1. Check if Docker services are running
2. Start services if not running (using docker-compose.e2e.yml)
3. Wait for services to be ready
4. Verify database connectivity
5. Check service health endpoints

### Phase 3: Test Execution
1. Set environment variables (WEB_BASE_URL, API_BASE_URL)
2. Run production-ready test suite
3. Capture test results

### Phase 4: Test Reporting
1. Generate HTML test report
2. Display test summary
3. Show production readiness status
4. Provide cleanup instructions if services were started

## Interpreting Results

### Success Indicators

When all tests pass, you'll see:

```
╔═══════════════════════════════════════════════╗
║  ✓ All Production-Ready Tests PASSED         ║
╚═══════════════════════════════════════════════╝

✓ System is PRODUCTION READY

All critical validations passed:
  ✓ Security measures in place
  ✓ Performance meets baselines
  ✓ Database integrity verified
  ✓ API contracts validated
  ✓ Authentication & authorization working
  ✓ Data validation enforced
```

**This means your system is ready for production deployment.**

### Failure Indicators

If any tests fail:

```
╔═══════════════════════════════════════════════╗
║  ✗ Some Production-Ready Tests FAILED        ║
╚═══════════════════════════════════════════════╝

✗ System is NOT READY for production

Please review failed tests and fix issues before deploying
Check the test report for detailed failure information
```

**DO NOT deploy to production until all issues are resolved.**

### Viewing Detailed Reports

After test execution, view the detailed HTML report:

```bash
npm run test:e2e:report
```

The report includes:
- Test execution timeline
- Detailed error messages
- Screenshots of failures
- Video recordings (if enabled)
- Stack traces for debugging

## Troubleshooting

### Common Issues and Solutions

#### Issue: Services not starting

**Symptom:**
```
✗ Backend API is not responding
Please check the logs: docker compose -f docker-compose.e2e.yml logs api
```

**Solution:**
```bash
# Check Docker logs
docker compose -f docker-compose.e2e.yml logs

# Restart services
docker compose -f docker-compose.e2e.yml down
docker compose -f docker-compose.e2e.yml up -d

# Wait for services to be fully ready
sleep 30
```

#### Issue: Database connection failures

**Symptom:**
```
Database query failed
```

**Solution:**
```bash
# Check if PostgreSQL container is running
docker ps | grep postgres

# Check PostgreSQL logs
docker compose -f docker-compose.e2e.yml logs postgres

# Verify database is ready
docker exec selly-base-postgres-e2e pg_isready -U postgres

# Restart database if needed
docker compose -f docker-compose.e2e.yml restart postgres
```

#### Issue: Authentication failures

**Symptom:**
```
AUTH-001: Protected routes test failed
```

**Solution:**
1. Verify test user exists in database
2. Check JWT_SECRET is properly configured
3. Verify token generation in login flow
4. Check API authentication middleware

#### Issue: Performance test failures

**Symptom:**
```
PERF-001: Response time exceeded 500ms
```

**Solution:**
1. Check system resources (CPU, memory)
2. Verify database has proper indexes
3. Check for slow queries in logs
4. Consider database optimization
5. Run tests on production-like environment

#### Issue: Docker not found

**Symptom:**
```
✗ Docker is not installed
```

**Solution:**
Install Docker from: https://docs.docker.com/get-docker/

#### Issue: Port conflicts

**Symptom:**
```
Error: Port 3000 is already in use
```

**Solution:**
```bash
# Stop conflicting services
docker compose down

# Or use different ports
export WEB_BASE_URL=http://localhost:3002
export API_BASE_URL=http://localhost:3003
```

## Best Practices

### When to Run These Tests

1. **Before every production deployment**
   - Always run the full suite before deploying to production
   - Treat failures as deployment blockers

2. **After infrastructure changes**
   - Database schema changes
   - Authentication system updates
   - API contract modifications
   - Security policy updates

3. **During CI/CD pipeline**
   - Include as part of deployment pipeline
   - Run on staging environment before production

4. **Periodic health checks**
   - Weekly validation of production environment
   - Monthly comprehensive system audits

### Maintaining Test Quality

1. **Keep tests up to date**
   - Update tests when requirements change
   - Add new tests for new features
   - Remove obsolete tests

2. **Monitor performance baselines**
   - Adjust thresholds as system evolves
   - Track performance trends over time
   - Update baselines based on production metrics

3. **Review test failures**
   - Investigate all test failures
   - Don't ignore intermittent failures
   - Document known issues

4. **Extend test coverage**
   - Add tests for discovered bugs
   - Cover edge cases
   - Test new security vulnerabilities

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Production Ready Tests

on:
  pull_request:
    branches: [main, production]
  push:
    branches: [main]

jobs:
  production-ready:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Run production-ready tests
        run: npm run test:production-ready
      
      - name: Upload test report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: production-ready-report
          path: playwright-report-e2e/
```

### Jenkins Pipeline Example

```groovy
pipeline {
    agent any
    
    stages {
        stage('Production Ready Tests') {
            steps {
                sh 'npm install'
                sh 'npm run test:production-ready'
            }
        }
    }
    
    post {
        always {
            publishHTML([
                reportDir: 'playwright-report-e2e',
                reportFiles: 'index.html',
                reportName: 'Production Ready Test Report'
            ])
        }
    }
}
```

## Exit Codes

The test script returns the following exit codes:

- `0`: All tests passed - System is production ready
- `1`: Some tests failed - System is NOT production ready

Use these exit codes in your CI/CD pipeline to block deployments when tests fail.

## Related Documentation

- [Test Quick Start](./TEST_QUICK_START.md) - Getting started with testing
- [E2E Quick Start](./E2E_QUICK_START.md) - E2E testing guide
- [Docker Setup](./DOCKER_SETUP.md) - Docker environment setup
- [Test Suite Complete](./TEST_SUITE_COMPLETE.md) - Complete test documentation

## Support and Feedback

For issues, questions, or feedback regarding the production-ready test suite:

1. Check this documentation for troubleshooting steps
2. Review test logs and reports for detailed error information
3. Check Docker logs for infrastructure issues
4. Open an issue in the repository with test failure details

## Version History

- **v1.0.0** (2025-12-09): Initial release with 21 tests across 6 categories
  - Security validation tests
  - Performance baseline tests
  - Database integrity tests
  - API contract validation tests
  - Authentication & authorization tests
  - Data consistency & validation tests
