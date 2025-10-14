# AWS Amplify Standalone Mode Fix

## Issue

**Problem**: Amplify build passes but page shows "This page can't be found" (404 error)
- Build completes successfully
- Deployment shows as successful
- But accessing the URL returns 404

**Error URL**: `https://main.d3etdi36uiivoz.amplifyapp.com/`

## Root Cause

AWS Amplify requires Next.js applications to use **standalone output mode** for proper SSR hosting. Without this configuration:
- Build artifacts are created but not in the format Amplify expects
- Amplify cannot serve the application properly
- Results in 404 errors even though deployment succeeded

## Solution

### 1. Enable Standalone Output Mode

Updated `apps/web/next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... other config
  output: 'standalone',  // Required for AWS Amplify SSR hosting
}

export default nextConfig
```

**Before**: `output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined`  
**After**: `output: 'standalone'` (always enabled)

### 2. Update Amplify Build Configuration

Updated `apps/web/amplify.yml` and root `amplify.yml`:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd ../..
        - npm ci
    build:
      commands:
        - npx turbo build --filter=web
    postBuild:
      commands:
        # Copy static assets and public files to standalone directory
        - cp -r apps/web/public apps/web/.next/standalone/apps/web/public || true
        - cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static
  artifacts:
    # Point to standalone directory instead of .next
    baseDirectory: .next/standalone
    files:
      - '**/*'
  cache:
    paths:
      - ../../node_modules/**/*
      - .next/cache/**/*
```

**Key Changes**:
- Added `postBuild` phase to copy static files
- Changed `baseDirectory` from `.next` to `.next/standalone`
- Static files and public assets are copied into the standalone bundle

## What is Standalone Mode?

Next.js standalone mode creates a **self-contained server bundle** that includes:
- Compiled server code
- All necessary dependencies
- A `server.js` entry point
- Minimal node_modules footprint

This is required for AWS Amplify because:
1. Amplify needs a complete, runnable server package
2. The standalone bundle includes everything needed to run the app
3. It's optimized for serverless/container deployments

## Verification

After the fix, the build should:

1. ✅ Complete successfully
2. ✅ Create `.next/standalone/` directory
3. ✅ Include `server.js` in standalone directory
4. ✅ Copy static assets to standalone bundle
5. ✅ Deploy successfully to Amplify
6. ✅ Serve pages without 404 errors

### Local Testing

To test the standalone build locally:

```bash
# Build with standalone mode
cd /path/to/monorepo
npx turbo build --filter=web

# Check standalone directory exists
ls apps/web/.next/standalone/apps/web/

# Should show:
# - server.js (entry point)
# - .next/ (compiled app)
# - public/ (static files)
# - node_modules/ (dependencies)
# - package.json

# Run the standalone server
cd apps/web/.next/standalone/apps/web
node server.js

# Test in browser: http://localhost:3000
```

## Files Changed

1. **apps/web/next.config.mjs** - Enable standalone output mode
2. **apps/web/amplify.yml** - Update build configuration for standalone
3. **amplify.yml** (root) - Update monorepo configuration for standalone
4. **AWS_AMPLIFY_DEPLOYMENT.md** - Document the changes
5. **AMPLIFY_QUICK_START.md** - Add troubleshooting note
6. **AMPLIFY_BASEDIRECTORY_FIX.md** - Note about standalone mode update

## Related Issues

This fix resolves:
- ✅ "This page can't be found" errors on Amplify deployment
- ✅ 404 errors despite successful build
- ✅ SSR not working on AWS Amplify
- ✅ Next.js app not serving properly on Amplify

## AWS Amplify Documentation

- [Next.js on Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/deploy-nextjs-app.html)
- [Next.js Standalone Output](https://nextjs.org/docs/app/api-reference/next-config-js/output)
- [Amplify Build Specification](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html)

## Summary

**Problem**: Build passes but page not accessible (404)  
**Cause**: Missing standalone output mode for Next.js on Amplify  
**Solution**: Enable `output: 'standalone'` and update amplify.yml to use `.next/standalone` directory  
**Result**: App now properly deploys and serves on AWS Amplify
