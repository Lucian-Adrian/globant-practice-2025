# Deployment Resources

This directory contains all deployment-related configurations and documentation for production environments.

## 📁 Directory Structure

```
deployment/
├── docs/              # Deployment guides for different platforms
├── docker/            # Production Docker configurations
├── scripts/           # Deployment automation scripts
└── nginx/             # Nginx reverse proxy configuration
```

## 🚀 For Windows Local Deployment

If you're deploying locally on Windows, see the main **[WINDOWS_DEPLOYMENT.md](../WINDOWS_DEPLOYMENT.md)** guide in the root directory.

**Quick start:**
1. Install Docker Desktop
2. Clone repository
3. Run: `docker compose up --build`

No dual boot needed!

## ☁️ For Cloud Deployment

See the guides in `docs/` folder:
- **PRODUCTION_QUICKSTART.md** - 5-minute quick start
- **CLOUD_DEPLOYMENT.md** - AWS, DigitalOcean, Azure
- **GCP_DEPLOYMENT.md** - Google Cloud Platform
- **HOME_SERVER_DEPLOYMENT.md** - Ubuntu/Linux self-hosted
- **QUICK_DEPLOYMENT_GUIDE.md** - Decision tree for platform selection

## 🐳 Docker Files

Production Docker configurations in `docker/` folder:
- `docker-compose.prod.yml` - Production orchestration
- `backend.Dockerfile` - Optimized backend image
- `frontend.Dockerfile` - Optimized frontend image with Nginx

## 🔧 Scripts

Automation scripts in `scripts/` folder:
- `deploy.sh` - One-command deployment
- `backup.sh` - Database backup automation
- `restore.sh` - Database restore utility

## 📋 Additional Resources

- **DEPLOYMENT_CHECKLIST.md** - Pre-deployment verification checklist
- **CI_CD_SETUP.md** - GitHub Actions CI/CD pipeline setup
