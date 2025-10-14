# Deployment Platform Configuration Guide

This document explains how the Next.js application is configured to work with both Vercel and AWS Amplify platforms.

## Overview

The application uses **conditional output mode** in `next.config.mjs` to support different deployment platforms:

- **Vercel**: Default Next.js output (`.next` directory)
- **AWS Amplify**: Standalone mode (`.next/standalone` directory)

## Configuration Details

### next.config.mjs

```javascript
const nextConfig = {
  // ... other config
  
  // Conditional output mode based on deployment platform:
  // - AWS Amplify: Use 'standalone' mode for SSR support (requires AWS_AMPLIFY=true)
  // - Vercel: Use default Next.js output with routes-manifest.json (no output set)
  output: process.env.AWS_AMPLIFY === 'true' ? 'standalone' : undefined,
}
```

### How It Works

#### For Vercel Deployment (Default)

**Environment Variables:**
- `AWS_AMPLIFY` is NOT set (or set to anything other than 'true')

**Build Output:**
- Uses default Next.js build output
- Generates `.next` directory with all required files
- Includes `routes-manifest.json` (required by Vercel)
- Supports all Next.js features (SSR, SSG, ISR, API routes)

**Vercel Configuration (`apps/web/vercel.json`):**
```json
{
  "buildCommand": "cd ../.. && npm ci && npx turbo build --filter=web",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

#### For AWS Amplify Deployment

**Environment Variables:**
- `AWS_AMPLIFY=true` (must be set in Amplify environment variables)

**Build Output:**
- Uses standalone mode
- Generates `.next/standalone` directory with self-contained server
- Includes `server.js` entry point
- Bundles all necessary dependencies
- Optimized for serverless/container deployments

**Amplify Configuration (`amplify.yml`):**
```yaml
frontend:
  phases:
    build:
      commands:
        - export AWS_AMPLIFY=true
        - npx turbo build --filter=web
    postBuild:
      commands:
        # Copy static assets to standalone directory
        - mkdir -p apps/web/.next/standalone/apps/web/public
        - mkdir -p apps/web/.next/standalone/apps/web/.next
        - cp -r apps/web/public/* apps/web/.next/standalone/apps/web/public/ || true
        - cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static
  artifacts:
    baseDirectory: .next/standalone
```

## Deployment Instructions

### Deploy to Vercel

1. **Create Project** in Vercel Dashboard
2. **Set Root Directory**: `apps/web`
3. **Configure Settings**:
   - Build Command: `cd ../.. && npm install && npx turbo build --filter=web`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. **Environment Variables**: 
   - `NEXT_PUBLIC_API_URL` (optional)
   - Do NOT set `AWS_AMPLIFY`
5. **Deploy**

### Deploy to AWS Amplify

1. **Create App** in AWS Amplify Console
2. **Set App Root Directory**: `apps/web`
3. **Configure Environment Variables**:
   - `AWS_AMPLIFY=true` (required!)
   - `NEXT_PUBLIC_API_URL` (optional)
   - `NODE_ENV=production`
4. **Build Settings**: Auto-detected from `amplify.yml`
5. **Deploy**

## Troubleshooting

### Vercel: "routes-manifest.json" not found

**Error:**
```
The file '/vercel/path0/apps/web/out/routes-manifest.json' couldn't be found
```

**Cause:** `AWS_AMPLIFY` environment variable is set in Vercel

**Solution:** 
1. Go to Vercel Project → Settings → Environment Variables
2. Remove or unset `AWS_AMPLIFY` variable
3. Redeploy

### AWS Amplify: 404 Error After Deployment

**Error:** Build succeeds but page returns 404

**Cause:** `AWS_AMPLIFY` environment variable is not set

**Solution:**
1. Go to Amplify App → App Settings → Environment Variables
2. Add `AWS_AMPLIFY=true`
3. Redeploy

### Verify Configuration

**Check next.config.mjs:**
```bash
grep "output" apps/web/next.config.mjs
# Should show: output: process.env.AWS_AMPLIFY === 'true' ? 'standalone' : undefined,
```

**Test Vercel build locally:**
```bash
cd apps/web
rm -rf .next out .turbo
npm run build
# Check: routes-manifest.json should exist in .next/
test -f .next/routes-manifest.json && echo "✓ Vercel ready"
```

**Test Amplify build locally:**
```bash
cd apps/web
rm -rf .next out .turbo
AWS_AMPLIFY=true npm run build
# Check: server.js should exist in .next/standalone/
test -f .next/standalone/apps/web/server.js && echo "✓ Amplify ready"
```

## Benefits of This Approach

### Single Configuration
- No need for separate branches or configs for different platforms
- Same codebase deploys to both platforms

### Platform-Optimized
- Vercel: Uses standard Next.js output with full feature support
- Amplify: Uses standalone mode optimized for AWS hosting

### Easy Maintenance
- Changes to code or configuration apply to both platforms
- Environment variable controls the output mode

## Technical Details

### What is Standalone Mode?

Standalone mode (`output: 'standalone'`) creates a minimal, self-contained deployment:

1. **Self-contained Server**: Includes all runtime dependencies
2. **Entry Point**: `server.js` for starting the application
3. **Optimized Bundle**: Only includes necessary files
4. **Serverless-Ready**: Perfect for container/serverless deployments

### What is routes-manifest.json?

The `routes-manifest.json` file:

1. **Purpose**: Defines all routes in the Next.js application
2. **Contains**: Static routes, dynamic routes, redirects, rewrites, headers
3. **Used By**: Vercel's edge network for request routing
4. **Location**: Generated in `.next` directory during build
5. **Required For**: Vercel deployments (not in standalone or export modes)

## References

- [Next.js Output Configuration](https://nextjs.org/docs/app/api-reference/next-config-js/output)
- [Next.js Standalone Mode](https://nextjs.org/docs/advanced-features/output-file-tracing)
- [Vercel Next.js Deployment](https://vercel.com/docs/frameworks/nextjs)
- [AWS Amplify Next.js Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/deploy-nextjs-app.html)
