# Administrator Guide

คู่มือสำหรับผู้ดูแลระบบ WorkSLA

---

## สารบัญ

- [การเริ่มต้นใช้งาน](#การเริ่มต้นใช้งาน)
- [การจัดการผู้ใช้](#การจัดการผู้ใช้)
- [การจัดการ Assignee Allowlist](#การจัดการ-assignee-allowlist)
- [การตั้งค่าระบบ](#การตั้งค่าระบบ)
- [การดู Audit Logs](#การดู-audit-logs)
- [การบำรุงรักษา](#การบำรุงรักษา)
- [การแก้ไขปัญหา](#การแก้ไขปัญหา)

---

## การเริ่มต้นใช้งาน

### 1. เข้าสู่ระบบด้วยบัญชี Admin

```
URL: https://10.251.150.222:3346/worksla/
Username: admin
Password: admin123
```

### 2. เปลี่ยนรหัสผ่าน Admin (สำคัญ!)

1. คลิกที่ Avatar มุมขวาบน
2. เลือก "Profile" หรือ "Change Password"
3. ใส่รหัสผ่านใหม่
4. บันทึก

---

## การจัดการผู้ใช้

### เข้าสู่หน้าจัดการผู้ใช้

Dashboard → Admin → Users

### สร้างผู้ใช้ใหม่

1. คลิก "Add User"
2. กรอกข้อมูล:
   - **Username**: ชื่อผู้ใช้ (unique)
   - **Password**: รหัสผ่าน (ขั้นต่ำ 8 ตัวอักษร)
   - **Role**: บทบาท
     - `admin` - สิทธิ์เต็ม
     - `analyst` - ดูและวิเคราะห์ข้อมูล
     - `viewer` - ดูข้อมูลอย่างเดียว
3. คลิก "Create"

### แก้ไขผู้ใช้

1. คลิกที่ผู้ใช้ที่ต้องการแก้ไข
2. แก้ไข:
   - Role
   - Active status
   - Password (ถ้าต้องการ)
3. คลิก "Save"

### ปิดการใช้งานผู้ใช้

1. คลิกที่ผู้ใช้
2. ยกเลิกเครื่องหมาย "Active"
3. คลิก "Save"

> ⚠️ **หมายเหตุ:** การปิดการใช้งานจะทำให้ผู้ใช้ login ไม่ได้ แต่ข้อมูลยังคงอยู่

### ลบผู้ใช้

1. คลิกที่ผู้ใช้
2. คลิก "Delete"
3. ยืนยันการลบ

> ⚠️ **คำเตือน:** การลบผู้ใช้จะไม่สามารถกู้คืนได้

---

## การจัดการ Assignee Allowlist

Assignee Allowlist คือรายชื่อผู้รับผิดชอบที่อนุญาตให้แสดงในระบบ

### เข้าสู่หน้าจัดการ Assignee

Dashboard → Admin → Assignees

### เพิ่ม Assignee

1. คลิก "Add Assignee"
2. กรอกข้อมูล:
   - **OpenProject User ID**: รหัสผู้ใช้จาก OpenProject
   - **Display Name**: ชื่อแสดงในระบบ
   - **Active**: เปิดใช้งาน
3. คลิก "Create"

### วิธีหา OpenProject User ID

```bash
# ใช้ API เพื่อดึงรายชื่อผู้ใช้จาก OpenProject
curl -X GET "https://hosp.wu.ac.th/cmms/api/v3/users" \
  -H "Authorization: Basic YOUR_API_KEY"
```

หรือดูจาก URL ของผู้ใช้ใน OpenProject:
```
https://hosp.wu.ac.th/cmms/users/123
                                 ^^^
                              User ID
```

### แก้ไข Assignee

1. คลิกที่ Assignee
2. แก้ไขข้อมูล
3. คลิก "Save"

### ปิดการใช้งาน Assignee

1. คลิกที่ Assignee
2. ยกเลิกเครื่องหมาย "Active"
3. คลิก "Save"

---

## การตั้งค่าระบบ

### เข้าสู่หน้าตั้งค่า

Dashboard → Admin → Settings

### การตั้งค่าที่สำคัญ

#### 1. OpenProject Configuration

```json
{
  "key": "OPENPROJECT_BASE_URL",
  "value": {
    "url": "https://hosp.wu.ac.th/cmms/api/v3"
  },
  "description": "OpenProject API base URL"
}
```

```json
{
  "key": "OPENPROJECT_API_KEY",
  "value": {
    "key": "YOUR_API_KEY_HERE"
  },
  "description": "OpenProject API authentication key"
}
```

#### 2. SLA Thresholds

```json
{
  "key": "SLA_THRESHOLDS",
  "value": {
    "warning_days": 7,
    "critical_days": 3,
    "overdue_hours": 24
  },
  "description": "SLA warning and critical thresholds"
}
```

#### 3. Refresh Interval

```json
{
  "key": "REFRESH_INTERVAL_MINUTES",
  "value": {
    "minutes": 30
  },
  "description": "Work package cache refresh interval"
}
```

#### 4. Default Filters

```json
{
  "key": "DEFAULT_FILTERS",
  "value": {
    "status": ["New", "In Progress"],
    "priority": ["High", "Urgent"]
  },
  "description": "Default filters for dashboard"
}
```

### การเพิ่มการตั้งค่าใหม่

1. คลิก "Add Setting"
2. กรอก:
   - **Key**: ชื่อการตั้งค่า (ตัวพิมพ์ใหญ่, underscore)
   - **Value**: ค่า (JSON format)
   - **Description**: คำอธิบาย
3. คลิก "Create"

---

## การดู Audit Logs

### วิธีการ

1. Dashboard → Admin → Audit Logs
2. Filter ตาม:
   - วันที่
   - ผู้ใช้
   - การกระทำ (Action)
   - ทรัพยากร (Resource)

### ตัวอย่าง Audit Events

- `user.login` - ผู้ใช้เข้าสู่ระบบ
- `user.logout` - ผู้ใช้ออกจากระบบ
- `user.created` - สร้างผู้ใช้ใหม่
- `user.updated` - แก้ไขผู้ใช้
- `user.deleted` - ลบผู้ใช้
- `setting.updated` - แก้ไขการตั้งค่า
- `wp.refresh` - รีเฟรช Work Packages

---

## การบำรุงรักษา

### การสำรองข้อมูล (Backup)

```bash
# Backup database
docker exec -t postgres_container pg_dump -U apirak.ja worksla > backup_$(date +%Y%m%d).sql

# หรือใช้ script
./scripts/backup.sh
```

### การกู้คืนข้อมูล (Restore)

```bash
# Restore database
docker exec -i postgres_container psql -U apirak.ja worksla < backup_20250101.sql

# หรือใช้ script
./scripts/restore.sh backup_20250101.sql
```

### การลบ Audit Logs เก่า

```bash
# Delete logs older than 90 days
docker-compose exec worksla-backend python -c "
from app.core.database import SessionLocal
from app.models.audit_log import AuditLog
from datetime import datetime, timedelta

db = SessionLocal()
cutoff = datetime.utcnow() - timedelta(days=90)
deleted = db.query(AuditLog).filter(AuditLog.created_at < cutoff).delete()
db.commit()
print(f'Deleted {deleted} audit logs')
"
```

### การอัปเดต Work Packages Cache

```bash
# Manual refresh
curl -X POST https://10.251.150.222:3346/worksla/api/wp/refresh \
  -k --cookie-jar cookies.txt --cookie cookies.txt

# หรือใช้ Makefile
make refresh-wp
```

### ตรวจสอบสุขภาพระบบ

```bash
# Check service health
make status

# View logs
make logs

# Check database connection
docker-compose exec worksla-backend python -c "
from app.core.database import engine
conn = engine.connect()
print('Database connection OK')
conn.close()
"
```

---

## การแก้ไขปัญหา

### ปัญหา: ผู้ใช้ไม่สามารถ Login ได้

**สาเหตุที่เป็นไปได้:**
1. Username หรือ Password ผิด
2. บัญชีถูกปิดการใช้งาน (is_active = false)
3. Session หมดอายุ

**วิธีแก้:**
```bash
# Reset password
docker-compose exec worksla-backend python scripts/seed_admin.py \
  --username <username> \
  --password <new_password> \
  --force

# Check user status
docker-compose exec worksla-backend python -c "
from app.core.database import SessionLocal
from app.repositories.user_repository import UserRepository

db = SessionLocal()
repo = UserRepository(db)
user = repo.get_by_username('username')
print(f'Active: {user.is_active}')
"
```

### ปัญหา: Work Packages ไม่แสดงข้อมูล

**วิธีแก้:**
1. ตรวจสอบ OpenProject API settings
2. Refresh work packages manually
3. ตรวจสอบ logs

```bash
# Check OpenProject connection
docker-compose exec worksla-backend python -c "
from app.services.openproject_client import OpenProjectClient

client = OpenProjectClient()
result = client.get_work_packages(page=1, page_size=10)
print(f'Success: {result is not None}')
"

# Manual refresh
make refresh-wp
```

### ปัญหา: SSL Certificate Error

**วิธีแก้:**
```bash
# Regenerate certificate
docker-compose down
docker volume rm worksla-nginx-certs
docker-compose up -d
```

### ปัญหา: Database Connection Error

**วิธีแก้:**
```bash
# Test database connection
psql -h 10.251.150.222 -p 5210 -U apirak.ja -d worksla

# Check environment variables
docker-compose exec worksla-backend env | grep POSTGRES
```

### ดู Error Logs

```bash
# All services
make logs

# Specific service
make logs-backend
make logs-frontend
make logs-nginx

# Follow logs
docker-compose logs -f --tail=100 worksla-backend
```

---

## Best Practices

### 1. Security

- เปลี่ยนรหัสผ่าน admin ทันทีหลังติดตั้ง
- ใช้รหัสผ่านที่แข็งแรง (> 12 ตัวอักษร)
- ตรวจสอบ audit logs เป็นประจำ
- ปิด accounts ที่ไม่ใช้งาน
- อัปเดต API keys เป็นระยะ

### 2. Maintenance

- Backup database อย่างน้อยสัปดาห์ละครั้ง
- ลบ audit logs เก่าทุก 3 เดือน
- ตรวจสอบ disk space
- อัปเดตระบบเป็นประจำ

### 3. Monitoring

- ตั้ง alerts สำหรับ errors
- ติดตาม service health
- ตรวจสอบ API rate limits
- Monitor database performance

### 4. User Management

- จำกัดจำนวน admin accounts
- ใช้ role ที่เหมาะสมกับหน้าที่
- Review user access เป็นระยะ
- ลบ accounts ที่ไม่ใช้งาน

---

## Scripts สำหรับ Admin

### Reset Admin Password

```bash
docker-compose exec worksla-backend python scripts/seed_admin.py \
  --username admin \
  --password NewSecurePassword123! \
  --force
```

### Create Bulk Users

```python
# create_users.py
from app.core.database import SessionLocal
from app.repositories.user_repository import UserRepository

db = SessionLocal()
repo = UserRepository(db)

users = [
    {"username": "analyst1", "password": "pass123", "role": "analyst"},
    {"username": "viewer1", "password": "pass123", "role": "viewer"},
]

for user_data in users:
    try:
        user = repo.create(**user_data)
        print(f"Created: {user.username}")
    except Exception as e:
        print(f"Error: {e}")
```

### Export Audit Logs

```bash
# Export to CSV
docker-compose exec worksla-backend python -c "
import csv
from app.core.database import SessionLocal
from app.models.audit_log import AuditLog

db = SessionLocal()
logs = db.query(AuditLog).limit(1000).all()

with open('/tmp/audit_logs.csv', 'w') as f:
    writer = csv.writer(f)
    writer.writerow(['ID', 'User', 'Action', 'Created At'])
    for log in logs:
        writer.writerow([log.id, log.username, log.action, log.created_at])
"

# Copy from container
docker cp worksla-backend:/tmp/audit_logs.csv ./audit_logs.csv
```

---

## Contact Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:

**Digital Medical Infrastructure Team**  
Medical Center, Walailak University

Email: [email protected]  
Tel: 075-xxx-xxx
