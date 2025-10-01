# Docker Setup Guide - PostgreSQL with pgvector

This guide explains how to set up a local PostgreSQL database with the pgvector extension for full backend development and testing.

## Quick Start

### 1. Start PostgreSQL with Docker Compose

```bash
# Start PostgreSQL with pgvector
docker-compose up -d postgres

# View logs to confirm successful startup
docker-compose logs -f postgres
```

The database will automatically:
- Install PostgreSQL 16 with pgvector extension
- Create database `selly_base`
- Run the schema file `selly-base-optimized-schema.sql`
- Install all required extensions (pgvector, pg_trgm, pgcrypto, citext, uuid-ossp)

### 2. Configure the API

```bash
# Copy Docker environment configuration
cp .env.docker apps/api/.env

# Or manually set these in apps/api/.env:
SKIP_DATABASE=false
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/selly_base
```

### 3. Start the Backend API

```bash
# From repository root
npm run dev

# Or start API only
cd apps/api && npm run start:dev
```

### 4. Verify Database Connection

Visit http://localhost:3001/api/health to check database connectivity.

## Optional: pgAdmin for Database Management

To start pgAdmin (web-based database management tool):

```bash
# Start with pgAdmin
docker-compose --profile with-pgadmin up -d

# Access pgAdmin at http://localhost:5050
# Email: admin@selly.com
# Password: admin123
```

### Connect to Database in pgAdmin:

1. Open http://localhost:5050
2. Login with the credentials above
3. Right-click "Servers" → "Register" → "Server"
4. **General Tab:**
   - Name: `Selly Base Local`
5. **Connection Tab:**
   - Host: `postgres` (use container name within Docker network)
   - Port: `5432`
   - Database: `selly_base`
   - Username: `postgres`
   - Password: `postgres`

## Database Details

### Connection Information

- **Host:** localhost
- **Port:** 5432
- **Database:** selly_base
- **Username:** postgres
- **Password:** postgres

### Installed Extensions

The schema automatically installs these PostgreSQL extensions:

- **pgvector** - Vector similarity search for AI embeddings
- **pg_trgm** - Trigram-based fuzzy text search
- **pgcrypto** - Cryptographic functions
- **citext** - Case-insensitive text type
- **uuid-ossp** - UUID generation functions

### Sample Data

The schema includes sample data:

- **Organizations:**
  - Albaly Digital (550e8400-e29b-41d4-a716-446655440000)
  - Sample Enterprise (550e8400-e29b-41d4-a716-446655440010)

- **Users:**
  - admin@albaly.com / Admin User
  - staff@albaly.com / Staff User
  - admin@sampleenterprise.com / Legacy Admin

## Common Commands

```bash
# Start database
docker-compose up -d postgres

# Stop database
docker-compose down

# Stop and remove all data (WARNING: deletes all data!)
docker-compose down -v

# View logs
docker-compose logs -f postgres

# Access PostgreSQL CLI
docker-compose exec postgres psql -U postgres -d selly_base

# Restart database
docker-compose restart postgres

# Check database status
docker-compose ps
```

## Troubleshooting

### Database Connection Refused

**Problem:** API cannot connect to database

**Solutions:**
1. Check if PostgreSQL is running:
   ```bash
   docker-compose ps
   ```

2. Wait for database to be ready:
   ```bash
   docker-compose logs postgres | grep "ready to accept connections"
   ```

3. Test connection manually:
   ```bash
   docker-compose exec postgres psql -U postgres -d selly_base -c "SELECT version();"
   ```

### Port Already in Use

**Problem:** Port 5432 is already in use

**Solution:** Stop existing PostgreSQL service or change port:

```bash
# Check what's using port 5432
sudo lsof -i :5432

# Option 1: Stop existing PostgreSQL
sudo systemctl stop postgresql

# Option 2: Change port in docker-compose.yml
# Edit the ports section to use different port:
# ports:
#   - "5433:5432"
# Then update DATABASE_URL:
# DATABASE_URL=postgresql://postgres:postgres@localhost:5433/selly_base
```

### Schema Not Loaded

**Problem:** Tables don't exist even though database is running

**Solution:** Reinitialize database:

```bash
# Stop and remove volumes
docker-compose down -v

# Start fresh
docker-compose up -d postgres

# Check logs to confirm schema was loaded
docker-compose logs postgres | grep "CREATE TABLE"
```

### Permission Issues

**Problem:** Permission denied when accessing database files

**Solution:** Fix volume permissions:

```bash
# Remove volumes and restart
docker-compose down -v
docker-compose up -d postgres
```

### pgvector Extension Not Found

**Problem:** "extension pgvector does not exist"

**Solution:** Verify you're using the correct Docker image:

```bash
# Check image
docker-compose config | grep image

# Should show: pgvector/pgvector:pg16
# If not, pull the correct image:
docker-compose pull postgres
docker-compose up -d postgres
```

## Manual Database Management

### Connect with psql

```bash
# Interactive SQL shell
docker-compose exec postgres psql -U postgres -d selly_base

# Run single query
docker-compose exec postgres psql -U postgres -d selly_base -c "SELECT COUNT(*) FROM companies;"
```

### Backup Database

```bash
# Backup to file
docker-compose exec postgres pg_dump -U postgres selly_base > backup.sql

# Restore from file
docker-compose exec -T postgres psql -U postgres -d selly_base < backup.sql
```

### Reset Database

```bash
# Stop and remove everything
docker-compose down -v

# Start fresh (automatically runs schema)
docker-compose up -d postgres
```

## Production Considerations

⚠️ **WARNING:** This Docker setup is for local development only!

For production deployment:

1. **Use Managed Database Services:**
   - AWS RDS for PostgreSQL
   - Google Cloud SQL
   - Supabase
   - Railway
   - Heroku Postgres

2. **Security:**
   - Change default passwords
   - Use environment variables
   - Enable SSL/TLS connections
   - Restrict network access

3. **Backup Strategy:**
   - Enable automated backups
   - Test restore procedures
   - Store backups securely

4. **Monitoring:**
   - Set up health checks
   - Monitor connection pools
   - Track query performance

## Additional Resources

- **pgvector Documentation:** https://github.com/pgvector/pgvector
- **PostgreSQL Official Docs:** https://www.postgresql.org/docs/16/
- **Docker Compose Reference:** https://docs.docker.com/compose/
- **API README:** [apps/api/README.md](apps/api/README.md)

## Next Steps

After setting up Docker:

1. ✅ Start the frontend: `cd apps/web && npm run dev`
2. ✅ Test API endpoints: http://localhost:3001/api/docs
3. ✅ Use pgAdmin to explore data: http://localhost:5050
4. ✅ Run tests: `npm test`

---

**Need Help?** Check the main [README.md](README.md) or [apps/api/README.md](apps/api/README.md)
