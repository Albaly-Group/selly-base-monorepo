# Permissions System Quick Reference

## Test Credentials

**Password for ALL test users:** `password123`

| Email | Role | Key Permissions |
|-------|------|-----------------|
| `platform@albaly.com` | Platform Admin | `*` (all access) |
| `admin@albaly.com` | Customer Admin | `org:*`, `users:*`, `lists:*`, `projects:*` |
| `staff@albaly.com` | Customer Staff | `projects:*`, `lists:*`, `companies:read` |
| `user@albaly.com` | Customer User | `lists:create`, `lists:read:own`, `companies:read` |

## Quick Commands

### Start Full Stack
```bash
# Terminal 1: Start database
docker compose up -d postgres

# Terminal 2: Start API
cd apps/api && npm run start:dev

# Terminal 3: Run tests
./test-permissions-docker.sh
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@albaly.com", "password": "password123"}' | jq '.'
```

### Check Database
```bash
# View all roles and permissions
docker compose exec postgres psql -U postgres -d selly_base -c \
  "SELECT name, permissions FROM roles;"

# View user-role assignments
docker compose exec postgres psql -U postgres -d selly_base -c \
  "SELECT u.email, r.name FROM users u 
   JOIN user_roles ur ON u.id = ur.user_id 
   JOIN roles r ON ur.role_id = r.id;"
```

## Permission Patterns

### Wildcard Examples

```typescript
// Global admin (*)
hasPermission(user, '*') → user can do ANYTHING

// Scoped wildcard (org:*)
hasPermission(user, 'org:*') → matches 'org:read', 'org:write', 'org:delete', etc.

// Exact match (lists:create)
hasPermission(user, 'lists:create') → only matches 'lists:create'
```

### Common Permission Checks

```typescript
// Organization management
hasPermission(user, 'org:read')
hasPermission(user, 'org:write')
hasPermission(user, 'org:delete')

// User management
hasPermission(user, 'users:read')
hasPermission(user, 'users:write')
hasPermission(user, 'users:manage')

// Data operations
hasPermission(user, 'lists:create')
hasPermission(user, 'lists:read')
hasPermission(user, 'companies:read')
hasPermission(user, 'projects:manage')
```

## Frontend Usage

```typescript
import { useAuth, hasPermission } from '@/lib/auth';

function MyComponent() {
  const { user } = useAuth();
  
  // Simple check
  if (hasPermission(user, 'org:write')) {
    return <EditButton />;
  }
  
  // In JSX
  return (
    <div>
      {hasPermission(user, 'users:manage') && <UserManagement />}
      {hasPermission(user, 'reports:view') && <ReportsDashboard />}
    </div>
  );
}
```

## Backend Usage (NestJS)

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('companies')
export class CompaniesController {
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    // req.user contains roles and permissions
    return this.companiesService.findAll(req.user);
  }
}
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Login fails | Check password is `password123` |
| No permissions | Check user has role assignment in `user_roles` table |
| Database error | Restart: `docker compose restart postgres` |
| API not connecting | Check `.env.docker` is copied to `apps/api/.env` |

## Common Tasks

### Add New Permission to Role
```sql
UPDATE roles 
SET permissions = permissions || ARRAY['new:permission']
WHERE name = 'customer_admin';
```

### Assign Role to User
```sql
INSERT INTO user_roles (user_id, role_id, organization_id)
VALUES (
  (SELECT id FROM users WHERE email = 'user@example.com'),
  (SELECT id FROM roles WHERE name = 'customer_admin'),
  (SELECT organization_id FROM users WHERE email = 'user@example.com')
);
```

### Generate Password Hash
```bash
cd apps/api
npx ts-node -e "
const argon2 = require('argon2');
argon2.hash('your_password').then(hash => console.log(hash));
"
```

## Documentation Links

- Full Guide: [PERMISSIONS_DOCKER_TEST_GUIDE.md](PERMISSIONS_DOCKER_TEST_GUIDE.md)
- Docker Setup: [TESTING_DOCKER_SETUP.md](TESTING_DOCKER_SETUP.md)
- RBAC Fix: [docs/RBAC_PERMISSION_FIX.md](docs/RBAC_PERMISSION_FIX.md)
- Migration: [docs/PERMISSION_BASED_ACCESS_MIGRATION.md](docs/PERMISSION_BASED_ACCESS_MIGRATION.md)

---

**Status:** ✅ Fully tested and working with Docker + PostgreSQL
