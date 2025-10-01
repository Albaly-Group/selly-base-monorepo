# Testing Docker Setup - Complete Walkthrough

This guide demonstrates the complete Docker setup for testing the full backend with PostgreSQL and pgvector.

## Prerequisites

- Docker and Docker Compose installed
- Node.js 18+ installed
- npm installed

## Step-by-Step Testing Guide

### 1. Start PostgreSQL with pgvector

**Option A: Using Helper Script (Recommended)**
```bash
./start-database.sh
```

**Option B: Using Docker Compose Directly**
```bash
docker compose up -d postgres
```

**Expected Output:**
```
✅ PostgreSQL is ready!
🔍 Verifying PostgreSQL extensions...
 citext    | 1.6     | case-insensitive character strings
 pg_trgm   | 1.6     | text similarity measurement
 pgcrypto  | 1.3     | cryptographic functions
 uuid-ossp | 1.1     | UUID generation
 vector    | 0.8.1   | vector data type and ivfflat/hnsw access
```

### 2. Verify Database is Running

```bash
# Check container status
docker compose ps

# View PostgreSQL logs
docker compose logs postgres | tail -20

# Test database connection
docker compose exec postgres pg_isready -U postgres -d selly_base
```

**Expected Output:**
```
/var/run/postgresql:5432 - accepting connections
```

### 3. Verify Schema and Extensions

```bash
# Check installed extensions
docker compose exec postgres psql -U postgres -d selly_base -c "\dx"

# List all tables
docker compose exec postgres psql -U postgres -d selly_base -c "\dt"

# Count sample data
docker compose exec postgres psql -U postgres -d selly_base -c "
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'organizations', COUNT(*) FROM organizations
UNION ALL
SELECT 'companies', COUNT(*) FROM companies;
"
```

**Expected Output:**
```
 table_name    | count 
---------------+-------
 users         |    11
 organizations |     3
 companies     |     4
```

### 4. Configure the API

```bash
# Install dependencies (if not already done)
npm install

# Copy Docker environment configuration
cp .env.docker apps/api/.env

# Verify configuration
cat apps/api/.env | grep DATABASE_URL
```

**Expected Output:**
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/selly_base
```

### 5. Start the Backend API

```bash
# Start from repository root
npm run dev

# Or start API only
cd apps/api && npm run start:dev
```

**Expected Output:**
```
[Nest] LOG [NestFactory] Starting Nest application...
🔧 Database configuration loaded for: selly_base@localhost:5432
[Nest] LOG [DatabaseHealthService] ✅ Database connection is healthy
🚀 NestJS API is running on http://localhost:3001
📚 API Documentation available at http://localhost:3001/docs
```

### 6. Test API Endpoints

**Health Check:**
```bash
curl http://localhost:3001/health | jq .
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-01T11:09:58.755Z",
  "database": "connected"
}
```

**Test Company Search (requires authentication):**
```bash
# First, login to get a token
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@albaly.com", "password": "password123"}'

# Use the token to search companies
# (Replace <TOKEN> with the actual token from login response)
curl http://localhost:3001/api/v1/companies/search \
  -H "Authorization: Bearer <TOKEN>" | jq .
```

### 7. Access Database Management (Optional)

**Start pgAdmin:**
```bash
docker compose --profile with-pgadmin up -d
```

**Access pgAdmin:**
1. Open http://localhost:5050 in your browser
2. Login with:
   - Email: admin@selly.com
   - Password: admin123
3. Add Server:
   - Name: Selly Base Local
   - Host: `postgres` (container name)
   - Port: 5432
   - Database: selly_base
   - Username: postgres
   - Password: postgres

### 8. Verify pgvector Extension

**Test vector operations:**
```bash
docker compose exec postgres psql -U postgres -d selly_base -c "
-- Check vector extension version
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

-- Test vector column (if companies have embeddings)
SELECT name_en, embedding_vector IS NOT NULL as has_embedding 
FROM companies 
LIMIT 5;
"
```

### 9. Monitor Database Activity

**View active connections:**
```bash
docker compose exec postgres psql -U postgres -d selly_base -c "
SELECT 
  count(*) as active_connections,
  datname as database
FROM pg_stat_activity 
WHERE datname = 'selly_base'
GROUP BY datname;
"
```

**Check database size:**
```bash
docker compose exec postgres psql -U postgres -d selly_base -c "
SELECT pg_size_pretty(pg_database_size('selly_base')) as database_size;
"
```

### 10. Stop Everything

**Stop API:**
```bash
# Press Ctrl+C in the terminal running the API

