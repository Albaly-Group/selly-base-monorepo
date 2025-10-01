# Docker Quick Reference - Selly Base Database

## Quick Start Commands

```bash
# Start database (easiest)
./start-database.sh

# Stop database
./stop-database.sh

# Start database manually
docker compose up -d postgres

# Start with pgAdmin
docker compose --profile with-pgadmin up -d
```

## Common Commands

### Database Management

```bash
# Check status
docker compose ps

# View logs
docker compose logs postgres
docker compose logs -f postgres    # Follow logs

# Restart database
docker compose restart postgres

# Stop database (keeps data)
docker compose down

# Stop and remove all data (⚠️ WARNING: destructive!)
docker compose down -v
```

### Database Access

```bash
# Connect to PostgreSQL CLI
docker compose exec postgres psql -U postgres -d selly_base

# Run a single SQL query
docker compose exec postgres psql -U postgres -d selly_base -c "SELECT COUNT(*) FROM companies;"

# List all tables
docker compose exec postgres psql -U postgres -d selly_base -c "\dt"

# List all extensions
docker compose exec postgres psql -U postgres -d selly_base -c "\dx"

# Show table structure
docker compose exec postgres psql -U postgres -d selly_base -c "\d users"
```

### Backup & Restore

```bash
# Backup database
docker compose exec postgres pg_dump -U postgres selly_base > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
docker compose exec -T postgres psql -U postgres -d selly_base < backup_20250101_120000.sql

# Copy backup from container
docker compose cp postgres:/tmp/backup.sql ./backup.sql
```

### Troubleshooting

```bash
# Check if database is ready
docker compose exec postgres pg_isready -U postgres -d selly_base

# View database size
docker compose exec postgres psql -U postgres -d selly_base -c "SELECT pg_size_pretty(pg_database_size('selly_base'));"

# Kill all connections (if stuck)
docker compose exec postgres psql -U postgres -d selly_base -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'selly_base' AND pid <> pg_backend_pid();"

# Force restart
docker compose restart postgres

# Complete reset (⚠️ destroys all data!)
docker compose down -v && docker compose up -d postgres
```

## pgAdmin Access

```bash
# Start pgAdmin
docker compose --profile with-pgadmin up -d

# Access pgAdmin
open http://localhost:5050

# Stop pgAdmin
docker compose --profile with-pgadmin down
```

**pgAdmin Credentials:**
- URL: http://localhost:5050
- Email: admin@selly.com
- Password: admin123

**Database Connection in pgAdmin:**
- Host: `postgres` (container name)
- Port: 5432
- Database: selly_base
- Username: postgres
- Password: postgres

## Connection Strings

### From Host Machine (for API)
```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/selly_base
```

### From Docker Network (for containers)
```bash
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/selly_base
```

## Environment Setup

```bash
# Copy Docker environment for API
cp .env.docker apps/api/.env

# Or manually set in apps/api/.env:
SKIP_DATABASE=false
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/selly_base
```

## Useful SQL Queries

```sql
-- Check pgvector extension
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';

-- List all extensions
SELECT * FROM pg_extension;

-- Count records in tables
SELECT 'users' as table_name, COUNT(*) FROM users
UNION ALL
SELECT 'organizations', COUNT(*) FROM organizations
UNION ALL
SELECT 'companies', COUNT(*) FROM companies;

-- View sample organizations
SELECT name, slug, status FROM organizations;

-- View sample users
SELECT email, name, status FROM users LIMIT 10;

-- Check database size
SELECT 
    pg_size_pretty(pg_database_size('selly_base')) as database_size;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

## Docker Compose Profiles

The docker-compose.yml supports profiles for optional services:

```bash
# Default (only PostgreSQL)
docker compose up -d

# With pgAdmin
docker compose --profile with-pgadmin up -d

# Stop specific profile
docker compose --profile with-pgadmin down
```

## Health Checks

```bash
# Check container health
docker compose ps

# Manual health check
docker compose exec postgres pg_isready -U postgres

# Check API health (when running)
curl http://localhost:3001/api/health
```

## Performance

```bash
# View active connections
docker compose exec postgres psql -U postgres -d selly_base -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'selly_base';"

# View slow queries (if enabled)
docker compose exec postgres psql -U postgres -d selly_base -c "SELECT query, calls, total_time, mean_time FROM pg_stat_statements ORDER BY mean_time DESC LIMIT 10;"

# Cache hit ratio
docker compose exec postgres psql -U postgres -d selly_base -c "SELECT sum(heap_blks_read) as heap_read, sum(heap_blks_hit) as heap_hit, sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)) as ratio FROM pg_statio_user_tables;"
```

## Additional Resources

- Full Documentation: [DOCKER_SETUP.md](DOCKER_SETUP.md)
- API Documentation: [apps/api/README.md](apps/api/README.md)
- Main README: [README.md](README.md)

---

💡 **Tip:** Bookmark this page for quick reference while developing!
