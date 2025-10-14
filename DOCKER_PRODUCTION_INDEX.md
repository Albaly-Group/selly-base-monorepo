# Docker Production Deployment - Documentation Index

## 📚 Overview

Complete Docker Compose production deployment with Traefik reverse proxy for the Selly Base monorepo. This setup provides enterprise-grade deployment with SSL/TLS, load balancing, and works on both AWS cloud and traditional servers.

## 🚀 Quick Links

### Getting Started
- **[Quick Start Guide](./DOCKER_PRODUCTION_QUICKSTART.md)** ⭐ Start here!
- **[Full Production Guide](./DOCKER_COMPOSE_PRODUCTION.md)** - Complete documentation

### Configuration Files
- `docker-compose.prod.yml` - Production Docker Compose configuration
- `.env.prod.example` - Environment variables template
- `traefik/traefik.yml` - Traefik static configuration
- `traefik/dynamic/` - Traefik dynamic configurations (TLS, middlewares)
- `postgres/postgresql.conf` - PostgreSQL optimization settings

### Scripts
- `deploy-production.sh` - Automated deployment script
- `maintenance.sh` - Backup, restore, and maintenance operations

## 📋 What's Included

### Services
1. **Traefik** - Reverse proxy and load balancer
   - Automatic SSL/TLS with Let's Encrypt
   - HTTP to HTTPS redirection
   - Security headers and rate limiting
   - Dashboard for monitoring

2. **Frontend (Next.js)** - Web application
   - Domain: `sellybase.albaly.jp`
   - Production optimized build
   - Compressed assets
   - Health checks

3. **Backend API (NestJS)** - REST API
   - Domain: `api.sellybase.albaly.jp`
   - Swagger documentation at `/docs`
   - JWT authentication
   - Database connection pooling

4. **PostgreSQL** - Database with pgvector
   - Internal network only (not exposed)
   - Persistent data storage
   - Automated backups
   - Performance tuning

