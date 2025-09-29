# Backend API Deployment Guide

The frontend requires a backend API to be deployed separately for full functionality.

## Quick Setup Options

### Option 1: Deploy Backend to Vercel (Recommended)
**Deploy the NestJS API as serverless functions on Vercel**

1. Follow the complete guide in [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
2. Create a separate Vercel project for the `apps/api` folder
3. Backend runs as serverless functions with automatic scaling
4. Configure frontend with `NEXT_PUBLIC_API_URL` environment variable

Benefits:
- Serverless scaling and performance optimization
- Independent deployment cycles for frontend and backend
- Optimized for Vercel's infrastructure
- Full NestJS functionality preserved

### Option 2: Deploy Backend to Railway
1. Connect Railway to your repository
2. Select the `apps/api` folder as the root
3. Railway will auto-detect NestJS and deploy
4. Get the URL from Railway dashboard

### Option 3: Use Mock Data Only
If you don't want to deploy a backend:
- Don't set `NEXT_PUBLIC_API_URL` in Vercel
- The frontend will automatically use mock data
- All features work with demo data

## Frontend Configuration

### For Vercel Backend Deployment (Option 1)
Once your backend is deployed to Vercel, configure the frontend:

1. Go to Vercel Dashboard → Your Frontend Project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://your-api.vercel.app`
3. Redeploy the frontend

### For Railway Deployment (Option 2)
Once your backend is deployed to Railway, configure the frontend:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`
3. Redeploy the frontend

## Verification

### Vercel Backend Deployment
Test the connection by visiting:
- **Frontend**: `https://your-frontend.vercel.app`
- **API Health**: `https://your-api.vercel.app/health`
- **API Docs**: `https://your-api.vercel.app/docs`
- **Integration Test**: `https://your-frontend.vercel.app/api-test`

### Railway Backend Deployment
Test the connection by visiting `/api-test` on your deployed frontend.