# Or from another terminal
pkill -f "nest start"
```

**Stop Database:**
```bash
# Using helper script
./stop-database.sh

# Or using Docker Compose
docker compose down

# To remove all data as well (⚠️ WARNING: destructive!)
docker compose down -v
```

## Common Testing Scenarios

### Scenario 1: Test Fresh Database

```bash
# Remove all data and restart
docker compose down -v
docker compose up -d postgres
cp .env.docker apps/api/.env
cd apps/api && npm run start:dev
```

### Scenario 2: Test with Existing Data

```bash
# Keep existing data, just restart
docker compose restart postgres
cd apps/api && npm run start:dev
```

### Scenario 3: Test Schema Updates

```bash
# Stop everything
docker compose down -v

# Update schema file (if needed)
# Edit: selly-base-optimized-schema.sql

# Restart with new schema
docker compose up -d postgres
cd apps/api && npm run start:dev
```

### Scenario 4: Backup and Restore

```bash
# Backup
docker compose exec postgres pg_dump -U postgres selly_base > backup.sql

# Stop and remove data
docker compose down -v

# Start fresh
docker compose up -d postgres

# Restore
docker compose exec -T postgres psql -U postgres -d selly_base < backup.sql
```

## Verification Checklist

Use this checklist to verify your Docker setup is working correctly:

- [ ] Docker containers are running (`docker compose ps`)
- [ ] PostgreSQL is accepting connections (`pg_isready`)
- [ ] All 5 extensions are installed (vector, pg_trgm, pgcrypto, citext, uuid-ossp)
- [ ] All 19 tables are created (`\dt` in psql)
- [ ] Sample data is loaded (11 users, 3 organizations, 4 companies)
- [ ] API connects to database successfully
- [ ] Health endpoint returns `"database": "connected"`
- [ ] pgAdmin can connect (if using with-pgadmin profile)

## Troubleshooting

### Issue: API Cannot Connect to Database

**Solution:**
1. Check if PostgreSQL is running: `docker compose ps`
2. Check PostgreSQL logs: `docker compose logs postgres`
3. Verify port 5432 is not in use by another service
4. Test connection manually: `docker compose exec postgres pg_isready`

### Issue: Schema Not Initialized

**Solution:**
```bash
# Reinitialize database
docker compose down -v
docker compose up -d postgres
docker compose logs postgres | grep "CREATE TABLE"
```

### Issue: Port 5432 Already in Use

**Solution:**
```bash
# Find what's using the port
sudo lsof -i :5432

# Stop existing PostgreSQL
sudo systemctl stop postgresql

# Or change port in docker-compose.yml to 5433
```

### Issue: Permission Denied

**Solution:**
```bash
# Remove volumes and restart
docker compose down -v
docker compose up -d postgres
```

## Performance Testing

### Test Database Query Performance

```bash
docker compose exec postgres psql -U postgres -d selly_base -c "
EXPLAIN ANALYZE 
SELECT * FROM companies 
WHERE name_en ILIKE '%technology%'
LIMIT 10;
"
```

### Test Vector Similarity Search (when data available)

```bash
docker compose exec postgres psql -U postgres -d selly_base -c "
-- Example vector similarity search
-- This requires actual embedding data in the database
SELECT name_en, 
       embedding_vector <=> '[0.1, 0.2, ...]' as distance
FROM companies 
WHERE embedding_vector IS NOT NULL
ORDER BY distance
LIMIT 5;
"
```

## Next Steps

After verifying the Docker setup:

1. ✅ Start the frontend: `cd apps/web && npm run dev`
2. ✅ Explore API documentation: http://localhost:3001/docs
3. ✅ Use pgAdmin for data management: http://localhost:5050
4. ✅ Run tests: `npm test` (when implemented)
5. ✅ Read full documentation: [DOCKER_SETUP.md](DOCKER_SETUP.md)

## Additional Resources

- **Docker Setup Guide:** [DOCKER_SETUP.md](DOCKER_SETUP.md)
- **Quick Reference:** [DOCKER_QUICK_REFERENCE.md](DOCKER_QUICK_REFERENCE.md)
- **API Documentation:** [apps/api/README.md](apps/api/README.md)
- **Main README:** [README.md](README.md)

---

**Status:** ✅ Docker setup verified and tested successfully!