### Features
✅ Automatic SSL/TLS certificates (Let's Encrypt)
✅ HTTP to HTTPS redirect
✅ Security headers (HSTS, XSS protection, etc.)
✅ Rate limiting
✅ Health checks for all services
✅ Zero-downtime deployments
✅ Database backups and restore
✅ Log management
✅ Resource monitoring
✅ Docker network isolation
✅ Non-root container users

## 🏗️ Architecture

```
                    Internet
                       │
                       ▼
           ╔═══════════════════════╗
           ║      Traefik          ║
           ║   (Port 80/443)       ║
           ║   - SSL/TLS           ║
           ║   - Load Balancer     ║
           ║   - Rate Limiting     ║
           ╚═══════════════════════╝
                  /        \
                 /          \
                ▼            ▼
    ┌──────────────────┐  ┌──────────────────┐
    │   Frontend       │  │   Backend API    │
    │   (Next.js)      │  │   (NestJS)       │
    │   Port 3000      │  │   Port 3001      │
    └──────────────────┘  └──────────────────┘
                                    │
                                    ▼
                          ┌──────────────────┐
                          │   PostgreSQL     │
                          │   + pgvector     │
                          │   (Internal)     │
                          └──────────────────┘

Network: selly-network (bridge, isolated)
```

## 🎯 Deployment Options

### Option 1: AWS Cloud Deployment
- EC2 with Security Groups
- Route53 for DNS
- Optional: RDS instead of Docker PostgreSQL
- Optional: Application Load Balancer
- See: [AWS-Specific Section](./DOCKER_COMPOSE_PRODUCTION.md#aws-specific-considerations)

### Option 2: Traditional Server
- DigitalOcean, Linode, Vultr, etc.
- Any Linux server with Docker
- Firewall configuration via UFW/iptables
- See: [Traditional Server Setup](./DOCKER_COMPOSE_PRODUCTION.md#installation-steps)

## 📝 Step-by-Step Deployment

### 1. Server Setup
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin
```

### 2. Configure DNS
Point these domains to your server IP:
- `sellybase.albaly.jp`
- `api.sellybase.albaly.jp`
- `traefik.sellybase.albaly.jp` (optional)

### 3. Configure Environment
```bash
cp .env.prod.example .env.prod
nano .env.prod  # Edit configuration
```

### 4. Deploy
```bash
./deploy-production.sh
```

That's it! 🎉

## 🔧 Configuration Guide

### Essential Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DOMAIN` | Main domain | `sellybase.albaly.jp` |
| `POSTGRES_USER` | Database user | `selly_user` |
| `POSTGRES_PASSWORD` | Database password | `strong_password_123` |
| `POSTGRES_DB` | Database name | `selly_base` |
| `JWT_SECRET` | JWT signing secret | `random_32_char_string` |
| `JWT_EXPIRES_IN` | Token expiration | `7d` |

### Optional: SSL Certificate Methods

#### Method 1: TLS-ALPN-01 (Default)
- No configuration needed
- Recommended for cloud environments
- Works out of the box

#### Method 2: DNS-01 with CloudFlare
```bash
CF_API_EMAIL=email@example.com
CF_DNS_API_TOKEN=your_token
```

#### Method 3: DNS-01 with AWS Route53
```bash
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
```

## 🛠️ Management Commands

### Basic Operations
```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop services
docker compose -f docker-compose.prod.yml down

# Restart services
docker compose -f docker-compose.prod.yml restart

# Check status
docker compose -f docker-compose.prod.yml ps
```

### Maintenance Operations
```bash
# Open maintenance menu
./maintenance.sh

# Available operations:
# 1. Backup Database
# 2. Restore Database
# 3. Update Application
# 4. View Logs
# 5. Service Status
# 6. Restart Services
# 7. Clean Docker Resources
# 8. SSL Certificate Status
```

### Update Application
```bash
# Automated with maintenance script
./maintenance.sh  # Choose option 3

# Or manual:
git pull
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

## 🔒 Security Best Practices

### 1. Strong Passwords
```bash
# Generate strong password
openssl rand -base64 32

# Generate Traefik dashboard password
htpasswd -nb admin your_password | sed -e s/\\$/\\$\\$/g
```

### 2. Firewall Configuration
```bash
# Using UFW (Ubuntu/Debian)
sudo ufw enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
```

### 3. File Permissions
```bash
chmod 600 .env.prod
chmod 600 traefik/traefik.yml
```

### 4. Regular Backups
```bash
# Automated daily backups
crontab -e
# Add: 0 2 * * * cd /path/to/project && ./maintenance.sh backup
```

## 📊 Monitoring

### Traefik Dashboard
Access: `https://traefik.sellybase.albaly.jp`
- View active routes
- Monitor traffic
- Check SSL certificate status
- View middleware chains

### Health Checks
```bash
# API health
curl https://api.sellybase.albaly.jp/health

# Frontend health
curl https://sellybase.albaly.jp

# API documentation
curl https://api.sellybase.albaly.jp/docs
```

### Resource Monitoring
```bash
# Container stats
docker stats

# Disk usage
docker system df

# Service logs
docker compose -f docker-compose.prod.yml logs -f [service]
```

## 🚨 Troubleshooting

### Common Issues

#### SSL Certificate Not Issued
- Wait 2-3 minutes after first deployment
- Check DNS is properly configured
- Verify ports 80 and 443 are open
- Check Traefik logs: `docker compose -f docker-compose.prod.yml logs traefik | grep certificate`

#### Service Not Accessible
- Verify DNS resolution: `nslookup sellybase.albaly.jp`
- Check containers are running: `docker compose -f docker-compose.prod.yml ps`
- Check Traefik routing: `docker compose -f docker-compose.prod.yml logs traefik`

#### Database Connection Issues
- Check database logs: `docker compose -f docker-compose.prod.yml logs postgres`
- Test connection: `docker exec selly-postgres psql -U selly_user -d selly_base -c "SELECT 1;"`

### Get Help
- Full troubleshooting guide: [DOCKER_COMPOSE_PRODUCTION.md#troubleshooting](./DOCKER_COMPOSE_PRODUCTION.md#troubleshooting)
- Check logs: `docker compose -f docker-compose.prod.yml logs -f`

## 📈 Scaling

### Horizontal Scaling
```bash
# Scale API service
docker compose -f docker-compose.prod.yml up -d --scale api=3

# Traefik automatically load balances
```

### Vertical Scaling
Add resource limits in `docker-compose.prod.yml`:
```yaml
api:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
```

## 🌐 AWS-Specific Features

### Using RDS PostgreSQL
1. Create RDS instance
2. Remove `postgres` service from docker-compose
3. Update `DATABASE_URL` to RDS endpoint

### Using Application Load Balancer
1. Create ALB with target groups
2. Configure SSL in ACM
3. Remove Traefik, use ALB directly

### Using ECS/Fargate
1. Convert to ECS task definitions
2. Use Application Load Balancer
3. Store secrets in AWS Secrets Manager

## 📚 Additional Documentation

- [Main README](./README.md) - Project overview
- [Docker Architecture](./DOCKER_ARCHITECTURE.md) - Development setup
- [Deployment Guide](./DEPLOYMENT.md) - Other deployment options
- [Backend Deployment](./BACKEND_DEPLOYMENT.md) - Backend-specific
- [AWS Amplify Deployment](./AWS_AMPLIFY_DEPLOYMENT.md) - Serverless option

## 🎯 Production Checklist

Before going live:
- [ ] Strong passwords configured in `.env.prod`
- [ ] DNS records created and propagated
- [ ] Firewall/Security groups configured
- [ ] SSL certificates issued successfully
- [ ] All health checks passing
- [ ] Backup strategy in place
- [ ] Monitoring dashboard accessible
- [ ] Log rotation configured
- [ ] `.env.prod` excluded from git (in .gitignore)
- [ ] Database connection working
- [ ] API documentation accessible
- [ ] Frontend loads correctly

## 💡 Tips

1. **Start with Quick Start** - Get it running first, optimize later
2. **Monitor Traefik logs** - Most issues appear in Traefik logs
3. **Use maintenance script** - Simplifies common operations
4. **Regular backups** - Automate daily database backups
5. **Test updates** - Always test updates in staging first
6. **Keep secrets secure** - Never commit `.env.prod`

## 🆘 Support

For issues or questions:
1. Check the [Troubleshooting Guide](./DOCKER_COMPOSE_PRODUCTION.md#troubleshooting)
2. Review logs: `docker compose -f docker-compose.prod.yml logs -f`
3. Check Docker status: `docker compose -f docker-compose.prod.yml ps`
4. Open an issue in the repository

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintained By**: Albaly Group

**Ready to deploy?** Start with the [Quick Start Guide](./DOCKER_PRODUCTION_QUICKSTART.md)! 🚀
