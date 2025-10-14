# AWS Amplify Fix - Visual Guide

## 🎯 Problem → Solution Diagram

```
❌ BEFORE (404 Error)
┌─────────────────────────────────────────────┐
│  AWS Amplify Build                          │
│  ┌─────────────────────────────────────┐   │
│  │ npm ci                              │   │
│  │ npx turbo build --filter=web        │   │
│  └─────────────────────────────────────┘   │
│                ↓                            │
│  ┌─────────────────────────────────────┐   │
│  │ apps/web/.next/                     │   │
│  │  ├── server/                        │   │
│  │  ├── static/                        │   │
│  │  ├── build-manifest.json            │   │
│  │  └── ...                            │   │
│  └─────────────────────────────────────┘   │
│                ↓                            │
│  Regular Next.js build - NOT standalone    │
│  AWS Amplify cannot run it properly        │
│  Result: 404 Not Found                     │
└─────────────────────────────────────────────┘

✅ AFTER (Working)
┌─────────────────────────────────────────────┐
│  AWS Amplify Build                          │
│  ┌─────────────────────────────────────┐   │
│  │ npm ci                              │   │
│  │ npx turbo build --filter=web        │   │
│  │ (with output: 'standalone')         │   │
│  └─────────────────────────────────────┘   │
│                ↓                            │
│  ┌─────────────────────────────────────┐   │
│  │ postBuild: Copy Assets              │   │
│  │  cp public → standalone/            │   │
│  │  cp static → standalone/            │   │
│  └─────────────────────────────────────┘   │
│                ↓                            │
│  ┌─────────────────────────────────────┐   │
│  │ apps/web/.next/standalone/          │   │
│  │  └── apps/web/                      │   │
│  │      ├── server.js ✅                │   │
│  │      ├── .next/ (compiled) ✅        │   │
│  │      ├── public/ (static) ✅         │   │
│  │      ├── node_modules/ ✅            │   │
│  │      └── package.json ✅             │   │
│  └─────────────────────────────────────┘   │
│                ↓                            │
│  Complete, self-contained server bundle    │
│  AWS Amplify runs it successfully          │
│  Result: ✅ App works!                     │
└─────────────────────────────────────────────┘
```

## 📊 File Changes Breakdown

### Configuration Files (Critical Changes)

#### 1. apps/web/next.config.mjs
```diff
- output: process.env.DOCKER_BUILD === 'true' ? 'standalone' : undefined,
+ output: 'standalone',  // Always enabled
```
**Impact**: Generates standalone server bundle for all deployments

#### 2. apps/web/amplify.yml
```diff
  build:
    commands:
      - npx turbo build --filter=web
+ postBuild:
+   commands:
+     - cp -r apps/web/public apps/web/.next/standalone/apps/web/public || true
+     - cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static
  artifacts:
-   baseDirectory: .next
+   baseDirectory: .next/standalone
```
**Impact**: Copies assets to standalone bundle and serves from correct directory

#### 3. amplify.yml (root)
```diff
  # Same changes as apps/web/amplify.yml
+ postBuild commands added
+ baseDirectory changed to .next/standalone
```
**Impact**: Keeps monorepo config in sync

## 🏗️ Build Process Flow

### Step-by-Step: What Happens During Build

```
1️⃣ preBuild Phase
   ┌──────────────────────────┐
   │ cd ../..                 │
   │ npm ci                   │
   └──────────────────────────┘
   Result: Dependencies installed at repo root

2️⃣ build Phase
   ┌──────────────────────────┐
   │ npx turbo build          │
   │ --filter=web             │
   └──────────────────────────┘
   Result: Creates .next/standalone/ with:
   - server.js (entry point)
   - .next/ (compiled app)
   - node_modules/ (deps)

3️⃣ postBuild Phase (NEW)
   ┌──────────────────────────┐
   │ cp public → standalone   │
   │ cp static → standalone   │
   └──────────────────────────┘
   Result: Standalone bundle complete

4️⃣ artifacts Collection
   ┌──────────────────────────┐
   │ baseDirectory:           │
   │   .next/standalone       │
   └──────────────────────────┘
   Result: Amplify deploys complete bundle
```

## 📁 Directory Structure Comparison

