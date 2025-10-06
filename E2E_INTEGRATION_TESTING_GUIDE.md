# End-to-End Integration Testing Guide

## Overview

This guide explains how to perform complete end-to-end (E2E) integration testing of the platform admin module, testing the full stack from frontend to database.

**Complete Flow:**
```
User Browser
    ↓ (HTTP)
Next.js Frontend (localhost:3000)
    ↓ (API Call)
NestJS Backend (localhost:3001)
    ↓ (TypeORM)
PostgreSQL Database (Docker)
    ↓ (SQL Results)
Backend → Frontend → User
```

---

## Prerequisites

### Required Software
- Node.js 18+ and npm
- Docker and Docker Compose
- curl (for API testing)
- Git

### Repository Setup
```bash
git clone <repository-url>
cd selly-base-frontend
```

---

## Quick Start - Automated E2E Test

### Option 1: Full Automated Test (Recommended)

Run the complete automated E2E test script:

```bash
chmod +x test-full-e2e-integration.sh
./test-full-e2e-integration.sh
```

This script will:
1. ✅ Start PostgreSQL database in Docker
2. ✅ Install all dependencies (root, API, web)
3. ✅ Start NestJS backend API on port 3001
4. ✅ Build Next.js frontend
5. ✅ Start Next.js frontend on port 3000
6. ✅ Test complete HTTP flow with actual requests
7. ✅ Verify database queries are executed
8. ✅ Generate comprehensive test report

**Expected Duration:** 5-10 minutes (first run with npm install)

**Output:**
```
====================================
Platform Admin - Complete End-to-End Integration Test
====================================

✓ Database is ready
✓ Dependencies installed
✓ Backend API started successfully
✓ Backend endpoints responding
✓ Frontend built successfully
✓ Frontend started successfully
✓ Complete E2E flow verified

====================================
✅ ALL E2E TESTS PASSED
====================================
```

---

## Manual Step-by-Step Testing

For more control and debugging, follow these manual steps:

### Step 1: Start Database

```bash
# Start PostgreSQL in Docker
docker compose up -d postgres

# Verify database is healthy
docker compose ps postgres

# Should show: Status: healthy
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install API dependencies
cd apps/api
npm install
cd ../..

# Install web dependencies
cd apps/web
npm install
cd ../..
```

### Step 3: Start Backend API

```bash
cd apps/api

# Set environment variables
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/selly_base"
export JWT_SECRET="your-secret-key"
export PORT=3001

# Start in development mode
npm run start:dev

# Backend should start on http://localhost:3001
```

**Verify Backend Started:**
```bash
# In another terminal
curl http://localhost:3001/health
# Should return: {"status":"ok"}
```

### Step 4: Build Frontend

```bash
cd apps/web

# Set environment variables
export NEXT_PUBLIC_API_URL="http://localhost:3001"

# Build the frontend
npm run build

cd ../..
```

### Step 5: Start Frontend

```bash
cd apps/web

export NEXT_PUBLIC_API_URL="http://localhost:3001"
export PORT=3000

# Start the frontend
npm run start

# Frontend should start on http://localhost:3000
```

**Verify Frontend Started:**
```bash
# In another terminal
curl http://localhost:3000
# Should return HTML content
```

### Step 6: Test Platform Admin Endpoints

#### Option A: Using Browser

1. Open browser to http://localhost:3000/platform-admin
2. Login with platform admin credentials
3. Verify data loads from backend
4. Check browser DevTools Network tab for API calls

#### Option B: Using API Test Script

```bash
chmod +x test-api-endpoints.sh
./test-api-endpoints.sh
```

#### Option C: Using curl

```bash
# Test tenants endpoint
curl http://localhost:3001/api/v1/platform-admin/tenants

# Test users endpoint
curl http://localhost:3001/api/v1/platform-admin/users

# Test shared companies endpoint
curl http://localhost:3001/api/v1/platform-admin/shared-companies

# Test with pagination
curl "http://localhost:3001/api/v1/platform-admin/tenants?page=1&limit=10"
```

**With Authentication:**
```bash
# Get JWT token (login first)
TOKEN="your-jwt-token-here"

# Test with authentication
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/platform-admin/tenants
```

---

## Verification Checklist

### ✅ Database Layer
- [ ] PostgreSQL container running and healthy
- [ ] Database has organizations table with 3 records
- [ ] Database has users table with 11 records
- [ ] Database has companies table with 2 shared records
- [ ] Database has roles and permissions configured

**Verify:**
```bash
docker exec selly-base-postgres psql -U postgres -d selly_base -c "SELECT COUNT(*) FROM organizations;"
docker exec selly-base-postgres psql -U postgres -d selly_base -c "SELECT COUNT(*) FROM users;"
docker exec selly-base-postgres psql -U postgres -d selly_base -c "SELECT COUNT(*) FROM companies WHERE is_shared_data = true;"
```

### ✅ Backend Layer
- [ ] NestJS server running on port 3001
- [ ] Platform admin module loaded
- [ ] JWT authentication configured
- [ ] TypeORM connected to database
- [ ] All three endpoints responding

**Verify:**
```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/v1/platform-admin/tenants
curl http://localhost:3001/api/v1/platform-admin/users
curl http://localhost:3001/api/v1/platform-admin/shared-companies
```

### ✅ Frontend Layer
- [ ] Next.js server running on port 3000
- [ ] Frontend built successfully
- [ ] Environment variables set correctly
- [ ] API client configured to call localhost:3001
- [ ] Platform admin page accessible

**Verify:**
```bash
curl http://localhost:3000
curl http://localhost:3000/platform-admin
```

