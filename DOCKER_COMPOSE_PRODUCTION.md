# Docker Compose Production Deployment Guide

## Overview

This guide provides instructions for deploying the Selly Base monorepo using Docker Compose with Traefik as a reverse proxy and load balancer. This setup works on both **AWS cloud environments** and **traditional servers**.

## Architecture

```
                                Internet
                                   │
                                   ▼
                         ┌──────────────────┐
                         │     Traefik      │
                         │  Load Balancer   │
                         │  (Port 80/443)   │
                         └──────────────────┘
                          /                \
                         /                  \
                        ▼                    ▼
           ┌─────────────────┐    ┌─────────────────┐
           │   Frontend      │    │   Backend API   │
           │   (Next.js)     │    │   (NestJS)      │
           │ sellybase.      │    │ api.sellybase.  │
           │   albaly.jp     │    │   albaly.jp     │
           └─────────────────┘    └─────────────────┘
                                           │
                                           ▼
                                  ┌─────────────────┐
                                  │   PostgreSQL    │
                                  │   + pgvector    │
                                  │  (Internal)     │
                                  └─────────────────┘
```

## Features

✅ **Automatic SSL/TLS** - Let's Encrypt certificates with auto-renewal
✅ **Load Balancing** - Traefik handles traffic distribution
✅ **Health Checks** - Automatic service health monitoring
✅ **Security** - HTTPS redirect, security headers, rate limiting
✅ **Monitoring** - Traefik dashboard with metrics
✅ **Zero Downtime** - Rolling updates support
✅ **Cloud & Server Compatible** - Works on AWS, DigitalOcean, traditional servers

## Prerequisites

### Server Requirements

- **OS**: Linux (Ubuntu 20.04+, Debian 11+, Amazon Linux 2, etc.)
- **RAM**: Minimum 2GB, recommended 4GB+
- **Storage**: Minimum 20GB free space
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+

### Network Requirements

- **Ports**: 80 (HTTP), 443 (HTTPS), 8080 (Traefik Dashboard - optional)
- **DNS**: Domain pointed to server IP
  - `sellybase.albaly.jp` → Your Server IP
  - `api.sellybase.albaly.jp` → Your Server IP
  - `traefik.sellybase.albaly.jp` → Your Server IP (optional, for dashboard)

### AWS-Specific Requirements

- **EC2 Instance**: t3.medium or larger
- **Security Group Rules**:
  - Inbound: Port 80 (HTTP) from 0.0.0.0/0
  - Inbound: Port 443 (HTTPS) from 0.0.0.0/0
  - Inbound: Port 8080 (Traefik Dashboard) from your IP only
  - Inbound: Port 22 (SSH) from your IP only
- **IAM Role** (if using Route53 for DNS):
  - `route53:ChangeResourceRecordSets`
  - `route53:ListHostedZones`
  - `route53:GetChange`

## Installation Steps

### 1. Install Docker and Docker Compose

#### On Ubuntu/Debian:
```bash
# Update package index
sudo apt-get update

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt-get install docker-compose-plugin

# Add your user to docker group
sudo usermod -aG docker $USER

# Verify installation
docker --version
docker compose version
```

#### On Amazon Linux 2:
```bash
# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo systemctl start docker
sudo systemctl enable docker

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER
```

### 2. Clone the Repository

```bash
# Clone the repository
git clone https://github.com/Albaly-Group/selly-base-monorepo.git
cd selly-base-monorepo
```

### 3. Configure Environment Variables

```bash
# Copy the production environment template
cp .env.prod.example .env.prod

# Edit the configuration
nano .env.prod  # or use vim, vi, or any text editor
```

#### Required Environment Variables:

```bash
# Domain Configuration
DOMAIN=sellybase.albaly.jp

# Database Credentials (use strong passwords!)
POSTGRES_USER=selly_user
POSTGRES_PASSWORD=YourStrongPasswordHere123!
POSTGRES_DB=selly_base

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=YourGeneratedSecretHere
JWT_EXPIRES_IN=7d

# Traefik Dashboard Auth (generate with: echo $(htpasswd -nb admin yourpass) | sed -e s/\\$/\\$\\$/g)
TRAEFIK_DASHBOARD_AUTH=admin:$$apr1$$...
```

#### Generate Strong Secrets:

