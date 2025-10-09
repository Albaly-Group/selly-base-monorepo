# AWS Amplify Quick Start Guide

Quick reference for deploying to AWS Amplify. For detailed instructions, see [AWS_AMPLIFY_DEPLOYMENT.md](./AWS_AMPLIFY_DEPLOYMENT.md).

## Prerequisites

- AWS Account
- GitHub repository connected to AWS Amplify
- Node.js 18+ and npm 10+

## Quick Deployment Steps

### 1. Deploy Frontend (apps/web)

```bash
# AWS Amplify Console → New app → Host web app
# Repository: Albaly-Group/selly-base-monorepo
# Branch: main
# App root: apps/web
```

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://your-backend-app.amplifyapp.com
NODE_ENV=production
```

### 2. Deploy Backend (apps/api)

```bash
# AWS Amplify Console → New app → Host web app (separate app)
# Repository: Albaly-Group/selly-base-monorepo
# Branch: main
# App root: apps/api
```

**Environment Variables (Demo Mode):**
```bash
SKIP_DATABASE=true
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
NODE_ENV=production
PORT=3000
```

**Environment Variables (Production):**
```bash
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/db?sslmode=require
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d
NODE_ENV=production
PORT=3000
```

### 3. Update Frontend with Backend URL

After backend deploys:
1. Copy backend Amplify URL
2. Update frontend `NEXT_PUBLIC_API_URL` 
3. Redeploy frontend

## Build Configuration Files

Both apps have `amplify.yml` files configured:

- **Frontend**: `/apps/web/amplify.yml`
- **Backend**: `/apps/api/amplify.yml`

## Testing Locally

```bash
# Install dependencies
npm install

# Build frontend
npx turbo build --filter=web

# Build backend
npx turbo build --filter=api

# Run frontend locally
cd apps/web && npm run dev

# Run backend locally
cd apps/api && npm run dev
```

## Verify Deployment

```bash
# Test frontend
curl https://your-frontend-app.amplifyapp.com

# Test backend health
curl https://your-backend-app.amplifyapp.com/health

# Test API documentation
open https://your-backend-app.amplifyapp.com/docs
```

## Key Features

✅ **Optimized Builds**: Turbo builds only necessary packages  
✅ **Monorepo Support**: Handles workspace dependencies automatically  
✅ **Auto-deploy**: Deploys on git push  
✅ **CORS Configured**: `.amplifyapp.com` domains whitelisted  
✅ **Environment Isolation**: Separate apps for frontend/backend  

## Troubleshooting

**Build fails?**
- Check Node version (18+)
- Verify `npm ci` completes
- Review build logs in Amplify Console

**API not accessible?**
- Verify backend PORT=3000
- Check CORS settings
- Test health endpoint

**Frontend can't connect?**
- Verify `NEXT_PUBLIC_API_URL` is set
- Check backend is deployed
- Test backend URL directly

## More Information

- **Full Guide**: [AWS_AMPLIFY_DEPLOYMENT.md](./AWS_AMPLIFY_DEPLOYMENT.md)
- **Deployment Options**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Vercel Alternative**: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
