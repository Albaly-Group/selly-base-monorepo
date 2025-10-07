# E2E Testing with DB in Docker Only

**Approach**: Run only PostgreSQL in Docker, with API and Web services running locally  
**Status**: ✅ Recommended Method  
**Date**: October 6, 2025

---

## Overview

This setup provides the best balance between isolation and development efficiency by:
- Running PostgreSQL in a Docker container (consistent, isolated database)
- Running API and Web locally (faster startup, easier debugging, live reload)

## Benefits

### ✅ Advantages Over Full Docker

1. **Faster Startup**: No need to build Docker images for API and Web
2. **Live Reload**: Code changes reflect immediately without rebuilding
3. **Easier Debugging**: Direct access to Node.js processes
4. **Less Resources**: Only one Docker container instead of three
5. **Better DX**: Full IDE debugging capabilities

### ✅ Advantages Over Fully Local

1. **Consistent Database**: Same PostgreSQL version across all environments
2. **Isolation**: Database changes don't affect your local system
3. **Clean State**: Easy to reset database with `docker compose down -v`
4. **No Installation**: No need to install PostgreSQL locally

---

## Quick Start

### Run Tests (Automated)

```bash
npm run test:e2e:docker:db-only
```

This single command will:
1. ✅ Start PostgreSQL in Docker
2. ✅ Wait for DB to be healthy
3. ✅ Start API locally (port 3001)
4. ✅ Start Web locally (port 3000)
5. ✅ Run all E2E tests
6. ✅ Generate HTML report
7. ✅ Clean up everything (DB, API, Web)

### Manual Control

If you prefer more control:

```bash
# 1. Start database
npm run test:e2e:db-only:setup

# 2. Start API (in separate terminal)
cd apps/api
export DATABASE_URL=postgresql://postgres:postgres@localhost:5433/selly_base_e2e
npm run start:dev

# 3. Start Web (in separate terminal)
cd apps/web
npm run dev

# 4. Run tests
npm run test:e2e

# 5. Cleanup
npm run test:e2e:db-only:cleanup
```

---

## Configuration

### Docker Compose File

**File**: `docker-compose.db-only.yml`

```yaml
services:
  postgres-e2e:
    image: pgvector/pgvector:pg16
    container_name: selly-base-postgres-e2e
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: selly_base_e2e
    ports:
      - "5433:5432"
    volumes:
      - ./selly-base-optimized-schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
      - postgres_e2e_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres -d selly_base_e2e"]
      interval: 5s
      timeout: 5s
      retries: 10
```

### Environment Variables

The automated script sets these automatically:

**API Environment**:
```bash
NODE_ENV=test
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/selly_base_e2e
JWT_SECRET=test-secret-key-for-e2e
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:3000
```

**Web Environment**:
```bash
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│      Playwright E2E Tests (Browser)              │
│          Running on Host Machine                 │
└────────────────┬────────────────────────────────┘
                 │ HTTP Requests
                 ↓
┌─────────────────────────────────────────────────┐
│      Frontend Web App (Local Process)            │
│           Next.js on port 3000                   │
│        - Live Reload Enabled                     │
│        - Full Debugging Support                  │
└────────────────┬────────────────────────────────┘
                 │ API Calls
                 ↓
┌─────────────────────────────────────────────────┐
│      Backend API (Local Process)                 │
│          NestJS on port 3001                     │
│        - Live Reload Enabled                     │
│        - Full Debugging Support                  │
└────────────────┬────────────────────────────────┘
                 │ Database Queries
                 ↓
┌─────────────────────────────────────────────────┐
│      PostgreSQL (Docker Container)               │
│         Port 5433 → 5432                         │
│        - pgvector Extension                      │
│        - Isolated Data                           │
│        - Auto Schema Loading                     │
└─────────────────────────────────────────────────┘
```

---

## NPM Scripts

### Main Commands

| Command | Description |
|---------|-------------|
| `npm run test:e2e:docker:db-only` | Run full E2E suite (automated) |
| `npm run test:e2e:db-only:setup` | Start database only |
| `npm run test:e2e:db-only:cleanup` | Stop database and remove volumes |
| `npm run test:e2e:db-only:logs` | View database logs |

### Comparison with Other Methods

| Command | Database | API | Web | Use Case |
|---------|----------|-----|-----|----------|
| `test:e2e:docker:db-only` | Docker | Local | Local | **Recommended** - Development |
| `test:e2e:docker` | Docker | Docker | Docker | Full isolation |
| `test:e2e` | (any) | (any) | (any) | Manual setup |

