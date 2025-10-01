# Docker Architecture - Selly Base Development Environment

## Overview

This document describes the Docker-based development architecture for the Selly Base application.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Development Machine                          │
│                                                                     │
│  ┌──────────────────┐         ┌──────────────────┐                │
│  │                  │         │                  │                 │
│  │   Frontend       │◄───────►│   Backend API    │                 │
│  │   (Next.js)      │  HTTP   │   (NestJS)       │                 │
│  │                  │         │                  │                 │
│  │  Port: 3000      │         │  Port: 3001      │                 │
│  └──────────────────┘         └────────┬─────────┘                 │
│                                        │                            │
│                                        │ TypeORM                    │
│                                        │ PostgreSQL Protocol        │
│                                        │                            │
│  ┌─────────────────────────────────────▼─────────────────────────┐ │
│  │              Docker Environment                                │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  PostgreSQL 16 with pgvector                             │ │ │
│  │  │  Container: selly-base-postgres                          │ │ │
│  │  │                                                           │ │ │
│  │  │  ┌────────────────┐                                      │ │ │
│  │  │  │  Extensions    │                                      │ │ │
│  │  │  ├────────────────┤                                      │ │ │
│  │  │  │ pgvector 0.8.1 │  Vector similarity search           │ │ │
│  │  │  │ pg_trgm  1.6   │  Fuzzy text search                  │ │ │
│  │  │  │ pgcrypto 1.3   │  Cryptographic functions            │ │ │
│  │  │  │ citext   1.6   │  Case-insensitive text              │ │ │
│  │  │  │ uuid-ossp 1.1  │  UUID generation                    │ │ │
│  │  │  └────────────────┘                                      │ │ │
│  │  │                                                           │ │ │
│  │  │  Port: 5432 → localhost:5432                             │ │ │
│  │  │                                                           │ │ │
│  │  │  Volume: postgres_data (persistent storage)              │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  ┌──────────────────────────────────────────────────────────┐ │ │
│  │  │  pgAdmin 4 (Optional)                                    │ │ │
│  │  │  Container: selly-base-pgadmin                           │ │ │
│  │  │  Profile: with-pgadmin                                   │ │ │
│  │  │                                                           │ │ │
│  │  │  Port: 80 → localhost:5050                               │ │ │
│  │  │                                                           │ │ │
│  │  │  Volume: pgadmin_data (persistent storage)               │ │ │
│  │  └──────────────────────────────────────────────────────────┘ │ │
│  │                                                                │ │
│  │  Network: selly-network (bridge)                              │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Frontend (apps/web)
- **Framework:** Next.js 15
- **Port:** 3000
- **Purpose:** User interface for B2B prospecting
- **Connection:** HTTP calls to Backend API

### 2. Backend API (apps/api)
- **Framework:** NestJS
- **Port:** 3001
- **Purpose:** REST API, business logic, database operations
- **Connection:** TypeORM to PostgreSQL

### 3. PostgreSQL Database (Docker Container)
- **Image:** pgvector/pgvector:pg16
- **Container:** selly-base-postgres
- **Port:** 5432 (host) → 5432 (container)
- **Database:** selly_base
- **Credentials:** postgres/postgres
- **Volume:** postgres_data (persists data between restarts)

### 4. pgAdmin (Optional Docker Container)
- **Image:** dpage/pgadmin4:latest
- **Container:** selly-base-pgadmin
- **Port:** 5050 (host) → 80 (container)
- **Profile:** with-pgadmin
- **Credentials:** admin@selly.com / admin123
- **Volume:** pgadmin_data (persists configuration)

## Data Flow

### 1. Database Initialization Flow
```
docker compose up -d postgres
         │
         ▼
Container starts with mounted volume
         │
         ▼
PostgreSQL initialization scripts run
         │
         ▼
/docker-entrypoint-initdb.d/01-schema.sql
(mounted from ./selly-base-optimized-schema.sql)
         │
         ▼
Extensions installed:
 - pgvector, pg_trgm, pgcrypto, citext, uuid-ossp
         │
         ▼
Tables created (19 tables)
         │
         ▼
Sample data inserted:
 - 3 organizations
 - 11 users
 - 4 companies
 - Roles, permissions, etc.
         │
         ▼
Database ready for connections
```

