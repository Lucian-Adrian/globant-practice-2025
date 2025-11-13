# Production Deployment Checklist

Use this checklist before deploying to production to ensure everything is configured correctly.

## Pre-Deployment Checklist

### 1. Environment Configuration ⚙️

- [ ] Created `.env.production` from `.env.production.example`
- [ ] Generated strong `DJANGO_SECRET_KEY`
  ```bash
  python3 -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
  ```
- [ ] Generated strong `JWT_SIGNING_KEY` (different from Django secret)
- [ ] Set `DJANGO_DEBUG=0`
- [ ] Configured `DJANGO_ALLOWED_HOSTS` with your domain(s)
- [ ] Set strong `POSTGRES_PASSWORD`
- [ ] Configured superuser credentials (DJANGO_SUPERUSER_*)
- [ ] Set `FRONTEND_ORIGIN` to your production domain
- [ ] Set `DISABLE_CSRF=0` (enable CSRF protection)
- [ ] Configured `BUSINESS_TZ` for your location
- [ ] Reviewed all environment variables

### 2. Domain & DNS 🌐

- [ ] Registered domain name
- [ ] Configured DNS A record to point to server IP
- [ ] Waited for DNS propagation (can take up to 48 hours)
- [ ] Verified DNS with `dig yourdomain.com` or `nslookup yourdomain.com`

### 3. Server Setup 🖥️

- [ ] Provisioned server (AWS, DigitalOcean, Azure, etc.)
- [ ] Server has minimum 2GB RAM
- [ ] Server has minimum 20GB storage
- [ ] Installed Docker
- [ ] Installed Docker Compose
- [ ] Created non-root user for deployment
- [ ] Added deployment user to docker group
- [ ] Configured firewall (ports 22, 80, 443 open)
- [ ] SSH access configured with key-based authentication
- [ ] Server timezone set correctly

### 4. Security Hardening 🔒

- [ ] SSH root login disabled
- [ ] SSH password authentication disabled (key-only)
- [ ] Firewall configured (ufw or iptables)
- [ ] Fail2ban installed and configured (optional but recommended)
- [ ] All passwords are strong and unique
- [ ] `.env.production` is not committed to git
- [ ] Server OS and packages updated
- [ ] Security patches applied

### 5. SSL Certificate 🔐

