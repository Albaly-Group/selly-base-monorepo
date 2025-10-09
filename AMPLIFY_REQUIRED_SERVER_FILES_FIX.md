# AWS Amplify "Can't find required-server-files.json" Fix

## Problem

**Error Message:**
```
!!! CustomerError: Can't find required-server-files.json in build output directory
```

**Build Log Context:**
```
2025-10-09T17:04:52.973Z [INFO]: ## Build completed successfully
2025-10-09T17:04:52.974Z [INFO]: # Starting caching...
2025-10-09T17:04:52.978Z [INFO]: # Creating cache artifact...
2025-10-09T17:04:52.982Z [INFO]: # Created cache artifact
2025-10-09T17:04:52.982Z [INFO]: # Uploading cache artifact...
2025-10-09T17:04:53.068Z [INFO]: # Uploaded cache artifact
2025-10-09T17:04:53.069Z [INFO]: # Caching completed
2025-10-09T17:04:53.074Z [ERROR]: !!! CustomerError: Can't find required-server-files.json in build output directory
2025-10-09T17:04:53.074Z [INFO]: # Starting environment caching...
2025-10-09T17:04:53.075Z [INFO]: # Environment caching completed
```

## Root Cause

AWS Amplify's build process detects Next.js applications and looks for `required-server-files.json` in the build output directory (specified by `baseDirectory` in `amplify.yml`).

**The Issue:**
1. Current configuration uses `output: 'export'` in `next.config.mjs` (static export/CSR mode)
2. `amplify.yml` has `baseDirectory: out` pointing to the static export output
3. Next.js generates `required-server-files.json` in the `.next/` directory during build
4. However, this file is NOT copied to the `out/` directory during static export
5. AWS Amplify looks for this file in `out/` (the `baseDirectory`) and fails to find it

**Why does Amplify need this file?**
Even though we're using static export mode, AWS Amplify's Next.js detection logic checks for this file to understand the Next.js configuration and deployment requirements. The file contains build configuration metadata that Amplify uses for optimization and proper deployment.

## Solution

Add a `postBuild` command in `amplify.yml` to copy `required-server-files.json` from `.next/` to `out/` directory.

### Implementation

**File: `amplify.yml`**

```yaml
applications:
  - appRoot: apps/web
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
            # Copy required-server-files.json to output directory for AWS Amplify
            - cp .next/required-server-files.json out/ || true
      artifacts:
        baseDirectory: out
        files:
          - '**/*'
      cache:
        paths:
          - ../../node_modules/**/*
          - .next/cache/**/*
```

### Key Points

1. **`|| true` suffix**: Ensures the build doesn't fail if the file doesn't exist (defensive programming)
2. **Timing**: Runs after the build completes, when both `.next/` and `out/` directories exist
3. **Path**: Uses relative path from `appRoot` (apps/web)
4. **Compatibility**: Works with both static export and potential future SSR configurations

## Verification

### Local Testing

Test the fix locally by simulating the AWS Amplify build process:

```bash
# 1. Clean previous builds
cd /path/to/monorepo/apps/web
rm -rf .next out

# 2. Navigate to repository root (simulating preBuild)
cd ../..

# 3. Build (simulating build phase)
npx turbo build --filter=web

# 4. PostBuild - Copy required file
cd apps/web
cp .next/required-server-files.json out/

# 5. Verify the file exists
ls -lh out/required-server-files.json
# Should show: -rw-rw-r-- 1 user user 8.9K out/required-server-files.json

# 6. Verify it's valid JSON
cat out/required-server-files.json | jq .version
# Should output: 1
```

### Expected Results

After applying this fix:

✅ Build completes successfully  
✅ Static export generates `out/` directory with all HTML/CSS/JS files  
✅ `required-server-files.json` is copied to `out/` directory  
✅ AWS Amplify can find the file and proceed with caching  
✅ No deployment errors  
✅ Application deploys and serves correctly  

### Build Output Verification

After deployment, the `out/` directory should contain:

```
out/
├── index.html                           # Homepage
├── login.html                           # Login page
├── dashboard.html                       # Dashboard page
├── required-server-files.json           # ✅ Build metadata (NOW INCLUDED)
├── _next/                               # Compiled assets
│   ├── static/
│   └── chunks/
└── [other pages].html
```

## Impact

### What This Fix Does

- ✅ Satisfies AWS Amplify's Next.js file requirement
- ✅ Maintains current CSR/static export configuration
- ✅ Adds minimal overhead (just a file copy)
- ✅ No impact on application functionality
- ✅ No impact on deployment performance

### What This Fix Does NOT Do

- ❌ Does not enable SSR (still using static export)
- ❌ Does not change application behavior
- ❌ Does not affect client-side functionality
- ❌ Does not require code changes

## Alternative Solutions Considered

### Option 1: Remove the file check (Not Possible)
AWS Amplify's build process is not configurable at this level.

### Option 2: Switch to SSR/Standalone Mode (Not Recommended)
Would require:
- Changing `output: 'export'` to `output: 'standalone'`
- Updating `baseDirectory: out` to `baseDirectory: .next/standalone`
- Adding postBuild commands to copy assets
- Would revert the CSR conversion

**Rejected because:** The CSR/static export mode is intentional and provides benefits:
- Simpler deployment
- Lower hosting costs
- Faster page loads
- No server requirements

### Option 3: Copy the file (Selected ✅)
**Advantages:**
- Minimal change (one line in amplify.yml)
- Maintains current architecture
- No side effects
- Easy to verify and test
- Can be easily reverted if needed

## Related Documentation

- [CSR_CONVERSION_SUMMARY.md](./CSR_CONVERSION_SUMMARY.md) - Details about the CSR conversion
- [AMPLIFY_STANDALONE_MODE_FIX.md](./AMPLIFY_STANDALONE_MODE_FIX.md) - Previous SSR configuration
- [AWS_AMPLIFY_DEPLOYMENT.md](./AWS_AMPLIFY_DEPLOYMENT.md) - General deployment guide
- [AWS Amplify Build Specification](https://docs.aws.amazon.com/amplify/latest/userguide/build-settings.html)
- [Next.js Output Configuration](https://nextjs.org/docs/app/api-reference/next-config-js/output)

## Rollback Plan

If this fix causes any issues, revert by:

```bash
# Remove the postBuild phase from amplify.yml
git revert <commit-hash>
git push origin main
```

The application will still build successfully, but AWS Amplify will show the error message again. The error doesn't prevent deployment in all cases, but may cause issues with caching and optimization.

## Troubleshooting

### If the error still occurs after applying the fix:

1. **Verify the file is being copied:**
   ```bash
   # In Amplify build logs, check postBuild phase
   # Should see: "cp .next/required-server-files.json out/"
   ```

2. **Check if the file exists in .next/:**
   ```bash
   # Add a debug command before the copy
   postBuild:
     commands:
       - ls -la .next/required-server-files.json
       - cp .next/required-server-files.json out/ || true
   ```

3. **Verify the build output directory:**
   ```bash
   # Ensure baseDirectory is correct
   artifacts:
     baseDirectory: out  # Should match the Next.js export directory
   ```

4. **Check for build cache issues:**
   - Try clearing the Amplify build cache
   - Or add a preBuild command: `rm -rf .next out`

### If the file still isn't found:

Contact AWS Support with:
- Build logs
- `amplify.yml` configuration
- `next.config.mjs` configuration
- Confirmation that the file exists in `.next/` after build

## Status

✅ **Fix Implemented**  
✅ **Tested Locally**  
✅ **Documentation Updated**  
✅ **Ready for Deployment**

Last Updated: 2025-01-09
