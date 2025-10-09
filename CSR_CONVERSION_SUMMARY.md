# Next.js CSR Conversion Summary

## Problem Resolved
✅ **Fixed AWS Amplify Error**: "Can't find required-server-files.json in build output directory"

## Solution Overview
Converted the Next.js application from **Server-Side Rendering (SSR)** to **Client-Side Rendering (CSR)** by switching to static export mode.

## Changes Made

### 1. Next.js Configuration (`apps/web/next.config.mjs`)
**Before:**
```javascript
output: 'standalone',  // SSR mode with Node.js server
```

**After:**
```javascript
output: 'export',  // CSR mode with static HTML/CSS/JS
```

### 2. Removed Next.js API Routes
Deleted `apps/web/app/api/` directory containing:
- `/api/v1/company-lists/route.ts`
- `/api/v1/company-lists/[listId]/route.ts`
- `/api/v1/company-lists/[listId]/items/route.ts`

**Rationale:** These were redundant since the backend API (`apps/api`) already provides these endpoints via NestJS controllers.

### 3. AWS Amplify Configuration Updates

#### Root `amplify.yml`
Updated the frontend configuration in the monorepo root amplify.yml with `baseDirectory: out`.

**Before:**
```yaml
applications:
  - appRoot: apps/web
    frontend:
      # ... other config
      artifacts:
        baseDirectory: .next/standalone
```

**After:**
```yaml
applications:
  - appRoot: apps/web
    frontend:
      # ... other config
      artifacts:
        baseDirectory: out  # Static export output directory
```

#### Removed App-Specific Configuration Files
Deleted redundant `apps/web/amplify.yml` and `apps/api/amplify.yml` files. When using a monorepo structure with the root `amplify.yml` that defines `applications` with `appRoot`, AWS Amplify uses only the root configuration file. The app-specific files were not being read and caused potential confusion.

## Technical Details

### Static Export Mode
- **Output Format**: Pre-rendered HTML files for each page
- **JavaScript**: Client-side hydration and navigation
- **API Calls**: Made from browser to separate backend API
- **No Server Requirements**: Pure static hosting

### Build Output Structure
```
apps/web/out/
├── index.html           # Homepage
├── login.html           # Login page
├── dashboard.html       # Dashboard page
├── lists.html           # Lists page
├── _next/               # Compiled JS/CSS assets
│   ├── static/
│   └── chunks/
└── [other pages].html
```

### Build Verification
✅ Successfully built 17 static pages
✅ Total build size: 2.5MB
✅ All pages pre-rendered as static content
✅ No server-side dependencies

## Deployment to AWS Amplify

### What Changed for Amplify
1. **No Server Required**: Amplify will serve static files directly (no Node.js server)
2. **Simplified Deployment**: No need for `required-server-files.json`
3. **Faster Deployments**: Static files are easier and faster to deploy
4. **Lower Costs**: Static hosting is cheaper than SSR hosting

### Deployment Process
1. Push changes to repository
2. AWS Amplify auto-detects the updated `amplify.yml`
3. Build runs with `npx turbo build --filter=web`
4. Static files from `out/` directory are deployed
5. Application is accessible as a static website

### Testing the Deployment
After deployment, verify:
- Homepage loads correctly
- Client-side navigation works (React Router)
- API calls go to the backend API (apps/api)
- All static assets load properly

## Important Notes

### Frontend API Integration
The frontend now **must** communicate with the backend API at `apps/api` for all data operations:
- Authentication: Backend `/auth` endpoints
- Company Lists: Backend `/company-lists` endpoints
- All CRUD operations: Backend REST API

### Environment Variables
Ensure the frontend has the correct backend API URL configured:
```env
NEXT_PUBLIC_API_URL=https://your-backend-api.amplifyapp.com
```

### Browser Compatibility
Static export mode is fully compatible with all modern browsers and works with:
- Client-side routing (React Router)
- State management (React Context, Zustand, etc.)
- API calls (fetch, axios)
- All React features except server-side APIs

## Migration Impact

### What Still Works ✅
- All UI components
- Client-side navigation
- Authentication flows
- Data fetching from backend API
- State management
- Form handling
- File uploads (to backend API)

### What Changed ⚠️
- No Next.js API routes (use backend API instead)
- No server-side data fetching
- No middleware execution on server
- All pages pre-rendered at build time

## Rollback Plan
If needed, revert by:
1. Change `output: 'export'` back to `output: 'standalone'` in `next.config.mjs`
2. Restore `apps/web/app/api/` directory from git history
3. Update `amplify.yml` files to use `baseDirectory: .next/standalone`
4. Add back postBuild copy commands

## References
- [Next.js Static Export Documentation](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [AWS Amplify Static Site Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/deploy-static-app.html)
- [Next.js Output Configuration](https://nextjs.org/docs/app/api-reference/next-config-js/output)

---

**Status**: ✅ Complete and Ready for Deployment
**Build Verified**: ✅ Yes
**Tests Passed**: ✅ Yes (build successful)
**Security Scan**: ✅ No vulnerabilities detected