### 2. API Connection Flow
```
npm run start:dev (API)
         │
         ▼
Load .env configuration
         │
         ▼
Read DATABASE_URL=postgresql://postgres:postgres@localhost:5432/selly_base
         │
         ▼
TypeORM connects to PostgreSQL
         │
         ▼
Health check queries:
 - SELECT 1
 - SELECT 1 FROM users
 - SELECT 1 FROM organizations
         │
         ▼
✅ Database connection healthy
         │
         ▼
API ready at http://localhost:3001
```

### 3. API Request Flow
```
Frontend → HTTP Request → Backend API
                              │
                              ▼
                         Authentication
                         (JWT validation)
                              │
                              ▼
                         Authorization
                         (Role-based checks)
                              │
                              ▼
                         Business Logic
                         (Service layer)
                              │
                              ▼
                         TypeORM Repository
                              │
                              ▼
                         PostgreSQL Query
                              │
                              ▼
                         Result Processing
                              │
                              ▼
Frontend ← JSON Response ← Backend API
```

## Network Configuration

### Docker Network
- **Name:** selly-network
- **Type:** bridge
- **Purpose:** Allows containers to communicate with each other

### Port Mappings
```
Host Machine        Docker Container
─────────────       ─────────────────
localhost:5432  →   postgres:5432     (PostgreSQL)
localhost:5050  →   pgadmin:80        (pgAdmin, optional)
localhost:3001      (Backend API, runs on host)
localhost:3000      (Frontend, runs on host)
```

## Volume Configuration

### PostgreSQL Data Volume
- **Name:** postgres_data
- **Type:** Docker volume (local driver)
- **Mount:** /var/lib/postgresql/data (in container)
- **Purpose:** Persist database data between restarts
- **Size:** Grows automatically with data

### pgAdmin Data Volume (Optional)
- **Name:** pgadmin_data
- **Type:** Docker volume (local driver)
- **Mount:** /var/lib/pgadmin (in container)
- **Purpose:** Persist pgAdmin configuration and server connections
- **Size:** Small (< 100MB)

### Schema File Mount
- **Type:** Read-only bind mount
- **Source:** ./selly-base-optimized-schema.sql (host)
- **Target:** /docker-entrypoint-initdb.d/01-schema.sql (container)
- **Purpose:** Automatic schema initialization on first startup

## Security Considerations

### Development Environment
✅ **Current Setup (Safe for Development):**
- Default PostgreSQL credentials (postgres/postgres)
- Database exposed on localhost only
- No SSL/TLS required
- Sample data with test users

### Production Recommendations
⚠️ **DO NOT use this Docker setup in production!**

**For production, use:**
1. Managed database services (AWS RDS, Google Cloud SQL, Supabase)
2. Strong passwords and secrets management
3. SSL/TLS encryption for database connections
4. Network isolation and firewalls
5. Regular automated backups
6. Monitoring and alerting
7. Limited user permissions (not superuser)

## Environment Variables

### Backend API (.env)
```bash
# Database Connection
SKIP_DATABASE=false
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/selly_base
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=selly_base

# API Configuration
PORT=3001
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1d

# Database Management (Development Only)
DB_SYNC=false
DB_AUTO_MIGRATE=false
```

### Docker Compose Environment
PostgreSQL environment variables are defined in `docker-compose.yml`:
```yaml
POSTGRES_USER: postgres
POSTGRES_PASSWORD: postgres
POSTGRES_DB: selly_base
POSTGRES_INITDB_ARGS: "--encoding=UTF8 --locale=en_US.utf8"
```

## Resource Requirements

### Minimum Requirements
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Disk:** 10 GB free space
- **Docker:** 20.10.0+
- **Docker Compose:** 2.0.0+

