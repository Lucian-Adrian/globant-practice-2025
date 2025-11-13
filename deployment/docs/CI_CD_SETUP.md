# CI/CD Setup Guide

This document explains how to set up Continuous Integration and Continuous Deployment (CI/CD) for the Driving School Management System.

## Overview

The project includes a GitHub Actions workflow that:
1. Runs automated tests on every push
2. Builds optimized Docker images
3. Pushes images to GitHub Container Registry
4. Deploys to production server automatically

## Prerequisites

- GitHub repository with Actions enabled
- Production server with Docker and SSH access
- Domain name configured (optional but recommended)

## Setup Instructions

### 1. GitHub Repository Secrets

Configure the following secrets in your GitHub repository:

**Navigate to:** Repository Settings → Secrets and variables → Actions → New repository secret

**Required Secrets:**

| Secret Name | Description | Example |
|------------|-------------|---------|
| `PRODUCTION_HOST` | IP address or domain of your production server | `192.168.1.100` or `yourdomain.com` |
| `PRODUCTION_USER` | SSH username for deployment | `deploy` |
| `PRODUCTION_SSH_KEY` | Private SSH key for authentication | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `PRODUCTION_PORT` | SSH port (optional, defaults to 22) | `22` |

**Optional Secrets:**

| Secret Name | Description |
|------------|-------------|
| `SLACK_WEBHOOK` | Slack webhook URL for deployment notifications |
| `SENTRY_DSN` | Sentry DSN for error tracking |

### 2. Generate SSH Key for Deployment

On your local machine:

```bash
# Generate SSH key pair
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/deploy_key

# Copy public key to production server
ssh-copy-id -i ~/.ssh/deploy_key.pub deploy@your-server-ip

# Display private key (copy this to PRODUCTION_SSH_KEY secret)
cat ~/.ssh/deploy_key
```

### 3. Prepare Production Server

On your production server:

```bash
# Create deployment user (if not exists)
sudo adduser deploy
sudo usermod -aG docker deploy
sudo usermod -aG sudo deploy

# Switch to deploy user
su - deploy

# Clone repository
git clone https://github.com/Lucian-Adrian/globant-practice-2025.git
cd globant-practice-2025

# Setup environment
cp .env.production.example .env.production
nano .env.production  # Configure with production values

# Initial deployment
./scripts/deploy.sh
```

### 4. Configure GitHub Actions

The workflow file is located at `.github/workflows/deploy.yml`.

**Workflow Triggers:**
- Automatic: On push to `main` branch
- Manual: Via GitHub Actions UI (workflow_dispatch)

**Workflow Jobs:**

1. **Test**: Runs backend and frontend tests
2. **Build-and-Push**: Builds Docker images and pushes to GitHub Container Registry
3. **Deploy**: Deploys to production server via SSH

### 5. Enable Container Registry

GitHub Container Registry is automatically enabled. Images will be stored at:
- `ghcr.io/lucian-adrian/globant-practice-2025/backend:latest`
- `ghcr.io/lucian-adrian/globant-practice-2025/frontend:latest`

### 6. First Deployment

**Push to main branch:**

```bash
git add .
git commit -m "feat: setup CI/CD pipeline"
git push origin main
```

**Monitor deployment:**
- Navigate to GitHub repository
- Click "Actions" tab
- Watch the workflow run

## Workflow Details

### Test Job

```yaml
- Spins up PostgreSQL database
- Installs Python and Node.js dependencies
- Runs Django tests
- Builds frontend to verify no errors
```

### Build and Push Job

```yaml
- Logs into GitHub Container Registry
- Builds production Docker images
- Tags images with branch name and SHA
- Pushes to registry
```

### Deploy Job

```yaml
- SSHs into production server
- Pulls latest code and images
- Updates running containers
- Runs database migrations
- Collects static files
- Verifies deployment
```

## Customization

### Modify Deployment Script

Edit `.github/workflows/deploy.yml` to customize deployment steps:

```yaml
script: |
  cd /home/${{ secrets.PRODUCTION_USER }}/globant-practice-2025
  
  # Your custom deployment steps here
  docker compose -f docker-compose.prod.yml pull
  docker compose -f docker-compose.prod.yml up -d
  
  # Run migrations
  docker compose -f docker-compose.prod.yml exec -T backend python manage.py migrate
```

### Add Environment-Specific Deployments

For staging environment:

```yaml
deploy-staging:
  name: Deploy to Staging
  if: github.ref == 'refs/heads/develop'
  steps:
    # Similar to production but using staging secrets
```

### Add Slack Notifications

