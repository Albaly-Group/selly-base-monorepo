# Vercel Deployment Fix - Summary

## Problem
Vercel build failed with error:
```
The file "/vercel/path0/apps/web/out/routes-manifest.json" couldn't be found.
```

## Root Cause
The `next.config.mjs` file had `output: 'export'` set, which:
1. Creates static export in `out/` directory
2. Does NOT generate `routes-manifest.json` in the output
3. Vercel requires `routes-manifest.json` for routing

## Solution
Implemented **conditional output mode** based on deployment platform:

```javascript
// next.config.mjs
output: process.env.AWS_AMPLIFY === 'true' ? 'standalone' : undefined
```

### For Vercel (Default)
- **Environment**: `AWS_AMPLIFY` NOT set
- **Output Mode**: `undefined` (default Next.js)
- **Build Output**: `.next/` directory
- **Key Files**: 
  - ✓ `.next/routes-manifest.json` (required by Vercel)
  - ✓ `.next/server/` (server code)
  - ✓ `.next/static/` (static assets)

### For AWS Amplify
- **Environment**: `AWS_AMPLIFY=true`
- **Output Mode**: `standalone`
- **Build Output**: `.next/standalone/` directory
- **Key Files**:
  - ✓ `.next/standalone/apps/web/server.js` (entry point)
  - ✓ `.next/standalone/node_modules/` (bundled deps)
  - ✓ `.next/standalone/apps/web/.next/` (build artifacts)

## Files Modified

### Configuration Files
1. **`apps/web/next.config.mjs`**
   - Changed: `output: 'export'` → `output: process.env.AWS_AMPLIFY === 'true' ? 'standalone' : undefined`
   - Impact: Platform-specific output mode

2. **`apps/web/vercel.json`**
   - Added: `"outputDirectory": ".next"`
   - Impact: Vercel knows where to find build output

3. **`amplify.yml`**
   - Updated build phase: Added `export AWS_AMPLIFY=true`
   - Updated postBuild: Copy assets to standalone directory
   - Changed baseDirectory: `out` → `.next/standalone`
   - Impact: Enables standalone mode for Amplify

### Documentation Files
4. **`VERCEL_DEPLOYMENT.md`**
   - Added troubleshooting section for routes-manifest.json error
   - Updated configuration instructions

5. **`AWS_AMPLIFY_DEPLOYMENT.md`**
   - Added AWS_AMPLIFY=true environment variable requirement
   - Updated explanation of standalone mode

6. **`DEPLOYMENT_PLATFORM_GUIDE.md`** (New)
   - Comprehensive guide for both platforms
   - Troubleshooting steps
   - Technical details

## Testing Results

### Vercel Mode ✅
```bash
# Build without AWS_AMPLIFY
npm run build

# Results:
✓ .next/routes-manifest.json exists
✓ No out/ directory
✓ No .next/standalone/ directory
```

### AWS Amplify Mode ✅
```bash
# Build with AWS_AMPLIFY=true
AWS_AMPLIFY=true npm run build

# Results:
✓ .next/standalone/ directory exists
✓ .next/standalone/apps/web/server.js exists
✓ No out/ directory (standalone mode doesn't need it)
```

## Deployment Instructions

### Vercel
1. Create project in Vercel Dashboard
2. Set root directory: `apps/web`
3. Build command: `cd ../.. && npm install && npx turbo build --filter=web`
4. Output directory: `.next` (from vercel.json)
5. **Important**: Do NOT set `AWS_AMPLIFY` environment variable
6. Deploy

### AWS Amplify
1. Create app in AWS Amplify Console
2. Set app root directory: `apps/web`
3. Build settings: Auto-detected from `amplify.yml`
4. **Important**: Set environment variable `AWS_AMPLIFY=true`
5. Deploy

## Benefits

### Single Codebase
- Same code works for both platforms
- No need for separate branches or configs

### Platform-Optimized
- Vercel: Full Next.js features with routing
- Amplify: Standalone bundle for AWS infrastructure

### Easy Maintenance
- One conditional line in config
- Environment variable controls behavior
- Clear documentation for each platform

## Verification

To verify the fix is working:

```bash
# Clone repository
git clone <repo-url>
cd selly-base-monorepo

# Install dependencies
npm ci

# Test Vercel mode
cd apps/web
npm run build
test -f .next/routes-manifest.json && echo "✓ Vercel ready"

# Test Amplify mode
rm -rf .next
AWS_AMPLIFY=true npm run build
test -f .next/standalone/apps/web/server.js && echo "✓ Amplify ready"
```

## Related Documentation
- [DEPLOYMENT_PLATFORM_GUIDE.md](./DEPLOYMENT_PLATFORM_GUIDE.md) - Comprehensive platform guide
- [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md) - Vercel deployment instructions
- [AWS_AMPLIFY_DEPLOYMENT.md](./AWS_AMPLIFY_DEPLOYMENT.md) - AWS Amplify deployment instructions

## Summary
The fix enables the Next.js application to support both Vercel and AWS Amplify deployments through conditional output mode. Vercel gets the standard `.next` output with `routes-manifest.json`, while AWS Amplify gets a standalone bundle optimized for AWS infrastructure.
