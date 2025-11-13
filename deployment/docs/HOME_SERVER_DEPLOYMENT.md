# Home Server Deployment Guide

Complete guide for deploying the Driving School Management System on your home server or local desktop with router port forwarding.

> **🪟 Running Windows?** Check out [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md) for Windows-specific instructions using Docker Desktop (no dual boot needed!)

> **This guide is for Ubuntu/Linux servers.** If you're on Windows, you have two options:
> 1. Use [WINDOWS_DEPLOYMENT.md](WINDOWS_DEPLOYMENT.md) - Deploy directly on Windows with Docker Desktop ✅ **Recommended**
> 2. Follow this guide if you want to dual boot or use a dedicated Ubuntu machine

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Network Setup](#network-setup)
4. [Router Port Forwarding](#router-port-forwarding)
5. [Dynamic DNS Setup](#dynamic-dns-setup)
6. [Server Setup](#server-setup)
7. [SSL Certificate Setup](#ssl-certificate-setup)
8. [Security Considerations](#security-considerations)
9. [Troubleshooting](#troubleshooting)
10. [Maintenance](#maintenance)

## Overview

### Pros of Home Server Deployment

✅ **No monthly hosting costs** (except electricity ~$5-15/month)  
✅ **Full control** over hardware and configuration  
✅ **No bandwidth limits** (depends on your ISP)  
✅ **Learn valuable skills** in server administration  
✅ **Can use existing hardware** (old PC, Raspberry Pi, etc.)

### Cons of Home Server Deployment

❌ **Your ISP's uptime** (power outages, internet downtime)  
❌ **Dynamic IP address** (requires DDNS)  
❌ **ISP may block ports** (port 80, 25, etc.)  
❌ **Security responsibility** is yours  
❌ **Slower upload speeds** (affects visitors' experience)  
❌ **No automatic scaling**  
❌ **Residential IP might be blacklisted** by some services

### Is This Right for You?

**Good for:**
- Personal projects and learning
- Internal company tools
- Development and testing
- Small user base (<100 concurrent users)
- Budget-conscious deployments

**Not recommended for:**
- Mission-critical applications
- High-traffic websites (>10,000 visitors/day)
- When 24/7 uptime is required
- When you lack technical expertise
- Applications handling sensitive financial data

## Prerequisites

### Hardware Requirements

**Minimum:**
- 2 CPU cores (or Raspberry Pi 4)
- 4GB RAM
- 20GB storage
- Ethernet connection (recommended over WiFi)

**Recommended:**
- 4 CPU cores
- 8GB RAM
- 50GB SSD storage
- Gigabit Ethernet
- UPS (Uninterruptible Power Supply)

### Software Requirements

- Ubuntu 22.04 LTS (or Ubuntu Server)
- Docker and Docker Compose
- SSH server
- Router with port forwarding capability
- Static local IP address

### ISP Requirements

- Residential or business internet connection
- Reasonable upload speed (5+ Mbps recommended)
- ISP doesn't block ports 80 and 443
- Ideally, no CGNAT (Carrier-Grade NAT)

## Network Setup

### Step 1: Find Your Local IP Address

**Linux/Mac:**
```bash
ip addr show
# or
ifconfig

# Look for inet 192.168.x.x or 10.0.x.x
```

**Windows:**
```cmd
ipconfig

# Look for IPv4 Address: 192.168.x.x
```

Example: Your local IP might be `192.168.1.100`

### Step 2: Set Static Local IP

You need a static local IP so port forwarding doesn't break when the server reboots.

**Option A: Configure in Ubuntu (Recommended)**

```bash
# Find your network interface name
ip link show

# Edit netplan configuration
sudo nano /etc/netplan/01-netcfg.yaml
```

Add this configuration:
```yaml
network:
  version: 2
  renderer: networkd
  ethernets:
    enp0s3:  # Replace with your interface name
      dhcp4: no
      addresses:
        - 192.168.1.100/24  # Your chosen static IP
      gateway4: 192.168.1.1  # Your router's IP
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]
```

Apply changes:
```bash
sudo netplan apply
```

**Option B: Configure in Router (DHCP Reservation)**

1. Log into your router admin panel
2. Find DHCP settings
3. Reserve IP `192.168.1.100` for your server's MAC address
4. Save and reboot router

### Step 3: Find Your Public IP Address

```bash
curl ifconfig.me
# or
curl ipinfo.io/ip
```

This is the IP address the internet sees. Example: `203.0.113.45`

**Note:** If you have a dynamic IP (changes periodically), you'll need DDNS (see later section).

## Router Port Forwarding

### Common Router Admin URLs

Try these URLs in your browser:
- http://192.168.1.1
- http://192.168.0.1
- http://10.0.0.1
- http://router.asus.com (ASUS)
- http://routerlogin.net (Netgear)

### Step-by-Step Port Forwarding

Every router interface is different, but the process is similar:

1. **Access Router Admin Panel**
   - Open browser to router IP (usually 192.168.1.1)
   - Login with admin credentials
   - Default credentials often on router label

2. **Find Port Forwarding Section**
   - Look for: "Port Forwarding", "Virtual Server", "NAT", or "Applications"
   - Common menu paths:
     - Advanced → Port Forwarding
     - NAT → Port Forwarding
     - WAN → Virtual Server

3. **Create Port Forwarding Rules**

   **Rule 1: HTTP (Port 80)**
   ```
   Service Name: HTTP
   External Port: 80
   Internal IP: 192.168.1.100
   Internal Port: 80
   Protocol: TCP
   Enabled: Yes
   ```

   **Rule 2: HTTPS (Port 443)**
   ```
   Service Name: HTTPS
   External Port: 443
   Internal IP: 192.168.1.100
   Internal Port: 443
   Protocol: TCP
   Enabled: Yes
   ```

   **Rule 3: SSH (Port 22) - Optional but recommended**
   ```
   Service Name: SSH
   External Port: 2222  # Different from default for security
   Internal IP: 192.168.1.100
   Internal Port: 22
   Protocol: TCP
   Enabled: Yes
   ```

4. **Save and Apply**
   - Click Save/Apply
   - Router may reboot

### Verify Port Forwarding

```bash
# Install nmap if not available
sudo apt-get install nmap

# Test from outside your network (use phone's mobile data)
# Or use online tools:
# - https://www.yougetsignal.com/tools/open-ports/
# - https://canyouseeme.org/

# Test port 80
curl http://YOUR_PUBLIC_IP
```

### Troubleshooting Port Forwarding

**ISP Blocks Ports:**

Some ISPs block port 80 and 443 on residential connections.

**Workaround: Use non-standard ports**

```bash
# In docker-compose.prod.yml, change:
nginx:
  ports:
    - "8080:80"   # HTTP on port 8080
    - "8443:443"  # HTTPS on port 8443
```

Then forward:
- External 8080 → Internal 8080
- External 8443 → Internal 8443

Access: `http://your-domain.com:8080`

**CGNAT Issues:**

If your ISP uses CGNAT (Carrier-Grade NAT), port forwarding won't work.

Check if you're behind CGNAT:
```bash
# Get your router's WAN IP (in router admin)
# Compare with your public IP (curl ifconfig.me)
# If different, you're behind CGNAT
```

**Solutions:**
1. Call ISP and request a public IP address (may cost extra)
2. Use IPv6 if available
3. Use a VPN tunnel service (ZeroTier, Tailscale)
4. Use Cloudflare Tunnel (free, no port forwarding needed)

## Dynamic DNS Setup

If your public IP changes (dynamic IP), use DDNS to keep a consistent domain.

### Popular Free DDNS Providers

- [No-IP](https://www.noip.com/) - Free with one hostname
- [DuckDNS](https://www.duckdns.org/) - Completely free, easy
- [Dynu](https://www.dynu.com/) - Free with multiple hostnames
- [FreeDNS](https://freedns.afraid.org/) - Free with ads

### Setup with DuckDNS (Recommended)

1. **Create Account**
   - Visit: https://www.duckdns.org/
   - Sign in with GitHub, Google, etc.
   - It's completely free!

2. **Create Subdomain**
   - Choose subdomain: `myschool.duckdns.org`
   - Click "Add domain"
   - Note your token (long string)

3. **Install Update Script on Server**

   ```bash
   # Create directory
   mkdir ~/duckdns
   cd ~/duckdns

   # Create update script
   cat > duck.sh << 'EOF'
   #!/bin/bash
   echo url="https://www.duckdns.org/update?domains=myschool&token=YOUR_TOKEN&ip=" | curl -k -o ~/duckdns/duck.log -K -
   EOF

   # Replace YOUR_TOKEN with your actual token
   nano duck.sh

   # Make executable
   chmod +x duck.sh

   # Test it
   ./duck.sh
   cat duck.log  # Should say "OK"
   ```

4. **Auto-Update Every 5 Minutes**

   ```bash
   crontab -e

   # Add this line:
   */5 * * * * ~/duckdns/duck.sh >/dev/null 2>&1
   ```

5. **Update DNS in Application**

   ```bash
   # In .env.production:
   DJANGO_ALLOWED_HOSTS=myschool.duckdns.org,www.myschool.duckdns.org
   FRONTEND_ORIGIN=https://myschool.duckdns.org
   ```

### Alternative: No-IP Setup

1. Sign up at: https://www.noip.com/
2. Create hostname: `myschool.ddns.net`
3. Install DUC (Dynamic Update Client):

```bash
cd /usr/local/src
sudo wget http://www.noip.com/client/linux/noip-duc-linux.tar.gz
sudo tar xzf noip-duc-linux.tar.gz
cd noip-2.1.9-1
sudo make
sudo make install

# Configure (enter your No-IP credentials)
sudo /usr/local/bin/noip2 -C

# Start service
sudo /usr/local/bin/noip2

# Make it start on boot
sudo nano /etc/systemd/system/noip2.service
```

Add:
```ini
[Unit]
Description=No-IP Dynamic DNS Update Client
After=network.target

[Service]
Type=forking
ExecStart=/usr/local/bin/noip2

[Install]
WantedBy=multi-user.target
```

Enable:
```bash
sudo systemctl enable noip2
sudo systemctl start noip2
```

## Server Setup

### Step 1: Install Ubuntu Server

1. Download Ubuntu Server 22.04 LTS
2. Create bootable USB (use Rufus or Etcher)
3. Install Ubuntu on your server
4. During installation:
   - Enable OpenSSH server
   - Create user account
   - Set hostname

### Step 2: Initial Server Configuration

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install essential tools
sudo apt-get install -y git curl wget nano htop net-tools

# Setup firewall
sudo ufw allow 22/tcp     # SSH
sudo ufw allow 80/tcp     # HTTP
sudo ufw allow 443/tcp    # HTTPS
sudo ufw enable

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Reboot for changes to take effect
sudo reboot
```

### Step 3: Deploy Application

```bash
# Clone repository
git clone https://github.com/Lucian-Adrian/globant-practice-2025.git
cd globant-practice-2025

# Setup environment
cp .env.production.example .env.production
nano .env.production

# Update values:
# DJANGO_SECRET_KEY=<generate-strong-key>
# DJANGO_DEBUG=0
# POSTGRES_PASSWORD=<strong-password>
# DJANGO_ALLOWED_HOSTS=myschool.duckdns.org
# FRONTEND_ORIGIN=https://myschool.duckdns.org

# Deploy
./scripts/deploy.sh
```

### Step 4: Test Local Access

```bash
# From server
curl http://localhost

# From another device on same network
curl http://192.168.1.100
```

### Step 5: Test External Access

```bash
# From phone (using mobile data, not WiFi!)
# Open browser to: http://YOUR_PUBLIC_IP
# Or: http://myschool.duckdns.org
```

## SSL Certificate Setup

### Option 1: Let's Encrypt (Free, Recommended)

```bash
# Install Certbot
sudo apt-get install -y certbot

# Stop nginx temporarily
docker compose -f docker-compose.prod.yml stop nginx

# Get certificate
sudo certbot certonly --standalone \
  -d myschool.duckdns.org \
  --agree-tos \
  --email your@email.com

# Certificates saved to:
# /etc/letsencrypt/live/myschool.duckdns.org/fullchain.pem
# /etc/letsencrypt/live/myschool.duckdns.org/privkey.pem

# Update docker-compose.prod.yml
nano docker-compose.prod.yml
```

Under nginx service, add volume:
```yaml
nginx:
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```

Update nginx config:
```bash
nano nginx/conf.d/default.conf
```

Uncomment SSL lines and update domain.

Restart:
```bash
docker compose -f docker-compose.prod.yml up -d
```

**Auto-renewal:**
```bash
sudo crontab -e

# Add:
0 0 * * * certbot renew --quiet --post-hook "cd /home/YOUR_USER/globant-practice-2025 && docker compose -f docker-compose.prod.yml restart nginx"
```

### Option 2: Cloudflare SSL (Easy, Free)

1. **Add domain to Cloudflare** (free account)
2. **Change nameservers** at your domain registrar
3. **Enable SSL** in Cloudflare dashboard
   - SSL/TLS → Overview → Full (or Flexible)
4. **Create DNS record**
   - Type: A
   - Name: @
   - Content: YOUR_PUBLIC_IP
   - Proxy status: Proxied (orange cloud)

Benefits:
- Free SSL certificate
- DDoS protection
- CDN (faster loading)
- Hides your real IP
- No port forwarding needed (Cloudflare Tunnel)

## Security Considerations

### Essential Security Measures

1. **Change SSH Port**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Change: Port 22 to Port 2222
   sudo systemctl restart sshd
   sudo ufw allow 2222/tcp
   sudo ufw delete allow 22/tcp
   ```

2. **Disable Root SSH Login**
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Set: PermitRootLogin no
   sudo systemctl restart sshd
   ```

3. **Install Fail2Ban**
   ```bash
   sudo apt-get install -y fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

4. **Setup Automatic Updates**
   ```bash
   sudo apt-get install -y unattended-upgrades
   sudo dpkg-reconfigure -plow unattended-upgrades
   ```

5. **Regular Backups**
   ```bash
   # Schedule daily backups
   crontab -e
   # Add:
   0 2 * * * cd /home/YOUR_USER/globant-practice-2025 && ./scripts/backup.sh
   ```

### Recommended: Cloudflare Tunnel

Cloudflare Tunnel (formerly Argo Tunnel) lets you expose your server without port forwarding.

**Benefits:**
- No port forwarding needed
- No exposing home IP
- DDoS protection
- Free SSL

**Setup:**
```bash
# Install cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# Login to Cloudflare
cloudflared tunnel login

# Create tunnel
cloudflared tunnel create driving-school

# Configure tunnel
cat > ~/.cloudflared/config.yml << EOF
tunnel: YOUR_TUNNEL_ID
credentials-file: /home/YOUR_USER/.cloudflared/YOUR_TUNNEL_ID.json

ingress:
  - hostname: myschool.yourdomain.com
    service: http://localhost:80
  - service: http_status:404
EOF

# Run tunnel
cloudflared tunnel run driving-school

# Make it run on startup
sudo cloudflared service install
```

## Troubleshooting

### Can't Access from Internet

**Check:**
1. Port forwarding rules are correct
2. Server firewall allows traffic: `sudo ufw status`
3. Application is running: `docker compose ps`
4. ISP isn't blocking ports
5. Not behind CGNAT

**Test:**
```bash
# Test from inside network
curl http://192.168.1.100

# Test port forwarding
sudo apt-get install nmap
nmap -p 80 YOUR_PUBLIC_IP
```

### Slow Performance

**Check:**
1. Upload speed: `speedtest-cli`
2. Server resources: `htop`
3. Database performance: Check logs
4. Too many concurrent users for your hardware

**Solutions:**
- Upgrade internet plan
- Add more RAM
- Use CDN (Cloudflare)
- Optimize database queries

### Power Outage Recovery

```bash
# Make services start on boot
sudo systemctl enable docker

# Create start script
cat > ~/start-app.sh << 'EOF'
#!/bin/bash
cd /home/YOUR_USER/globant-practice-2025
docker compose -f docker-compose.prod.yml up -d
EOF

chmod +x ~/start-app.sh

# Add to crontab
crontab -e
# Add:
@reboot sleep 30 && /home/YOUR_USER/start-app.sh
```

### Dynamic IP Changed

If using DDNS, IP changes are handled automatically. If not:
1. Check new IP: `curl ifconfig.me`
2. Update DNS records
3. Wait for propagation
4. Renew SSL certificate if needed

## Maintenance

### Daily Tasks
```bash
# Check logs for errors
docker compose -f docker-compose.prod.yml logs --tail=100

# Check disk space
df -h

# Check system resources
htop
```

### Weekly Tasks
```bash
# Verify backups
ls -lh backups/

# Check for updates
sudo apt-get update
sudo apt-get upgrade

# Review firewall logs
sudo grep UFW /var/log/syslog | tail -50
```

### Monthly Tasks
```bash
# Update Docker images
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# Clean Docker system
docker system prune -a

# Rotate logs
sudo logrotate -f /etc/logrotate.conf

# Test backup restore
./scripts/restore.sh backups/latest.sql.gz
```

## Estimated Costs

### Hardware
- Repurpose old PC: **$0**
- Raspberry Pi 4 (8GB): **$75**
- Used mini PC: **$100-200**
- New server: **$300-500**

### Ongoing Costs
- Electricity: **$5-15/month**
- Domain name: **$10-15/year**
- ISP: **Already paying**
- UPS (recommended): **$50-150 one-time**

**Total monthly cost: ~$5-15** (mostly electricity)

## When to Consider Cloud Hosting Instead

Move to cloud if:
- Uptime < 99% is unacceptable
- You exceed 100+ concurrent users
- Your upload speed is < 5 Mbps
- You travel frequently
- Business-critical application
- Need redundancy and backups
- ISP has CGNAT or blocks ports

## Additional Resources

- [Port Forward Guide](https://portforward.com/) - Router-specific guides
- [DuckDNS](https://www.duckdns.org/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Cloudflare Tunnel](https://www.cloudflare.com/products/tunnel/)

---

**Running your own server? That's awesome! 🏠🚀**

Remember: With great power comes great responsibility. Keep your server secure and updated!