- [ ] Chose SSL certificate method (Let's Encrypt recommended)
- [ ] Installed Certbot (for Let's Encrypt)
- [ ] Obtained SSL certificate
- [ ] Configured Nginx with SSL certificate paths
- [ ] Verified HTTPS is working
- [ ] HTTP to HTTPS redirect enabled
- [ ] Certificate auto-renewal configured

### 6. Application Deployment 🚀

- [ ] Cloned repository to production server
- [ ] Placed `.env.production` in project root
- [ ] Reviewed `docker-compose.prod.yml` configuration
- [ ] Reviewed Nginx configuration
- [ ] Tested Docker build locally (optional)
- [ ] Ran `./scripts/deploy.sh`
- [ ] Verified all containers are running
- [ ] Checked logs for errors
- [ ] Applied database migrations
- [ ] Collected static files
- [ ] Created superuser account

### 7. Database 🗄️

- [ ] Database is not exposed to public internet
- [ ] Database password is strong
- [ ] Initial backup created
- [ ] Backup script configured (`scripts/backup.sh`)
- [ ] Automated backups scheduled (cron job)
- [ ] Tested database restore process
- [ ] Database connection pooling configured (optional)

### 8. Testing & Verification ✅

- [ ] Can access frontend at https://yourdomain.com
- [ ] Can access admin at https://yourdomain.com/admin/
- [ ] Can access API at https://yourdomain.com/api/
- [ ] API documentation accessible at /api/docs/swagger/
- [ ] Can log in with superuser credentials
- [ ] Tested creating/editing records in admin
- [ ] Tested API endpoints with Postman/curl
- [ ] Verified static files are loading correctly
- [ ] Checked browser console for errors
- [ ] Tested on mobile devices
- [ ] Verified HTTPS certificate is valid

### 9. Monitoring & Logging 📊

- [ ] Configured application logging
- [ ] Set up log rotation
- [ ] Can access logs via `docker compose logs`
- [ ] Configured external monitoring (optional: Sentry, New Relic)
- [ ] Set up uptime monitoring (optional: Uptime Robot, Pingdom)
- [ ] Configured error notifications
- [ ] Set up performance monitoring (optional)

### 10. CI/CD (Optional but Recommended) 🔄

- [ ] Reviewed `.github/workflows/deploy.yml`
- [ ] Configured GitHub repository secrets
  - [ ] PRODUCTION_HOST
  - [ ] PRODUCTION_USER
  - [ ] PRODUCTION_SSH_KEY
  - [ ] PRODUCTION_PORT (if not 22)
- [ ] Generated SSH key for GitHub Actions
- [ ] Added public key to production server
- [ ] Tested GitHub Actions workflow
- [ ] Configured Slack notifications (optional)
- [ ] Protected main branch (requires PR reviews)

### 11. Backup Strategy 💾

- [ ] Manual backup tested and working
- [ ] Automated daily backups configured
- [ ] Backup retention policy defined (e.g., keep 30 days)
- [ ] Backups stored securely
- [ ] Off-site backup configured (optional: S3, Spaces)
- [ ] Database restore process documented and tested
- [ ] Full system backup strategy defined

### 12. Documentation 📚

- [ ] Reviewed all deployment documentation
- [ ] Team members trained on deployment process
- [ ] Runbook created for common issues
- [ ] Rollback procedure documented
- [ ] Contact information for emergencies documented
- [ ] Update schedule defined

### 13. Performance Optimization ⚡

- [ ] Nginx caching configured
- [ ] Redis caching configured
- [ ] Database indexes reviewed
- [ ] Static files compressed (gzip)
- [ ] CDN configured for static assets (optional)
- [ ] Database query optimization reviewed
- [ ] Application performance tested under load

### 14. Legal & Compliance ⚖️

- [ ] Privacy policy in place (if collecting personal data)
- [ ] Terms of service defined
- [ ] GDPR compliance reviewed (if serving EU users)
- [ ] Data retention policies defined
- [ ] Cookie consent implemented (if required)
- [ ] Security audit completed (recommended)

### 15. Post-Deployment 🎯

- [ ] Monitored logs for 24 hours after deployment
- [ ] Verified automated backups are running
- [ ] Tested all critical user flows
- [ ] Documented any issues encountered
- [ ] Updated team on deployment status
- [ ] Scheduled first maintenance window
- [ ] Added monitoring alerts for critical metrics

## Quick Reference Commands

### Deploy
```bash
./scripts/deploy.sh
```

### Backup
```bash
./scripts/backup.sh
```

### View Logs
```bash
docker compose -f docker-compose.prod.yml logs -f
```

### Restart Services
```bash
docker compose -f docker-compose.prod.yml restart
```

### Check Service Status
```bash
docker compose -f docker-compose.prod.yml ps
```

### Access Backend Shell
```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py shell
```

### Access Database
```bash
docker compose -f docker-compose.prod.yml exec db psql -U $POSTGRES_USER -d $POSTGRES_DB
```

## Emergency Contacts

Document your emergency contacts:

- System Administrator: [Name, Phone, Email]
- DevOps Lead: [Name, Phone, Email]
- Database Administrator: [Name, Phone, Email]
- On-Call Rotation: [Link to schedule]

## Common Issues & Solutions

### Issue: Service won't start
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs [service-name]

# Restart specific service
docker compose -f docker-compose.prod.yml restart [service-name]
```

### Issue: Cannot connect to database
```bash
# Check database health
docker compose -f docker-compose.prod.yml exec db pg_isready

# Verify environment variables
docker compose -f docker-compose.prod.yml config
```

### Issue: SSL certificate expired
```bash
# Renew certificate
sudo certbot renew

# Restart nginx
docker compose -f docker-compose.prod.yml restart nginx
```

### Issue: Disk space full
```bash
# Clean Docker system
docker system prune -a

# Check disk usage
df -h
```

## Rollback Procedure

If deployment fails:

1. **Via Git:**
   ```bash
   git revert HEAD
   git push origin main
   # CI/CD will auto-deploy previous version
   ```

2. **Manual:**
   ```bash
   git checkout <previous-commit>
   docker compose -f docker-compose.prod.yml up -d --build
   ./scripts/restore.sh ./backups/db_backup_YYYYMMDD_HHMMSS.sql.gz
   ```

## Sign-Off

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Lead | | | |
| DevOps Engineer | | | |
| QA Lead | | | |
| Security Officer | | | |

---

**When all items are checked, you're ready for production! 🎉**

For detailed instructions, see:
- [PRODUCTION_QUICKSTART.md](PRODUCTION_QUICKSTART.md)
- [CLOUD_DEPLOYMENT.md](CLOUD_DEPLOYMENT.md)
- [CI_CD_SETUP.md](CI_CD_SETUP.md)