---

## Logs

The automated script creates detailed logs:

### Main Log
```
e2e-test-logs/e2e-run-[timestamp].log
```
Contains all output from the test run.

### Service Logs
```
e2e-test-logs/api.log    # Backend API output
e2e-test-logs/web.log    # Frontend Web output
```

### Database Logs
```bash
npm run test:e2e:db-only:logs
```

---

## Troubleshooting

### Database Issues

**Problem**: Database not starting
```bash
# Check if port 5433 is available
lsof -i :5433

# View database logs
docker compose -f docker-compose.db-only.yml logs postgres-e2e

# Rebuild database
docker compose -f docker-compose.db-only.yml down -v
docker compose -f docker-compose.db-only.yml up -d
```

### API Issues

**Problem**: API not connecting to database
```bash
# Verify database is accessible
docker exec selly-base-postgres-e2e pg_isready -U postgres -d selly_base_e2e

# Check API logs
cat e2e-test-logs/api.log

# Verify DATABASE_URL
echo $DATABASE_URL
# Should be: postgresql://postgres:postgres@localhost:5433/selly_base_e2e
```

### Web Issues

**Problem**: Web app not starting
```bash
# Check if port 3000 is available
lsof -i :3000

# Check Web logs
cat e2e-test-logs/web.log

# Verify NEXT_PUBLIC_API_URL
echo $NEXT_PUBLIC_API_URL
# Should be: http://localhost:3001
```

### Port Conflicts

If you have services already running:

```bash
# Check ports
lsof -i :3000  # Frontend
lsof -i :3001  # Backend
lsof -i :5433  # Database

# Kill if needed
kill -9 <PID>
```

---

## Development Workflow

### Typical Development Session

1. **Start database once**:
   ```bash
   npm run test:e2e:db-only:setup
   ```

2. **Develop with live reload**:
   ```bash
   # Terminal 1
   cd apps/api
   export DATABASE_URL=postgresql://postgres:postgres@localhost:5433/selly_base_e2e
   npm run start:dev
   
   # Terminal 2
   cd apps/web
   npm run dev
   ```

3. **Run tests as needed**:
   ```bash
   # Terminal 3
   npm run test:e2e
   ```

4. **Cleanup when done**:
   ```bash
   npm run test:e2e:db-only:cleanup
   ```

### Debugging Tests

1. **Use UI Mode**:
   ```bash
   npm run test:e2e:ui
   ```

2. **Run specific test**:
   ```bash
   npx playwright test e2e/auth-flow.e2e.spec.ts
   ```

3. **Debug mode**:
   ```bash
   npx playwright test --debug
   ```

---

## Performance Comparison

| Metric | Full Docker | DB Only | Improvement |
|--------|-------------|---------|-------------|
| Initial Setup | ~5-10 min | ~30 sec | **90%** faster |
| Test Run | ~2-5 min | ~2-5 min | Same |
| Code Change | Rebuild images | Instant | **Instant** |
| Debugging | Limited | Full | **Better** |
| Resources | High | Low | **50%** less |

---

## When to Use Each Method

### Use DB in Docker Only When:
- ✅ Developing locally
- ✅ Writing/debugging tests
- ✅ Need fast iteration
- ✅ Want live reload
- ✅ Debugging issues

### Use Full Docker When:
- ✅ CI/CD pipeline
- ✅ Complete isolation needed
- ✅ Testing Docker configuration
- ✅ Production-like environment
- ✅ No local Node.js

### Use Fully Local When:
- ✅ Already have PostgreSQL installed
- ✅ Need to test against specific DB version
- ✅ Working offline
- ✅ No Docker available

---

## Summary

The **DB in Docker only** approach provides the best development experience:

✅ **Fast**: No Docker image builds  
✅ **Flexible**: Easy debugging and development  
✅ **Consistent**: Same database for all developers  
✅ **Clean**: Easy reset and cleanup  
✅ **Efficient**: Lower resource usage

**Recommended for**: Daily development and testing  
**Command**: `npm run test:e2e:docker:db-only`

---

**Last Updated**: October 6, 2025  
**Maintained By**: Development Team  
**Related Docs**:
- [Testing Quick Reference](./TESTING_QUICK_REFERENCE.md)
- [E2E Test Execution Report](./E2E_TEST_EXECUTION_REPORT.md)
- [Code Quality Summary](./CODE_QUALITY_AND_TEST_SUMMARY.md)
