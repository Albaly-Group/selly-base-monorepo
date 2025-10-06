# E2E Role-Based Testing Guide

## Overview

This guide documents the multi-role testing approach for E2E tests, ensuring all user roles defined in the seed SQL are properly tested.

## Test User Credentials

All test users use the password: `password123`

### Platform Roles

| Email | Role | Description | Permissions |
|-------|------|-------------|-------------|
| `platform@albaly.com` | Platform Admin | Full system access | `*` (all) |
| `support@albaly.com` | Platform Staff | Limited platform access | Read-only platform operations |

### Customer/Organization Roles

| Email | Role | Description | Organization | Permissions |
|-------|------|-------------|--------------|-------------|
| `admin@albaly.com` | Customer Admin | Full org access | Albaly Digital | Full organization management |
| `staff@albaly.com` | Customer Staff | Limited org access | Albaly Digital | Projects, lists, company read |
| `user@albaly.com` | Customer User | Basic user access | Albaly Digital | Create/read own lists, read companies |

### Legacy Roles (For Backward Compatibility)

| Email | Role | Organization |
|-------|------|--------------|
| `admin@democustomer.com` | Customer Admin | Demo Customer |
| `staff@democustomer.com` | Customer Staff | Demo Customer |
| `admin@sampleenterprise.com` | Legacy Admin | Sample Enterprise |
| `staff@sampleenterprise.com` | Legacy Staff | Sample Enterprise |

## Role-Based Test Coverage

### Authentication Tests

The auth-flow E2E tests now include login tests for all primary roles:

1. **Platform Admin Login** - Tests full system access
   ```typescript
   email: 'platform@albaly.com'
   password: 'password123'
   Expected: Dashboard access with full permissions
   ```

2. **Platform Staff Login** - Tests limited platform access
   ```typescript
   email: 'support@albaly.com'
   password: 'password123'
   Expected: Dashboard access with read-only permissions
   ```

3. **Customer Admin Login** - Tests full organization access
   ```typescript
   email: 'admin@albaly.com'
   password: 'password123'
   Expected: Dashboard with full organization management
   ```

4. **Customer Staff Login** - Tests limited organization access
   ```typescript
   email: 'staff@albaly.com'
   password: 'password123'
   Expected: Dashboard with projects/lists access
   ```

5. **Customer User Login** - Tests basic user access
   ```typescript
   email: 'user@albaly.com'
   password: 'password123'
   Expected: Dashboard with basic read access
   ```

## Test Structure

### Current Implementation

```typescript
// e2e/auth-flow.e2e.spec.ts
test.describe('Authentication E2E Flow', () => {
  test('should successfully login as Platform Admin and show welcome state', ...)
  test('should successfully login as Platform Staff with limited access', ...)
  test('should successfully login as Customer Admin with org access', ...)
  test('should successfully login as Customer Staff', ...)
  test('should successfully login as Customer User with basic access', ...)
  // ... other auth tests
});
```

### All Tests Updated

All E2E tests that require authentication now use the correct seed SQL credentials:

- `e2e/auth-flow.e2e.spec.ts` - ✅ Updated with multi-role tests
- `e2e/company-management.e2e.spec.ts` - ✅ Updated to use `admin@albaly.com`

## Permission Testing

Each role has specific permissions that should be tested:

### Platform Admin (`platform@albaly.com`)
- ✅ Full system access
- ✅ Can manage all organizations
- ✅ Can manage all users
- ✅ Can access platform administration

### Platform Staff (`support@albaly.com`)
- ✅ Read-only platform access
- ✅ Can view organizations
- ✅ Can view users
- ❌ Cannot modify system settings

### Customer Admin (`admin@albaly.com`)
- ✅ Full organization access
- ✅ Can manage users in their org
- ✅ Can manage lists and projects
- ✅ Can view and manage companies
- ❌ Cannot access other organizations

### Customer Staff (`staff@albaly.com`)
- ✅ Can manage projects
- ✅ Can manage lists
- ✅ Can read companies
- ❌ Cannot manage users
- ❌ Cannot modify organization settings