1. Create Slack webhook:
   - Go to Slack → Apps → Incoming Webhooks
   - Create webhook for your channel
   - Copy webhook URL

2. Add to GitHub secrets:
   - Secret name: `SLACK_WEBHOOK`
   - Value: Webhook URL

3. Already configured in workflow!

## Rollback Procedure

If deployment fails or introduces issues:

### Option 1: Rollback via Git

```bash
# On local machine
git revert HEAD
git push origin main

# CI/CD will automatically deploy previous version
```

### Option 2: Manual Rollback

```bash
# SSH into production server
ssh deploy@your-server-ip

cd globant-practice-2025

# Checkout previous version
git log --oneline -5  # Find previous commit
git checkout <previous-commit-sha>

# Redeploy
docker compose -f docker-compose.prod.yml up -d --build

# Restore database if needed
./scripts/restore.sh ./backups/db_backup_YYYYMMDD_HHMMSS.sql.gz
```

### Option 3: Use Previous Docker Images

```bash
# Pull specific version
docker pull ghcr.io/lucian-adrian/globant-practice-2025/backend:main-abc1234
docker pull ghcr.io/lucian-adrian/globant-practice-2025/frontend:main-abc1234

# Tag as latest
docker tag ghcr.io/.../backend:main-abc1234 backend:latest
docker tag ghcr.io/.../frontend:main-abc1234 frontend:latest

# Restart
docker compose -f docker-compose.prod.yml up -d
```

## Monitoring Deployments

### GitHub Actions UI

- View workflow runs: Repository → Actions
- Check logs: Click on workflow run → Click on job
- Re-run failed jobs: Click "Re-run jobs"

### Production Server

```bash
# View running containers
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Check health
curl http://localhost/health
curl http://localhost/api/
```

## Troubleshooting

### Deployment Fails: SSH Connection

**Check:**
- PRODUCTION_HOST is correct
- PRODUCTION_USER has SSH access
- PRODUCTION_SSH_KEY is valid
- Server firewall allows SSH (port 22)

**Test SSH locally:**
```bash
ssh -i deploy_key deploy@your-server-ip
```

### Deployment Fails: Docker Permissions

```bash
# On production server
sudo usermod -aG docker deploy
sudo systemctl restart docker
```

### Deployment Fails: Disk Space

```bash
# Clean up Docker
docker system prune -a
docker volume prune
```

### Tests Fail

```bash
# Run tests locally
cd backend
python manage.py test

cd frontend
npm test
```

### Images Not Building

**Check Dockerfile syntax:**
```bash
# Test build locally
docker build -f backend/Dockerfile.prod -t test-backend backend/
docker build -f frontend/Dockerfile.prod -t test-frontend frontend/
```

## Best Practices

### 1. Branch Strategy

- `main`: Production-ready code (auto-deploys)
- `develop`: Development branch (optional staging deploy)
- `feature/*`: Feature branches (no auto-deploy)

### 2. Testing Before Merge

- All PRs should pass tests
- Manual testing in staging environment
- Code review required

### 3. Database Migrations

- Always include migrations in commits
- Test migrations on staging first
- Backup before deploying migrations

### 4. Rollback Plan

- Always have a rollback plan
- Keep previous Docker images
- Maintain regular database backups

### 5. Zero-Downtime Deployments

For production systems:
- Use blue-green deployment
- Health checks before routing traffic
- Rolling updates for multiple instances

## Advanced: Blue-Green Deployment

For zero-downtime deployments:

**1. Update docker-compose.prod.yml:**

```yaml
services:
  backend-blue:
    # Current production
    
  backend-green:
    # New version
    
  nginx:
    # Switch upstream between blue and green
```

**2. Deployment script:**

```bash
# Deploy to green
docker compose up -d backend-green

# Health check
curl http://backend-green:8000/health

# Switch nginx upstream to green
# ...

# Remove blue
docker compose stop backend-blue
```

## Security Considerations

### Secrets Management

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate SSH keys regularly
- Use separate SSH keys for CI/CD

### Access Control

- Limit who can trigger deployments
- Use branch protection rules
- Require approvals for production deployments

### Audit Trail

- GitHub Actions provides full audit trail
- Review deployment history regularly
- Monitor for unauthorized changes

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/marketplace/actions/build-and-push-docker-images)
- [SSH Action](https://github.com/marketplace/actions/ssh-remote-commands)

## Support

If you need help with CI/CD setup:

1. Check GitHub Actions logs
2. Review this documentation
3. Check [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md)
4. Open an issue on GitHub

---

**Happy Deploying! 🚀**
