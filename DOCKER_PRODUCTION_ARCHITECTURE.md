# Docker Production Architecture Diagram

## Complete System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                               INTERNET                                      │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ HTTPS/HTTP
                                    │
                        ┌───────────▼──────────┐
                        │   DNS Resolution     │
                        │  sellybase.albaly.jp │
                        │  api.sellybase...    │
                        └───────────┬──────────┘
                                    │
                        ┌───────────▼──────────────────────────────────────┐
                        │         FIREWALL / SECURITY GROUP                │
                        │  Rules: 80 (HTTP), 443 (HTTPS), 22 (SSH)        │
                        └───────────┬──────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼──────────────────────────────────────────┐
│                            SERVER / EC2 INSTANCE                              │
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────────┐  │
│   │                         TRAEFIK CONTAINER                             │  │
│   │                    (Reverse Proxy & Load Balancer)                    │  │
│   │                                                                       │  │
│   │  ┌─────────────────────────────────────────────────────────────┐    │  │
│   │  │                    Entry Points                              │    │  │
│   │  │  • Port 80  (HTTP)  → Redirect to HTTPS                     │    │  │
│   │  │  • Port 443 (HTTPS) → Handle requests                       │    │  │
│   │  │  • Port 8080 (Dashboard) → Traefik UI                       │    │  │
│   │  └─────────────────────────────────────────────────────────────┘    │  │
│   │                                                                       │  │
│   │  ┌─────────────────────────────────────────────────────────────┐    │  │
│   │  │                SSL/TLS Certificates                          │    │  │
│   │  │  • Let's Encrypt (automatic)                                │    │  │
│   │  │  • Auto-renewal                                             │    │  │
│   │  │  • TLS-ALPN-01, HTTP-01, or DNS-01 challenge               │    │  │
│   │  └─────────────────────────────────────────────────────────────┘    │  │
│   │                                                                       │  │
│   │  ┌─────────────────────────────────────────────────────────────┐    │  │
│   │  │                    Middlewares                               │    │  │
│   │  │  • Rate Limiting                                            │    │  │
│   │  │  • Security Headers (HSTS, XSS, Frame Options)             │    │  │
│   │  │  • Compression (gzip)                                       │    │  │
│   │  │  • CORS Headers                                             │    │  │
│   │  └─────────────────────────────────────────────────────────────┘    │  │
│   │                                                                       │  │
│   │  ┌─────────────────────────────────────────────────────────────┐    │  │
│   │  │                       Routing                                │    │  │
│   │  │  sellybase.albaly.jp        → Frontend Container            │    │  │
│   │  │  api.sellybase.albaly.jp    → Backend Container             │    │  │
│   │  │  traefik.sellybase.albaly.jp → Traefik Dashboard            │    │  │
│   │  └─────────────────────────────────────────────────────────────┘    │  │
│   └───────────────────────────┬───────────────────────────────────────────┘  │
│                               │                                               │
│                    ┌──────────┴──────────┐                                   │
│                    │                     │                                   │
│   ┌────────────────▼───────┐  ┌─────────▼──────────┐                        │
│   │  FRONTEND CONTAINER    │  │  BACKEND CONTAINER │                        │
│   │      (Next.js)         │  │     (NestJS)       │                        │
│   │                        │  │                    │                        │
│   │  • Port: 3000          │  │  • Port: 3001      │                        │
│   │  • User: nextjs        │  │  • User: nestjs    │                        │
│   │  • Health Check: ✓     │  │  • Health Check: ✓ │                        │
│   │  • Production Build    │  │  • Production Build│                        │
│   │  • Compression ✓       │  │  • JWT Auth ✓      │                        │
│   │                        │  │  • Swagger Docs ✓  │                        │
│   └────────────────────────┘  └─────────┬──────────┘                        │
│                                          │                                   │
│                                          │ Database Connection               │
│                                          │ (Internal Network)                │
│                               ┌──────────▼──────────┐                        │
│                               │ POSTGRESQL CONTAINER│                        │
│                               │    + pgvector       │                        │
│                               │                     │                        │
│                               │  • Port: 5432       │                        │
│                               │  • User: postgres   │                        │
│                               │  • Health Check: ✓  │                        │
│                               │  • Persistent Vol. ✓│                        │
│                               │  • Not Exposed ✓    │                        │
│                               └─────────────────────┘                        │
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────┐     │
│   │                    DOCKER NETWORK (Bridge)                        │     │
│   │  Name: selly-network                                             │     │
│   │  Subnet: 172.25.0.0/16                                           │     │
│   │  Isolation: Internal communication only                          │     │
│   └───────────────────────────────────────────────────────────────────┘     │
│                                                                               │
│   ┌───────────────────────────────────────────────────────────────────┐     │
│   │                         VOLUMES                                   │     │
│   │  • postgres_data        (Database persistence)                   │     │
│   │  • traefik-certificates (SSL certificates)                       │     │
│   │  • backups/             (Database backups - host)                │     │
│   └───────────────────────────────────────────────────────────────────┘     │
│                                                                               │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Request Flow Diagram

