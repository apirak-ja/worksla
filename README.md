# WorkSLA - Open Project SLA Reporting System

ระบบรายงานตัวชี้วัด (SLA) สำหรับ OpenProject  
พัฒนาโดย **กลุ่มงานโครงสร้างพื้นฐานดิจิทัลทางการแพทย์**  
**ศูนย์การแพทย์ มหาวิทยาลัยวลัยลักษณ์**

🌐 **Production URL**: https://10.251.150.222:3346/worksla/

---

## 🚀 Quick Start

```bash
# Clone และเข้าไปยัง directory
cd /opt/code/openproject/worksla

# รันระบบ (Non-interactive)
./start.sh

# หรือแบบ manual
docker compose up -d
```

**Default Admin Login:**
- Username: `admin`
- Password: `admin123`
- ⚠️ **กรุณาเปลี่ยนรหัสผ่านทันทีหลังเข้าสู่ระบบครั้งแรก!**

---

## 📋 สารบัญ

- [ภาพรวมระบบ](#ภาพรวมระบบ)
- [คุณสมบัติหลัก](#คุณสมบัติหลัก)
- [สถาปัตยกรรมระบบ](#สถาปัตยกรรมระบบ)
- [ความต้องการระบบ](#ความต้องการระบบ)
- [การติดตั้ง](#การติดตั้ง)
- [การใช้งาน](#การใช้งาน)
- [โครงสร้างโปรเจกต์](#โครงสร้างโปรเจกต์)
- [การพัฒนา](#การพัฒนา)
- [การแก้ไขปัญหา](#การแก้ไขปัญหา)
- [เอกสารเพิ่มเติม](#เอกสารเพิ่มเติม)

---

## 🎯 ภาพรวมระบบ

WorkSLA เป็นระบบรายงานและวิเคราะห์ตัวชี้วัด SLA (Service Level Agreement) สำหรับ Work Packages ใน OpenProject พร้อมด้วย:

- **Dashboard แบบ Real-time** - ภาพรวม KPI และสถานะงานจาก OpenProject API
- **รายงาน SLA** - วิเคราะห์การปฏิบัติตาม SLA พร้อม Export CSV/PDF
- **ระบบ RBAC** - จัดการสิทธิ์ผู้ใช้แบบละเอียด (Admin/Analyst/Viewer)
- **API RESTful** - เชื่อมต่อกับระบบอื่นได้ง่าย
- **Security** - JWT HttpOnly cookies + Anti-CSRF + HTTPS

---

## ✨ คุณสมบัติหลัก

### 📊 Dashboard & Analytics
- แสดง KPI การทำงานแบบ Real-time จาก OpenProject
- กราฟแนวโน้มรายสัปดาห์/เดือน
- แจ้งเตือนงานใกล้ครบกำหนดและเกินกำหนด
- กรองข้อมูลตามโปรเจกต์, ผู้รับผิดชอบ, สถานะ

### 📝 Work Package Management
- ตารางแสดงผล Work Packages แบบ Server-side Pagination
- ค้นหาและกรองข้อมูลขั้นสูง
- ดูรายละเอียดและประวัติการอัปเดตจาก OpenProject API
- Export ข้อมูลเป็น CSV

### 📈 Reports
- รายงาน SLA รายเดือน (PDF/CSV)
- รายงาน Productivity แยกตามผู้รับผิดชอบ/โปรเจกต์
- กราฟและตารางวิเคราะห์

### 🔐 Security & Authentication
- JWT-based Authentication (HttpOnly Secure cookies)
- Anti-CSRF protection (Double-Submit Token)
- Role-Based Access Control (Admin, Analyst, Viewer)
- HTTPS บังคับด้วย TLS
- Secure cookie settings (SameSite=Strict, Path=/worksla)

### ⚙️ Admin Features
- จัดการผู้ใช้และสิทธิ์
- กำหนด Assignee Allowlist
- ตั้งค่าระบบ (OpenProject API, SLA Thresholds)
- Audit Logs

---

## 🏗️ สถาปัตยกรรมระบบ

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                         │
│              (https://10.251.150.222:3346/worksla/)         │
└─────────────────────────────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                       │
│         (TLS Termination + SPA Fallback + Security)          │
└─────────────────────────────────────────────────────────────┘
            │                                     │
      /worksla/                            /worksla/api/
            │                                     │
            ▼                                     ▼
┌─────────────────────┐              ┌─────────────────────────┐
│  Frontend (React)   │              │  Backend (FastAPI)      │
│  - Vite + React 18  │              │  - Uvicorn              │
│  - TypeScript       │              │  - SQLAlchemy           │
│  - MUI + Tailwind   │              │  - JWT Auth + CSRF      │
│  - Purple Theme     │              │  - OpenProject Client   │
└─────────────────────┘              └─────────────────────────┘
                                                  │
                                     ┌────────────┴────────────┐
                                     │                         │
                                     ▼                         ▼
                        ┌─────────────────────┐  ┌─────────────────────┐
                        │  PostgreSQL         │  │  OpenProject API    │
                        │  (External: 5210)   │  │  (port 3000)        │
                        └─────────────────────┘  └─────────────────────┘
```
                                     │  (hosp.wu.ac.th/cmms)   │
                                     └─────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite (Build Tool)
- Material-UI (MUI) v5
- TailwindCSS
- TanStack Query (Data Fetching)
- Recharts (Charts)
- React Router v6

**Backend:**
- FastAPI (Python)
- Uvicorn (ASGI Server)
- SQLAlchemy (ORM)
- Alembic (Migrations)
- JWT (jose)
- Pydantic (Validation)

**Infrastructure:**
- Docker + Docker Compose
- Nginx (Reverse Proxy + SSL)
- PostgreSQL (Database)

---

## 📦 ความต้องการระบบ

### Software Requirements
- Docker Engine 20.10+
- Docker Compose 2.0+
- Git

### Hardware Requirements (Minimum)
- CPU: 2 cores
- RAM: 4 GB
- Disk: 10 GB free space

### Network Requirements
- เข้าถึง PostgreSQL Database (10.251.150.222:5210)
- เข้าถึง OpenProject API (https://hosp.wu.ac.th/cmms/api/v3)
- Port 3346 (HTTPS) และ 3346 (HTTPS only)

---

## 🚀 การติดตั้ง

### Quick Start (แนะนำ)

```bash
# 1. Clone repository (ถ้ามี) หรือใช้โฟลเดอร์ที่มีอยู่
cd /opt/code/openproject/worksla

# 2. ตรวจสอบไฟล์ .env
cat .env

# 3. รันสคริปต์ติดตั้งและเริ่มระบบ
./start.sh

# หรือใช้ Makefile
make install
```

### Manual Installation

```bash
# 1. ตรวจสอบ .env configuration
cat .env

# 2. Build Docker images
docker-compose build

# 3. Start services
docker-compose up -d

# 4. Create database and tables
docker-compose exec worksla-backend python scripts/init_db.py

# 5. Create admin user
docker-compose exec worksla-backend python scripts/seed_admin.py

# 6. Check status
docker-compose ps
```

### การเข้าถึงระบบ

เปิดเบราว์เซอร์และเข้าสู่:
```
https://10.251.150.222:3346/worksla/
```

**⚠️ หมายเหตุ:** คุณจะเห็นคำเตือนเกี่ยวกับ certificate (Self-signed)
- Chrome/Edge: คลิก "Advanced" → "Proceed to 10.251.150.222"
- Firefox: คลิก "Advanced" → "Accept the Risk and Continue"

**ข้อมูลเข้าสู่ระบบเริ่มต้น:**
```
Username: admin
Password: admin123
```

🔐 **สำคัญ!** เปลี่ยนรหัสผ่านหลังจากเข้าสู่ระบบครั้งแรก

---

## 💻 การใช้งาน

### Makefile Commands

```bash
make help              # แสดงคำสั่งทั้งหมด
make up                # เริ่มระบบ
make down              # หยุดระบบ
make restart           # รีสตาร์ทระบบ
make logs              # ดู logs ทั้งหมด
make logs-backend      # ดู backend logs
make logs-frontend     # ดู frontend logs
make ps                # แสดงสถานะ containers
make seed              # สร้าง admin user
make clean             # ลบทุกอย่างรวม volumes
make install           # ติดตั้งครั้งแรก
```

### Docker Compose Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart specific service
docker-compose restart worksla-backend

# Rebuild specific service
docker-compose build worksla-frontend
docker-compose up -d worksla-frontend
```

### การสร้าง Admin User เพิ่มเติม

```bash
# Default credentials (admin/admin123)
make seed

# Custom credentials
docker-compose exec worksla-backend python scripts/seed_admin.py \
  --username myuser \
  --password mypassword

# Force update existing user
docker-compose exec worksla-backend python scripts/seed_admin.py \
  --username admin \
  --password newpassword \
  --force
```

---

## 📁 โครงสร้างโปรเจกต์

```
/opt/code/openproject/worksla/
├── backend/                    # Backend (FastAPI)
│   ├── app/
│   │   ├── main.py            # FastAPI application
│   │   ├── core/              # Config, security, database
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── repositories/      # Data access layer
│   │   ├── services/          # Business logic
│   │   └── api/
│   │       └── routes/        # API endpoints
│   ├── scripts/
│   │   ├── init_db.py         # Database initialization
│   │   └── seed_admin.py      # Seed admin user
│   ├── pyproject.toml         # Python dependencies
│   └── Dockerfile
│
├── frontend/                   # Frontend (React + Vite)
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Main app component
│   │   ├── api/               # API client
│   │   ├── components/        # Reusable components
│   │   ├── context/           # React contexts
│   │   ├── layouts/           # Layout components
│   │   ├── pages/             # Page components
│   │   ├── styles/            # Global styles
│   │   └── theme.ts           # MUI theme
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── reverse-proxy/              # Nginx reverse proxy
│   ├── nginx.conf             # Nginx configuration
│   ├── Dockerfile
│   └── generate-certs.sh      # SSL certificate generator
│
├── docker-compose.yml          # Docker Compose configuration
├── Makefile                    # Make commands
├── start.sh                    # Build & run script
├── .env                        # Environment variables
│
└── docs/                       # Documentation
    ├── README.md              # This file
    ├── DEPLOY.md              # Deployment guide
    ├── API.md                 # API documentation
    ├── DB_SCHEMA.md           # Database schema
    ├── ADMIN_GUIDE.md         # Admin guide
    ├── USER_GUIDE.md          # User guide
    └── SECURITY.md            # Security guide
```

---

## 🔧 การพัฒนา

### Local Development

**Backend Development:**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows

# Install dependencies
pip install -e .

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Development:**
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### การเพิ่ม API Endpoint ใหม่

1. สร้าง Route ใน `backend/app/api/routes/`
2. เพิ่ม Schema ใน `backend/app/schemas/`
3. เพิ่ม Repository method ใน `backend/app/repositories/`
4. Register router ใน `backend/app/main.py`
5. เพิ่ม API call ใน `frontend/src/api/client.ts`
6. สร้าง React component ใช้งาน API

---

## 🐛 การแก้ไขปัญหา

### ปัญหา: Port ถูกใช้งานอยู่แล้ว

```bash
# ตรวจสอบ process ที่ใช้ port
sudo lsof -i :3346
sudo lsof -i :3346

# Kill process
sudo kill -9 <PID>
```

### ปัญหา: Database connection failed

```bash
# ตรวจสอบ PostgreSQL
psql -h 10.251.150.222 -p 5210 -U apirak.ja -d postgres

# ตรวจสอบ environment variables
docker-compose exec worksla-backend env | grep POSTGRES

# รัน init_db.py อีกครั้ง
docker-compose exec worksla-backend python scripts/init_db.py
```

### ปัญหา: Backend ไม่ทำงาน

```bash
# ดู logs
docker-compose logs worksla-backend

# Restart backend
docker-compose restart worksla-backend

# Check health
curl http://localhost:8000/api/health
```

### ปัญหา: Frontend แสดงผลผิดพลาด

```bash
# ดู logs
docker-compose logs worksla-frontend

# Rebuild frontend
docker-compose build worksla-frontend
docker-compose up -d worksla-frontend

# Clear browser cache
# Ctrl+Shift+R (Chrome/Firefox)
```

### ปัญหา: Certificate error

```bash
# Regenerate certificate
docker-compose down
docker volume rm worksla-nginx-certs
docker-compose up -d
```

### ดู Container Labels

```bash
# ดู containers ที่มี worksla label
docker ps --filter "label=worksla=1"

# ดูรายละเอียด labels
docker inspect worksla-backend | grep -A 5 Labels
```

---

## 📚 เอกสารเพิ่มเติม

- [DEPLOY.md](./DEPLOY.md) - คู่มือการ Deploy สำหรับ Production
- [API.md](./API.md) - เอกสาร API Reference
- [DB_SCHEMA.md](./DB_SCHEMA.md) - Database Schema และ ERD
- [ADMIN_GUIDE.md](./ADMIN_GUIDE.md) - คู่มือสำหรับ Administrator
- [USER_GUIDE.md](./USER_GUIDE.md) - คู่มือการใช้งานสำหรับผู้ใช้
- [SECURITY.md](./SECURITY.md) - แนวปฏิบัติด้านความปลอดภัย

---

## 🤝 การสนับสนุน

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. ตรวจสอบ [การแก้ไขปัญหา](#การแก้ไขปัญหา)
2. ดู logs: `make logs`
3. ติดต่อทีมพัฒนา: กลุ่มงานโครงสร้างพื้นฐานดิจิทัลทางการแพทย์

---

## 📝 License

Copyright © 2025 Digital Medical Infrastructure Team  
Medical Center, Walailak University

---

## 👥 Credits

**พัฒนาโดย:**  
กลุ่มงานโครงสร้างพื้นฐานดิจิทัลทางการแพทย์  
ศูนย์การแพทย์ มหาวิทยาลัยวลัยลักษณ์

**Version:** 1.0.0  
**Last Updated:** October 2025
