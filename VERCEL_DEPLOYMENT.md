# Vercel Deployment Guide for Separated Applications

This guide explains how to deploy the Next.js frontend and NestJS backend API as separate Vercel projects.

## Architecture Overview

Our application consists of:
- **Frontend**: Next.js application in `apps/web/` (separate Vercel project)
- **Backend**: NestJS API with serverless adapter in `apps/api/` (separate Vercel project)
- **Shared Types**: TypeScript definitions in `packages/types/`

The backend API is configured to run as Vercel serverless functions while maintaining full NestJS functionality.

## Deployment Setup

### 1. Repository Structure

```
selly-base-monorepo/
├── apps/
│   ├── web/                # Next.js frontend (Project 1)
│   │   ├── vercel.json    # Frontend configuration
│   │   └── ...
│   └── api/                # NestJS backend (Project 2)
│       ├── api/
│       │   └── index.ts   # Serverless entry point
│       ├── vercel.json    # Backend configuration
│       └── src/
│           ├── serverless.ts  # Serverless adapter
│           └── main.ts       # Traditional server (dev mode)
├── packages/types/         # Shared TypeScript types
└── package.json           # Root workspace
```

### 2. Optimized Separate Vercel Configurations

**Frontend Configuration (`apps/web/vercel.json`)**:
- Optimized build command that builds only the web app and its dependencies
- Uses Turbo's `--filter=web` to avoid building unnecessary packages
- Outputs to `.next` directory

**Backend Configuration (`apps/api/vercel.json`)**:
- Optimized build command that builds only the API and its dependencies  
- Uses Turbo's `--filter=api` to avoid building unnecessary packages
- Serverless function configuration
- Routes all requests to the API handler

### 3. Deployment Steps

#### Deploy Frontend (Project 1)

1. **Create Frontend Project**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository
   - **Root Directory**: Set to `apps/web`

2. **Configure Frontend Settings**:
   - **Build Command**: Optimized to build only web app: `cd ../.. && npm install && npx turbo build --filter=web`
   - **Output Directory**: `.next` (from vercel.json)
   - **Install Command**: `npm install` (at repository root)

3. **Environment Variables**:
   ```bash
   # Optional: Point to your API deployment
   NEXT_PUBLIC_API_URL=https://your-api-project.vercel.app
   
   # Or leave empty to use mock data
   ```

#### Deploy Backend (Project 2)

1. **Create Backend Project**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import the same Git repository
   - **Root Directory**: Set to `apps/api`

2. **Configure Backend Settings**:
   - **Build Command**: Optimized to build only API: `cd ../.. && npm install && npx turbo build --filter=api`
   - **Output Directory**: `dist` (from vercel.json)
   - **Install Command**: `npm install` (at repository root)

3. **Backend Environment Variables**:
   Configure the following in Vercel Dashboard → Settings → Environment Variables:
   
   **For Demo/Development (No Database Required):**
   ```bash
   # Skip database entirely (case-insensitive: TRUE, true, True all work)
   SKIP_DATABASE=true
   
   # JWT Configuration (required)
   JWT_SECRET=your-jwt-secret-key
   JWT_EXPIRES_IN=1d
   
   # Node Environment
   NODE_ENV=production
   ```
   
   **For Production with Database (Option A - DATABASE_URL):**
   ```bash
   # Database Configuration (Recommended - single connection string with SSL)
   DATABASE_URL=postgresql://username:password@host:5432/database_name?sslmode=require
   
   # JWT Configuration
   JWT_SECRET=your-jwt-secret-key
   JWT_EXPIRES_IN=1d
   
   # Node Environment
   NODE_ENV=production
   ```
   
   **For Production with Database (Option B - Individual Variables):**
   ```bash
   # Database Configuration (Alternative - individual variables)
   DATABASE_HOST=your-db-host
   DATABASE_PORT=5432
   DATABASE_USERNAME=your-username
   DATABASE_PASSWORD=your-password
   DATABASE_NAME=your-database
   
   # JWT Configuration
   JWT_SECRET=your-jwt-secret-key
   JWT_EXPIRES_IN=1d
   
   # Node Environment
   NODE_ENV=production
   ```

