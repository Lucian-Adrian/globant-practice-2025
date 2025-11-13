# Professional Cloud Deployment Guide

This guide covers deploying the Driving School Management System to various cloud platforms using Docker Compose.

## Deployment Guides

Choose your deployment platform:

| Platform | Guide | Best For | Estimated Cost |
|----------|-------|----------|----------------|
| **AWS EC2/ECS** | [AWS Section](#aws-deployment) | Enterprise, high traffic | $35-50/month |
| **DigitalOcean** | [DigitalOcean Section](#digitalocean-deployment) | Easiest cloud setup | $12-27/month |
| **Azure** | [Azure Section](#azure-deployment) | Microsoft ecosystem | $35/month |
| **Google Cloud** | [GCP_DEPLOYMENT.md](GCP_DEPLOYMENT.md) | Google services, scalability | $25-50/month |
| **Home Server** | [HOME_SERVER_DEPLOYMENT.md](HOME_SERVER_DEPLOYMENT.md) | Learning, budget, full control | $5-15/month |

## Table of Contents

1. [Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Platform-Specific Guides](#platform-specific-guides)
   - [AWS EC2 / ECS](#aws-deployment)
   - [DigitalOcean Droplet](#digitalocean-deployment)
   - [Azure Container Instances](#azure-deployment)
   - [Google Cloud Platform](GCP_DEPLOYMENT.md) - **Separate detailed guide**
   - [Home Server Deployment](HOME_SERVER_DEPLOYMENT.md) - **Self-hosted guide**
4. [SSL/HTTPS Setup](#ssl-https-setup)
5. [Domain Configuration](#domain-configuration)
6. [Monitoring & Logging](#monitoring--logging)
7. [Backup & Recovery](#backup--recovery)
8. [Security Best Practices](#security-best-practices)

## Overview

The production deployment uses:
- **Docker Compose** for container orchestration
- **Nginx** as reverse proxy and load balancer
- **PostgreSQL 15** for database
- **Gunicorn** for Django WSGI server
- **Redis** for caching (optional)
- Multi-stage Docker builds for optimized images
- Non-root users for enhanced security

## Pre-Deployment Checklist

Before deploying to production:

### 1. Environment Configuration

```bash
# Copy production environment template
cp .env.production.example .env.production

# Edit with your production values
nano .env.production
```

**Required changes:**
- [ ] Generate strong `DJANGO_SECRET_KEY`
- [ ] Generate strong `JWT_SIGNING_KEY`
- [ ] Set strong `POSTGRES_PASSWORD`
- [ ] Set `DJANGO_DEBUG=0`
- [ ] Configure `DJANGO_ALLOWED_HOSTS` with your domain
- [ ] Set `FRONTEND_ORIGIN` to your domain
- [ ] Configure superuser credentials
- [ ] Set `DISABLE_CSRF=0` (enable CSRF protection)

### 2. Generate Secrets

```bash
# Generate Django secret key
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Generate strong passwords
openssl rand -base64 32
```

### 3. Domain & DNS

- [ ] Register a domain name
- [ ] Configure DNS A record pointing to your server IP
- [ ] Wait for DNS propagation (can take up to 48 hours)

### 4. SSL Certificate

Choose one:
- **Let's Encrypt** (free, recommended) - See [SSL Setup](#ssl-https-setup)
- Commercial SSL certificate
- CloudFlare SSL (free tier available)

## Platform-Specific Guides

### AWS Deployment

#### Option 1: AWS EC2 (Recommended for full control)

**1. Launch EC2 Instance**

```bash
# Recommended specifications:
# - Instance type: t3.medium or larger (2 vCPU, 4GB RAM minimum)
# - OS: Ubuntu 22.04 LTS
# - Storage: 20GB+ SSD
# - Security Group: Allow ports 22, 80, 443
```

**2. Connect to Instance**

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

**3. Install Docker**

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version
```

**4. Deploy Application**

```bash
# Clone repository
git clone https://github.com/Lucian-Adrian/globant-practice-2025.git
cd globant-practice-2025

# Setup environment
cp .env.production.example .env.production
nano .env.production  # Edit with your values

# Deploy
./scripts/deploy.sh
```

**5. Configure Security Group**

In AWS Console:
- Inbound Rules:
  - Port 22 (SSH): Your IP only
  - Port 80 (HTTP): 0.0.0.0/0
  - Port 443 (HTTPS): 0.0.0.0/0
  - Port 5432 (PostgreSQL): Deny (internal only)

#### Option 2: AWS ECS (Elastic Container Service)

**1. Create ECR Repositories**

```bash
# Install AWS CLI
pip install awscli

# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Create repositories
aws ecr create-repository --repository-name driving-school-backend
aws ecr create-repository --repository-name driving-school-frontend
```

**2. Build and Push Images**

```bash
# Backend
docker build -f backend/Dockerfile.prod -t driving-school-backend backend/
docker tag driving-school-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/driving-school-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/driving-school-backend:latest

# Frontend
docker build -f frontend/Dockerfile.prod -t driving-school-frontend frontend/
docker tag driving-school-frontend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/driving-school-frontend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/driving-school-frontend:latest
```

**3. Create ECS Cluster**

Use AWS Console or CLI to:
- Create ECS cluster
- Create task definitions from images
- Create services with load balancer
- Configure RDS for PostgreSQL
- Configure ElastiCache for Redis

### DigitalOcean Deployment

DigitalOcean is excellent for Docker-based deployments with their Droplets.

**1. Create Droplet**

```bash
# Recommended specifications:
# - Droplet: Basic or General Purpose
# - Size: 2GB RAM minimum ($12/month)
# - OS: Ubuntu 22.04 LTS
# - Region: Choose closest to your users
# - Enable: Monitoring, IPv6
```

**2. Initial Server Setup**

```bash
# SSH into droplet
ssh root@your-droplet-ip

# Create non-root user
adduser deploy
usermod -aG sudo deploy
usermod -aG docker deploy

# Setup firewall
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw enable

# Switch to deploy user
su - deploy
```

**3. Install Docker**

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**4. Deploy Application**

```bash
# Clone repository
git clone https://github.com/Lucian-Adrian/globant-practice-2025.git
cd globant-practice-2025

# Setup environment
cp .env.production.example .env.production
nano .env.production

# Deploy
./scripts/deploy.sh
```

**5. Setup DigitalOcean Managed Database (Optional)**

For better database management:
- Create PostgreSQL Managed Database cluster
- Update `.env.production` with database credentials
- Configure trusted sources in database settings

### Azure Deployment

**1. Create Azure Container Instance**

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Create resource group
az group create --name driving-school-rg --location eastus

# Create container registry
az acr create --resource-group driving-school-rg \
  --name drivingschoolregistry --sku Basic

# Login to registry
az acr login --name drivingschoolregistry
```

**2. Build and Push Images**

```bash
# Build and push backend
az acr build --registry drivingschoolregistry \
  --image backend:latest \
  --file backend/Dockerfile.prod \
  backend/

# Build and push frontend
az acr build --registry drivingschoolregistry \
  --image frontend:latest \
  --file frontend/Dockerfile.prod \
  frontend/
```

**3. Deploy with Azure Container Instances**

```bash
# Create PostgreSQL database
az postgres server create \
  --resource-group driving-school-rg \
  --name drivingschool-db \
  --location eastus \
  --sku-name B_Gen5_1

# Deploy containers
az container create \
  --resource-group driving-school-rg \
  --name driving-school-app \
  --image drivingschoolregistry.azurecr.io/backend:latest \
  --dns-name-label driving-school \
  --ports 80
```

### GCP Deployment

**📘 For detailed Google Cloud Platform deployment, see: [GCP_DEPLOYMENT.md](GCP_DEPLOYMENT.md)**

The dedicated GCP guide includes:
- Step-by-step Compute Engine VM setup
- Cloud Run serverless deployment
- Google Kubernetes Engine (GKE) setup
- Cloud SQL managed database configuration
- Static IP reservation
- Cost optimization strategies
- Detailed firewall configuration
- Cloud Storage for backups
- Monitoring with Cloud Logging

**Quick Overview:**

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
gcloud init

# Create VM instance
gcloud compute instances create driving-school-vm \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --machine-type=e2-medium \
  --boot-disk-size=20GB \
  --zone=us-central1-a \
  --tags=http-server,https-server

# SSH and deploy
gcloud compute ssh driving-school-vm --zone=us-central1-a
# Then follow standard deployment steps
```

**👉 See [GCP_DEPLOYMENT.md](GCP_DEPLOYMENT.md) for complete guide with screenshots and troubleshooting.**

## SSL/HTTPS Setup

### Option 1: Let's Encrypt (Free, Recommended)

**Install Certbot**

```bash
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx
```

**Obtain Certificate**

```bash
# Stop nginx temporarily
docker compose -f docker-compose.prod.yml stop nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Certificates will be saved to:
# /etc/letsencrypt/live/yourdomain.com/fullchain.pem
# /etc/letsencrypt/live/yourdomain.com/privkey.pem
```

**Configure Nginx for SSL**

Edit `nginx/conf.d/default.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... rest of configuration
}
```

**Update docker-compose.prod.yml**

Add SSL certificate volumes to nginx service:

```yaml
nginx:
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

**Auto-renewal**

```bash
# Test renewal
sudo certbot renew --dry-run

# Setup cron job for auto-renewal
sudo crontab -e

# Add this line:
0 0 * * * certbot renew --quiet --post-hook "docker compose -f /path/to/project/docker-compose.prod.yml restart nginx"
```

### Option 2: CloudFlare SSL (Free)

1. Add your domain to CloudFlare
2. Update nameservers
3. Enable "Flexible SSL" or "Full SSL"
4. CloudFlare will handle SSL termination

## Domain Configuration

### DNS Records

Configure these DNS records:

```
Type    Name    Value               TTL
A       @       your-server-ip      3600
A       www     your-server-ip      3600
CNAME   api     yourdomain.com      3600
```

### Update Application Configuration

1. Edit `.env.production`:
```bash
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
FRONTEND_ORIGIN=https://yourdomain.com
```

2. Update nginx configuration with your domain

3. Restart services:
```bash
docker compose -f docker-compose.prod.yml restart
```

## Monitoring & Logging

### View Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100
```

### Setup Log Rotation

Create `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

Restart Docker:
```bash
sudo systemctl restart docker
```

### Monitoring Tools (Optional)

**Prometheus + Grafana**

Add to `docker-compose.prod.yml`:

```yaml
services:
  prometheus:
    image: prom/prometheus
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "127.0.0.1:9090:9090"
  
  grafana:
    image: grafana/grafana
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "127.0.0.1:3001:3000"
    depends_on:
      - prometheus
```

**Application Performance Monitoring**

Consider integrating:
- **Sentry** for error tracking
- **New Relic** for APM
- **DataDog** for infrastructure monitoring

## Backup & Recovery

### Automated Backups

**Setup Cron Job**

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/project/scripts/backup.sh

# Add weekly backup with upload to S3
0 3 * * 0 /path/to/project/scripts/backup.sh && aws s3 cp /path/to/project/backups/ s3://your-bucket/backups/ --recursive
```

### Manual Backup

```bash
./scripts/backup.sh
```

### Restore from Backup

```bash
./scripts/restore.sh ./backups/db_backup_20250113_120000.sql.gz
```

### Backup to Cloud Storage

**AWS S3**

```bash
# Install AWS CLI
pip install awscli

# Configure
aws configure

# Upload backups
aws s3 sync ./backups/ s3://your-bucket/backups/
```

**DigitalOcean Spaces**

```bash
# Install s3cmd
sudo apt-get install s3cmd

# Configure
s3cmd --configure

# Upload
s3cmd sync ./backups/ s3://your-space/backups/
```

## Security Best Practices

### 1. Server Hardening

```bash
# Update system regularly
sudo apt-get update && sudo apt-get upgrade -y

# Configure firewall
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Disable root SSH login
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd

# Setup fail2ban
sudo apt-get install fail2ban
sudo systemctl enable fail2ban
```

### 2. Container Security

- Use official base images
- Run containers as non-root users (already configured)
- Scan images for vulnerabilities:
```bash
docker scan backend:latest
```

### 3. Secrets Management

**Never commit secrets to git!**

Options for production:
- **AWS Secrets Manager**
- **HashiCorp Vault**
- **Azure Key Vault**
- **Environment variables** (minimum)

### 4. Database Security

- Use strong passwords
- Limit network access
- Enable SSL connections
- Regular backups
- Regular updates

### 5. Application Security

- [ ] HTTPS enforced
- [ ] CSRF protection enabled (`DISABLE_CSRF=0`)
- [ ] Strong `DJANGO_SECRET_KEY`
- [ ] Debug mode disabled (`DJANGO_DEBUG=0`)
- [ ] Allowed hosts configured
- [ ] Rate limiting enabled (in Nginx)
- [ ] Security headers configured
- [ ] Regular dependency updates

### 6. Network Security

- Minimize exposed ports
- Use private networks for inter-container communication
- Configure firewall rules
- Use VPN for administrative access

## Scaling Considerations

### Horizontal Scaling

**Multiple Backend Instances**

```yaml
backend:
  deploy:
    replicas: 3
```

**Load Balancing**

Nginx handles load balancing automatically when multiple backend instances exist.

### Vertical Scaling

Increase server resources:
- More CPU cores
- More RAM
- Faster storage (SSD)

### Database Scaling

- Read replicas for read-heavy workloads
- Connection pooling (PgBouncer)
- Managed database services with auto-scaling

### Caching Strategy

Redis is already included for:
- Session storage
- Database query caching
- API response caching

## Troubleshooting

### Service Won't Start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs

# Check service status
docker compose -f docker-compose.prod.yml ps

# Rebuild and restart
docker compose -f docker-compose.prod.yml up --build -d
```

### Database Connection Issues

```bash
# Check database health
docker compose -f docker-compose.prod.yml exec db pg_isready -U $POSTGRES_USER

# Check network connectivity
docker compose -f docker-compose.prod.yml exec backend ping db
```

### SSL Certificate Issues

```bash
# Test certificate
openssl s_client -connect yourdomain.com:443

# Renew certificate
sudo certbot renew
```

### Performance Issues

```bash
# Check resource usage
docker stats

# Check database queries
docker compose -f docker-compose.prod.yml exec db psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT * FROM pg_stat_activity;"
```

## Maintenance

### Regular Tasks

- [ ] Weekly: Review logs
- [ ] Weekly: Check disk space
- [ ] Weekly: Backup verification
- [ ] Monthly: Update system packages
- [ ] Monthly: Update Docker images
- [ ] Monthly: Review security advisories
- [ ] Quarterly: Rotate secrets
- [ ] Quarterly: Review and optimize database

### Update Procedure

```bash
# 1. Backup
./scripts/backup.sh

# 2. Pull latest code
git pull origin main

# 3. Rebuild images
docker compose -f docker-compose.prod.yml build

# 4. Update with zero downtime
docker compose -f docker-compose.prod.yml up -d --no-deps --build backend
docker compose -f docker-compose.prod.yml up -d --no-deps --build frontend

# 5. Run migrations
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# 6. Verify
docker compose -f docker-compose.prod.yml ps
```

## Cost Optimization

### Cloud Provider Costs (Monthly estimates)

**AWS EC2**
- t3.medium: ~$30/month
- EBS 20GB: ~$2/month
- Data transfer: ~$5-20/month
- Total: ~$35-50/month

**DigitalOcean**
- 2GB Droplet: $12/month
- Managed Database: $15/month (optional)
- Total: $12-27/month

**Azure**
- B2s VM: ~$30/month
- Storage: ~$5/month
- Total: ~$35/month

**Cost Saving Tips**
- Use reserved instances (AWS)
- Schedule non-production environments to shut down at night
- Use CDN for static assets
- Implement efficient caching
- Optimize Docker images

## Support & Resources

- [Docker Documentation](https://docs.docker.com/)
- [Django Deployment Checklist](https://docs.djangoproject.com/en/stable/howto/deployment/checklist/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Let's Encrypt](https://letsencrypt.org/)

## Getting Help

If you encounter issues:

1. Check application logs
2. Review this documentation
3. Check [CONTRIBUTING.md](CONTRIBUTING.md)
4. Open an issue on GitHub

---

**Successfully deployed? Congratulations! 🎉**

Your driving school management system is now running professionally in the cloud!
