# Windows Home Server Deployment Guide

Complete guide for deploying on Windows (no dual boot required!) with Docker Desktop and router port forwarding.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Windows Setup Options](#windows-setup-options)
4. [Option 1: Docker Desktop (Recommended)](#option-1-docker-desktop-recommended)
5. [Option 2: WSL2 (Windows Subsystem for Linux)](#option-2-wsl2-advanced)
6. [Router Port Forwarding](#router-port-forwarding)
7. [Dynamic DNS Setup](#dynamic-dns-setup)
8. [SSL Certificate Setup](#ssl-certificate-setup)
9. [Troubleshooting](#troubleshooting)

## Overview

### You DON'T Need to Dual Boot! ✅

You can run the entire application on Windows using:
1. **Docker Desktop for Windows** (easiest, recommended)
2. **WSL2** (Windows Subsystem for Linux)
3. Combination of both (Docker Desktop uses WSL2 backend)

### What You Need

- Windows 10 (64-bit) or Windows 11
- Virtualization enabled in BIOS
- At least 8GB RAM (4GB minimum)
- Docker Desktop for Windows
- Internet connection with port forwarding capability

## Prerequisites

### System Requirements

- **OS**: Windows 10 Pro/Enterprise (64-bit) or Windows 11
  - Windows 10 Home works too (with WSL2)
- **Processor**: 64-bit with SLAT capability
- **RAM**: 8GB recommended (4GB minimum)
- **Storage**: 20GB free space
- **Virtualization**: Must be enabled in BIOS

### Check Virtualization

**Open PowerShell as Administrator and run:**

```powershell
# Check if virtualization is enabled
Get-ComputerInfo -Property "HyperV*"
```

Or check in Task Manager:
1. Open Task Manager (Ctrl + Shift + Esc)
2. Go to Performance tab
3. Click CPU
4. Look for "Virtualization: Enabled"

**If disabled**, you need to enable it in BIOS:
1. Restart computer
2. Enter BIOS (usually F2, F10, Del, or F12)
3. Find "Virtualization Technology" or "Intel VT-x" or "AMD-V"
4. Enable it
5. Save and exit

## Windows Setup Options

### Comparison

| Method | Pros | Cons | Best For |
|--------|------|------|----------|
| Docker Desktop | Easiest, GUI, Windows integrated | Uses more resources | Beginners, development |
| WSL2 + Docker | More control, Linux-like | Command-line only | Advanced users |
| Virtual Machine | Isolated environment | Very resource heavy | Testing only |

**Recommendation: Use Docker Desktop** (easiest and most reliable)

## Option 1: Docker Desktop (Recommended)

This is the **easiest and recommended** method for Windows users.

### Step 1: Install Docker Desktop

1. **Download Docker Desktop**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"
   - Save the installer

2. **Run Installer**
   - Double-click `Docker Desktop Installer.exe`
   - Check "Use WSL 2 instead of Hyper-V" (recommended)
   - Click OK
   - Wait for installation (takes 5-10 minutes)
   - Click "Close and restart" when done

3. **Start Docker Desktop**
   - Docker Desktop should start automatically after restart
   - If not, find it in Start Menu
   - First start takes a few minutes
   - You'll see a whale icon in system tray when ready

4. **Verify Installation**
   
   Open PowerShell or Command Prompt:
   ```powershell
   docker --version
   docker compose version
   ```
   
   You should see version numbers.

### Step 2: Configure Docker Desktop

1. **Open Docker Desktop**
2. **Click Settings (gear icon)**
3. **General tab:**
   - ✅ Use WSL 2 based engine
   - ✅ Start Docker Desktop when you log in (optional)

4. **Resources tab:**
   - **CPUs**: 2-4 (leave some for Windows)
   - **Memory**: 4GB-6GB (leave at least 2GB for Windows)
   - **Disk**: 20GB+

5. **Docker Engine tab:**
   - Default settings are fine

6. **Click "Apply & Restart"**

### Step 3: Find Your Local IP Address

**Open Command Prompt or PowerShell:**

```powershell
ipconfig
```

Look for your **Ethernet adapter** or **Wi-Fi adapter**:
```
IPv4 Address. . . . . . . . : 192.168.1.100
```

This is your local IP (example: `192.168.1.100`)

### Step 4: Set Static IP in Windows

**Option A: In Windows Settings**

1. Open Settings → Network & Internet
2. Click your connection (Ethernet or Wi-Fi)
3. Click "Edit" under IP assignment
4. Choose "Manual"
5. Enable IPv4
6. Enter:
   - IP address: `192.168.1.100` (choose one not in use)
   - Subnet mask: `255.255.255.0`
   - Gateway: `192.168.1.1` (your router IP)
   - DNS: `8.8.8.8` (Google DNS)
7. Save

**Option B: Set DHCP Reservation in Router** (recommended)
- Log into router
- Find DHCP settings
- Reserve `192.168.1.100` for your PC's MAC address

### Step 5: Clone Repository and Deploy

**Open PowerShell:**

```powershell
# Navigate to where you want to store the project
cd C:\Users\YourUsername\

# Clone repository
git clone https://github.com/Lucian-Adrian/globant-practice-2025.git
cd globant-practice-2025

# Create production environment file
copy deployment/.env.production.example deployment/.env.production

# Edit deployment/.env.production
notepad deployment/.env.production
```

**Update deployment/.env.production:**
```bash
DJANGO_SECRET_KEY=<generate-strong-key>
DJANGO_DEBUG=0
POSTGRES_PASSWORD=<strong-password>
DJANGO_ALLOWED_HOSTS=myschool.duckdns.org,192.168.1.100
FRONTEND_ORIGIN=https://myschool.duckdns.org
DISABLE_CSRF=0
```

**Deploy:**

```powershell
# Build and start services
docker compose -f deployment/docker/docker-compose.prod.yml up -d --build

# Check status
docker compose -f deployment/docker/docker-compose.prod.yml ps

# View logs
docker compose -f deployment/docker/docker-compose.prod.yml logs -f
```

### Step 6: Test Local Access

**Open browser to:**
- http://localhost
- http://192.168.1.100
- http://YOUR-PC-NAME

If you see the application, Docker deployment is working! ✅

### Step 7: Configure Windows Firewall

**Allow incoming connections:**

```powershell
# Open PowerShell as Administrator

# Allow HTTP (port 80)
New-NetFirewallRule -DisplayName "HTTP Server" -Direction Inbound -LocalPort 80 -Protocol TCP -Action Allow

# Allow HTTPS (port 443)
New-NetFirewallRule -DisplayName "HTTPS Server" -Direction Inbound -LocalPort 443 -Protocol TCP -Action Allow
```

**Or use GUI:**
1. Open "Windows Defender Firewall with Advanced Security"
2. Click "Inbound Rules" → "New Rule"
3. Rule Type: Port
4. Protocol: TCP, Port: 80 (then repeat for 443)
5. Action: Allow
6. Profile: All
7. Name: HTTP Server (or HTTPS Server)

### Step 8: Keep PC Running 24/7

For production use, you need the PC running all the time.

**Prevent Sleep:**
1. Open Settings → System → Power & Sleep
2. Set "When plugged in, PC goes to sleep after": **Never**
3. Set "When plugged in, turn off display after": **Never** (optional)

**Advanced Power Settings:**
```powershell
# Open PowerShell as Administrator
powercfg /change monitor-timeout-ac 0
powercfg /change standby-timeout-ac 0
powercfg /change hibernate-timeout-ac 0
```

**Configure Docker Desktop to start on boot:**
- Docker Desktop Settings → General
- ✅ Start Docker Desktop when you log in

### Step 9: Auto-start Services on Boot

Docker Desktop automatically starts containers that were running.

**To ensure services start:**

Create a PowerShell script: `C:\startup-app.ps1`

```powershell
# Wait for Docker Desktop to start
Start-Sleep -Seconds 30

# Navigate to project
cd C:\Users\YourUsername\globant-practice-2025

# Start services
docker compose -f deployment/docker/docker-compose.prod.yml up -d
```

**Add to Task Scheduler:**
1. Open Task Scheduler
2. Create Basic Task
3. Name: "Start Driving School App"
4. Trigger: "When I log on"
5. Action: "Start a program"
6. Program: `powershell.exe`
7. Arguments: `-File C:\startup-app.ps1`
8. Finish

## Option 2: WSL2 (Advanced)

If you want a more Linux-like experience or Docker Desktop has issues.

### Step 1: Install WSL2

**Open PowerShell as Administrator:**

```powershell
# Enable WSL
wsl --install

# Or manually:
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Restart computer

# Set WSL2 as default
wsl --set-default-version 2

# Install Ubuntu
wsl --install -d Ubuntu-22.04
```

### Step 2: Install Docker in WSL2

**Open Ubuntu from Start Menu:**

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker
sudo service docker start

# Make Docker start automatically
echo "sudo service docker start" >> ~/.bashrc
```

### Step 3: Deploy Application

**In Ubuntu (WSL2):**

```bash
# Clone repository
git clone https://github.com/Lucian-Adrian/globant-practice-2025.git
cd globant-practice-2025

# Setup environment
cp deployment/.env.production.example deployment/.env.production
nano deployment/.env.production

# Deploy
./scripts/deploy.sh
```

**Access from Windows:**
- http://localhost
- Application runs in WSL2 but accessible from Windows

## Router Port Forwarding

Same as Linux/Ubuntu! See the main guide: [HOME_SERVER_DEPLOYMENT.md](HOME_SERVER_DEPLOYMENT.md#router-port-forwarding)

**Quick steps:**

1. **Find your public IP:**
   ```powershell
   Invoke-WebRequest -Uri "http://ifconfig.me" | Select-Object -ExpandProperty Content
   ```

2. **Access router admin** (usually http://192.168.1.1)

3. **Create port forwarding rules:**
   - External Port 80 → Internal IP 192.168.1.100 → Internal Port 80
   - External Port 443 → Internal IP 192.168.1.100 → Internal Port 443

4. **Test from outside:**
   - Use phone's mobile data (not WiFi)
   - Open browser to: `http://YOUR-PUBLIC-IP`

## Dynamic DNS Setup

### Using DuckDNS (Free, Easy)

**On Windows:**

1. **Create account** at https://www.duckdns.org/

2. **Create subdomain:** `myschool.duckdns.org`

3. **Create update script:**

   Create `C:\duckdns\duck.bat`:
   ```batch
   @echo off
   curl "https://www.duckdns.org/update?domains=myschool&token=YOUR_TOKEN&ip="
   ```

4. **Schedule with Task Scheduler:**
   - Open Task Scheduler
   - Create Basic Task
   - Name: "DuckDNS Update"
   - Trigger: "Daily" at 00:00
   - Action: "Start a program"
   - Program: `C:\duckdns\duck.bat`
   - ✅ Run whether user is logged on or not

### Using No-IP (Alternative)

1. Sign up at https://www.noip.com/
2. Download Windows DUC (Dynamic Update Client)
3. Install and configure with your credentials
4. Set to run on startup

## SSL Certificate Setup

### Option 1: Certbot on Windows

**Requires WSL2:**

```bash
# In WSL2 Ubuntu
sudo apt-get install certbot

# Stop nginx
docker compose -f deployment/docker/docker-compose.prod.yml stop nginx

# Get certificate
sudo certbot certonly --standalone -d myschool.duckdns.org

# Certificates saved to /etc/letsencrypt/
# Mount in deployment/docker/docker-compose.prod.yml
```

### Option 2: Win-ACME (Windows Native)

1. **Download Win-ACME:**
   - Visit: https://www.win-acme.com/
   - Download latest release
   - Extract to `C:\win-acme\`

2. **Run Win-ACME:**
   ```powershell
   cd C:\win-acme
   .\wacs.exe
   ```

3. **Follow prompts:**
   - Choose: Create certificate
   - Domain: myschool.duckdns.org
   - Validation: HTTP (requires stopping nginx temporarily)

4. **Certificates saved to:**
   `C:\ProgramData\win-acme\`

### Option 3: Cloudflare (Easiest!)

**Recommended for Windows users:**

1. Sign up at https://www.cloudflare.com/ (free)
2. Add your domain
3. Change nameservers at domain registrar
4. Enable SSL in Cloudflare dashboard
5. Create DNS record:
   - Type: A
   - Name: @
   - Content: YOUR_PUBLIC_IP
   - Proxy: Enabled (orange cloud)
6. Done! Cloudflare handles SSL automatically

**Bonus:** Cloudflare hides your real IP and provides DDoS protection

## Troubleshooting

### Docker Desktop Won't Start

**Check:**
```powershell
# Open PowerShell as Administrator

# Check Hyper-V
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V

# Check WSL2
wsl --list --verbose
```

**Fix:**
```powershell
# Enable Hyper-V
Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V -All

# Update WSL2
wsl --update

# Restart computer
```

### Can't Access from Local Network

**Check Windows Firewall:**
1. Open "Windows Defender Firewall"
2. Click "Allow an app through firewall"
3. Look for "Docker Desktop" and check all boxes
4. If not listed, add manually

**Or disable firewall temporarily to test:**
```powershell
# PowerShell as Administrator
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False

# Test access, then re-enable
Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
```

### Can't Access from Internet

1. **Verify port forwarding** in router
2. **Check public IP hasn't changed** (use DDNS)
3. **Test with phone** (mobile data, not WiFi)
4. **Check ISP doesn't block ports:**
   - Use https://www.canyouseeme.org/
   - Test port 80 and 443

### High Resource Usage

**Docker Desktop uses resources even when idle:**

**Optimize:**
1. Docker Desktop → Settings → Resources
2. Reduce CPU to 2 cores
3. Reduce Memory to 4GB
4. Reduce Disk to 20GB

**Or use WSL2 directly** for better resource management

### Application Won't Start

**Check logs:**
```powershell
# View all logs
docker compose -f deployment/docker/docker-compose.prod.yml logs

# View specific service
docker compose -f deployment/docker/docker-compose.prod.yml logs backend
docker compose -f deployment/docker/docker-compose.prod.yml logs frontend
docker compose -f deployment/docker/docker-compose.prod.yml logs db
```

**Common issues:**
- Port already in use (close other apps using port 80/443)
- Environment variables missing (check deployment/.env.production)
- Docker out of disk space (clean with `docker system prune -a`)

## Performance Considerations

### Windows vs Linux

**Windows adds overhead:**
- Docker Desktop runs Linux VM
- File system performance is slower
- Uses more RAM and CPU

**For best performance:**
- Use SSD storage
- Allocate 4-6GB RAM to Docker
- Keep Windows updated
- Don't run heavy apps alongside

### Recommended PC Specs

**Minimum:**
- Intel i3 or AMD Ryzen 3
- 8GB RAM
- 128GB SSD
- 10 Mbps upload

**Recommended:**
- Intel i5 or AMD Ryzen 5
- 16GB RAM
- 256GB+ SSD
- 20+ Mbps upload
- UPS (battery backup)

## Electricity Cost

**Estimated power consumption:**
- Average desktop: 100-200W
- Per day: 2.4-4.8 kWh
- Per month: 72-144 kWh
- Cost (at $0.12/kWh): **$8-17/month**

**Reduce costs:**
- Use laptop (uses 30-50W)
- Use mini PC (20-40W)
- Use Raspberry Pi (5-15W)
- Enable power saving features

## Backup Strategy

**Schedule backups:**

Create `C:\backup-app.ps1`:
```powershell
cd C:\Users\YourUsername\globant-practice-2025
docker compose -f deployment/docker/docker-compose.prod.yml exec -T db pg_dump -U drivingschool_prod drivingschool_prod > backups\backup-$(Get-Date -Format yyyy-MM-dd-HHmm).sql

# Keep only last 30 backups
Get-ChildItem .\backups\*.sql | Sort-Object LastWriteTime -Descending | Select-Object -Skip 30 | Remove-Item
```

**Schedule in Task Scheduler:**
- Daily at 2 AM
- Program: `powershell.exe`
- Arguments: `-File C:\backup-app.ps1`

## Should You Dual Boot?

### When to Consider Dual Boot

**Pros of Ubuntu:**
- Better Docker performance
- More efficient resource usage
- Native Linux tools
- Better for learning server administration

**Consider dual boot if:**
- You want best performance
- You're comfortable with Linux
- You can dedicate entire PC to server
- You want to learn Linux

### When to Stick with Windows

**Pros of staying on Windows:**
- Use PC for other tasks
- Familiar environment
- Easy to manage with GUI
- Docker Desktop works great

**Stick with Windows if:**
- You need Windows for other apps
- Not comfortable with Linux
- Want easy GUI management
- PC has good specs (16GB+ RAM)

## Recommended: Dedicated Hardware

**Best setup for 24/7 server:**
- Old laptop (uses less power, has battery backup)
- Mini PC (Intel NUC, etc.)
- Raspberry Pi 4 (8GB) with Ubuntu Server
- Refurbished business desktop

**Keep your main PC for daily use!**

## Comparison: Windows vs Cloud

| Factor | Windows Home Server | Cloud (DigitalOcean) |
|--------|--------------------|--------------------|
| **Cost** | $10-20/month (electricity) | $12-25/month |
| **Performance** | Depends on PC | Guaranteed |
| **Uptime** | Depends on ISP | 99.9%+ |
| **Setup** | More complex | Easier |
| **Control** | Full control | Limited |
| **Learning** | More to learn | Less to learn |

## Next Steps

1. ✅ Install Docker Desktop
2. ✅ Deploy application locally
3. ✅ Test on local network
4. ✅ Setup port forwarding
5. ✅ Configure DDNS
6. ✅ Setup SSL with Cloudflare
7. ✅ Test from internet
8. ✅ Setup automated backups
9. ✅ Monitor for issues

## Additional Resources

- [Docker Desktop Documentation](https://docs.docker.com/desktop/windows/)
- [WSL2 Documentation](https://docs.microsoft.com/en-us/windows/wsl/)
- [Port Forwarding Guide](https://portforward.com/)
- [DuckDNS](https://www.duckdns.org/)
- [Cloudflare](https://www.cloudflare.com/)

---

**Running on Windows? Perfect! No need to dual boot! 🪟🚀**

Docker Desktop makes it easy to run production-ready containers on Windows!
