# Quick Deployment Guide

**Choose your deployment platform and follow the appropriate guide:**

## 🚀 I Want the Easiest Cloud Deployment

**Recommended: DigitalOcean**
- **Cost**: $12/month
- **Setup Time**: 15 minutes
- **Guide**: [CLOUD_DEPLOYMENT.md - DigitalOcean Section](CLOUD_DEPLOYMENT.md#digitalocean-deployment)

**Steps:**
1. Create DigitalOcean account
2. Create droplet (Ubuntu 22.04, 2GB)
3. SSH into droplet
4. Run: `curl -fsSL https://get.docker.com | sh`
5. Clone repo and run `./scripts/deploy.sh`

## ☁️ I Want to Use Google Cloud

**Google Cloud Platform**
- **Cost**: $25-50/month
- **Setup Time**: 30 minutes
- **Guide**: [GCP_DEPLOYMENT.md](GCP_DEPLOYMENT.md)

**Steps:**
1. Create GCP account ($300 free credit)
2. Install gcloud CLI
3. Create VM instance with gcloud
4. SSH and deploy

## 🪟 I Have a Windows PC (No Dual Boot!)

**Windows Desktop with Docker Desktop**
- **Cost**: $10-20/month (electricity)
- **Setup Time**: 20 minutes
- **Guide**: [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md)

**Steps:**
1. Install Docker Desktop for Windows
2. Configure port forwarding in router
3. Setup DuckDNS for domain
4. Clone repo and run `docker compose up`

**No dual boot needed!** ✅

## 🐧 I Have Ubuntu/Linux Server

**Ubuntu Server with Port Forwarding**
- **Cost**: $5-15/month (electricity)
- **Setup Time**: 45 minutes
- **Guide**: [HOME_SERVER_DEPLOYMENT.md](HOME_SERVER_DEPLOYMENT.md)

**Steps:**
1. Install Docker on Ubuntu
2. Configure static IP
3. Setup port forwarding
4. Setup DuckDNS
5. Deploy with `./scripts/deploy.sh`

## 📦 I Just Want to Develop Locally

**Local Development**
- **Cost**: Free
- **Setup Time**: 5 minutes
- **Guide**: [README.md](README.md#quick-start)

**Steps:**
```bash
git clone https://github.com/Lucian-Adrian/globant-practice-2025.git
cd globant-practice-2025
docker compose up --build
```

Access at: http://localhost:3000

## 🤔 I'm Not Sure Which to Choose

### Decision Tree:

**Is this for learning/personal use?**
- YES → Use Windows PC or Ubuntu Server at home
  - Have Windows? → [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md)
  - Have Ubuntu? → [HOME_SERVER_DEPLOYMENT.md](HOME_SERVER_DEPLOYMENT.md)

**Is this for business/production?**
- Need easiest setup? → [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md) (DigitalOcean)
- Need scalability? → [GCP_DEPLOYMENT.md](GCP_DEPLOYMENT.md)
- Need enterprise features? → [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md) (AWS)

**Budget considerations:**
- $0-20/month → Home server (Windows or Ubuntu)
- $20-50/month → Cloud (DigitalOcean, GCP, AWS)

## 📋 Required Before Any Deployment

1. **Domain name** (optional but recommended)
   - Buy from Namecheap, GoDaddy, etc. ($10/year)
   - Or use free DuckDNS subdomain

2. **Environment variables**
   - Copy `.env.production.example` to `.env.production`
   - Generate strong `DJANGO_SECRET_KEY`
   - Set strong `POSTGRES_PASSWORD`
   - Configure your domain

3. **SSL Certificate**
   - Use Let's Encrypt (free)
   - Or use Cloudflare (free)

## 🆘 Need Help?

**Start with:**
1. [PRODUCTION_QUICKSTART.md](PRODUCTION_QUICKSTART.md) - 5-minute overview

**Then check platform-specific guide:**
- Cloud: [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md)
- Google Cloud: [GCP_DEPLOYMENT.md](GCP_DEPLOYMENT.md)
- Windows: [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md)
- Ubuntu/Linux: [HOME_SERVER_DEPLOYMENT.md](HOME_SERVER_DEPLOYMENT.md)

**Pre-deployment checklist:**
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

**CI/CD automation:**
- [CI_CD_SETUP.md](CI_CD_SETUP.md)

## 🎯 Most Common Setup: Windows + DuckDNS

If you're on Windows and want to self-host:

1. **Install Docker Desktop** (10 minutes)
   - Download from docker.com
   - Install and enable WSL2

2. **Setup DuckDNS** (5 minutes)
   - Create account at duckdns.org
   - Get free subdomain: `myschool.duckdns.org`

3. **Configure Router** (10 minutes)
   - Log into router (usually 192.168.1.1)
   - Forward port 80 → your PC's IP
   - Forward port 443 → your PC's IP

4. **Deploy Application** (5 minutes)
   ```powershell
   git clone https://github.com/Lucian-Adrian/globant-practice-2025.git
   cd globant-practice-2025
   copy .env.production.example .env.production
   # Edit .env.production with your values
   docker compose -f docker-compose.prod.yml up -d
   ```

5. **Setup SSL with Cloudflare** (10 minutes)
   - Add domain to Cloudflare
   - Point A record to your public IP
   - Enable SSL

**Total time: 40 minutes**  
**Total cost: ~$10-20/month (electricity)**

See [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md) for complete guide!

---

**Ready to deploy? Pick your platform and let's go! 🚀**
