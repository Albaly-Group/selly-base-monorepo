# AWS Amplify Deployment Guide

This guide explains how to deploy both the frontend (Next.js) and backend (NestJS) applications to AWS Amplify.

## Overview

The monorepo contains two separate applications that can be deployed to AWS Amplify:

1. **Frontend (Next.js)** - Located in `apps/web`
2. **Backend (NestJS API)** - Located in `apps/api`

Both applications are configured with `amplify.yml` build specifications and optimized Turbo build commands.

## Prerequisites

- AWS Account with Amplify access
- GitHub repository connected to AWS Amplify
- Node.js 18+ and npm 10+

## Architecture

```
┌─────────────────────────────────────────┐
│  AWS Amplify Frontend (Next.js)         │
│  - Static site hosting                  │
│  - SSR/SSG support                      │
│  - CDN distribution                     │
└─────────────────┬───────────────────────┘
                  │
                  │ API Calls
                  ▼
┌─────────────────────────────────────────┐
│  AWS Amplify Backend (NestJS)           │
│  - Compute/Container hosting            │
│  - RESTful API endpoints                │
│  - Database connection                  │
└─────────────────────────────────────────┘
```

---

## Frontend Deployment (apps/web)

### 1. Create Amplify App for Frontend

1. **Go to AWS Amplify Console**: https://console.aws.amazon.com/amplify/
2. **Click "New app" → "Host web app"**
3. **Connect Repository**:
   - Select GitHub
   - Authorize AWS Amplify
   - Choose your repository: `Albaly-Group/selly-base-monorepo`
   - Select branch: `main` (or your deployment branch)

### 2. Configure Build Settings

AWS Amplify should auto-detect the `amplify.yml` file in `apps/web/`. If not:

1. **Set App root directory**: `apps/web`
2. **Build settings** will use the `amplify.yml` file:

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
  artifacts:
    baseDirectory: apps/web/.next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - apps/web/.next/cache/**/*
```

### 3. Configure Environment Variables

Navigate to **App Settings → Environment variables** and add:

**Required:**
```bash
# API URL - Set this after deploying the backend
NEXT_PUBLIC_API_URL=https://your-api-app.amplifyapp.com

# Node environment
NODE_ENV=production
```

**Optional (for demo mode without backend):**
```bash
# Leave NEXT_PUBLIC_API_URL empty to use mock data
NEXT_PUBLIC_API_URL=
```

### 4. Advanced Settings

1. **Build image**: Use `Amazon Linux 2023` or latest
2. **Node version**: 18 or higher
3. **Package manager**: npm
4. **Live package updates**: Enable for automatic dependency updates

### 5. Deploy Frontend

Click **"Save and deploy"**

The frontend will:
- Install dependencies from monorepo root
- Build using Turbo (includes types package)
- Deploy Next.js app to Amplify CDN
- Generate deployment URL: `https://main.xxxxxxxxxxxxx.amplifyapp.com`

---

## Backend Deployment (apps/api)

AWS Amplify now supports backend deployments through Amplify Hosting compute. Here's how to deploy the NestJS API:

### 1. Create Amplify App for Backend

1. **Go to AWS Amplify Console**: https://console.aws.amazon.com/amplify/
2. **Click "New app" → "Host web app"**
3. **Connect Repository**:
   - Select GitHub
   - Authorize AWS Amplify
   - Choose same repository: `Albaly-Group/selly-base-monorepo`
   - Select branch: `main` (or your deployment branch)

### 2. Configure Build Settings

1. **Set App root directory**: `apps/api`
2. **Build settings** will use the `amplify.yml` file:

```yaml
version: 1
backend:
  phases:
    preBuild:
      commands:
        - cd ../..
        - npm ci
    build:
      commands:
        - npx turbo build --filter=api
    postBuild:
      commands:
        - cp -r node_modules apps/api/dist/
  artifacts:
    baseDirectory: apps/api/dist
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### 3. Configure Environment Variables

Navigate to **App Settings → Environment variables** and add:

**For Demo/Development (No Database):**
```bash
# Skip database entirely
SKIP_DATABASE=true