4. **Deploy**: Click "Deploy"

#### Deploy via Vercel CLI

**Frontend Deployment:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy frontend
cd apps/web
vercel

# Follow the prompts for frontend configuration
```

**Backend Deployment:**
```bash
# Deploy backend (in a separate project)
cd apps/api
vercel

# Follow the prompts for backend configuration
```

### 4. How It Works

#### Serverless Backend

The NestJS API runs as serverless functions through:

1. **Serverless Adapter** (`apps/api/src/serverless.ts`):
   - Creates a cached NestJS application instance
   - Configures Express adapter for serverless environment
   - Handles CORS, validation, and Swagger documentation

2. **Vercel Function** (`apps/api/api/index.ts`):
   - Entry point for serverless requests
   - Imports compiled NestJS application
   - Routes all requests to the NestJS app

3. **Request Flow**:
   ```
   https://your-api.vercel.app/health
   ↓
   Vercel Routes → /api/index.ts (in apps/api)
   ↓
   Serverless NestJS → AppController.getHealth()
   ↓
   Response
   ```

#### Frontend Integration

The Next.js frontend connects to the backend API:
- Configure `NEXT_PUBLIC_API_URL` to point to your API deployment
- API calls to the configured URL are routed to the serverless functions
- Both applications can be developed and deployed independently

## API Documentation

Once deployed, your API documentation is available at:
- **Swagger UI**: `https://your-api.vercel.app/docs`
- **Health Check**: `https://your-api.vercel.app/health`

## Frontend Configuration

After deploying both applications, configure the frontend to connect to the API:

1. **Set API URL Environment Variable**:
   ```bash
   # In your frontend Vercel project settings
   NEXT_PUBLIC_API_URL=https://your-api.vercel.app
   ```

2. **Alternative: Use Mock Data**:
   - Don't set `NEXT_PUBLIC_API_URL`
   - Frontend will automatically use mock data for development

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration | `1d` |

### Database Variables

**Option 1: Skip Database (Recommended for Demo)**

| Variable | Description | Example |
|----------|-------------|---------|
| `SKIP_DATABASE` | Skip database entirely | `true` |

**Option 2: Use DATABASE_URL (Recommended for Production)**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:password@host:5432/dbname?sslmode=require` |

> **SSL Support**: The `DATABASE_URL` can include SSL parameters such as `?sslmode=require` or `?ssl=true`. These parameters are automatically parsed and applied to the database connection. This is essential for most cloud database providers that require SSL connections.

**Option 3: Use Individual PostgreSQL Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_HOST` | PostgreSQL host | `your-db-host.com` |
| `DATABASE_PORT` | Database port | `5432` |
| `DATABASE_USERNAME` | Database user | `postgres` |
| `DATABASE_PASSWORD` | Database password | `your-password` |
| `DATABASE_NAME` | Database name | `selly_base` |

> **Note**: If `DATABASE_URL` is provided, it takes precedence over individual database variables. Most cloud database providers (Heroku Postgres, Supabase, Railway, etc.) provide a `DATABASE_URL` connection string which is more convenient to use.

### Setting Environment Variables

1. **Vercel Dashboard**:
   - Go to Project → Settings → Environment Variables
   - Add each variable with its value
   - Choose environment (Production, Preview, Development)

2. **Vercel CLI**:
   ```bash
   vercel env add JWT_SECRET
   vercel env add DATABASE_URL
   # OR use individual database variables:
   vercel env add DATABASE_HOST
   vercel env add DATABASE_USERNAME
   # etc...
   ```

## Development vs Production

### Development Mode
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001` (traditional NestJS server)
- API Docs: `http://localhost:3001/api/docs`

### Production Mode (Separate Vercel Projects)
- **Frontend**: `https://your-frontend.vercel.app`
- **Backend API**: `https://your-api.vercel.app`
- **API Docs**: `https://your-api.vercel.app/docs`
- **Health Check**: `https://your-api.vercel.app/health`

## Troubleshooting

### Common Issues

#### 1. Build Failures
```bash
# Check turbo build locally
npm run build

# Common fixes:
# - Ensure all dependencies are installed
# - Check TypeScript compilation errors
# - Verify environment variables
```

