# Running E2E Tests in Real Environment

## Overview

E2E tests now run against a real PostgreSQL database by default instead of mock data. This provides more realistic test conditions and better catches integration issues.

## Quick Start

```bash
# Run all E2E tests with real database (recommended)
npm run test:e2e

# Run E2E tests with mock data (faster, no database)
npm run test:e2e:mock

# Run E2E tests interactively
npm run test:e2e:ui

# View test report
npm run test:e2e:report
```

## How It Works

### Automatic Database Setup

When you run `npm run test:e2e`, the following happens automatically:

1. **Global Setup** (`e2e/setup/global-setup.js`):
   - Checks if Docker is running
   - Cleans up any existing test database containers
   - Starts PostgreSQL in Docker (port 5433)
   - Waits for database to be healthy
   - Database schema is automatically initialized

2. **Test Execution**:
   - Backend API starts with `SKIP_DATABASE=false`
   - Backend connects to real database at `postgresql://postgres:postgres@localhost:5433/selly_base_e2e`
   - Frontend starts and connects to backend
   - Tests run against the full stack

3. **Global Teardown** (`e2e/setup/global-teardown.js`):
   - Stops database container
   - In CI: removes volumes completely
   - Locally: keeps volumes for faster reruns

### Mock Data Mode

For faster development iteration when database integration isn't needed:

```bash
USE_MOCK_DATA=true npm run test:e2e
# or
npm run test:e2e:mock
```

This skips database setup and uses in-memory mock data.

## Requirements

- **Docker** and **Docker Compose** installed
- **Ports available**:
  - 5433 (PostgreSQL test database)
  - 3000 (Frontend)
  - 3001 (Backend API)

## Configuration

### Environment Variables

The following environment variables are automatically set for tests:

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/selly_base_e2e
SKIP_DATABASE=false
JWT_SECRET=test-secret-key-for-e2e
JWT_EXPIRES_IN=7d
```

### Database Container

- **Image**: `pgvector/pgvector:pg16`
- **Port**: 5433 (mapped from 5432 inside container)
- **Database**: `selly_base_e2e`
- **Username**: `postgres`
- **Password**: `postgres`

## Troubleshooting

### Database fails to start

If you see an error about the database not starting:

```bash
# Manually clean up and retry
npm run test:e2e:db-only:cleanup
npm run test:e2e
```

### Port conflicts

If port 5433 is already in use:

```bash
# Check what's using the port
lsof -i :5433

# Kill the process or change docker-compose.db-only.yml port mapping
```

### Tests hang or timeout

Check if services are running:

```bash
# Check database
docker ps | grep postgres-e2e

# Check database logs
npm run test:e2e:db-only:logs

# Check backend/frontend logs
curl http://localhost:3001/health
curl http://localhost:3000
```

## Manual Database Management

If you need to manually manage the test database:

```bash
# Start database only
npm run test:e2e:db-only:setup

# Connect to database
docker exec -it selly-base-postgres-e2e psql -U postgres -d selly_base_e2e

# View logs
npm run test:e2e:db-only:logs

# Stop and remove database
npm run test:e2e:db-only:cleanup
```

## CI/CD Integration

In CI environments, the setup automatically:
- Removes volumes after tests (clean state)
- Uses proper retries (configured in playwright.config.ts)
- Fails fast if Docker isn't available

Example GitHub Actions workflow:

```yaml
- name: Run E2E Tests
  run: npm run test:e2e
  env:
    CI: true
```

## Benefits of Real Environment Testing

1. **Realistic**: Tests actual database queries and transactions
2. **Catches Issues**: Finds SQL errors, constraint violations, etc.
3. **Data Integrity**: Validates referential integrity and triggers
4. **Performance**: Tests can measure actual query performance
5. **Confidence**: Higher confidence in production deployments

## Migration from Mock Data

Previous behavior:
```bash
npm run test:e2e  # Used mock data
```

New behavior:
```bash
npm run test:e2e       # Uses real database
npm run test:e2e:mock  # Uses mock data
```

If you prefer the old behavior for local development, you can always use `npm run test:e2e:mock`.