# JWT Configuration (required)
JWT_SECRET=your-secure-jwt-secret-key-here
JWT_EXPIRES_IN=1d

# Node environment
NODE_ENV=production

# Port (Amplify default)
PORT=3000
```

**For Production with Database:**
```bash
# Database Configuration (recommended)
DATABASE_URL=postgresql://username:password@host:5432/database_name?sslmode=require

# JWT Configuration (required)
JWT_SECRET=your-secure-jwt-secret-key-here
JWT_EXPIRES_IN=1d

# Node environment
NODE_ENV=production

# Port (Amplify default)
PORT=3000
```

**Alternative Database Configuration (individual variables):**
```bash
# Database Configuration
DATABASE_HOST=your-rds-endpoint.rds.amazonaws.com
DATABASE_PORT=5432
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
DATABASE_NAME=your-database

# JWT Configuration (required)
JWT_SECRET=your-secure-jwt-secret-key-here
JWT_EXPIRES_IN=1d

# Node environment
NODE_ENV=production

# Port
PORT=3000
```

### 4. Configure Runtime

For backend APIs on Amplify, you may need to:

1. **Enable SSR/Compute**: 
   - Go to App Settings → General
   - Enable "SSR" or "Compute" if available
   - This allows the backend to run as a compute instance

2. **Configure Rewrites (if needed)**:
   Add in Amplify Console → App Settings → Rewrites:
   ```
   Source: /<*>
   Target: /api/index (200)
   Type: Rewrite
   ```

### 5. Deploy Backend

Click **"Save and deploy"**

The backend will:
- Install dependencies from monorepo root
- Build using Turbo (includes types package)
- Bundle with node_modules
- Deploy NestJS API to Amplify compute
- Generate API URL: `https://main.xxxxxxxxxxxxx.amplifyapp.com`

### 6. Update Frontend with Backend URL

After backend deployment:

1. Copy the backend Amplify URL
2. Go to **Frontend Amplify App** → Environment variables
3. Update `NEXT_PUBLIC_API_URL` with the backend URL
4. Redeploy frontend (or it will auto-deploy on next commit)

---

## Environment Variables Reference

### Frontend (apps/web)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | No* | `https://api.amplifyapp.com` |
| `NODE_ENV` | Node environment | Yes | `production` |

*Leave empty to use mock data for demo purposes

### Backend (apps/api)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `JWT_SECRET` | Secret for JWT signing | Yes | `your-secret-key` |
| `JWT_EXPIRES_IN` | JWT expiration time | Yes | `1d`, `7d`, `30d` |
| `NODE_ENV` | Node environment | Yes | `production` |
| `PORT` | Server port | No | `3000` (default) |
| `SKIP_DATABASE` | Skip database (demo mode) | No | `true` or `false` |
| `DATABASE_URL` | Full database connection string | No** | `postgresql://user:pass@host:5432/db` |
| `DATABASE_HOST` | Database host | No** | `rds.amazonaws.com` |
| `DATABASE_PORT` | Database port | No** | `5432` |
| `DATABASE_USERNAME` | Database username | No** | `admin` |
| `DATABASE_PASSWORD` | Database password | No** | `password` |
| `DATABASE_NAME` | Database name | No** | `selly_base` |

**Database configuration required unless `SKIP_DATABASE=true`

---

## Post-Deployment Steps

### 1. Test the Deployment

**Frontend:**
```bash
curl https://your-frontend-app.amplifyapp.com
# Should return the Next.js homepage
```

**Backend:**
```bash
# Health check
curl https://your-backend-app.amplifyapp.com/health

# API documentation
curl https://your-backend-app.amplifyapp.com/docs

# Test API endpoint
curl https://your-backend-app.amplifyapp.com/api/v1/auth/login
```

### 2. Configure Custom Domain (Optional)

1. Go to **App Settings → Domain management**
2. Add your custom domain
3. Configure DNS settings as instructed
4. Wait for SSL certificate provisioning

### 3. Setup Database (if using RDS)

If using AWS RDS for PostgreSQL:

