# Selly Base API

A NestJS-based backend API for the Selly Base B2B prospecting platform.

## Database Setup

This API uses PostgreSQL with TypeORM. The application supports three modes:

### 1. Database Disabled Mode (Demo/Development)
```bash
# Run without database (uses mock data)
SKIP_DATABASE=true npm run start:dev
```

### 2. Docker PostgreSQL with pgvector (Recommended for Full Testing) 🐳

The easiest way to test the full backend with a real database:

```bash
# From repository root, start PostgreSQL with pgvector
docker-compose up -d postgres

# Copy Docker environment configuration
cp ../../.env.docker .env

# Start the API
npm run start:dev
```

**What this gives you:**
- ✅ PostgreSQL 16 with pgvector extension
- ✅ Automatic schema initialization from `selly-base-optimized-schema.sql`
- ✅ All required extensions (pgvector, pg_trgm, pgcrypto, citext, uuid-ossp)
- ✅ Sample data pre-loaded
- ✅ Ready to use in seconds

**Optional:** Start pgAdmin for database management:
```bash
docker-compose --profile with-pgadmin up -d
# Access at http://localhost:5050 (admin@selly.com / admin123)
```

📖 **See detailed Docker guide:** [../../DOCKER_SETUP.md](../../DOCKER_SETUP.md)

### 3. Manual PostgreSQL Setup (Production/Custom Setup)

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

## ⚠️ Important: Database Initialization (Manual Setup Only)

**Note:** If using Docker (recommended), schema is automatically initialized. Skip this section.

After configuring your database connection manually, you **must** initialize the database schema:

```bash
# Required: Run the SQL schema file to create all tables
psql -U postgres -d selly_base -f ../../selly-base-optimized-schema.sql
```

**Why is this required?** 
- The database schema includes many PostgreSQL extensions (pgcrypto, vector, pg_trgm, etc.)
- The SQL file creates all tables, indexes, and triggers in one go
- This prevents "relation does not exist" errors

**Alternative: TypeORM Migrations**
If you prefer using TypeORM migrations for development:
```bash
# Enable automatic migration on startup
DB_AUTO_MIGRATE=true npm run start:dev

# Or run migrations manually
npm run migration:run
```

## Database Migration Commands

```bash
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

### "relation 'users' does not exist" or "relation 'organizations' does not exist"
**Solution:** Initialize the database schema using the SQL file:
```bash
psql -U postgres -d selly_base -f selly-base-optimized-schema.sql
```

**Root Cause:** The database exists but doesn't have the required tables. The schema hasn't been initialized yet.

**Temporary Workaround:** The application will automatically fall back to mock authentication when tables don't exist, but this is NOT suitable for production. You'll see these warnings in the logs:
```
❌ Database tables not found. Please initialize schema: psql -U postgres -d selly_base -f selly-base-optimized-schema.sql
💡 Falling back to mock authentication. This is not suitable for production!
```

**Alternative Solutions:**
1. Enable automatic migration on startup (uses TypeORM migrations):
   ```bash
   DB_AUTO_MIGRATE=true npm run start:dev
   ```
2. Enable schema synchronization (NOT recommended for production):
   ```bash
   DB_SYNC=true npm run start:dev
   ```

### "relation typeorm_metadata does not exist"
**Solution:** Initialize the database schema using the SQL file:
```bash
psql -U postgres -d selly_base -f selly-base-optimized-schema.sql
```

**Root Cause:** The database exists but doesn't have the required tables. TypeORM needs either:
1. Existing tables (created by the SQL schema file), OR  
2. Schema synchronization enabled (not recommended)

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
