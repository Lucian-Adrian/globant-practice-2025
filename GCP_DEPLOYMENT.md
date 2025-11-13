# Google Cloud Platform Deployment Guide

Complete guide for deploying the Driving School Management System to Google Cloud Platform (GCP).

## Table of Contents

1. [Deployment Options](#deployment-options)
2. [Option 1: Google Compute Engine (VM)](#option-1-google-compute-engine-vm)
3. [Option 2: Google Cloud Run](#option-2-google-cloud-run)
4. [Option 3: Google Kubernetes Engine](#option-3-google-kubernetes-engine)
5. [Cloud SQL Setup](#cloud-sql-setup)
6. [Storage and Backups](#storage-and-backups)
7. [Monitoring and Logging](#monitoring-and-logging)
8. [Cost Optimization](#cost-optimization)

## Deployment Options

| Option | Best For | Monthly Cost | Complexity |
|--------|----------|--------------|------------|
| Compute Engine (VM) | Full control, easiest | $25-50 | Low |
| Cloud Run | Serverless, auto-scaling | $10-30 | Medium |
| Kubernetes Engine (GKE) | Large scale, microservices | $75+ | High |

**Recommended for beginners:** Compute Engine VM

## Option 1: Google Compute Engine (VM)

This is the recommended option - similar to AWS EC2 or DigitalOcean Droplet.

### Step 1: Setup GCP Account

1. **Create GCP Account**
   - Visit: https://cloud.google.com/
   - Click "Get started for free"
   - You get $300 free credit for 90 days

2. **Create Project**
   ```bash
   # Visit: https://console.cloud.google.com/
   # Click "Select a project" → "New Project"
   # Name: driving-school-prod
   # Click "Create"
   ```

### Step 2: Install Google Cloud SDK

**Linux/Mac:**
```bash
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
```

**Windows:**
- Download from: https://cloud.google.com/sdk/docs/install
- Run installer
- Open "Google Cloud SDK Shell"
- Run: `gcloud init`

**Configure:**
```bash
# Login
gcloud auth login

# Set project
gcloud config set project YOUR_PROJECT_ID

# Set default region (choose closest to your users)
gcloud config set compute/region us-central1
gcloud config set compute/zone us-central1-a
```

### Step 3: Create VM Instance

**Via Console (Easy):**

1. Go to: https://console.cloud.google.com/compute/instances
2. Click "Create Instance"
3. Configure:
   - **Name:** driving-school-vm
   - **Region:** us-central1 (or closest to your users)
   - **Zone:** us-central1-a
   - **Machine type:** e2-medium (2 vCPU, 4GB RAM) - $25/month
   - **Boot disk:** 
     - Ubuntu 22.04 LTS
     - Size: 20 GB SSD
   - **Firewall:** Check "Allow HTTP traffic" and "Allow HTTPS traffic"
4. Click "Create"

**Via Command Line:**

```bash
gcloud compute instances create driving-school-vm \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=20GB \
  --boot-disk-type=pd-ssd \
  --tags=http-server,https-server \
  --zone=us-central1-a
```

### Step 4: Configure Firewall Rules

```bash
# Allow HTTP
gcloud compute firewall-rules create allow-http \
  --allow tcp:80 \
  --target-tags http-server \
  --description "Allow HTTP traffic"

# Allow HTTPS
gcloud compute firewall-rules create allow-https \
  --allow tcp:443 \
  --target-tags https-server \
  --description "Allow HTTPS traffic"

# Allow SSH (usually already exists)
gcloud compute firewall-rules create allow-ssh \
  --allow tcp:22 \
  --description "Allow SSH"
```

### Step 5: Reserve Static IP (Recommended)

```bash
# Create static IP
gcloud compute addresses create driving-school-ip \
  --region=us-central1

# Get the IP address
gcloud compute addresses describe driving-school-ip \
  --region=us-central1 \
  --format="get(address)"

# Assign to VM
gcloud compute instances delete-access-config driving-school-vm \
  --access-config-name "external-nat" \
  --zone=us-central1-a

gcloud compute instances add-access-config driving-school-vm \
  --access-config-name "external-nat" \
  --address driving-school-ip \
  --zone=us-central1-a
```

### Step 6: Connect to VM and Install Docker

```bash
# SSH into VM
gcloud compute ssh driving-school-vm --zone=us-central1-a

# Now you're on the VM - run these commands:

# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add current user to docker group
sudo usermod -aG docker $USER

# Log out and back in for group changes
exit
```

### Step 7: Deploy Application

```bash
# SSH back in
gcloud compute ssh driving-school-vm --zone=us-central1-a

# Clone repository
git clone https://github.com/Lucian-Adrian/globant-practice-2025.git
cd globant-practice-2025

# Setup environment
cp .env.production.example .env.production
nano .env.production

# Update these values in .env.production:
# DJANGO_SECRET_KEY=<generate-new-key>
# DJANGO_DEBUG=0
# POSTGRES_PASSWORD=<strong-password>
# DJANGO_ALLOWED_HOSTS=YOUR_STATIC_IP,yourdomain.com
# FRONTEND_ORIGIN=http://YOUR_STATIC_IP

# Deploy
./scripts/deploy.sh
```

### Step 8: Configure Domain (Optional but Recommended)

1. **Point domain to GCP IP:**
   - Get your static IP: 
     ```bash
     gcloud compute addresses describe driving-school-ip --region=us-central1 --format="get(address)"
     ```
   - In your domain registrar (Namecheap, GoDaddy, etc.):
     - Create A record: `@` → `YOUR_STATIC_IP`
     - Create A record: `www` → `YOUR_STATIC_IP`

2. **Wait for DNS propagation** (up to 48 hours, usually ~1 hour)

3. **Verify DNS:**
   ```bash
   dig yourdomain.com
   ```

### Step 9: Setup SSL with Let's Encrypt

```bash
# SSH into VM
gcloud compute ssh driving-school-vm --zone=us-central1-a

cd globant-practice-2025

# Stop nginx temporarily
docker compose -f docker-compose.prod.yml stop nginx

# Install Certbot
sudo apt-get install -y certbot

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Update nginx configuration to use SSL
# Edit nginx/conf.d/default.conf and uncomment SSL lines
nano nginx/conf.d/default.conf

# Add certificate volumes to docker-compose.prod.yml
nano docker-compose.prod.yml
# Under nginx service, volumes section, add:
# - /etc/letsencrypt:/etc/letsencrypt:ro

# Restart services
docker compose -f docker-compose.prod.yml up -d

# Setup auto-renewal
sudo crontab -e
# Add this line:
# 0 0 * * * certbot renew --quiet --post-hook "cd /home/YOUR_USERNAME/globant-practice-2025 && docker compose -f docker-compose.prod.yml restart nginx"
```

### Step 10: Verify Deployment

```bash
# Check services
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Test application
curl http://YOUR_STATIC_IP
curl https://yourdomain.com
```

## Option 2: Google Cloud Run

Serverless container deployment - auto-scales from 0 to many instances.

### Prerequisites

```bash
# Enable required APIs
gcloud services enable run.googleapis.com
gcloud services enable containerregistry.googleapis.com
gcloud services enable sqladmin.googleapis.com
```

### Step 1: Setup Cloud SQL (Database)

```bash
# Create PostgreSQL instance
gcloud sql instances create driving-school-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1

# Set root password
gcloud sql users set-password postgres \
  --instance=driving-school-db \
  --password=YOUR_STRONG_PASSWORD

# Create database
gcloud sql databases create drivingschool --instance=driving-school-db

# Get instance connection name
gcloud sql instances describe driving-school-db \
  --format="get(connectionName)"
# Save this for later: PROJECT_ID:REGION:INSTANCE_NAME
```

### Step 2: Build and Push Container

```bash
# Configure Docker for GCR
gcloud auth configure-docker

# Set project ID
export PROJECT_ID=$(gcloud config get-value project)

# Build backend
cd backend
docker build -f Dockerfile.prod -t gcr.io/$PROJECT_ID/driving-school-backend:latest .
docker push gcr.io/$PROJECT_ID/driving-school-backend:latest

# Build frontend
cd ../frontend
docker build -f Dockerfile.prod -t gcr.io/$PROJECT_ID/driving-school-frontend:latest .
docker push gcr.io/$PROJECT_ID/driving-school-frontend:latest
```

### Step 3: Deploy to Cloud Run

```bash
# Deploy backend
gcloud run deploy driving-school-backend \
  --image gcr.io/$PROJECT_ID/driving-school-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances PROJECT_ID:REGION:INSTANCE_NAME \
  --set-env-vars DJANGO_SECRET_KEY=YOUR_SECRET \
  --set-env-vars POSTGRES_DB=drivingschool \
  --set-env-vars POSTGRES_USER=postgres \
  --set-env-vars POSTGRES_PASSWORD=YOUR_PASSWORD \
  --set-env-vars DB_HOST=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME

# Deploy frontend
gcloud run deploy driving-school-frontend \
  --image gcr.io/$PROJECT_ID/driving-school-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Note:** Cloud Run is more complex for this full-stack app. VM deployment is recommended.

## Cloud SQL Setup

For production, use managed Cloud SQL instead of containerized PostgreSQL.

### Create Cloud SQL Instance

```bash
# Create instance
gcloud sql instances create driving-school-db \
  --database-version=POSTGRES_15 \
  --tier=db-g1-small \
  --region=us-central1 \
  --backup \
  --backup-start-time=02:00

# Create database
gcloud sql databases create drivingschool \
  --instance=driving-school-db

# Create user
gcloud sql users create drivingschool_user \
  --instance=driving-school-db \
  --password=STRONG_PASSWORD

# Get connection details
gcloud sql instances describe driving-school-db
```

### Connect from VM

1. **Install Cloud SQL Proxy on VM:**
```bash
wget https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 -O cloud_sql_proxy
chmod +x cloud_sql_proxy

# Run proxy (or add to systemd)
./cloud_sql_proxy -instances=PROJECT_ID:REGION:INSTANCE_NAME=tcp:5432 &
```

2. **Update .env.production:**
```bash
DB_HOST=127.0.0.1
DB_PORT=5432
POSTGRES_DB=drivingschool
POSTGRES_USER=drivingschool_user
POSTGRES_PASSWORD=STRONG_PASSWORD
```

## Storage and Backups

### Automated Backups to Cloud Storage

```bash
# Create storage bucket
gsutil mb -l us-central1 gs://driving-school-backups

# Update backup script to upload to GCS
# Edit scripts/backup.sh and add at the end:
gsutil cp ${BACKUP_FILE}.gz gs://driving-school-backups/

# Schedule automated backups
crontab -e
# Add:
0 2 * * * cd /home/YOUR_USERNAME/globant-practice-2025 && ./scripts/backup.sh
```

### Static Files on Cloud Storage

For serving static files from GCS:

1. **Create public bucket:**
```bash
gsutil mb -l us-central1 gs://driving-school-static
gsutil iam ch allUsers:objectViewer gs://driving-school-static
```

2. **Configure Django settings:**
```python
# In backend/project/settings.py
USE_GCS = os.getenv('USE_GCS', '0') == '1'
if USE_GCS:
    DEFAULT_FILE_STORAGE = 'storages.backends.gcloud.GoogleCloudStorage'
    GS_BUCKET_NAME = 'driving-school-static'
```

## Monitoring and Logging

### Setup Cloud Monitoring

```bash
# Install monitoring agent on VM
curl -sSO https://dl.google.com/cloudagents/add-google-cloud-ops-agent-repo.sh
sudo bash add-google-cloud-ops-agent-repo.sh --also-install

# View logs in Cloud Console
# https://console.cloud.google.com/logs
```

### Configure Alerts

1. Go to: https://console.cloud.google.com/monitoring
2. Create alert policies for:
   - High CPU usage (> 80%)
   - High memory usage (> 90%)
   - Disk space (> 80%)
   - Service downtime

## Cost Optimization

### Estimated Monthly Costs

**Compute Engine (VM):**
- e2-micro (free tier): $0/month (limited performance)
- e2-small (1 vCPU, 2GB): ~$13/month
- e2-medium (2 vCPU, 4GB): ~$25/month ⭐ Recommended
- e2-standard-2 (2 vCPU, 8GB): ~$50/month

**Additional Costs:**
- Static IP: $0 (free while in use)
- Storage (20GB SSD): ~$3/month
- Cloud SQL (optional): $10-50/month
- Egress traffic: First 1GB free, then ~$0.12/GB
- Backups (Cloud Storage): ~$0.50/month

**Total estimated cost: $25-30/month** for basic setup

### Cost Saving Tips

1. **Use Preemptible VMs** (for dev/staging):
   ```bash
   --preemptible flag (up to 80% cheaper)
   ```

2. **Use sustained use discounts** (automatic)

3. **Stop VM when not needed:**
   ```bash
   gcloud compute instances stop driving-school-vm --zone=us-central1-a
   ```

4. **Use Cloud Storage lifecycle policies** for old backups

5. **Enable budget alerts:**
   - Go to: https://console.cloud.google.com/billing/
   - Set budget alert at $30/month

## Maintenance Commands

```bash
# SSH into VM
gcloud compute ssh driving-school-vm --zone=us-central1-a

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Update application
cd globant-practice-2025
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build

# Backup database
./scripts/backup.sh

# Stop VM (to save costs when not needed)
exit
gcloud compute instances stop driving-school-vm --zone=us-central1-a

# Start VM
gcloud compute instances start driving-school-vm --zone=us-central1-a
```

## Troubleshooting

### Can't connect to VM

```bash
# Check VM status
gcloud compute instances list

# Check firewall rules
gcloud compute firewall-rules list

# Reset VM
gcloud compute instances reset driving-school-vm --zone=us-central1-a
```

### Port not accessible

```bash
# Verify firewall rules allow traffic
gcloud compute firewall-rules describe allow-http

# Check if service is running on VM
gcloud compute ssh driving-school-vm --zone=us-central1-a
sudo netstat -tulpn | grep :80
```

### High costs

```bash
# Check current spend
gcloud billing accounts list

# View detailed usage
# Visit: https://console.cloud.google.com/billing/reports
```

## Security Best Practices

1. **Enable OS Login** (better than SSH keys):
   ```bash
   gcloud compute instances add-metadata driving-school-vm \
     --metadata enable-oslogin=TRUE
   ```

2. **Use Identity-Aware Proxy** for SSH:
   ```bash
   gcloud compute ssh driving-school-vm \
     --zone=us-central1-a \
     --tunnel-through-iap
   ```

3. **Enable VPC firewall logs**

4. **Use Secret Manager** for sensitive data:
   ```bash
   gcloud secrets create django-secret-key --data-file=-
   ```

5. **Regular security updates:**
   ```bash
   sudo apt-get update && sudo apt-get upgrade -y
   ```

## Next Steps

1. ✅ Setup monitoring and alerts
2. ✅ Configure automated backups to Cloud Storage
3. ✅ Setup Cloud CDN for static files (optional)
4. ✅ Configure Cloud Armor for DDoS protection (optional)
5. ✅ Setup staging environment
6. ✅ Review GCP security best practices

## Additional Resources

- [GCP Documentation](https://cloud.google.com/docs)
- [Compute Engine Pricing](https://cloud.google.com/compute/pricing)
- [Cloud SQL Best Practices](https://cloud.google.com/sql/docs/postgres/best-practices)
- [GCP Free Tier](https://cloud.google.com/free)

---

**Successfully deployed on GCP? Great! 🎉**

For CI/CD setup, see [CI_CD_SETUP.md](CI_CD_SETUP.md)