```bash
# Generate JWT Secret
openssl rand -base64 32

# Generate Traefik Dashboard Password
# First install apache2-utils if not available
sudo apt-get install apache2-utils  # Ubuntu/Debian
# or
sudo yum install httpd-tools  # CentOS/Amazon Linux

# Then generate password hash
echo $(htpasswd -nb admin your_password) | sed -e s/\\$/\\$\\$/g
```

### 4. Configure DNS

Point your domain to your server's IP address:

#### Using AWS Route53:
1. Go to Route53 console
2. Select your hosted zone
3. Create A records:
   - `sellybase.albaly.jp` → Server Public IP
   - `api.sellybase.albaly.jp` → Server Public IP
   - `traefik.sellybase.albaly.jp` → Server Public IP (optional)

#### Using CloudFlare:
1. Go to CloudFlare DNS settings
2. Add A records with the same configuration

**Note**: DNS propagation can take 5-60 minutes.

### 5. SSL/TLS Certificate Configuration

Choose one of three methods for SSL certificates:

#### Method 1: TLS-ALPN-01 (Default, Recommended)
- No additional configuration needed
- Works out of the box
- Best for cloud environments

#### Method 2: HTTP-01 Challenge
Edit `traefik/traefik.yml` and uncomment:
```yaml
# httpChallenge:
#   entryPoint: web
```

#### Method 3: DNS-01 Challenge (For Wildcard Certificates)

##### Option A: Using CloudFlare
Add to `.env.prod`:
```bash
CF_API_EMAIL=your-email@example.com
CF_DNS_API_TOKEN=your-cloudflare-api-token
```

Edit `traefik/traefik.yml` and uncomment:
```yaml
# dnsChallenge:
#   provider: cloudflare
#   delayBeforeCheck: 0
```

##### Option B: Using AWS Route53
Add to `.env.prod`:
```bash
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
AWS_REGION=us-east-1
```

Edit `traefik/traefik.yml` and change provider:
```yaml
dnsChallenge:
  provider: route53
  delayBeforeCheck: 0
```

### 6. Build and Deploy

```bash
# Build Docker images (first time or after code changes)
docker compose -f docker-compose.prod.yml build --no-cache

# Start all services
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check service status
docker compose -f docker-compose.prod.yml ps
```

### 7. Verify Deployment

```bash
# Check if all containers are running
docker ps

# Test health endpoints
curl -I https://api.sellybase.albaly.jp/health
curl -I https://sellybase.albaly.jp

# Access Traefik Dashboard (if enabled)
# Visit: https://traefik.sellybase.albaly.jp
# Login with credentials from TRAEFIK_DASHBOARD_AUTH
```

## Management Commands

### View Logs
```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web
docker compose -f docker-compose.prod.yml logs -f traefik
docker compose -f docker-compose.prod.yml logs -f postgres
```

### Restart Services
```bash
# Restart all
docker compose -f docker-compose.prod.yml restart

# Restart specific service
docker compose -f docker-compose.prod.yml restart api
```

### Update Application
```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d

# Alternative: Rolling update (zero downtime)
docker compose -f docker-compose.prod.yml up -d --force-recreate --no-deps api
docker compose -f docker-compose.prod.yml up -d --force-recreate --no-deps web
```

### Database Backup
```bash
# Create backup
docker exec selly-postgres pg_dump -U selly_user selly_base > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker exec -i selly-postgres psql -U selly_user selly_base < backup_20250101_120000.sql
```

### Stop Services
```bash
# Stop all (keeps data)
docker compose -f docker-compose.prod.yml down

# Stop and remove volumes (WARNING: deletes data)
docker compose -f docker-compose.prod.yml down -v
```

## Monitoring and Maintenance

### Traefik Dashboard
Access at: `https://traefik.sellybase.albaly.jp`
- View active routes
- Monitor traffic
- Check certificate status
- View middleware chains

### Health Checks
```bash
# API Health
curl https://api.sellybase.albaly.jp/health

# API Documentation
curl https://api.sellybase.albaly.jp/docs

# Frontend
curl https://sellybase.albaly.jp
```

### Resource Monitoring
```bash
# Container resource usage
docker stats

# Disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

### Log Rotation
Logs are automatically rotated. To view:
```bash
# Traefik logs
docker exec selly-traefik ls -lh /var/log/traefik/