### ✅ Integration Layer
- [ ] Frontend makes HTTP requests to backend
- [ ] Backend receives and processes requests
- [ ] Backend queries database successfully
- [ ] Data flows back to frontend
- [ ] UI displays data from database
- [ ] Loading states work correctly
- [ ] Error handling works correctly

---

## Testing Scenarios

### Scenario 1: Test Tenant Management

1. Navigate to http://localhost:3000/platform-admin
2. Go to "Tenant Organizations" tab
3. Verify list shows 3 organizations
4. Check each organization shows:
   - Name and slug
   - Status (active)
   - Subscription tier
   - User count
   - Data count
   - Last activity

**Expected Result:** Data matches database records

### Scenario 2: Test Platform Users

1. Navigate to "Platform Users" tab
2. Verify list shows 11 users
3. Check users show:
   - Name and email
   - Role (platform_admin, customer_admin, etc.)
   - Organization (if applicable)
   - Status
   - Last login

**Expected Result:** All users displayed with correct roles

### Scenario 3: Test Shared Companies

1. Navigate to "Shared Data" tab
2. Verify list shows 2 shared companies
3. Check companies show:
   - Company name
   - Province
   - Verification status
   - Data completeness

**Expected Result:** Shared companies from database displayed

### Scenario 4: Test Pagination

1. Go to any tab
2. Check pagination controls at bottom
3. Change page size (10, 25, 50)
4. Navigate between pages
5. Verify correct data loads

**Expected Result:** Pagination works correctly

### Scenario 5: Test Error Handling

1. Stop the backend server
2. Reload platform admin page
3. Verify error message displays
4. Restart backend
5. Reload page
6. Verify data loads again

**Expected Result:** Graceful error handling

---

## Troubleshooting

### Database Won't Start

```bash
# Check Docker status
docker compose ps

# View logs
docker compose logs postgres

# Restart database
docker compose down
docker compose up -d postgres
```

### Backend Won't Start

```bash
# Check if port 3001 is in use
lsof -i :3001

# Check backend logs
cd apps/api
cat ../../backend.log

# Try starting with verbose logging
npm run start:dev -- --verbose
```

### Frontend Won't Start

```bash
# Check if port 3000 is in use
lsof -i :3000

# Check frontend logs
cd apps/web
cat ../../frontend.log

# Clear build cache and rebuild
rm -rf .next
npm run build
npm run start
```

### API Calls Failing

**Check Environment Variables:**
```bash
# In frontend terminal
echo $NEXT_PUBLIC_API_URL
# Should be: http://localhost:3001

# Restart frontend if incorrect
```

**Check CORS:**
```bash
# Backend should allow localhost:3000
# Check apps/api/src/main.ts for CORS config
```

**Check Authentication:**
```bash
# Verify JWT token is being sent
# Check browser DevTools Network tab
# Look for Authorization header
```

### Database Connection Issues

```bash
# Test database connection
docker exec selly-base-postgres psql -U postgres -d selly_base -c "SELECT 1;"

# Check DATABASE_URL in backend
cd apps/api
cat .env
# Should have: DATABASE_URL=postgresql://postgres:postgres@localhost:5432/selly_base
```

---

## Performance Testing

### Load Testing with Apache Bench

```bash
# Test tenants endpoint
ab -n 100 -c 10 http://localhost:3001/api/v1/platform-admin/tenants

# Test with authentication
ab -n 100 -c 10 -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/v1/platform-admin/tenants
```

### Monitoring Database Queries

```bash
# Enable query logging in PostgreSQL
docker exec selly-base-postgres psql -U postgres -d selly_base -c \
  "ALTER DATABASE selly_base SET log_statement = 'all';"

# View query logs
docker compose logs -f postgres | grep SELECT
```

---

## Test Reports

### Automated Test Report

After running `./test-full-e2e-integration.sh`, check:
- Console output for test results
- `backend.log` for backend logs
- `frontend.log` for frontend logs

### Manual Test Report Template

```markdown
# Platform Admin E2E Test Report

**Date:** YYYY-MM-DD
**Tester:** Your Name
**Environment:** Development

## Test Results

| Test Case | Status | Notes |
|-----------|--------|-------|
| Database Started | ✅ | Healthy in 5s |
| Backend Started | ✅ | Port 3001 |
| Frontend Started | ✅ | Port 3000 |
| Tenant List Loads | ✅ | 3 records |
| User List Loads | ✅ | 11 records |
| Company List Loads | ✅ | 2 records |
| Pagination Works | ✅ | All pages load |
| Error Handling | ✅ | Graceful |

## Issues Found

None

## Recommendations

Ready for production deployment
```

---

## Continuous Integration

### GitHub Actions Workflow

```yaml
name: E2E Integration Tests

on: [push, pull_request]

jobs:
  e2e-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: selly_base
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          npm install
          cd apps/api && npm install
          cd ../web && npm install
      
      - name: Run E2E tests
        run: ./test-full-e2e-integration.sh
```

---

## Summary

### What Gets Tested

1. **Infrastructure**
   - Docker container orchestration
   - PostgreSQL database health
   - Network connectivity

2. **Backend**
   - NestJS server startup
   - Module registration
   - Database connection
   - TypeORM queries
   - API endpoint responses
   - Authentication/authorization
   - Error handling

3. **Frontend**
   - Next.js build
   - Server startup
   - API client configuration
   - Component rendering
   - Data fetching with useEffect
   - Loading states
   - Error states

4. **Integration**
   - Frontend → Backend HTTP communication
   - Backend → Database queries
   - Complete data flow
   - End-to-end user experience

### Production Readiness

After all E2E tests pass, the platform admin module is:
- ✅ Fully integrated
- ✅ Database tested
- ✅ API tested
- ✅ Frontend tested
- ✅ Ready for deployment

---

**Last Updated:** January 2025
**Test Script Version:** 1.0
**Documentation Version:** 1.0