#### 2. Serverless Function Timeout
The default timeout is 10 seconds. For longer operations:
```json
// vercel.json
{
  "functions": {
    "api/index.ts": {
      "maxDuration": 30
    }
  }
}
```

#### 3. Database Connection Issues

**SSL Connection Errors** (e.g., "connection is insecure"):
```bash
# Add SSL parameters to your DATABASE_URL
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require

# Or use ssl=true parameter
DATABASE_URL=postgresql://user:pass@host:5432/db?ssl=true
```

**General Database Issues**:
```bash
# Enable debug logging
NODE_ENV=development

# Or skip database entirely for testing
SKIP_DATABASE=true
```

**Common Cloud Provider URLs**:
```bash
# Heroku Postgres
DATABASE_URL=postgres://user:pass@host:5432/db?sslmode=require

# Supabase
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres?sslmode=require

# Railway
DATABASE_URL=postgresql://postgres:pass@host.railway.app:5432/railway?sslmode=require
```

#### 4. Frontend Build Failures
If `apps/web` build fails on Vercel:
```bash
# Check local build first
cd apps/web && npm run build

# Common fixes:
# 1. Ensure root directory is set to "apps/web" in Vercel
# 2. Check build command: "cd ../.. && npm ci && npx turbo build --filter=web"  
# 3. Verify output directory: ".next"
# 4. Install command should be: "npm ci"
```

**CSS Build Issues on Vercel:**
```bash
# If CSS build fails with "Cannot find module 'critters'" error:
# 1. Ensure critters is listed in dependencies (not devDependencies) in apps/web/package.json
# 2. Clear Vercel build cache in dashboard and redeploy
# 3. Check that optimizeCss is enabled in next.config.mjs

# Common error during prerendering /404 page:
# Error: Cannot find module 'critters' - Fixed by moving critters to dependencies
```

#### 5. Cache Issues on Vercel
If builds appear incomplete or CSS is missing:
```bash
# Clear cache methods:
# 1. Go to Vercel Dashboard → Project → Settings → General
# 2. Scroll to "Build & Development Settings"
# 3. Clear build cache
# 4. Redeploy the project

# Or use Vercel CLI:
vercel --prod --force
```

#### 5. CORS Errors
The serverless adapter handles CORS automatically, but you can customize:
```typescript
// apps/api/src/serverless.ts
app.enableCors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://*.vercel.app', /\.vercel\.app$/] 
    : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
});
```

### Logs and Debugging

1. **Function Logs**:
   ```bash
   vercel logs
   ```

2. **Real-time Logs**:
   ```bash
   vercel logs --follow
   ```

3. **Local Testing**:
   ```bash
   vercel dev
   ```

## Limitations and Considerations

### Serverless Limitations
- **Cold Starts**: First request may be slower
- **Stateless**: No persistent state between requests
- **Timeout**: Maximum execution time limits
- **Memory**: Limited memory per function

### Database Connections
- Use connection pooling for PostgreSQL
- Consider serverless-friendly databases (PlanetScale, Supabase)
- Set `SKIP_DATABASE=true` for demo deployments

### File Uploads
- Use external storage (AWS S3, Cloudinary)
- Vercel has file size limits for serverless functions

## Benefits of Separate Deployments

### Advantages
- **Independent Scaling**: Frontend and backend scale independently
- **Separate Teams**: Different teams can deploy independently
- **Environment Isolation**: Different environment variables and configurations
- **Technology Flexibility**: Easier to migrate to different platforms if needed

### Considerations
- **CORS Configuration**: Need to configure CORS between domains
- **Environment Variables**: Must set `NEXT_PUBLIC_API_URL` in frontend
- **Two Deployments**: Requires managing two separate Vercel projects

## Next Steps

1. **Custom Domain**: Add your domain in Vercel Dashboard
2. **Monitoring**: Set up error tracking (Sentry, LogRocket)
3. **Analytics**: Configure Vercel Analytics
4. **Performance**: Monitor function performance and optimize

## Support

For deployment issues:
- Check [Vercel Documentation](https://vercel.com/docs)
- Review function logs with `vercel logs`
- Test locally with `vercel dev`