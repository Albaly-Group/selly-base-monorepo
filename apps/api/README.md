# Selly Base API

A NestJS-based backend API for the Selly Base B2B prospecting platform.

## Database Setup

This API uses PostgreSQL with TypeORM. The application supports two modes:

### 1. Database Disabled Mode (Demo/Development)
```bash
# Run without database (uses mock data)
SKIP_DATABASE=true npm run start:dev
```

### 2. Database Enabled Mode (Production/Full Development)
```bash
# Run with database connection
npm run start:dev
```

## Database Configuration

Configure the database using either:

**Option A: DATABASE_URL (Recommended)**
```bash
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
```

**Option B: Individual Environment Variables**
```bash
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=selly_base
```

## ⚠️ Important: Database Initialization

After configuring your database connection, you **must** initialize the database schema:

```bash
# Required: Run migrations to create all tables
npm run migration:run
```

**Why is this required?** 
- By default, schema synchronization is disabled to prevent data loss
- Migrations ensure your database has the correct schema
- This prevents "typeorm_metadata does not exist" errors

## Database Migration Commands

```bash
# Run migrations (creates tables) - REQUIRED FOR FIRST SETUP
npm run migration:run

# Show migration status
npm run migration:show

# Revert last migration
npm run migration:revert

# Generate new migration from entity changes
npm run migration:generate -- src/database/migrations/NewMigration

# Create empty migration file
npm run migration:create -- src/database/migrations/NewMigration
```

## Advanced Configuration

```bash
# Enable automatic schema synchronization (NOT recommended for production)
DB_SYNC=true npm run start:dev

# Enable automatic migration on startup
DB_AUTO_MIGRATE=true npm run start:dev
```

## Troubleshooting Database Issues

### "relation typeorm_metadata does not exist"
**Solution:** Run migrations to initialize the database schema:
```bash
npm run migration:run
```

**Root Cause:** The database exists but doesn't have the required tables. TypeORM needs either:
1. Existing tables (created by migrations), OR  
2. Schema synchronization enabled (not recommended)

**Alternative:** Enable synchronization temporarily:
```bash
DB_SYNC=true npm run start:dev
```

### Connection Refused
Check your database configuration and ensure PostgreSQL is running:
```bash
# Check if PostgreSQL is running (Linux/macOS)
sudo systemctl status postgresql
# or
brew services list | grep postgresql
```

### Database Does Not Exist
Create the database first:
```sql
CREATE DATABASE selly_base;
```

## Health Check

Check application and database status:
```bash
curl http://localhost:3001/health
```

Response examples:
```json
// Database disabled
{
  "status": "ok",
  "timestamp": "2025-09-29T20:56:05.096Z",
  "database": "disconnected"
}

// Database connected
{
  "status": "ok", 
  "timestamp": "2025-09-29T20:56:05.096Z",
  "database": "connected"
}
```

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## API Documentation

When running, visit:
- API Documentation: http://localhost:3001/docs
- Health Check: http://localhost:3001/health
- Root Endpoint: http://localhost:3001

## Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SKIP_DATABASE` | Disable database (true/false) | false | No |
| `DATABASE_URL` | Full database connection string | - | No* |
| `DATABASE_HOST` | Database host | localhost | No* |
| `DATABASE_PORT` | Database port | 5432 | No |
| `DATABASE_USER` | Database username | postgres | No* |
| `DATABASE_PASSWORD` | Database password | postgres | No* |
| `DATABASE_NAME` | Database name | selly_base | No* |
| `DB_SYNC` | Enable schema synchronization | false | No |
| `DB_AUTO_MIGRATE` | Run migrations on startup | false | No |
| `JWT_SECRET` | JWT signing secret | - | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | 1d | No |
| `NODE_ENV` | Environment mode | development | No |

*Required when database is enabled (SKIP_DATABASE != true)

## Deployment

See the main project [DEPLOYMENT.md](../../DEPLOYMENT.md) for deployment instructions.

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