### Frontend Request Flow

```
User Browser
    │
    │ 1. Request: https://sellybase.albaly.jp
    │
    ▼
Traefik (Port 443)
    │
    │ 2. SSL Termination
    │ 3. Apply Middlewares (Security Headers, Compression)
    │ 4. Route based on Host header
    │
    ▼
Frontend Container (Next.js)
    │
    │ 5. Serve HTML/CSS/JS
    │ 6. Make API calls to api.sellybase.albaly.jp
    │
    ◄───┐
        │ 7. Return response
        │
User Browser
```

### API Request Flow

```
User Browser / Frontend
    │
    │ 1. Request: https://api.sellybase.albaly.jp/api/v1/companies
    │    Header: Authorization: Bearer <JWT>
    │
    ▼
Traefik (Port 443)
    │
    │ 2. SSL Termination
    │ 3. Apply Middlewares (Rate Limiting, Security Headers)
    │ 4. Route to Backend
    │
    ▼
Backend Container (NestJS)
    │
    │ 5. JWT Validation
    │ 6. Process Request
    │
    ▼
PostgreSQL Container
    │
    │ 7. Execute Query
    │
    ◄───┐
        │ 8. Return Data
        │
Backend Container
    │
    │ 9. Format Response (JSON)
    │
    ◄───┐
        │ 10. Return through Traefik
        │
User Browser / Frontend
```

## SSL/TLS Certificate Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    Let's Encrypt Flow                            │
└─────────────────────────────────────────────────────────────────┘

Traefik Startup
    │
    │ 1. Read configuration (traefik.yml)
    │ 2. Detect services from Docker labels
    │
    ▼
Certificate Check
    │
    ├─── Certificate exists? ───► Use existing certificate
    │                              │
    │                              ▼
    │                         Monitor expiration
    │                              │
    │                              ├─► < 30 days? ─► Auto-renew
    │                              └─► > 30 days? ─► Continue
    │
    └─── No certificate
         │
         ▼
    Let's Encrypt Challenge
         │
         ├─► TLS-ALPN-01 (Default)
         │   • Direct TLS handshake
         │   • No DNS/HTTP config needed
         │   • Port 443 required
         │
         ├─► HTTP-01 (Alternative)
         │   • Places file in /.well-known/
         │   • Port 80 required
         │   • Simple verification
         │
         └─► DNS-01 (For wildcards)
             • Creates TXT record in DNS
             • Requires DNS API access
             • Supports wildcard certs
         │
         ▼
    Certificate Issued
         │
         ▼
    Store in volume: /letsencrypt/acme.json
         │
         ▼
    Install certificate for domain
         │
         ▼
    HTTPS enabled ✓
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                       Security Stack                             │
└─────────────────────────────────────────────────────────────────┘

Layer 1: Network Security
    • Firewall (UFW / Security Groups)
    • Only necessary ports open (22, 80, 443)
    • SSH key-based authentication

Layer 2: Traefik Security
    • Automatic HTTPS redirect
    • HSTS (HTTP Strict Transport Security)
    • Rate limiting (100 req/sec for API)
    • Security headers (XSS, Frame Options, etc.)
    • TLS 1.2+ only

Layer 3: Container Security
    • Non-root users (nextjs, nestjs)
    • Read-only file systems where possible
    • Resource limits (CPU, Memory)
    • Health checks for auto-restart

Layer 4: Application Security
    • JWT authentication
    • CORS configuration
    • Input validation
    • SQL injection prevention (TypeORM)

Layer 5: Database Security
    • Not exposed to internet
    • Internal network only
    • Strong passwords
    • Regular backups
```

## High Availability Setup (Optional)

For production high availability, you can extend the setup:

```
┌────────────────────────────────────────────────────────────────┐
│                        Load Balancer                            │
│              (AWS ALB / DigitalOcean LB)                       │
└────────────────────────────────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
        ┌───────▼──────┐         ┌───────▼──────┐
        │   Server 1   │         │   Server 2   │
        │   (Traefik)  │         │   (Traefik)  │
        │   + Apps     │         │   + Apps     │
        └──────┬───────┘         └──────┬───────┘
               │                         │
               └────────┬────────────────┘
                        │
                ┌───────▼──────┐
                │  RDS / DB    │
                │  (Managed)   │
                └──────────────┘
