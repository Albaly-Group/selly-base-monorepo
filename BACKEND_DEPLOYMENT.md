# Backend API Deployment Guide

The frontend requires a backend API to be deployed separately for full functionality.

## Quick Setup Options

### Option 1: Deploy Backend to Vercel
1. Create a new Vercel project for the `apps/api` folder
2. Set build command: `npm run build`
3. Set output directory: `dist`
4. Deploy and get the URL (e.g., `https://your-api.vercel.app`)

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

Once your backend is deployed, configure the frontend:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`
3. Redeploy the frontend

## Verification

Test the connection by visiting `/api-test` on your deployed frontend.