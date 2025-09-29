# Backend API Deployment Guide

The frontend requires a backend API to be deployed separately for full functionality.

## Quick Setup Options

### Option 1: Deploy Full-Stack to Vercel (Recommended)
**NEW: Deploy both frontend and backend together as serverless functions**

1. Follow the complete guide in [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
2. Deploy entire monorepo to single Vercel project
3. Backend runs as serverless functions alongside the frontend
4. No need for separate API URL configuration

Benefits:
- Single deployment for frontend + backend
- Automatic scaling and performance optimization
- Simplified environment configuration
- Unified domain for frontend and API

### Option 2: Deploy Backend to Vercel (Separate Project)
1. Create a new Vercel project for the `apps/api` folder
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy and get the URL (e.g., `https://your-api.vercel.app`)

### Option 3: Deploy Backend to Railway
1. Connect Railway to your repository
2. Select the `apps/api` folder as the root
3. Railway will auto-detect NestJS and deploy
4. Get the URL from Railway dashboard

### Option 4: Use Mock Data Only
If you don't want to deploy a backend:
- Don't set `NEXT_PUBLIC_API_URL` in Vercel
- The frontend will automatically use mock data
- All features work with demo data

## Frontend Configuration

### For Full-Stack Vercel Deployment (Option 1)
No additional configuration needed! The API is automatically available at the same domain.

### For Separate Backend Deployment (Options 2-3)
Once your backend is deployed separately, configure the frontend:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`
3. Redeploy the frontend

## Verification

### Full-Stack Deployment
Test the connection by visiting:
- Frontend: `https://your-app.vercel.app`
- API Health: `https://your-app.vercel.app/api/health`
- API Docs: `https://your-app.vercel.app/api/docs`

### Separate Deployment
Test the connection by visiting `/api-test` on your deployed frontend.