```

## Scaling Strategies

### Vertical Scaling (Single Server)

```
┌─────────────────────────────────────────────────────────────┐
│             Increase Server Resources                        │
├─────────────────────────────────────────────────────────────┤
│  CPU:    2 cores  →  4 cores  →  8 cores                   │
│  RAM:    4 GB     →  8 GB     →  16 GB                     │
│  Disk:   20 GB    →  50 GB    →  100 GB                    │
└─────────────────────────────────────────────────────────────┘
```

### Horizontal Scaling (Multiple Containers)

```bash
# Scale API containers
docker compose -f docker-compose.prod.yml up -d --scale api=3

# Traefik automatically distributes load
```

```
Traefik
   │
   ├──► API Container 1
   ├──► API Container 2
   └──► API Container 3
```

## Monitoring Points

```
┌────────────────────────────────────────────────────────────┐
│                   Monitoring Dashboard                      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  Traefik Dashboard (Port 8080)                            │
│  ├─ Active Routes                                         │
│  ├─ Request Metrics                                       │
│  ├─ SSL Certificate Status                                │
│  └─ Middleware Performance                                │
│                                                             │
│  Container Metrics (docker stats)                         │
│  ├─ CPU Usage per container                               │
│  ├─ Memory Usage per container                            │
│  ├─ Network I/O                                            │
│  └─ Disk I/O                                               │
│                                                             │
│  Application Logs                                          │
│  ├─ Traefik: /var/log/traefik/                           │
│  ├─ API: docker logs selly-api                            │
│  ├─ Frontend: docker logs selly-web                       │
│  └─ Database: docker logs selly-postgres                  │
│                                                             │
│  Health Endpoints                                          │
│  ├─ API: https://api.sellybase.albaly.jp/health          │
│  └─ Frontend: https://sellybase.albaly.jp                 │
│                                                             │
└────────────────────────────────────────────────────────────┘
```

## Backup Strategy

```
┌────────────────────────────────────────────────────────────┐
│                    Backup Architecture                      │
└────────────────────────────────────────────────────────────┘

Daily Automated Backup (Cron)
    │
    ▼
Database Dump (maintenance.sh)
    │
    ├─► PostgreSQL pg_dump
    │   • Full database backup
    │   • Compressed (gzip)
    │   • Timestamped filename
    │
    ▼
Local Storage (backups/)
    │
    ├─► Keep last 7 backups
    │   • Auto-cleanup old backups
    │   • ~100-500MB per backup
    │
    ▼
Remote Storage (Optional)
    │
    ├─► AWS S3
    ├─► Backblaze B2
    ├─► DigitalOcean Spaces
    └─► Any S3-compatible storage

Recovery Time Objective (RTO)
    • < 15 minutes (restore from backup)

Recovery Point Objective (RPO)
    • < 24 hours (daily backups)
    • Can be improved to < 1 hour with more frequent backups
```

## Deployment Workflow

```
┌────────────────────────────────────────────────────────────┐
│              Production Deployment Flow                     │
└────────────────────────────────────────────────────────────┘

Developer
    │
    │ 1. Code changes
    │
    ▼
Git Repository (GitHub)
    │
    │ 2. git push
    │
    ▼
Production Server
    │
    │ 3. git pull
    │
    ▼
Backup Database
    │
    │ 4. ./maintenance.sh (backup)
    │
    ▼
Build New Images
    │
    │ 5. docker compose build
    │
    ▼
Rolling Update
    │
    │ 6. docker compose up -d --force-recreate
    │    • Zero downtime
    │    • One container at a time
    │
    ▼
Health Checks
    │
    │ 7. Verify all services healthy
    │
    ▼
Monitor
    │
    │ 8. Check logs and metrics
    │
    ▼
Done ✓
```

---

**Key Features:**
- ✅ Production-ready with SSL/TLS
- ✅ Automatic certificate management
- ✅ Load balancing with Traefik
- ✅ Health checks and auto-restart
- ✅ Security headers and rate limiting
- ✅ Zero-downtime deployments
- ✅ Automated backups
- ✅ Works on AWS and traditional servers

**Documentation:**
- [Production Guide](./DOCKER_COMPOSE_PRODUCTION.md)
- [Quick Start](./DOCKER_PRODUCTION_QUICKSTART.md)
- [AWS vs Traditional](./AWS_VS_TRADITIONAL_DEPLOYMENT.md)
