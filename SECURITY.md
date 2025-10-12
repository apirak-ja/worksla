# Security Guide

คู่มือแนวปฏิบัติด้านความปลอดภัยสำหรับระบบ WorkSLA

---

## สารบัญ

- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [Network Security](#network-security)
- [API Security](#api-security)
- [Deployment Security](#deployment-security)
- [Monitoring & Auditing](#monitoring--auditing)
- [Incident Response](#incident-response)

---

## Authentication & Authorization

### JWT-based Authentication

ระบบใช้ JWT (JSON Web Tokens) สำหรับ authentication:

- **Access Token**: อายุ 30 นาที
- **Refresh Token**: อายุ 7 วัน
- เก็บใน **HttpOnly Cookies** (ป้องกัน XSS)
- **SameSite=strict** (ป้องกัน CSRF)
- **Secure flag** (HTTPS เท่านั้น)

### Password Security

**ข้อกำหนดรหัสผ่าน:**
- ความยาวขั้นต่ำ: 8 ตัวอักษร (แนะนำ 12+)
- เข้ารหัสด้วย bcrypt (cost factor: 12)
- ไม่เก็บ plain text passwords

**Best Practices:**
```python
# Strong password example
password = "MySecure@Password2025!"

# Avoid
password = "password123"  # ❌ Too weak
password = "admin"         # ❌ Too common
```

### Role-Based Access Control (RBAC)

**Roles:**

1. **admin**
   - สิทธิ์เต็มทุกอย่าง
   - จัดการผู้ใช้
   - แก้ไขการตั้งค่าระบบ
   - ดู audit logs

2. **analyst**
   - ดูและวิเคราะห์ข้อมูล
   - สร้างรายงาน
   - Refresh work packages
   - ไม่สามารถแก้ไขผู้ใช้

3. **viewer**
   - ดูข้อมูลอย่างเดียว
   - ไม่สามารถแก้ไขหรือลบ

### Session Management

```python
# Token expiration
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7

# Auto-refresh mechanism
- Access token หมดอายุ → ใช้ refresh token สร้างใหม่
- Refresh token หมดอายุ → ต้อง login ใหม่
```

### Logout & Token Revocation

```bash
# Logout clears cookies
POST /api/auth/logout

# Manual token revocation (if needed)
- ลบ session จาก database
- Clear cookies ฝั่ง client
```

---

## Data Protection

### Database Security

**Connection Security:**
```python
# ใช้ SSL/TLS สำหรับ database connection (production)
DATABASE_URL = "postgresql://user:pass@host:5210/db?sslmode=require"
```

**Password Storage:**
```python
# Never store plain text passwords
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
password_hash = pwd_context.hash(plain_password)
```

**SQL Injection Prevention:**
```python
# ✅ Use SQLAlchemy ORM (parameterized queries)
user = db.query(User).filter(User.username == username).first()

# ❌ Never use raw SQL with string interpolation
# DANGEROUS: f"SELECT * FROM users WHERE username = '{username}'"
```

### Sensitive Data

**Environment Variables:**
```bash
# Store secrets in .env file (never commit to git)
SECRET_KEY=your-secret-key-minimum-32-characters
POSTGRES_PASSWORD=your-db-password
OPENPROJECT_API_KEY=your-api-key
```

**Secrets Management:**
```bash
# Production: Use secrets manager
# - Docker Secrets
# - Kubernetes Secrets
# - HashiCorp Vault
# - AWS Secrets Manager

# Example with Docker Secrets
echo "my-secret" | docker secret create db_password -
```

### Data Encryption

**At Rest:**
```bash
# Enable PostgreSQL encryption
# Encrypt sensitive fields (if needed)
# Encrypt backups
```

**In Transit:**
```bash
# HTTPS for all connections
# TLS 1.2+ only
# Strong cipher suites
```

---

## Network Security

### HTTPS/TLS Configuration

**Nginx SSL Configuration:**
```nginx
# Force HTTPS
listen 443 ssl http2;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;

# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

**Generate Strong Certificate:**
```bash
# Production: Use Let's Encrypt or organizational CA
# Development: Self-signed certificate

openssl req -x509 -nodes -days 365 -newkey rsa:4096 \
  -keyout key.pem \
  -out cert.pem \
  -subj "/C=TH/ST=NST/L=Tha Sala/O=WU/CN=10.251.150.222"
```

### Firewall Rules

```bash
# Allow only necessary ports
ufw allow 3346/tcp  # HTTPS
ufw deny 3346/tcp   # Block HTTP (redirect to HTTPS)
ufw deny 8000/tcp   # Block direct backend access
ufw deny 5210/tcp   # Block direct database access (from outside)

# Enable firewall
ufw enable
```

### Network Isolation

```yaml
# Docker network isolation
networks:
  worksla-network:
    driver: bridge
    internal: false  # Only nginx exposed to outside

# Internal services not accessible from outside
- backend (only via nginx)
- database (only from backend)
```

### CORS Configuration

```python
# Strict CORS policy
CORS_ORIGINS = [
    "https://10.251.150.222:3346",  # Production
]

# Don't use wildcard in production
# ❌ CORS_ORIGINS = ["*"]
```

---

## API Security

### Input Validation

```python
# Use Pydantic for validation
from pydantic import BaseModel, Field, validator

class LoginRequest(BaseModel):
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8)
    
    @validator('username')
    def validate_username(cls, v):
        if not v.isalnum():
            raise ValueError('Username must be alphanumeric')
        return v
```

### Rate Limiting

```python
# Add rate limiting middleware (production)
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/api/auth/login")
@limiter.limit("5/minute")  # Max 5 login attempts per minute
async def login(...):
    ...
```

### Request Size Limits

```nginx
# Nginx config
client_max_body_size 50M;
client_body_timeout 60s;
```

### Security Headers

```nginx
# Security headers
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

### API Key Management

```python
# Rotate OpenProject API key periodically
# Store in settings table, not in code

# Update API key
PUT /api/admin/settings/OPENPROJECT_API_KEY
{
  "value": {"key": "new-api-key-here"}
}
```

---

## Deployment Security

### Docker Security

**Best Practices:**

```dockerfile
# Run as non-root user
RUN useradd -m -u 1000 worksla
USER worksla

# Minimize image layers
# Use specific version tags (not :latest)
FROM python:3.11-slim

# Scan images for vulnerabilities
docker scan worksla-backend:latest
```

**Docker Compose Security:**

```yaml
# Limit container resources
services:
  backend:
    mem_limit: 1g
    cpus: 2
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
```

### Secrets Management

```yaml
# Use Docker secrets
secrets:
  db_password:
    file: ./secrets/db_password.txt

services:
  backend:
    secrets:
      - db_password
```

### File Permissions

```bash
# Restrict .env file permissions
chmod 600 .env
chown root:root .env

# SSL certificates
chmod 600 /etc/nginx/certs/key.pem
chmod 644 /etc/nginx/certs/cert.pem
```

### Regular Updates

```bash
# Keep dependencies updated
pip install --upgrade pip
pip list --outdated

# Update Docker images
docker-compose pull
docker-compose up -d

# Update OS packages
apt update && apt upgrade
```

---

## Monitoring & Auditing

### Audit Logging

**What to Log:**
- Authentication attempts (success/failure)
- User creation/modification/deletion
- Permission changes
- Settings modifications
- Data exports
- API access

**Log Format:**
```json
{
  "timestamp": "2025-01-10T12:00:00Z",
  "user_id": 1,
  "username": "admin",
  "action": "user.created",
  "resource_type": "user",
  "resource_id": "5",
  "ip_address": "10.251.150.100",
  "user_agent": "Mozilla/5.0...",
  "meta": {
    "role": "analyst",
    "username": "newuser"
  }
}
```

### Security Monitoring

```bash
# Monitor failed login attempts
docker-compose exec worksla-backend python -c "
from app.core.database import SessionLocal
from app.models.audit_log import AuditLog

db = SessionLocal()
failed_logins = db.query(AuditLog).filter(
    AuditLog.action == 'auth.failed',
    AuditLog.created_at > datetime.now() - timedelta(hours=1)
).count()

if failed_logins > 10:
    print('⚠️ Alert: Multiple failed login attempts!')
"
```

### Log Retention

```python
# Keep audit logs for compliance
AUDIT_LOG_RETENTION_DAYS = 90

# Automated cleanup
from datetime import datetime, timedelta

cutoff = datetime.utcnow() - timedelta(days=90)
db.query(AuditLog).filter(AuditLog.created_at < cutoff).delete()
```

### Security Alerts

```bash
# Set up alerts for:
- Multiple failed login attempts
- Privilege escalation
- Unusual API usage
- Database connection failures
- Certificate expiration
```

---

## Incident Response

### Security Incident Checklist

**1. Identify:**
- What happened?
- When did it happen?
- Who is affected?

**2. Contain:**
```bash
# Disable compromised accounts
docker-compose exec worksla-backend python -c "
from app.repositories.user_repository import UserRepository
from app.core.database import SessionLocal

db = SessionLocal()
repo = UserRepository(db)
repo.update(user_id, is_active=False)
"

# Revoke all sessions
docker-compose exec worksla-backend python -c "
from app.models.session import Session
from app.core.database import SessionLocal

db = SessionLocal()
db.query(Session).update({'revoked': True})
db.commit()
"

# Block IP address (if needed)
ufw deny from <IP_ADDRESS>
```

**3. Investigate:**
```bash
# Check audit logs
docker-compose exec worksla-backend python -c "
from app.models.audit_log import AuditLog
from app.core.database import SessionLocal

db = SessionLocal()
logs = db.query(AuditLog).filter(
    AuditLog.user_id == <compromised_user_id>
).order_by(AuditLog.created_at.desc()).limit(100).all()

for log in logs:
    print(f'{log.created_at}: {log.action} - {log.meta}')
"

# Check access logs
docker-compose logs nginx | grep <IP_ADDRESS>
```

**4. Remediate:**
- Reset passwords
- Rotate API keys
- Patch vulnerabilities
- Update security policies

**5. Document:**
- Record incident details
- Document response actions
- Update security procedures

### Backup & Recovery

```bash
# Regular backups
# Automated daily backup
0 2 * * * /opt/code/openproject/worksla/scripts/backup.sh

# Test restore procedure quarterly
./scripts/restore.sh backup_test.sql
```

---

## Security Checklist

### Pre-deployment

- [ ] Change default admin password
- [ ] Set strong SECRET_KEY
- [ ] Configure HTTPS/TLS
- [ ] Enable firewall
- [ ] Set up CORS properly
- [ ] Configure rate limiting
- [ ] Review file permissions
- [ ] Scan Docker images
- [ ] Set up secrets management
- [ ] Configure audit logging

### Post-deployment

- [ ] Monitor logs regularly
- [ ] Review user access
- [ ] Update dependencies
- [ ] Test backup/restore
- [ ] Review audit logs weekly
- [ ] Rotate API keys (90 days)
- [ ] Update SSL certificates (before expiry)
- [ ] Security assessment (quarterly)

### Ongoing

- [ ] Monitor failed logins
- [ ] Review new users
- [ ] Check system logs
- [ ] Update software
- [ ] Backup verification
- [ ] Incident response drills

---

## Contact

**Security Issues:**  
Email: [email protected]  
Phone: 075-xxx-xxx

**Report Vulnerabilities:**  
DO NOT disclose publicly  
Contact security team directly
