# Deployment Guide

## Vercel Deployment

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

Make sure to configure these in Vercel:

```
NEXT_PUBLIC_API_URL=https://your-api-domain.com
```

### Troubleshooting

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