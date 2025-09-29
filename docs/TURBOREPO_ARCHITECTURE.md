# Turborepo Monorepo Architecture Documentation

## Overview

This document describes the transformation of the Selly Base project from a single Next.js application with direct database connection to a turborepo monorepo structure with NestJS backend API.

## Architecture Changes

### Before: Monolithic Next.js App
```
selly-base/
├── app/              # Next.js pages
├── components/       # React components  
├── lib/
│   ├── database.ts   # Direct PostgreSQL connection
│   ├── types.ts      # Type definitions
│   └── services/     # Business logic mixed with UI
├── middleware.ts     # Route protection
└── package.json      # Single package
```

### After: Turborepo Monorepo
```
selly-base-monorepo/
├── apps/
│   ├── web/          # Next.js frontend (port 3000)
│   │   ├── app/      # Pages and layouts
│   │   ├── components/ # UI components
│   │   ├── lib/
│   │   │   ├── api-client.ts  # API communication
│   │   │   └── types.ts       # Re-exports shared types
│   │   └── package.json
│   └── api/          # NestJS backend (port 3001)
│       ├── src/
│       │   ├── database/      # Database entities
│       │   ├── modules/       # Feature modules
│       │   ├── config/        # Configuration
│       │   └── main.ts        # Application bootstrap
│       └── package.json
├── packages/
│   └── types/        # Shared TypeScript types
│       ├── src/
│       │   ├── index.ts       # Main exports
│       │   └── company.ts     # Business entities
│       └── package.json
├── turbo.json        # Turborepo task configuration
└── package.json      # Workspace root
```

## Key Components

### 1. Turborepo Configuration (`turbo.json`)

```json
{
  "$schema": "https://turbo.build/schema.json",
  "ui": "tui",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^lint"]
    }
  }
}
```

**Benefits:**
- Parallel task execution
- Dependency-based build orchestration
- Intelligent caching
- Task pipelines

### 2. Frontend Application (`apps/web`)

#### API Client (`lib/api-client.ts`)
Replaces direct database access with HTTP API calls:

```typescript
// Before: Direct database query
const companies = await DatabaseService.getInstance().query(
  'SELECT * FROM companies WHERE organization_id = ?', [orgId]
);

// After: API client call
const companies = await apiClient.getCompanies({ organizationId: orgId });
```

#### Type Integration
```typescript
// Uses shared types from packages/types
import type { Company, Organization, User } from '@selly/types';
```

### 3. Backend Application (`apps/api`)

#### NestJS Structure
- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and database operations  
- **Entities**: TypeORM database models
- **Modules**: Feature organization

#### Example Controller:
```typescript
@Controller('api/companies')
export class CompaniesController {
  @Get()
  async getCompanies(@Query() filters: SearchFilters) {
    return this.companiesService.searchCompanies(filters);
  }
}
```

### 4. Shared Types Package (`packages/types`)

Ensures type safety across applications:

```typescript
// Shared business entities
export interface Company {
  id: string;
  organization_id?: string | null;
  displayName: string;
  dataSource: 'albaly_list' | 'dbd_registry' | 'customer_input';
  isSharedData: boolean;
  // ... other fields
}

// API request/response types
export interface SearchResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

## Development Workflow

### 1. Installation
```bash
# Install all dependencies across the monorepo
npm install
```

### 2. Development
```bash
# Start all applications
npm run dev

# Or individually:
cd apps/api && npm run dev     # Backend on :3001
cd apps/web && npm run dev     # Frontend on :3000
cd packages/types && npm run dev  # Types in watch mode
```

### 3. Building
```bash
# Build all packages in correct order
npm run build

# Turbo handles dependency resolution:
# 1. packages/types builds first
# 2. apps/api builds (depends on types)  
# 3. apps/web builds (depends on types)
```

### 4. Testing Integration
Visit http://localhost:3000/api-test to verify:
- Frontend can reach backend API
- CORS is configured correctly
- Type safety is working
- API responses are formatted correctly

## Migration Benefits

### 1. Separation of Concerns
- **Frontend**: Focus on user interface and experience
- **Backend**: Focus on business logic and data management
- **Types**: Single source of truth for data structures

### 2. Development Experience  
- **Parallel Development**: Frontend and backend teams can work independently
- **Type Safety**: Shared types prevent API contract mismatches
- **Hot Reloading**: Both applications support hot reload in development
- **Better Debugging**: Clearer error boundaries between client and server

### 3. Scalability
- **Independent Deployment**: Deploy frontend and backend separately
- **Performance**: Optimize each application for its specific needs
- **Team Structure**: Allows for specialized frontend/backend teams
- **Technology Choices**: Can evolve backend technology without affecting frontend

### 4. Maintainability
- **Clear Boundaries**: Well-defined interfaces between applications
- **Code Organization**: Feature-based modules in backend
- **Dependency Management**: Turbo manages complex build dependencies
- **Testing**: Easier to unit test backend API endpoints

## Database Integration

### Current State
- Basic NestJS structure with TypeORM configured
- Sample endpoints for health check and companies
- CORS enabled for frontend communication

### Next Steps
- Complete TypeORM entity definitions
- Implement full CRUD operations for companies
- Add authentication middleware
- Migrate list management functionality
- Add comprehensive API documentation with Swagger

## Environment Configuration

### Backend (`apps/api/.env`)
```env
# Database (when implemented)
DATABASE_URL=postgresql://user:password@localhost:5432/selly_base

# Server
PORT=3001
NODE_ENV=development
```

### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## Deployment Considerations

### Development
- Run both applications locally during development
- Use turbo dev for coordinated startup

### Production Options
1. **Separate Deployments**: Deploy frontend and backend to different services
2. **Containerized**: Use Docker with separate containers
3. **Serverless**: Deploy API as serverless functions, frontend as static site

## Migration Status

### ✅ Infrastructure Complete
- [x] Turborepo monorepo setup
- [x] NestJS backend application structure  
- [x] Next.js frontend migration
- [x] Shared TypeScript types
- [x] API client implementation
- [x] CORS and development server setup
- [x] Basic API endpoints
- [x] Integration testing page

### 🚧 API Implementation In Progress  
- [ ] Complete database schema integration with TypeORM
- [ ] Full companies CRUD API implementation
- [ ] Authentication and authorization middleware
- [ ] List management API endpoints
- [ ] Import/export API functionality

### 📋 Frontend Migration Planned
- [ ] Update existing components to use API client
- [ ] Replace direct database calls with API calls
- [ ] Update authentication flow for API-based auth
- [ ] Error handling for API failures
- [ ] Loading states and offline handling

## Troubleshooting

### Common Issues
1. **Port Conflicts**: Ensure 3000 and 3001 are available
2. **CORS Errors**: Check backend CORS configuration
3. **Type Errors**: Rebuild shared types package
4. **Build Failures**: Check dependency order in turbo.json

### Debug Tips
- Check both application logs during development
- Use `/api-test` page to verify API connectivity  
- Verify environment variables are loaded correctly
- Ensure shared types are built before applications

This architecture provides a solid foundation for scaling the Selly Base platform while maintaining type safety and developer productivity.