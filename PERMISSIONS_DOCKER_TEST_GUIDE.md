# Permissions System Docker Testing Guide

## Overview

This guide explains how the RBAC (Role-Based Access Control) permissions system works with a real PostgreSQL database in Docker, and how to test it.

## What Was Fixed

### Problem
The permissions system was not working correctly because:
1. **Invalid Password Hashes**: The database schema file contained fake/corrupted argon2 password hashes
2. **No Integration Tests**: There was no way to verify the complete permission flow from database to frontend

### Solution
1. **Updated Database Schema**: All user password hashes replaced with valid argon2id hashes
2. **Created Test Script**: Comprehensive Docker integration test (`test-permissions-docker.sh`)
3. **Verified End-to-End**: Tested complete flow: Database → API → Frontend

## Architecture

### Permission Flow

```
┌─────────────────┐
│   PostgreSQL    │
│                 │
│  permissions:   │
│  TEXT[] array   │
│  ['org:*',      │
│   'users:*']    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   NestJS API    │
│                 │
│  Transforms to  │
│  Permission[]   │
│  objects        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  React/Next.js  │
│                 │
│  hasPermission()│
│  function with  │
│  wildcard match │
└─────────────────┘
```

### Database Schema

Roles table stores permissions as TEXT[] array:
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  permissions TEXT[] DEFAULT '{}',
  ...
);
```

Example data:
```sql
INSERT INTO roles (name, permissions) VALUES
('customer_admin', ARRAY['org:*', 'users:*', 'lists:*', 'projects:*']),
('platform_admin', ARRAY['*']),
('customer_staff', ARRAY['projects:*', 'lists:*', 'companies:read']);
```

### API Transformation

The `auth.service.ts` transforms TEXT[] to Permission[] objects:

```typescript
const roles = user.userRoles2?.map((userRole: any) => ({
  id: userRole.role.id,
  name: userRole.role.name,
  description: userRole.role.description,
  permissions: (userRole.role.permissions || []).map((permissionKey: string, index: number) => ({
    id: `${userRole.role.id}-perm-${index}`,
    key: permissionKey,
    description: `Permission: ${permissionKey}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })),
}));
```

### Frontend Permission Checking

The `hasPermission()` function in `apps/web/lib/auth.tsx`:

```typescript
export function hasPermission(user: User, permissionKey: string): boolean {
  if (!user.roles) return false
  
  for (const role of user.roles) {
    if (!role.permissions) continue
    
    for (const permission of role.permissions) {
      // Admin wildcard permission
      if (permission.key === '*') return true
      
      // Exact match
      if (permission.key === permissionKey) return true
      
      // Pattern matching (e.g., 'tenants:*' matches 'tenants:read')
      if (permission.key.endsWith(':*')) {
        const prefix = permission.key.slice(0, -1)
        if (permissionKey.startsWith(prefix)) return true
      }
    }
  }
  
  return false
}
```

## Test Users

All test users have the password: `password123`

| Email | Role | Permissions | Organization |
|-------|------|-------------|--------------|
| platform@albaly.com | platform_admin | `*` (all) | None (platform-wide) |
| support@albaly.com | platform_staff | `platform:read`, `organizations:read`, `users:read` | None |
| admin@albaly.com | customer_admin | `org:*`, `users:*`, `lists:*`, `projects:*` | Albaly Digital |
| staff@albaly.com | customer_staff | `projects:*`, `lists:*`, `companies:read` | Albaly Digital |
| user@albaly.com | customer_user | `lists:create`, `lists:read:own`, `companies:read`, `contacts:read` | Albaly Digital |
| admin@democustomer.com | customer_admin | `org:*`, `users:*`, `lists:*`, `projects:*` | Demo Customer Corp |
| admin@sampleenterprise.com | admin (legacy) | `org:*`, `users:*`, `lists:*`, `projects:*` | Sample Enterprise |

## Running Tests

### Prerequisites

1. Docker and Docker Compose installed
2. Node.js 18+ installed
3. jq installed (for JSON parsing in bash)

### Step 1: Start PostgreSQL Database

```bash
# Start PostgreSQL with schema initialization
docker compose up -d postgres

# Verify it's running
docker compose ps postgres

# Check database connection
docker compose exec postgres pg_isready -U postgres -d selly_base
```

### Step 2: Start API Server

```bash
# Copy environment configuration
cp .env.docker apps/api/.env

# Install dependencies (if not already done)
npm install

# Start API in development mode
cd apps/api && npm run start:dev
```

Wait for the API to start. You should see:
```
🚀 NestJS API is running on http://localhost:3001
✅ Database connection is healthy and schema is initialized
```

### Step 3: Run Permission Tests

```bash
# Make script executable (if not already)
chmod +x test-permissions-docker.sh

# Run the test
./test-permissions-docker.sh
```

### Expected Output

```
=====================================
RBAC Permissions System - Docker Integration Test
=====================================

✓ PostgreSQL container is running
✓ API is accessible at http://localhost:3001
✓ Database is connected

=====================================
Test 1: Platform Admin with wildcard (*) permission
=====================================

✓ Login successful for platform@albaly.com
✓ Role matches: platform_admin
✓ Permission '*' found

... (more tests) ...

=====================================
Test Summary
=====================================

Tests Passed: 36
Tests Failed: 0
Total Tests: 36

✓ All tests passed! The permissions system is working correctly.
```

## Permission Examples

### Wildcard Permissions

#### Global Admin (`*`)
```typescript
hasPermission(user, 'org:read')      // ✓ true
hasPermission(user, 'users:write')   // ✓ true
hasPermission(user, 'tenants:manage') // ✓ true
hasPermission(user, 'anything')      // ✓ true
```

#### Scoped Wildcard (`org:*`)
```typescript
hasPermission(user, 'org:read')      // ✓ true
hasPermission(user, 'org:write')     // ✓ true
hasPermission(user, 'org:delete')    // ✓ true
hasPermission(user, 'users:read')    // ✗ false
```

#### Exact Match (`lists:create`)
```typescript
hasPermission(user, 'lists:create')  // ✓ true
hasPermission(user, 'lists:read')    // ✗ false
hasPermission(user, 'lists:delete')  // ✗ false
```

## Manual Testing

### Test Login with curl

```bash
# Login as platform admin
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "platform@albaly.com", "password": "password123"}' | jq '.'

# Expected: JWT token + user object with roles and permissions
```

### Test Permission Transformation

```bash
# Login and extract permissions
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@albaly.com", "password": "password123"}' | jq '.user.roles[0].permissions'

# Expected: Array of permission objects with id, key, description
```

### Verify Database

```bash
# Check roles and permissions in database
docker compose exec postgres psql -U postgres -d selly_base -c \
  "SELECT name, permissions FROM roles ORDER BY name;"

# Check user-role assignments
docker compose exec postgres psql -U postgres -d selly_base -c \
  "SELECT u.email, r.name as role_name, r.permissions 
   FROM users u 
   JOIN user_roles ur ON u.id = ur.user_id 
   JOIN roles r ON ur.role_id = r.id 
   ORDER BY u.email;"
```

## Troubleshooting

### Issue: Login fails with "Invalid credentials"

**Cause**: Password hash mismatch

**Solution**:
```bash
# Generate new password hash
cd apps/api
npx ts-node -e "
const argon2 = require('argon2');
argon2.hash('password123').then(hash => console.log(hash));
"

# Update user in database
docker compose exec postgres psql -U postgres -d selly_base -c \
  "UPDATE users SET password_hash = '\$argon2id\$...' WHERE email = 'user@example.com';"
```

### Issue: Permissions not appearing in API response

**Cause**: User-role assignment missing

**Solution**:
```bash
# Check user-role assignments
docker compose exec postgres psql -U postgres -d selly_base -c \
  "SELECT * FROM user_roles WHERE user_id = (SELECT id FROM users WHERE email = 'user@example.com');"

# Add role assignment if missing
docker compose exec postgres psql -U postgres -d selly_base -c \
  "INSERT INTO user_roles (user_id, role_id, organization_id) 
   VALUES (
     (SELECT id FROM users WHERE email = 'user@example.com'),
     (SELECT id FROM roles WHERE name = 'customer_admin'),
     (SELECT organization_id FROM users WHERE email = 'user@example.com')
   );"
```

### Issue: Database not connected

**Cause**: API can't reach PostgreSQL

**Solution**:
```bash
# Check if PostgreSQL is running
docker compose ps postgres

# Restart PostgreSQL
docker compose restart postgres

# Check API environment variables
cat apps/api/.env | grep DATABASE
```

## Clean Up

```bash
# Stop API (Ctrl+C in terminal)

# Stop and remove containers
docker compose down

# Remove volumes (WARNING: deletes all data)
docker compose down -v
```

## Related Documentation

- [RBAC_PERMISSION_FIX.md](docs/RBAC_PERMISSION_FIX.md) - Original permission fix documentation
- [PERMISSION_BASED_ACCESS_MIGRATION.md](docs/PERMISSION_BASED_ACCESS_MIGRATION.md) - Full RBAC migration guide
- [TESTING_DOCKER_SETUP.md](TESTING_DOCKER_SETUP.md) - Docker setup walkthrough
- [DOCKER_E2E_TEST_RESULTS.md](DOCKER_E2E_TEST_RESULTS.md) - E2E test results

## Summary

✅ **Working**: Permissions system fully functional with Docker + PostgreSQL
✅ **Tested**: All user roles and permission patterns verified
✅ **Documented**: Complete guide for testing and troubleshooting
✅ **Ready**: Production-ready RBAC system

The permissions system is now properly tested and verified to work correctly in a full Docker environment with real database connections!