1. Create RDS instance in same region as Amplify apps
2. Configure security groups to allow Amplify access
3. Update backend environment variables with RDS endpoint
4. Run database migrations:
   ```bash
   # Locally with connection to RDS
   export DATABASE_URL="postgresql://user:pass@rds-endpoint/db"
   npm run migration:run
   ```

### 4. Configure CI/CD

Amplify automatically sets up CI/CD:

- **Auto-deploy on push**: Enabled by default for connected branch
- **Pull request previews**: Enable in App Settings → Previews
- **Branch deployments**: Add additional branches in App Settings → Branches

---

## Monitoring and Troubleshooting

### View Build Logs

1. Go to your Amplify app
2. Click on the deployment
3. View build logs under "Build logs"
4. Check for errors in preBuild, build, or postBuild phases

### Common Issues

**Frontend build fails:**
- Check if `npm ci` completes successfully
- Verify Node version compatibility (18+)
- Check Turbo build command: `npx turbo build --filter=web`
- Review build logs for missing dependencies

**Backend build fails:**
- Check if `npm ci` completes successfully
- Verify NestJS build completes: `npx turbo build --filter=api`
- Check if node_modules copy succeeds in postBuild
- Review dist folder structure

**API not accessible:**
- Verify PORT environment variable is set correctly
- Check if backend app is configured for compute/SSR
- Verify rewrites are configured correctly
- Check CORS settings allow Amplify domains

**Frontend can't connect to backend:**
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check CORS configuration in backend includes `.amplifyapp.com`
- Test backend health endpoint directly
- Check browser console for CORS errors

**Database connection fails:**
- Verify database credentials are correct
- Check RDS security groups allow Amplify access
- Test connection string format
- Verify SSL mode matches database requirements

### Debug Mode

Enable verbose logging:

**Backend:**
```bash
# Add to environment variables
LOG_LEVEL=debug
```

**Monitor with CloudWatch:**
- AWS Amplify integrates with CloudWatch
- View logs in CloudWatch Logs console
- Set up alarms for errors or performance issues

---

## Cost Optimization

### Frontend
- **Build minutes**: 1000 free minutes/month, then $0.01/minute
- **Data transfer**: 15 GB free/month, then $0.15/GB
- **Hosting**: Free for first 5 GB stored

### Backend (Compute)
- **Compute time**: Pay per use, similar to Lambda pricing
- **Data transfer**: Standard AWS data transfer rates
- Consider using AWS Lambda for API if cost is a concern

### Tips
1. Use caching effectively (configured in amplify.yml)
2. Enable CDN for static assets
3. Use environment-specific branches (dev, staging, prod)
4. Clean up unused deployments and branches

---

## Comparison with Vercel Deployment

| Feature | AWS Amplify | Vercel |
|---------|-------------|--------|
| **Frontend Hosting** | ✅ Excellent | ✅ Excellent |
| **Backend API** | ✅ Supported (compute) | ✅ Excellent (serverless) |
| **Build Speed** | Good | Excellent |
| **Cold Start** | Some latency | Minimal |
| **Scalability** | Auto-scaling | Auto-scaling |
| **Pricing** | AWS pricing model | Generous free tier |
| **AWS Integration** | Native (RDS, S3, etc.) | Limited |
| **Custom Domains** | Included | Included |
| **Deployment** | Git-based | Git-based |

---

## Next Steps

1. ✅ Deploy frontend to Amplify
2. ✅ Deploy backend to Amplify  
3. ✅ Configure environment variables
4. ✅ Update frontend with backend URL
5. ✅ Test all API endpoints
6. ✅ Setup database if needed
7. ✅ Configure custom domain (optional)
8. ✅ Setup monitoring and alerts

## Additional Resources

- [AWS Amplify Documentation](https://docs.aws.amazon.com/amplify/)
- [Next.js on Amplify](https://docs.aws.amazon.com/amplify/latest/userguide/deploy-nextjs-app.html)
- [NestJS Documentation](https://docs.nestjs.com/)
- [Turbo Documentation](https://turbo.build/repo/docs)

## Support

For issues specific to:
- **AWS Amplify**: Check AWS Support or Amplify forums
- **This application**: Open an issue in the repository
- **Deployment guide**: Refer to [DEPLOYMENT.md](./DEPLOYMENT.md)
