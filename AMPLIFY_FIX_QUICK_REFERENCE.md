# AWS Amplify Fix - Quick Reference

## Problem Fixed
✅ **"This page can't be found" error on AWS Amplify deployment**

- Issue: `https://main.d3etdi36uiivoz.amplifyapp.com/` returned 404
- Cause: Missing Next.js standalone mode configuration
- Status: **FIXED**

## What Changed

### 1. Next.js Configuration
```javascript
// apps/web/next.config.mjs
output: 'standalone'  // Always enabled for Amplify
```

### 2. Amplify Build Config
```yaml
# amplify.yml - Updated baseDirectory
baseDirectory: .next/standalone  # Was: .next
```

### 3. Added PostBuild Step
```yaml
postBuild:
  commands:
    - cp -r apps/web/public apps/web/.next/standalone/apps/web/public || true
    - cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static
```

## How to Deploy This Fix

### Option 1: Merge PR (Recommended)
1. Merge this PR to main branch
2. AWS Amplify will auto-deploy
3. Wait 2-5 minutes for build
4. Test: `curl https://your-app.amplifyapp.com`

### Option 2: Manual Update
If you need to apply manually:
1. Update `apps/web/next.config.mjs` - set `output: 'standalone'`
2. Update both amplify.yml files with postBuild commands
3. Push changes to trigger deployment

## Verification Checklist

After deployment, verify:

- [ ] Build completes successfully (check Amplify Console)
- [ ] postBuild phase executes without errors
- [ ] Deployment shows as "Deployed" in Amplify Console
- [ ] URL responds with HTML (not 404)
- [ ] Login page loads at `/login`
- [ ] Static assets load correctly (images, CSS)

### Test Commands
```bash
# Test homepage
curl https://your-app.amplifyapp.com

# Should return HTML, not 404

# Test login page
curl https://your-app.amplifyapp.com/login

# Should return login page HTML
```

## Troubleshooting

### Build fails?
- Check build logs in Amplify Console
- Look for errors in postBuild phase
- Verify Node version is 18+

### Still getting 404?
- Check Amplify Console → App Settings → General
- Verify build is using the updated amplify.yml
- Check that baseDirectory is `.next/standalone`
- Verify postBuild commands executed successfully

### Need to rollback?
If this causes issues:
1. Revert the PR
2. Amplify will auto-deploy previous version
3. Contact support for help

## Documentation

Full details in:
- `AMPLIFY_STANDALONE_MODE_FIX.md` - Complete fix explanation
- `AWS_AMPLIFY_DEPLOYMENT.md` - Deployment guide
- `AMPLIFY_QUICK_START.md` - Quick start guide

## Technical Details

**What is Standalone Mode?**
- Creates self-contained server bundle
- Includes all dependencies
- Optimized for serverless/container deployments
- Required for AWS Amplify SSR hosting

**Build Output Structure:**
```
apps/web/.next/standalone/
├── apps/web/
│   ├── server.js          # Entry point
│   ├── .next/             # Compiled app
│   │   └── static/        # Static assets (copied)
│   ├── public/            # Public files (copied)
│   ├── package.json
│   └── node_modules/      # Dependencies
└── node_modules/          # Shared dependencies
```

## Support

- Issues? Check `AMPLIFY_STANDALONE_MODE_FIX.md`
- Questions? See `AWS_AMPLIFY_DEPLOYMENT.md`
- Still stuck? Open a GitHub issue