# PostgreSQL logs
docker exec selly-postgres ls -lh /var/lib/postgresql/data/log/
```

## Security Best Practices

### 1. Firewall Configuration

#### Using UFW (Ubuntu/Debian):
```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Traefik Dashboard (from specific IP only)
sudo ufw allow from YOUR_IP to any port 8080

# Check status
sudo ufw status
```

#### Using AWS Security Groups:
- Create a security group with:
  - SSH (22) from your IP
  - HTTP (80) from anywhere
  - HTTPS (443) from anywhere
  - Traefik Dashboard (8080) from your IP

### 2. Regular Updates
```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Update Docker images
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### 3. Secret Management
- Never commit `.env.prod` to version control
- Use AWS Secrets Manager or HashiCorp Vault for production
- Rotate secrets regularly (quarterly recommended)
- Set file permissions: `chmod 600 .env.prod`

### 4. Database Security
- Use strong passwords (16+ characters, mixed case, numbers, symbols)
- Regular backups (automated daily recommended)
- Keep PostgreSQL not exposed to internet (only accessible via Docker network)
- Enable SSL for database connections in production

### 5. Rate Limiting
Already configured in Traefik:
- API: 100 requests/second (burst: 50)
- Frontend: No limit by default

Adjust in `docker-compose.prod.yml` if needed.

## Troubleshooting

### SSL Certificate Issues
```bash
# Check certificate status
docker compose -f docker-compose.prod.yml logs traefik | grep -i certificate

# Delete and regenerate certificates
docker compose -f docker-compose.prod.yml down
sudo rm -rf /var/lib/docker/volumes/selly-base-monorepo_traefik-certificates
docker compose -f docker-compose.prod.yml up -d
```

### Database Connection Issues
```bash
# Check database logs
docker compose -f docker-compose.prod.yml logs postgres

# Test database connection
docker exec selly-postgres psql -U selly_user -d selly_base -c "SELECT 1;"

# Verify connection from API
docker exec selly-api wget -O- http://localhost:3001/health
```

### Service Not Accessible
```bash
# Check if containers are running
docker compose -f docker-compose.prod.yml ps

# Check Traefik routing
docker compose -f docker-compose.prod.yml logs traefik | grep -i router

# Verify DNS resolution
nslookup sellybase.albaly.jp
nslookup api.sellybase.albaly.jp

# Check port accessibility
sudo netstat -tlnp | grep -E ':(80|443|8080)'
```

### Performance Issues
```bash
# Check resource usage
docker stats

# Adjust PostgreSQL memory settings in postgres/postgresql.conf
# Restart database
docker compose -f docker-compose.prod.yml restart postgres
```

## Scaling

### Horizontal Scaling (Multiple Replicas)

```bash
# Scale API service
docker compose -f docker-compose.prod.yml up -d --scale api=3

# Traefik automatically load balances across replicas
```

### Vertical Scaling (More Resources)
Edit `docker-compose.prod.yml` and add resource limits:
```yaml
api:
  deploy:
    resources:
      limits:
        cpus: '2'
        memory: 2G
      reservations:
        cpus: '1'
        memory: 1G
```

## AWS-Specific Considerations

### Using Amazon RDS Instead of Docker PostgreSQL

1. Create an RDS PostgreSQL instance
2. Update `.env.prod`:
```bash
# In docker-compose.prod.yml, remove postgres service
# Update API environment:
DATABASE_URL=postgresql://username:password@rds-endpoint.region.rds.amazonaws.com:5432/dbname?sslmode=require
```

### Using AWS Application Load Balancer (ALB)
If you prefer ALB over Traefik:
1. Create ALB with target groups
2. Configure SSL certificates in ACM
3. Remove Traefik from docker-compose
4. Point ALB to EC2 instances running containers

### Using ECS/Fargate
For managed container orchestration:
1. Use AWS ECS service
2. Create task definitions from Dockerfiles
3. Use Application Load Balancer
4. Store secrets in AWS Secrets Manager

## Support and Documentation

- **Main Documentation**: [README.md](./README.md)
- **Docker Architecture**: [DOCKER_ARCHITECTURE.md](./DOCKER_ARCHITECTURE.md)
- **Deployment Options**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **API Documentation**: https://api.sellybase.albaly.jp/docs
- **Traefik Documentation**: https://doc.traefik.io/traefik/

## License

This deployment configuration is part of the Selly Base project.

---

**Last Updated**: January 2025
**Maintained By**: Albaly Group
**Support**: For issues, please contact your system administrator or create an issue in the repository.
