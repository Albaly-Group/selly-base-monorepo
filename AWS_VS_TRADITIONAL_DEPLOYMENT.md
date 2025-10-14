# AWS vs Traditional Server Deployment Guide

## Overview

This document explains the differences and considerations when deploying the Selly Base Docker Compose production setup on AWS versus traditional servers.

## Architecture Comparison

### AWS Deployment
```
Route53 (DNS) → EC2 (Docker Compose + Traefik)
                    ├── Frontend Container
                    ├── Backend Container
                    └── PostgreSQL Container (or RDS)
```

### Traditional Server Deployment
```
DNS Provider → VPS (Docker Compose + Traefik)
                   ├── Frontend Container
                   ├── Backend Container
                   └── PostgreSQL Container
```

## Deployment Comparison Table

| Feature | AWS EC2 | Traditional VPS (DigitalOcean, Linode, Vultr) |
|---------|---------|-----------------------------------------------|
| **Server Setup** | Launch EC2 instance | Create droplet/instance |
| **DNS Management** | Route53 | CloudFlare, Namecheap, etc. |
| **Security Groups** | AWS Security Groups | UFW/iptables firewall |
| **Load Balancing** | Traefik (or ALB) | Traefik |
| **Database** | PostgreSQL container or RDS | PostgreSQL container |
| **SSL Certificates** | Let's Encrypt (via Traefik) | Let's Encrypt (via Traefik) |
| **Monitoring** | CloudWatch (optional) | Built-in metrics |
| **Backups** | EBS Snapshots + script backups | Volume snapshots + script backups |
| **Scaling** | Easier with AWS services | Manual or provider-specific |
| **Cost** | Pay-as-you-go, can be higher | Fixed monthly pricing |

## AWS-Specific Setup

### 1. EC2 Instance Launch

```bash
# Recommended instance types:
# Development: t3.small (2 vCPU, 2GB RAM) - ~$15/month
# Production: t3.medium (2 vCPU, 4GB RAM) - ~$30/month
# High Traffic: t3.large (2 vCPU, 8GB RAM) - ~$60/month

# Operating System: Ubuntu 22.04 LTS or Amazon Linux 2
```

### 2. Security Group Configuration

```yaml
# Inbound Rules:
- Type: SSH
  Protocol: TCP
  Port: 22
  Source: Your IP (e.g., 1.2.3.4/32)

- Type: HTTP
  Protocol: TCP
  Port: 80
  Source: Anywhere (0.0.0.0/0, ::/0)

- Type: HTTPS
  Protocol: TCP
  Port: 443
  Source: Anywhere (0.0.0.0/0, ::/0)

- Type: Custom TCP
  Protocol: TCP
  Port: 8080
  Source: Your IP (for Traefik dashboard)

# Outbound Rules:
- Type: All traffic
  Protocol: All
  Port: All
  Destination: 0.0.0.0/0
```

### 3. IAM Role (Optional, for Route53 SSL)

If using Route53 for DNS-01 challenge:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "route53:GetChange",
        "route53:ChangeResourceRecordSets",
        "route53:ListHostedZones",
        "route53:ListResourceRecordSets"
      ],
      "Resource": "*"
    }
  ]
}
```

### 4. Route53 DNS Setup

```bash
# Create A records in Route53:
sellybase.albaly.jp        A  <EC2 Public IP>
api.sellybase.albaly.jp    A  <EC2 Public IP>
traefik.sellybase.albaly.jp A  <EC2 Public IP>
```

### 5. AWS-Specific Environment Variables

Add to `.env.prod`:

```bash
# For DNS-01 challenge with Route53
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
```

### 6. Using RDS Instead of Docker PostgreSQL

Update `docker-compose.prod.yml`:

```yaml
# Comment out or remove the postgres service

# Update API service:
api:
  environment:
    DATABASE_URL: postgresql://username:password@your-rds-endpoint.us-east-1.rds.amazonaws.com:5432/selly_base?sslmode=require
