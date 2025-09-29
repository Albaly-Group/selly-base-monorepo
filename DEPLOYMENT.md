# Deployment Guide

## Deployment Options

### Option 1: Separate Vercel Deployments (Recommended)

Deploy frontend and backend as separate Vercel projects for maximum flexibility.

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
- Independent scaling and deployment cycles
- Optimized build configurations per application
- Team independence (frontend/backend teams)
- Environment isolation

### Option 2: Traditional Server Deployment

Deploy backend to traditional hosting platforms (Railway, Heroku, etc.).

**Frontend:** Follow Vercel deployment instructions below
**Backend:** See [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md)

---

## Vercel Frontend Deployment (Option 2)

This monorepo is configured for deployment on Vercel with the following setup:

### Project Configuration in Vercel Dashboard

When setting up the project in Vercel, use these settings:

- **Build Command**: `npm run build` (uses turbo to build all packages in correct order)
- **Output Directory**: `apps/web/.next` 
- **Install Command**: `npm install`
- **Root Directory**: Leave empty (deploy from repository root)

### vercel.json Configuration

The included `vercel.json` file configures:

```json
{
  "installCommand": "npm install",
  "buildCommand": "npm run build", 
  "devCommand": "npm run dev",
  "outputDirectory": "apps/web/.next"
}
```

### Build Process

The build process works as follows:

1. **Install**: `npm install` - Installs all dependencies across the monorepo
2. **Build Types**: `packages/types` builds first (TypeScript compilation)
3. **Build API**: `apps/api` builds (NestJS compilation)
4. **Build Web**: `apps/web` builds (Next.js compilation)

### Important Notes

- The monorepo uses Turbo for orchestrated builds
- Shared types in `packages/types` must build before other applications
- Build artifacts (`.next/`, `dist/`) are excluded from Git
- All dependencies are managed at the workspace root level

### Environment Variables

**CRITICAL**: Configure these environment variables in Vercel Dashboard for production:

#### Required for Production
```
NEXT_PUBLIC_API_URL=https://your-backend-api-url.com
```

**Important Notes:**
- Without `NEXT_PUBLIC_API_URL`, the frontend will operate in **fallback mode** using mock data only
- The backend API must be deployed separately (e.g., on Railway, Heroku, or another Vercel project)
- Do **NOT** use `localhost` URLs in production environment variables
- The API URL should be the full base URL including protocol (https://)

#### For Development
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NODE_ENV=development
```

### Troubleshooting

#### API Connection Issues in Production

**Problem**: Frontend calls `http://localhost:3001/api/auth/login` in Vercel deployment and fails.

**Solution**: 
1. Set `NEXT_PUBLIC_API_URL` environment variable in Vercel Dashboard
2. Deploy your backend API to a production service
3. Use the production backend URL (e.g., `https://your-api.vercel.app`)

**Fallback Behavior**: 
- If `NEXT_PUBLIC_API_URL` is not set, the app will use mock data
- Users can still log in with demo accounts and browse mock company data
- This allows the frontend to be deployed independently while the backend is being set up

#### Missing routes-manifest.json Error

If you see `"The file "/.next/routes-manifest.json" couldn't be found"`:

1. Ensure `outputDirectory` is set to `apps/web/.next`
2. Make sure the build command runs from repository root
3. Verify turbo build completes successfully for all packages

#### Build Failures

- Check that all dependencies are properly installed
- Ensure shared types build before other applications
- Verify no build artifacts are committed to Git

### Alternative Deployment

For other platforms (Netlify, Railway, etc.):

1. Build command: `npm run build`
2. Output directory: `apps/web/.next` or `apps/web/out` (for static export)
3. Install command: `npm install`
4. Ensure platform supports Node.js workspaces