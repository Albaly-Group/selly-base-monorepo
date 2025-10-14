# Docker Compose Production - Quick Start Guide

## TL;DR - Get Started in 5 Minutes

### 1. Prerequisites
- Server with Docker and Docker Compose installed
- Domain pointed to your server IP
- Ports 80, 443 open

### 2. Quick Setup

```bash
# Clone repository
git clone https://github.com/Albaly-Group/selly-base-monorepo.git
cd selly-base-monorepo

# Configure environment
cp .env.prod.example .env.prod
nano .env.prod  # Edit: DOMAIN, POSTGRES_PASSWORD, JWT_SECRET

# Deploy
./deploy-production.sh
```

### 3. Access Your Application
- Frontend: https://sellybase.albaly.jp
- API: https://api.sellybase.albaly.jp/docs
- Dashboard: https://traefik.sellybase.albaly.jp

## Essential Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop everything
docker compose -f docker-compose.prod.yml down

# Update application
./maintenance.sh  # Choose option 3

# Backup database
./maintenance.sh  # Choose option 1
```

## Generate Secrets

```bash
# JWT Secret
openssl rand -base64 32

# Traefik Dashboard Password
echo $(htpasswd -nb admin your_password) | sed -e s/\\$/\\$\\$/g
```

## Architecture

```
Internet → Traefik (SSL) → Frontend (sellybase.albaly.jp)
                        → Backend API (api.sellybase.albaly.jp)
                                    → PostgreSQL (internal)
```

## Environment Variables Template

```bash
# .env.prod (minimum required)
DOMAIN=sellybase.albaly.jp
POSTGRES_USER=selly_user
POSTGRES_PASSWORD=your_strong_password_here
POSTGRES_DB=selly_base
JWT_SECRET=your_generated_secret_here
JWT_EXPIRES_IN=7d
```

## Troubleshooting

### SSL Certificate Issues
Wait 2-3 minutes after first deployment. Check:
```bash
docker compose -f docker-compose.prod.yml logs traefik | grep certificate
```

### Service Not Accessible
```bash
# Check if running
docker compose -f docker-compose.prod.yml ps

# Check DNS
nslookup sellybase.albaly.jp
```

### Database Issues
```bash
# Check database logs
docker compose -f docker-compose.prod.yml logs postgres

# Test connection
docker exec selly-postgres psql -U selly_user -d selly_base -c "SELECT 1;"
```

## AWS Deployment Notes

### Security Group Requirements
- Inbound: Port 80 (HTTP) - 0.0.0.0/0
- Inbound: Port 443 (HTTPS) - 0.0.0.0/0
- Inbound: Port 22 (SSH) - Your IP
- Inbound: Port 8080 (Dashboard) - Your IP (optional)

### Route53 DNS Setup
Create A records:
- `sellybase.albaly.jp` → EC2 Public IP
- `api.sellybase.albaly.jp` → EC2 Public IP
- `traefik.sellybase.albaly.jp` → EC2 Public IP

### Recommended Instance Type
- Minimum: t3.small (2 vCPU, 2GB RAM)
- Recommended: t3.medium (2 vCPU, 4GB RAM)
- Production: t3.large (2 vCPU, 8GB RAM)

## Production Checklist

- [ ] Strong passwords configured
- [ ] DNS records created and propagated
- [ ] Firewall/Security groups configured
- [ ] SSL certificates issued (wait 2-3 minutes)
- [ ] Health checks passing
- [ ] Backup strategy in place
- [ ] Monitoring configured
- [ ] Log rotation enabled
- [ ] .env.prod excluded from git

## Support

📖 **Full Documentation**: [DOCKER_COMPOSE_PRODUCTION.md](./DOCKER_COMPOSE_PRODUCTION.md)

For detailed information, troubleshooting, scaling, and advanced configuration, see the full documentation.

---

**Quick Links:**
- [Full Production Guide](./DOCKER_COMPOSE_PRODUCTION.md)
- [Docker Architecture](./DOCKER_ARCHITECTURE.md)
- [Main README](./README.md)