### Customer User (`user@albaly.com`)
- ✅ Can create lists
- ✅ Can read own lists
- ✅ Can read companies
- ❌ Cannot manage projects
- ❌ Cannot manage other users' lists

## Running Role-Based Tests

### Run All Authentication Tests
```bash
npx playwright test e2e/auth-flow.e2e.spec.ts
```

### Run Specific Role Test
```bash
npx playwright test e2e/auth-flow.e2e.spec.ts -g "Platform Admin"
```

### Run with Docker
```bash
npm run test:e2e:docker
```

This ensures all roles are tested against the actual database with proper role assignments.

## Test Results

When running the tests, you should see:

```
✓ should display login page for unauthenticated users
✓ should show clear validation errors for empty form submission
✓ should show helpful error message for invalid credentials
✓ should successfully login as Platform Admin and show welcome state
✓ should successfully login as Platform Staff with limited access
✓ should successfully login as Customer Admin with org access
✓ should successfully login as Customer Staff
✓ should successfully login as Customer User with basic access
✓ should maintain login session across page refreshes
✓ should allow user to logout and return to login screen
✓ should protect sensitive pages from unauthenticated access
✓ should handle slow network gracefully during login
```

## Adding New Role Tests

When adding new roles to the system:

1. Add the role to `selly-base-optimized-schema.sql`
2. Create a test user with that role
3. Add a login test for the role in `auth-flow.e2e.spec.ts`
4. Document the role permissions here
5. Add permission-specific tests as needed

### Example Template

```typescript
test('should successfully login as [Role Name]', async ({ page }) => {
  // UX Test: [Role Name] should have [permission description]
  await page.goto('/login');
  
  const emailInput = page.getByLabel(/email/i);
  const passwordInput = page.getByLabel(/password/i);
  const submitButton = page.getByRole('button', { name: /sign in|login/i });
  
  // Login as [Role Name] (from seed SQL)
  await emailInput.fill('[email]');
  await passwordInput.fill('password123');
  
  await submitButton.click();
  
  // Should redirect to dashboard
  await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  
  // Verify successful login
  const mainContent = page.getByRole('main');
  await expect(mainContent).toBeVisible({ timeout: 5000 });
  
  // Add role-specific assertions here
});
```

## Database Seed File

The test users are defined in `selly-base-optimized-schema.sql`:

```sql
-- All test users have password: password123
-- Password hash generated using argon2id

INSERT INTO users (id, organization_id, email, name, password_hash, status, email_verified_at) VALUES
('550e8400-e29b-41d4-a716-446655440001', NULL, 'platform@albaly.com', 'Platform Admin', '$argon2id$...', 'active', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440002', NULL, 'support@albaly.com', 'Platform Staff', '$argon2id$...', 'active', CURRENT_TIMESTAMP),
('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'admin@albaly.com', 'Albaly Admin', '$argon2id$...', 'active', CURRENT_TIMESTAMP),
-- ... more users
```

## Troubleshooting

### Test Fails with "Invalid Credentials"

- Verify the database is seeded with the correct SQL file
- Check that password is `password123` (not `Admin@123` or other)
- Ensure user exists in the database
- Check that user status is 'active'

### Test Fails with "Insufficient Permissions"

- Verify the user has the correct role assigned in `user_roles` table
- Check role permissions in `roles` table
- Ensure organization_id is correct for customer roles

### User Not Found

- Run database setup: `npm run test:e2e:setup`
- Verify SQL seed file has the user
- Check database connection

## Best Practices

1. **Use Seed SQL Credentials** - Always use credentials from the seed SQL file
2. **Test All Roles** - Ensure each role has at least one login test
3. **Verify Permissions** - Test that each role can/cannot access specific features
4. **Document Changes** - Update this file when adding new roles
5. **Keep Consistent** - Use the same password (`password123`) for all test users

## References

- Seed SQL: `selly-base-optimized-schema.sql`
- Auth Tests: `e2e/auth-flow.e2e.spec.ts`
- Role Definitions: See SQL file for complete role list and permissions
- Docker Setup: `E2E_DOCKER_GUIDE.md`

---

**Last Updated**: 2024  
**Status**: ✅ Active  
**Test Coverage**: 5 primary roles tested