```

### 7. EBS Volume for Data Persistence

```bash
# Create and attach EBS volume for database
aws ec2 create-volume \
  --size 20 \
  --volume-type gp3 \
  --availability-zone us-east-1a

# Mount to /var/lib/docker/volumes
```

## Traditional Server Setup

### 1. VPS Creation

**DigitalOcean:**
```bash
# Recommended droplets:
# Development: Basic - $12/month (2GB RAM, 1 vCPU)
# Production: General Purpose - $24/month (4GB RAM, 2 vCPU)
# High Traffic: General Purpose - $48/month (8GB RAM, 4 vCPU)
```

**Linode:**
```bash
# Recommended instances:
# Development: Nanode - $5/month (1GB RAM)
# Production: Linode 4GB - $24/month (4GB RAM, 2 vCPU)
# High Traffic: Linode 8GB - $48/month (8GB RAM, 4 vCPU)
```

**Vultr:**
```bash
# Recommended instances:
# Development: Cloud Compute - $12/month (2GB RAM, 1 vCPU)
# Production: Cloud Compute - $24/month (4GB RAM, 2 vCPU)
```

### 2. Firewall Configuration (UFW)

```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Traefik Dashboard (from specific IP)
sudo ufw allow from YOUR_IP to any port 8080

# Check status
sudo ufw status verbose
```

### 3. DNS Configuration

**CloudFlare:**
1. Add domain to CloudFlare
2. Create A records:
   - `sellybase.albaly.jp` → Server IP
   - `api.sellybase.albaly.jp` → Server IP
   - `traefik.sellybase.albaly.jp` → Server IP

**For CloudFlare DNS-01 Challenge:**
```bash
# Add to .env.prod:
CF_API_EMAIL=your@email.com
CF_DNS_API_TOKEN=your-cloudflare-api-token
```

**Other DNS Providers:**
- Create A records pointing to your server IP
- Use TLS-ALPN-01 or HTTP-01 challenge (default)

### 4. Volume Backups

```bash
# DigitalOcean Volume Snapshots
doctl compute volume-snapshot create <volume-id> --snapshot-name backup-$(date +%Y%m%d)

# Or use built-in provider backups
# Most VPS providers offer automated backup options
```

## SSL Certificate Considerations

### AWS with Route53
- **Recommended**: DNS-01 challenge
- Supports wildcard certificates
- Automated renewal
- Configuration:
  ```yaml
  # traefik/traefik.yml
  certificatesResolvers:
    letsencrypt:
      acme:
        dnsChallenge:
          provider: route53
  ```

### Traditional Server with CloudFlare
- **Recommended**: DNS-01 challenge
- Configuration:
  ```yaml
  # traefik/traefik.yml
  certificatesResolvers:
    letsencrypt:
      acme:
        dnsChallenge:
          provider: cloudflare
  ```

### Any Server (Default)
- **Default**: TLS-ALPN-01 challenge
- No additional configuration needed
- Works with any DNS provider
- Configuration: Already set in `traefik/traefik.yml`

## Database Options

### Docker PostgreSQL (Default)
✅ **Best for**: Development, small to medium applications
✅ **Pros**: Simple, included, no extra cost
❌ **Cons**: Manual backups, limited scaling

### AWS RDS
✅ **Best for**: Production AWS deployments
✅ **Pros**: Automated backups, managed service, easy scaling
❌ **Cons**: Additional cost, vendor lock-in

```bash
# Cost: ~$15-50/month depending on instance size
```

### Managed Database (DigitalOcean, Linode)
✅ **Best for**: Production traditional server deployments
✅ **Pros**: Automated backups, managed service
❌ **Cons**: Additional cost

```bash
# Cost: ~$15-30/month
```

## Cost Comparison (Monthly)

### AWS Deployment

| Component | Cost |
|-----------|------|
| EC2 t3.medium | $30 |
| EBS Volume 20GB | $2 |
| Data Transfer (100GB) | $9 |
| Route53 Hosted Zone | $0.50 |
| **Total** | **~$42/month** |

*Optional: RDS db.t3.micro adds ~$15/month*

### DigitalOcean Deployment

| Component | Cost |
|-----------|------|
| 4GB Droplet | $24 |
| Volume 20GB | $2 |
| **Total** | **~$26/month** |

*Optional: Managed Database adds ~$15/month*

### Linode Deployment

| Component | Cost |
|-----------|------|
| Linode 4GB | $24 |
| Volume 20GB | $2 |
| **Total** | **~$26/month** |

## Scaling Strategies

### AWS Scaling

**Vertical Scaling:**
```bash
# Stop instance, change instance type, start
aws ec2 stop-instances --instance-ids i-xxx
aws ec2 modify-instance-attribute --instance-id i-xxx --instance-type t3.large
aws ec2 start-instances --instance-ids i-xxx
```

**Horizontal Scaling:**
```bash
# Use Application Load Balancer + multiple EC2 instances
# Deploy docker compose on multiple instances
# Configure ALB to distribute traffic
```

### Traditional Server Scaling

**Vertical Scaling:**
- Resize droplet/instance through provider dashboard
- Typically requires brief downtime

**Horizontal Scaling:**
```bash
# Use provider's load balancer
# Or deploy multiple servers with Traefik on one as main proxy
# Requires additional configuration
```

## Monitoring

### AWS CloudWatch
```bash
# Enable detailed monitoring on EC2 instance
# View metrics: CPU, Network, Disk

