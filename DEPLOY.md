# Deployment Guide

คู่มือการ Deploy WorkSLA สำหรับ Production Environment

---

## สารบัญ

- [Production Requirements](#production-requirements)
- [Pre-deployment Checklist](#pre-deployment-checklist)
- [Deployment Steps](#deployment-steps)
- [Post-deployment](#post-deployment)
- [Backup & Recovery](#backup--recovery)
- [Monitoring](#monitoring)
- [Scaling](#scaling)
- [Troubleshooting](#troubleshooting)

---

## Production Requirements

### Hardware

**Minimum:**
- CPU: 4 cores
- RAM: 8 GB
- Disk: 50 GB SSD
- Network: 100 Mbps

**Recommended:**
- CPU: 8 cores
- RAM: 16 GB
- Disk: 100 GB SSD (with RAID)
- Network: 1 Gbps

### Software

- Docker Engine 24.0+
- Docker Compose 2.20+
- Ubuntu 22.04 LTS / RHEL 8+ / Debian 12+
- PostgreSQL 14+ (external)
- SSL Certificate (Let's Encrypt recommended)

---

## Pre-deployment Checklist

### 1. Security

- [ ] Change default admin password
- [ ] Generate strong SECRET_KEY (32+ characters)
- [ ] Configure firewall (UFW/iptables)
- [ ] Set up SSL certificates
- [ ] Review CORS settings
- [ ] Set up fail2ban (optional)

### 2. Configuration

- [ ] Review `.env` file
- [ ] Set ENVIRONMENT=production
- [ ] Set DEBUG=false
- [ ] Configure PostgreSQL connection
- [ ] Configure OpenProject API credentials
- [ ] Set proper ALLOWED_HOSTS

### 3. Infrastructure

- [ ] Database backup strategy
- [ ] Log rotation setup
- [ ] Monitoring setup
- [ ] Alerting configuration
- [ ] Load balancer (if needed)

### 4. Testing

- [ ] Run smoke tests
- [ ] Test database connection
- [ ] Test OpenProject API connection
- [ ] Test authentication flow
- [ ] Performance testing

---

## Deployment Steps

### Step 1: Prepare Environment

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install additional tools
sudo apt install -y git make ufw fail2ban
```

### Step 2: Clone/Copy Project

```bash
# Clone from git (if using git)
git clone <repository-url> /opt/code/openproject/worksla
cd /opt/code/openproject/worksla

# Or copy files via scp/rsync
rsync -avz --exclude='.git' ./worksla/ user@server:/opt/code/openproject/worksla/
```

### Step 3: Configure Environment

```bash
# Create production .env
cp .env.example .env
nano .env

# Required configurations:
ENVIRONMENT=production
DEBUG=false
SECRET_KEY=<generate-strong-key-here>
POSTGRES_HOST=10.251.150.222
POSTGRES_PORT=5210
POSTGRES_USER=apirak.ja
POSTGRES_PASSWORD=<secure-password>
POSTGRES_DB=worksla
OPENPROJECT_URL=https://hosp.wu.ac.th/cmms/api/v3
OPENPROJECT_API_KEY=<api-key>
```

### Step 4: Generate Secrets

```bash
# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Or use openssl
openssl rand -base64 32
```

### Step 5: Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH (adjust port if needed)
sudo ufw allow 22/tcp

# Allow HTTPS
sudo ufw allow 3346/tcp

# Deny HTTP (we force HTTPS)
sudo ufw deny 3346/tcp

# Check status
sudo ufw status
```

### Step 6: SSL Certificates

**Option A: Self-signed (Development/Internal)**

Already handled by Docker. Certificate auto-generated on first run.

**Option B: Let's Encrypt (Production with Domain)**

```bash
# Install certbot
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to project
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem reverse-proxy/certs/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem reverse-proxy/certs/key.pem

# Set permissions
sudo chmod 644 reverse-proxy/certs/cert.pem
sudo chmod 600 reverse-proxy/certs/key.pem
```

**Option C: Organizational CA**

Place certificates in:
- `reverse-proxy/certs/cert.pem`
- `reverse-proxy/certs/key.pem`

### Step 7: Initialize Database

```bash
# Build and start init-db service
docker-compose build worksla-init-db
docker-compose run --rm worksla-init-db

# Or use make
make migrate
```

### Step 8: Deploy Services

```bash
# Build all images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 9: Create Admin User

```bash
# Create admin with custom password
docker-compose exec worksla-backend python scripts/seed_admin.py \
  --username admin \
  --password <secure-admin-password>

# Or use make
make seed
```

### Step 10: Verify Deployment

```bash
# Check service health
curl -k https://10.251.150.222:3346/health

# Check backend
curl -k https://10.251.150.222:3346/worksla/api/health

# Test login
curl -X POST https://10.251.150.222:3346/worksla/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"your-password"}' \
  -k
```

---

## Post-deployment

### 1. Security Hardening

```bash
# Enable automatic security updates
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades

# Configure fail2ban
sudo nano /etc/fail2ban/jail.local
# Add:
[nginx-limit-req]
enabled = true
port = 3346
logpath = /var/log/nginx/error.log

sudo systemctl restart fail2ban
```

### 2. Log Rotation

```bash
# Configure logrotate
sudo nano /etc/logrotate.d/worksla

# Add:
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}

# Test
sudo logrotate -f /etc/logrotate.conf
```

### 3. Backup Setup

```bash
# Create backup script
sudo nano /usr/local/bin/backup-worksla.sh

#!/bin/bash
BACKUP_DIR="/backup/worksla"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup database
docker exec postgres_container pg_dump -U apirak.ja worksla | gzip > "$BACKUP_DIR/worksla_db_$DATE.sql.gz"

# Backup volumes
docker run --rm -v worksla-nginx-certs:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/certs_$DATE.tar.gz -C /data .

# Keep only last 7 days
find "$BACKUP_DIR" -name "*.gz" -mtime +7 -delete

# Make executable
sudo chmod +x /usr/local/bin/backup-worksla.sh

# Add to cron (daily at 2 AM)
sudo crontab -e
0 2 * * * /usr/local/bin/backup-worksla.sh
```

### 4. Monitoring Setup

```bash
# Install monitoring tools (example: prometheus + grafana)
# Or use cloud monitoring (DataDog, New Relic, etc.)

# Docker stats
docker stats --no-stream

# System resources
htop
```

---

## Backup & Recovery

### Manual Backup

```bash
# Database backup
docker exec <postgres-container> pg_dump -U apirak.ja worksla > backup_$(date +%Y%m%d).sql

# Compress
gzip backup_$(date +%Y%m%d).sql

# Backup volumes
docker run --rm -v worksla-nginx-certs:/data -v $(pwd):/backup alpine tar czf /backup/certs_backup.tar.gz -C /data .
```

### Restore

```bash
# Stop services
docker-compose down

# Restore database
gunzip -c backup_20250101.sql.gz | docker exec -i <postgres-container> psql -U apirak.ja -d worksla

# Restore volumes
docker run --rm -v worksla-nginx-certs:/data -v $(pwd):/backup alpine tar xzf /backup/certs_backup.tar.gz -C /data

# Start services
docker-compose up -d
```

---

## Monitoring

### Health Checks

```bash
# Service health
docker-compose ps

# Container health
docker inspect --format='{{.State.Health.Status}}' worksla-backend

# Endpoint health
curl -k https://10.251.150.222:3346/health
```

### Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f worksla-backend

# Tail last 100 lines
docker-compose logs --tail=100 worksla-nginx

# Search logs
docker-compose logs | grep ERROR
```

### Metrics

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Database size
docker exec <postgres-container> psql -U apirak.ja -d worksla -c "
SELECT pg_size_pretty(pg_database_size('worksla'));
"
```

---

## Scaling

### Horizontal Scaling (Multiple Instances)

```yaml
# docker-compose.yml
services:
  worksla-backend:
    deploy:
      replicas: 3
    
  # Add load balancer
  worksla-lb:
    image: nginx:alpine
    ports:
      - "3346:443"
    volumes:
      - ./lb-nginx.conf:/etc/nginx/nginx.conf
```

### Vertical Scaling (Resources)

```yaml
# docker-compose.yml
services:
  worksla-backend:
    deploy:
      resources:
        limits:
          cpus: '4'
          memory: 4G
        reservations:
          cpus: '2'
          memory: 2G
```

---

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check disk space
df -h

# Check memory
free -m

# Rebuild images
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Failed

```bash
# Test connection
psql -h 10.251.150.222 -p 5210 -U apirak.ja -d worksla

# Check env vars
docker-compose exec worksla-backend env | grep POSTGRES
```

### High CPU/Memory Usage

```bash
# Check resource usage
docker stats

# Restart services
docker-compose restart

# Check logs for errors
docker-compose logs --tail=1000 | grep -i error
```

### SSL Certificate Issues

```bash
# Regenerate certificate
docker-compose down
docker volume rm worksla-nginx-certs
docker-compose up -d

# Check certificate
openssl s_client -connect 10.251.150.222:3346 -showcerts
```

---

## Maintenance Windows

### Rolling Updates

```bash
# Update backend
docker-compose build worksla-backend
docker-compose up -d --no-deps worksla-backend

# Update frontend
docker-compose build worksla-frontend
docker-compose up -d --no-deps worksla-frontend

# Update nginx
docker-compose up -d --no-deps worksla-nginx
```

### Zero-Downtime Deployment

Use blue-green deployment or load balancer:

1. Deploy new version alongside old
2. Test new version
3. Switch traffic to new version
4. Remove old version

---

## Contact

**DevOps Team:**  
Digital Medical Infrastructure Team  
Medical Center, Walailak University

Email: [email protected]  
Emergency: 075-xxx-xxx (24/7)
