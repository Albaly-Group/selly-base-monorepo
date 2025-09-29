# Vercel Deployment Guide for Full-Stack Application

This guide explains how to deploy both the Next.js frontend and NestJS backend API to Vercel as a unified full-stack application.

## Architecture Overview

Our application consists of:
- **Frontend**: Next.js application in `apps/web/`
- **Backend**: NestJS API with serverless adapter in `apps/api/`
- **Shared Types**: TypeScript definitions in `packages/types/`

The backend API is configured to run as Vercel serverless functions while maintaining full NestJS functionality.

## Deployment Setup

### 1. Repository Structure

```
selly-base-monorepo/
├── api/                     # Vercel serverless function
│   └── index.ts            # Serverless entry point
├── apps/
│   ├── web/                # Next.js frontend
│   └── api/                # NestJS backend
│       └── src/
│           ├── serverless.ts  # Serverless adapter
│           └── main.ts       # Traditional server (dev mode)
├── packages/types/         # Shared TypeScript types
├── vercel.json            # Vercel configuration
└── package.json           # Root workspace
```

### 2. Vercel Configuration

The `vercel.json` file configures:
- **Frontend**: Next.js application from `apps/web/`
- **Backend**: Serverless function from `api/index.ts`
- **Routing**: API requests to `/api/*` route to the serverless function

### 3. Deployment Steps

#### Option A: Deploy from Vercel Dashboard

1. **Connect Repository**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your Git repository

2. **Configure Project Settings**:
   - **Build Command**: `npm run build` (automatically detected)
   - **Output Directory**: `apps/web/.next` (automatically configured)
   - **Install Command**: `npm install` (automatically detected)
   - **Root Directory**: Leave empty (deploy from repository root)

3. **Environment Variables**:
   Configure the following in Vercel Dashboard → Settings → Environment Variables:
   
   ```bash
   # Database Configuration (if using PostgreSQL)
   DATABASE_HOST=your-db-host
   DATABASE_PORT=5432
   DATABASE_USERNAME=your-username
   DATABASE_PASSWORD=your-password
   DATABASE_NAME=your-database
   
   # JWT Configuration
   JWT_SECRET=your-jwt-secret-key
   JWT_EXPIRES_IN=1d
   
   # Optional: Skip database for demo mode
   SKIP_DATABASE=true
   
   # Node Environment
   NODE_ENV=production
   ```

4. **Deploy**: Click "Deploy"

#### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from repository root
vercel

# Follow the prompts:
# - Set up and deploy "selly-base-monorepo"? [Y/n] y
# - Which scope? Select your team/personal account
# - Link to existing project? [y/N] n
# - What's your project's name? selly-base-api
# - In which directory is your code located? ./
```

### 4. How It Works

#### Serverless Backend

The NestJS API runs as serverless functions through:

1. **Serverless Adapter** (`apps/api/src/serverless.ts`):
   - Creates a cached NestJS application instance
   - Configures Express adapter for serverless environment
   - Handles CORS, validation, and Swagger documentation

2. **Vercel Function** (`api/index.ts`):
   - Entry point for serverless requests
   - Imports compiled NestJS application
   - Routes all requests to the NestJS app

3. **Request Flow**:
   ```
   https://your-app.vercel.app/api/health
   ↓
   Vercel Routes → /api/index.ts
   ↓
   Serverless NestJS → AppController.getHealth()
   ↓
   Response
   ```

#### Frontend Integration

The Next.js frontend automatically works with the serverless backend:
- API calls to `/api/*` are routed to the serverless functions
- No additional configuration needed
- Same codebase works for development and production

## API Documentation

Once deployed, your API documentation is available at:
- **Swagger UI**: `https://your-app.vercel.app/api/docs`
- **Health Check**: `https://your-app.vercel.app/api/health`

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `JWT_SECRET` | JWT signing secret | `your-secret-key` |
| `JWT_EXPIRES_IN` | Token expiration | `1d` |

### Database Variables (Optional)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | Database port | `5432` |
| `DATABASE_USERNAME` | Database user | `postgres` |
| `DATABASE_PASSWORD` | Database password | `password` |
| `DATABASE_NAME` | Database name | `selly_base` |
| `SKIP_DATABASE` | Skip DB for demo mode | `true` |

### Setting Environment Variables

1. **Vercel Dashboard**:
   - Go to Project → Settings → Environment Variables
   - Add each variable with its value
   - Choose environment (Production, Preview, Development)

2. **Vercel CLI**:
   ```bash
   vercel env add JWT_SECRET
   vercel env add DATABASE_HOST
   ```

## Development vs Production

### Development Mode
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:3001` (traditional NestJS server)
- API Docs: `http://localhost:3001/api/docs`

### Production Mode (Vercel)
- Frontend + Backend: `https://your-app.vercel.app`
- API Docs: `https://your-app.vercel.app/api/docs`
- Health Check: `https://your-app.vercel.app/api/health`

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
```bash
# Enable debug logging
NODE_ENV=development

# Or skip database entirely
SKIP_DATABASE=true
```

#### 4. CORS Errors
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

## Migration from Separate Deployments

If you previously deployed frontend and backend separately:

1. **Update Frontend Environment**:
   ```bash
   # Remove separate API URL
   # The API is now available at the same domain
   unset NEXT_PUBLIC_API_URL
   ```

2. **Database Migration**:
   - Keep existing database
   - Update connection details in Vercel environment variables

3. **DNS Updates**:
   - Frontend and API now share the same domain
   - Update any external integrations

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