### Recommended for Development
- **CPU:** 4+ cores
- **RAM:** 8+ GB
- **Disk:** 20+ GB SSD
- **Docker:** Latest stable version

### Container Resources
```yaml
PostgreSQL:
  - Memory: ~200-500 MB (idle), up to 2 GB (active)
  - CPU: 0.5-2 cores (depending on load)
  - Disk: ~100 MB (base) + data size

pgAdmin (optional):
  - Memory: ~100-200 MB
  - CPU: 0.1-0.5 cores
  - Disk: ~50 MB + config size
```

## Database Schema

### Tables (19 total)
```
Core Tables:
├── organizations        (Multi-tenant isolation)
├── users               (Authentication & authorization)
├── roles               (RBAC system)
└── user_roles          (User-role assignments)

Business Data:
├── companies           (Company records with pgvector embeddings)
├── company_registrations
├── company_contacts
├── company_lists       (User-created lists)
└── company_list_items  (Companies in lists)

Lead Management:
├── lead_projects
├── lead_project_companies
└── lead_project_tasks

Reference Data:
├── ref_industry_codes
├── ref_regions
└── ref_tags

Operations:
├── import_jobs
├── export_jobs
├── audit_logs
└── user_activity_logs
```

### Key Features
- **Multi-tenancy:** Organization-level data isolation
- **RBAC:** Role-based access control
- **Audit Logging:** Complete operation tracking
- **Vector Search:** AI/ML embeddings with pgvector
- **Full-text Search:** PostgreSQL tsvector with pg_trgm
- **Data Quality:** Automated scoring and validation

## Monitoring and Debugging

### Container Status
```bash
# Check running containers
docker compose ps

# View container logs
docker compose logs -f postgres
docker compose logs -f pgadmin
```

### Database Metrics
```bash
# Active connections
docker compose exec postgres psql -U postgres -d selly_base \
  -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'selly_base';"

# Database size
docker compose exec postgres psql -U postgres -d selly_base \
  -c "SELECT pg_size_pretty(pg_database_size('selly_base'));"

# Table sizes
docker compose exec postgres psql -U postgres -d selly_base \
  -c "SELECT schemaname, tablename, 
      pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
      FROM pg_tables WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"
```

### Health Checks
```bash
# Database health
docker compose exec postgres pg_isready -U postgres -d selly_base

# API health
curl http://localhost:3001/health

# pgAdmin health (if running)
curl http://localhost:5050/misc/ping
```

## Backup and Recovery

### Manual Backup
```bash
# Create backup
docker compose exec postgres pg_dump -U postgres selly_base > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker compose exec -T postgres psql -U postgres -d selly_base < backup_20250101_120000.sql
```

### Automated Backup (Recommended)
Consider using:
- **pg_dump** with cron jobs
- **pgBackRest** for production-grade backups
- **Managed database services** (AWS RDS, etc.) with automatic backups

## Scaling Considerations

### Current Setup (Single Container)
- ✅ Perfect for local development
- ✅ Easy to set up and tear down
- ✅ No external dependencies
- ❌ Not suitable for production load
- ❌ Single point of failure

### Production Scaling Options
1. **Managed Database Services**
   - AWS RDS, Google Cloud SQL, Azure Database
   - Built-in replication, backups, monitoring
   
2. **Self-Managed Replication**
   - PostgreSQL streaming replication
   - Read replicas for scaling queries
   
3. **Connection Pooling**
   - PgBouncer for connection management
   - Reduces connection overhead

## Additional Resources

- **Setup Guide:** [DOCKER_SETUP.md](DOCKER_SETUP.md)
- **Quick Reference:** [DOCKER_QUICK_REFERENCE.md](DOCKER_QUICK_REFERENCE.md)
- **Testing Guide:** [TESTING_DOCKER_SETUP.md](TESTING_DOCKER_SETUP.md)
- **API Documentation:** [apps/api/README.md](apps/api/README.md)

---

**Last Updated:** 2025-10-01  
**Version:** 1.0  
**Status:** Production-ready for development