# Install CloudWatch agent for custom metrics
wget https://s3.amazonaws.com/amazoncloudwatch-agent/linux/amd64/latest/AmazonCloudWatchAgent.zip
```

### Traditional Server Monitoring
```bash
# Built-in provider monitoring
# Or use docker stats
docker stats

# Or install monitoring solution
# Prometheus + Grafana, Netdata, etc.
```

## Backup Strategies

### AWS
```bash
# 1. EBS Snapshots (automated)
aws ec2 create-snapshot --volume-id vol-xxx --description "Daily backup"

# 2. Database backups (manual/scheduled)
./maintenance.sh  # Option 1

# 3. Store in S3
aws s3 cp backups/ s3://my-bucket/backups/ --recursive
```

### Traditional Server
```bash
# 1. Volume snapshots (provider dashboard)

# 2. Database backups (manual/scheduled)
./maintenance.sh  # Option 1

# 3. Store remotely (S3, Backblaze, etc.)
s3cmd sync backups/ s3://my-bucket/backups/
```

## Recommendations

### Use AWS When:
- ✅ You need easy integration with other AWS services
- ✅ You want managed database (RDS) option
- ✅ You need advanced networking (VPC, security groups)
- ✅ You plan to scale horizontally with ALB
- ✅ You're already using AWS infrastructure

### Use Traditional Server When:
- ✅ You want simpler, more predictable pricing
- ✅ You prefer straightforward server management
- ✅ You don't need AWS-specific services
- ✅ You want better price/performance ratio
- ✅ You're comfortable with manual scaling

## Migration Path

### From Traditional to AWS:
1. Create EC2 instance with same specs
2. Copy docker-compose and configuration
3. Backup database: `./maintenance.sh` (option 1)
4. Restore on new server: `./maintenance.sh` (option 2)
5. Update DNS to point to EC2 IP
6. Wait for DNS propagation (5-60 minutes)
7. Verify everything works
8. Decommission old server

### From AWS to Traditional:
Same process in reverse direction.

## Conclusion

Both AWS and traditional servers work excellently with this Docker Compose setup. The choice depends on your:
- Budget constraints
- Scaling requirements
- Existing infrastructure
- Team expertise

The Docker Compose configuration with Traefik is **platform-agnostic** and works identically on both, making migration easy if needed.

---

**Quick Start Links:**
- [AWS Deployment](./DOCKER_COMPOSE_PRODUCTION.md#aws-specific-considerations)
- [Traditional Server Deployment](./DOCKER_COMPOSE_PRODUCTION.md#installation-steps)
- [Quick Start Guide](./DOCKER_PRODUCTION_QUICKSTART.md)