### Before (Regular Build)
```
apps/web/
└── .next/
    ├── server/
    ├── static/
    ├── build-manifest.json
    └── ...

❌ Missing:
- No server.js entry point
- No bundled dependencies
- Not self-contained
```

### After (Standalone Build)
```
apps/web/
└── .next/
    ├── standalone/              ← NEW
    │   ├── apps/web/
    │   │   ├── server.js       ✅ Entry point
    │   │   ├── .next/          ✅ Compiled
    │   │   │   ├── server/
    │   │   │   └── static/     ✅ Copied
    │   │   ├── public/         ✅ Copied
    │   │   ├── node_modules/   ✅ Minimal deps
    │   │   └── package.json
    │   └── node_modules/       ✅ Shared deps
    ├── server/
    ├── static/
    └── ...

✅ Complete:
- server.js entry point
- All dependencies bundled
- Self-contained and runnable
```

## 🔄 Deployment Flow

```
┌─────────────────┐
│ Developer       │
│ Merges PR       │
└────────┬────────┘
         ↓
┌─────────────────┐
│ GitHub          │
│ Push to main    │
└────────┬────────┘
         ↓
┌─────────────────┐
│ AWS Amplify     │
│ Auto-deploy     │
├─────────────────┤
│ 1. Clone repo   │
│ 2. npm ci       │
│ 3. Build        │
│ 4. PostBuild    │
│ 5. Collect      │
│ 6. Deploy       │
└────────┬────────┘
         ↓
┌─────────────────┐
│ Production URL  │
│ ✅ Working!     │
└─────────────────┘
```

## 🎨 Before/After Comparison

| Aspect | Before ❌ | After ✅ |
|--------|-----------|----------|
| **Output Mode** | Conditional (Docker only) | Always standalone |
| **Build Directory** | `.next` | `.next/standalone` |
| **PostBuild** | None | Copy assets |
| **Server Entry** | Missing | `server.js` |
| **Dependencies** | Not bundled | Bundled |
| **Amplify Status** | 404 Error | Works correctly |
| **Can Run?** | ❌ No | ✅ Yes |

## 🧪 Testing Checklist

### Local Testing
```bash
# 1. Build
cd /path/to/monorepo
npx turbo build --filter=web
✅ Should create .next/standalone/

# 2. Check Structure
ls apps/web/.next/standalone/apps/web/
✅ Should show: server.js, .next/, public/, node_modules/

# 3. Run Server
cd apps/web/.next/standalone/apps/web
node server.js
✅ Should start on port 3000

# 4. Test Response
curl http://localhost:3000
✅ Should return HTML
```

### Amplify Testing (After Merge)
```bash
# 1. Wait for deployment (2-5 minutes)

# 2. Test URL
curl https://main.d3etdi36uiivoz.amplifyapp.com
✅ Should return HTML, not 404

# 3. Test Specific Pages
curl https://main.d3etdi36uiivoz.amplifyapp.com/login
curl https://main.d3etdi36uiivoz.amplifyapp.com/dashboard
✅ All should work

# 4. Check Static Assets
curl https://main.d3etdi36uiivoz.amplifyapp.com/_next/static/...
✅ Should load correctly
```

## 📚 Documentation Map

```
📖 Documentation Files
├── AMPLIFY_FIX_SUMMARY.md          ← Executive summary
├── AMPLIFY_STANDALONE_MODE_FIX.md  ← Technical details
├── AMPLIFY_FIX_QUICK_REFERENCE.md  ← Deployment guide
├── AMPLIFY_FIX_VISUAL_GUIDE.md     ← This file (visual)
├── AWS_AMPLIFY_DEPLOYMENT.md       ← Full deployment docs
└── AMPLIFY_QUICK_START.md          ← Quick start

🎯 Start Here:
1. New to this fix? → Read AMPLIFY_FIX_SUMMARY.md
2. Need to deploy? → Read AMPLIFY_FIX_QUICK_REFERENCE.md
3. Want visuals? → Read this file
4. Need details? → Read AMPLIFY_STANDALONE_MODE_FIX.md
```

## 🚀 Ready to Deploy?

### Quick Checklist
- [x] Code changes complete
- [x] Tested locally
- [x] Documentation updated
- [x] Changes committed
- [x] Changes pushed

### Next Step
**Merge this PR** → Amplify will auto-deploy → ✅ App will work!

---

**Visual Guide Complete** | See other docs for more details
