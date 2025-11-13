# Production Deployment Quick Start

This is a quick reference guide for deploying to production. For detailed instructions, see [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md).

## Prerequisites

- Server with Docker and Docker Compose installed
- Domain name (optional but recommended)
- SSL certificate (Let's Encrypt recommended)

## 5-Minute Setup

### 1. Server Preparation

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sudo sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create non-root user
sudo adduser deploy
sudo usermod -aG docker deploy
```

### 2. Clone and Configure

```bash
# Switch to deploy user
su - deploy

# Clone repository
git clone https://github.com/Lucian-Adrian/globant-practice-2025.git
cd globant-practice-2025

# Create production environment file
cp .env.production.example .env.production

# Edit environment variables (IMPORTANT!)
nano .env.production
```

**Required changes in .env.production:**

```bash
# Generate secret key
python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'

# Update these values:
DJANGO_SECRET_KEY=<your-generated-key>
DJANGO_DEBUG=0
POSTGRES_PASSWORD=<strong-password>
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
FRONTEND_ORIGIN=https://yourdomain.com
DISABLE_CSRF=0
```

### 3. Deploy

```bash
# Deploy application
./scripts/deploy.sh
```

That's it! Your application is now running.

### 4. Setup SSL (Recommended)

```bash
# Install Certbot
sudo apt-get install -y certbot

# Stop nginx temporarily
docker compose -f docker-compose.prod.yml stop nginx

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Update nginx config to use SSL (see CLOUD_DEPLOYMENT.md)

# Restart nginx
docker compose -f docker-compose.prod.yml start nginx
```

## Access Your Application

- **Frontend**: http://yourdomain.com (or http://your-server-ip)
- **Admin**: http://yourdomain.com/admin/
- **API**: http://yourdomain.com/api/
- **API Docs**: http://yourdomain.com/api/docs/swagger/

## Default Credentials

If you configured `DJANGO_SUPERUSER_*` in `.env.production`, use those credentials.

Otherwise, create superuser:

```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

## Common Commands

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Stop services
docker compose -f docker-compose.prod.yml stop

# Start services
docker compose -f docker-compose.prod.yml start

# Update application
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build

# Backup database
./scripts/backup.sh

# View running services
docker compose -f docker-compose.prod.yml ps
```

## Troubleshooting

### Can't access application

```bash
# Check if services are running
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs

# Check firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Database connection issues

```bash
# Check database health
docker compose -f docker-compose.prod.yml exec db pg_isready -U drivingschool_prod

# Check environment variables
docker compose -f docker-compose.prod.yml config
```

### Fresh start (WARNING: Deletes all data!)

```bash
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
```

## Security Checklist

- [ ] Strong passwords set for database and superuser
- [ ] `DJANGO_DEBUG=0` in production
- [ ] `DJANGO_SECRET_KEY` is unique and secret
- [ ] `DJANGO_ALLOWED_HOSTS` configured with your domain
- [ ] `DISABLE_CSRF=0` (CSRF protection enabled)
- [ ] SSL certificate configured (HTTPS)
- [ ] Firewall configured (only ports 22, 80, 443 open)
- [ ] Regular backups scheduled
- [ ] Database not exposed to public internet

## Next Steps

1. **Setup CI/CD**: See [CI_CD_SETUP.md](CI_CD_SETUP.md)
2. **Configure monitoring**: Add Sentry, Prometheus, or other monitoring tools
3. **Setup automated backups**: Configure cron jobs for regular backups
4. **Review security**: Follow all recommendations in [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md)

## Need Help?

- Full deployment guide: [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md)
- CI/CD setup: [CI_CD_SETUP.md](CI_CD_SETUP.md)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
- Open an issue on GitHub

---

**🎉 Congratulations on your production deployment!**
