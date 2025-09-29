# Deployment Guide

## Deployment Options

### Option 1: Optimized Separate Vercel Deployments (Recommended)

Deploy frontend and backend as separate Vercel projects with optimized build commands.

**Quick Start:**
```bash
# 1. Push your code to GitHub
git push origin main

# 2. Create two Vercel projects:
# - Frontend project: Import repository, set root to `apps/web`
# - Backend project: Import repository, set root to `apps/api`
```

**Complete Guide:** See [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) for detailed instructions.

**Benefits:**
- **Optimized Builds**: Each deployment builds only necessary packages using Turbo filters
- **Faster Deployment**: Web builds only web+types, API builds only api+types
- Independent scaling and deployment cycles
- Optimized build configurations per application
- Team independence (frontend/backend teams)
- Environment isolation

### Option 2: Traditional Server Deployment

Deploy backend to traditional hosting platforms (Railway, Heroku, etc.).

**Frontend:** Deploy frontend using Option 1 approach to Vercel
**Backend:** See [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md)

## Build Process Overview

When using the optimized separate deployments (Option 1):

**Frontend Build (`apps/web`)**:
1. **Install**: `npm install` - Installs all dependencies across the monorepo
2. **Build**: `npx turbo build --filter=web` - Builds only web app and dependencies (types)

**Backend Build (`apps/api`)**:  
1. **Install**: `npm install` - Installs all dependencies across the monorepo
2. **Build**: `npx turbo build --filter=api` - Builds only API and dependencies (types)

## Important Notes

- **Optimized Builds**: Each deployment builds only necessary packages using Turbo filters
- **Dependency Management**: Turbo automatically builds required dependencies (shared types)
- **Faster Deployments**: Avoids building unnecessary packages
- Build artifacts (`.next/`, `dist/`) are excluded from Git
- All dependencies are managed at the workspace root level

## Environment Variables

Configure these in each Vercel project's dashboard:

**Frontend Project (`apps/web`)**:
```bash
# Point to your API deployment
NEXT_PUBLIC_API_URL=https://your-api-project.vercel.app

# Or leave empty to use mock data
```

**Backend Project (`apps/api`)**:
```bash
# JWT Configuration (required)
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=1d

# Database options:
# Option 1: Skip database (demo/development)
SKIP_DATABASE=true

# Option 2: Use DATABASE_URL (recommended for production)
# DATABASE_URL=postgresql://user:password@host:5432/dbname

# Option 3: Use individual variables (alternative)
# DATABASE_HOST=your-db-host
# DATABASE_PORT=5432
# DATABASE_USERNAME=your-username
# DATABASE_PASSWORD=your-password
# DATABASE_NAME=your-database
```

## Troubleshooting

### Common Issues

**Frontend-Backend Connection**:
- Ensure `NEXT_PUBLIC_API_URL` points to your deployed API project
- Use production URLs (not localhost) in environment variables
- API project must be deployed separately as a second Vercel project

**Build Failures**:
- Verify all dependencies install correctly from repository root
- Check that Turbo filters work: `npx turbo build --filter=web` and `npx turbo build --filter=api`
- Ensure no build artifacts are committed to Git

**Missing Dependencies**:
- All node_modules are installed at repository root level
- Subdirectory builds use root dependencies via workspace configuration