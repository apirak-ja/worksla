# 📊 WorkSLA System - การศึกษาโครงสร้างทั้งหมด

## 📋 สัญญา

**เขียนวันที่**: 17 ตุลาคม 2567  
**ระบบ**: WorkSLA - Open Project SLA Reporting System  
**สถาบัน**: ศูนย์การแพทย์ มหาวิทยาลัยวลัยลักษณ์ (WUH)

---

## 🏗️ A. สถาปัตยกรรมระบบ

### 1. Overview Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                            │
│              (HTTPS: 10.251.150.222:3346/worksla/)         │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS (TLS 1.2/1.3)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│           Nginx Reverse Proxy & Load Balancer               │
│                 (worksla-nginx)                             │
│  • SSL/TLS Termination                                      │
│  • Gzip Compression                                         │
│  • Security Headers                                         │
│  • Rate Limiting                                            │
│  • Static Asset Caching                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
   ┌─────────────┐          ┌──────────────┐
   │  Frontend   │          │   Backend    │
   │  (React)    │          │  (FastAPI)   │
   │  Port: 80   │          │  Port: 8000  │
   └─────────────┘          └──────┬───────┘
                                   │
                                   ▼
                          ┌─────────────────┐
                          │ OpenProject API │
                          │ (hosp.wu.ac.th) │
                          │  Port: 443      │
                          └─────────────────┘
```

### 2. Docker Compose Services

| Service | Image | Port | Volume | Purpose |
|---------|-------|------|--------|---------|
| **worksla-backend** | Custom (FastAPI) | 8000 | ./backend | API Server |
| **worksla-frontend** | Custom (React+Vite) | 80 | - | Web UI |
| **worksla-nginx** | Custom (Nginx) | 3346 | nginx-certs | Reverse Proxy |

---

## 🎨 B. Frontend Architecture

### 1. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | React | 18.2.0 | UI Library |
| **Build** | Vite | 5.0.11 | Build Tool |
| **Language** | TypeScript | 5.3.3 | Type Safety |
| **UI Library** | MUI (Material-UI) | 5.15.6 | Component Library |
| **Styling** | Tailwind CSS | 3.4.1 | Utility CSS |
| **State Mgmt** | Zustand | 4.5.0 | Lightweight Store |
| **Routing** | React Router | 6.21.3 | Client-side Routing |
| **Data Fetching** | Axios + React Query | 5.17.15 | API Client |
| **Charts** | Chart.js + Recharts | 4.4.1 | Data Visualization |
| **Date** | date-fns | 3.2.0 | Date Utility |
| **Icons** | MUI Icons | 5.15.6 | Icon Set |

### 2. Folder Structure

```
frontend/src/
├── api/
│   └── client.ts              # Axios instance + API types
├── assets/
│   └── wuh_logo.png           # WUH Logo
├── components/
│   ├── ActivityHistoryCard.tsx
│   ├── ActivityTimelineImproved.tsx
│   ├── Footer.tsx
│   ├── ProfileMenu.tsx
│   ├── ProtectedRoute.tsx
│   ├── Section.tsx
│   ├── ThemeToggle.tsx
│   ├── WorkPackageTimeline.tsx
│   └── ui/                    # Reusable UI Components
├── context/
│   ├── AuthContext.tsx        # Authentication State
│   └── ThemeContext.tsx       # Light/Dark Mode
├── layouts/
│   └── MainLayout.tsx         # Main App Layout
├── pages/
│   ├── admin/
│   │   ├── AdminRouteCheckerPage.tsx
│   │   ├── AdminSyncPage.tsx
│   │   ├── AssigneesAdminPage.tsx
│   │   ├── DefaultFiltersPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── UsersAdminPage.tsx
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── dashboard/
│   │   └── DashboardPage.tsx
│   ├── reports/
│   │   └── SLAReportsPage.tsx
│   └── workpackages/
│       ├── WorkPackageDetailModern.tsx
│       ├── WorkPackageDetailModern_Enhanced.tsx
│       ├── WorkPackageDetailPageNew.tsx
│       ├── WorkPackagesListModern.tsx
│       └── WorkPackagesPageNew.tsx
├── schemas/
├── styles/
├── types/
├── utils/
├── App.tsx                    # Main App Component
├── main.tsx                   # Entry Point
└── theme.ts                   # MUI Theme Config
```

### 3. Key Components

#### App.tsx - Main Application
- BrowserRouter ที่ basename="/worksla"
- QueryClientProvider สำหรับ React Query
- AuthProvider สำหรับ Authentication
- ThemeProvider สำหรับ Light/Dark Mode
- Route configuration

#### Routing Structure
```
/ → Dashboard (ProtectedRoute)
├── /dashboard → DashboardPage
├── /workpackages → WorkPackagesListModern
├── /workpackages/:id → WorkPackageDetailModern
├── /workpackages-enhanced/:id → WorkPackageDetailModernEnhanced
├── /reports/sla → SLAReportsPage
├── /admin/users → UsersAdminPage (Admin only)
├── /admin/assignees → AssigneesAdminPage (Admin only)
├── /admin/settings → SettingsPage (Admin only)
├── /admin/sync → AdminSyncPage (Admin only)
├── /admin/routes → AdminRouteCheckerPage (Admin only)
└── /auth/login → LoginPage
```

### 4. Context & State Management

#### AuthContext.tsx
- User state: `{ id, username, role, is_active }`
- Roles: admin, analyst, viewer
- Methods: `login()`, `logout()`, `hasRole()`

#### ThemeContext.tsx
- Mode: light | dark
- Persisted in localStorage
- Respects system preference

### 5. API Client Architecture

```typescript
// Base URL: /worksla/api
const api = axios.create({
  baseURL: '/worksla/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// Response interceptor
- Handles 401 Unauthorized
- Auto-refresh token
- Redirect to login on failure
```

### 6. Theme Configuration

#### Colors
- **Primary**: #7B5BA4 (Purple) - WUH Brand
- **Secondary**: #F17422 (Orange) - WUH Brand
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)
- **Info**: #3B82F6 (Blue)

#### Typography
- **Font**: IBM Plex Sans Thai
- **H1**: 2.5rem, bold
- **H2**: 2rem, bold
- **Button**: fontWeight: 500, textTransform: none

#### Shape
- **borderRadius**: 12px

---

## 🖥️ C. Backend Architecture

### 1. Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| **Framework** | FastAPI | Latest | Web Framework |
| **Language** | Python | 3.10+ | Backend Language |
| **Database** | SQLAlchemy | 2.0 | ORM |
| **Auth** | JWT + HttpOnly Cookies | - | Authentication |
| **Validation** | Pydantic | V2 | Data Validation |
| **Server** | Uvicorn | Latest | ASGI Server |

### 2. API Routes Structure

#### Base URL
```
External: https://10.251.150.222:3346/worksla/api/*
Internal: http://backend:8000/api/*
```

#### Route Groups

| Prefix | Purpose | Protected | Roles |
|--------|---------|-----------|-------|
| `/api/auth` | Authentication | Some | - |
| `/api/workpackages` | Work Package Operations | Yes | All |
| `/api/reports` | Report Generation | Yes | All |
| `/api/admin` | Administration | Yes | Admin |
| `/api/search` | Search Functionality | Yes | All |

### 3. Key Endpoints

#### Authentication
```
POST   /api/auth/login          Login
POST   /api/auth/logout         Logout
GET    /api/auth/me             Get Current User
POST   /api/auth/refresh        Refresh Token
```

#### Work Packages
```
GET    /api/workpackages                List WP
GET    /api/workpackages/{id}           Get Detail
GET    /api/workpackages/{id}/raw       Get Raw Data
GET    /api/workpackages/{id}/journals  Get Activities
GET    /api/workpackages/dashboard      Dashboard Stats
```

#### Reports
```
GET    /api/reports/sla         SLA Report
```

#### Admin
```
GET    /api/admin/users         List Users
POST   /api/admin/users         Create User
GET    /api/admin/assignees     List Assignees
POST   /api/admin/workpackages-sync    Sync WP
GET    /api/admin/settings      Get Settings
PUT    /api/admin/settings/{key}       Update Setting
```

### 4. Database Models

```
User
├── id: int
├── username: str (unique)
├── password: str (hashed)
├── role: enum (admin, analyst, viewer)
├── is_active: bool
└── created_at: datetime

WorkPackage (cached from OpenProject)
├── wp_id: int
├── subject: str
├── status: str
├── priority: str
├── assignee_id: int
├── project_id: int
├── start_date: datetime
├── due_date: datetime
└── cached_at: datetime

Setting
├── key: str
├── value: str
└── created_at: datetime

AuditLog
├── id: int
├── user_id: int
├── action: str
└── timestamp: datetime
```

### 5. Security Features

- **JWT Authentication**: HttpOnly, Secure, SameSite=Strict cookies
- **CORS**: Configured for worksla origin only
- **CSRF Protection**: Double-Submit Token pattern
- **HTTPS**: TLS 1.2/1.3 enforced
- **Rate Limiting**: Can be added via middleware
- **Input Validation**: Pydantic schemas
- **SQL Injection**: SQLAlchemy ORM prevents
- **XSS Protection**: React escapes by default + DOMPurify

---

## 🔌 D. API Communication Flow

### Request Flow
```
Browser (React)
  ↓
Axios API Client (/worksla/api/*)
  ↓
Nginx Reverse Proxy (/worksla/api/* → backend:8000/api/*)
  ↓
FastAPI Backend
  ├─ JWT Validation
  ├─ Role Check
  ├─ Request Validation
  └─ OpenProject API calls (if needed)
  ↓
Response
  ↓
Browser (Redux/Zustand → React Render)
```

### Authentication Flow
1. User submits credentials on LoginPage
2. Frontend calls `POST /api/auth/login`
3. Backend validates credentials, issues JWT
4. JWT stored in HttpOnly cookie
5. Subsequent requests include cookie automatically
6. 401 response triggers automatic token refresh
7. On refresh failure, user redirected to login

### Data Sync Flow
1. Admin triggers sync via `/api/admin/workpackages-sync`
2. Backend fetches from OpenProject API
3. Data cached in SQLAlchemy database
4. Frontend fetches from cache via `/api/workpackages/*`
5. Dashboard shows real-time stats

---

## 🌐 E. Nginx Configuration

### URL Routing
```
External Request: https://10.251.150.222:3346/worksla/api/health

Nginx Rules:
1. Match: /worksla/api/* → proxy to backend:8000/api/*
2. Match: /worksla/* → proxy to frontend:80

Result: Backend receives /api/health
```

### Security Headers
- `Strict-Transport-Security`: max-age=31536000
- `X-Frame-Options`: SAMEORIGIN
- `X-Content-Type-Options`: nosniff
- `X-XSS-Protection`: 1; mode=block
- `Referrer-Policy`: no-referrer-when-downgrade

### Compression
- gzip enabled for all text/json content
- min_length: 1024 bytes

---

## 👥 F. User Roles & Permissions

| Role | Dashboard | Work Packages | Reports | Admin |
|------|-----------|---------------|---------|-------|
| **admin** | Read | Read | Read | Full |
| **analyst** | Read | Read | Read | - |
| **viewer** | Read | Read | Read | - |

---

## 📊 G. Current UI Components

### Pages
1. **LoginPage**: Authentication
2. **DashboardPage**: KPI Overview + Stats
3. **WorkPackagesListModern**: List + Table
4. **WorkPackageDetailModern**: Detail View
5. **SLAReportsPage**: Report Generation
6. **Admin Pages**: Settings, Users, Assignees, Sync

### UI Components
- LoadingState, ErrorState, StatusChip
- Cards, Charts (Chart.js, Recharts)
- Tables (DataGrid)
- Forms, Inputs
- Drawers, Dialogs

---

## 🎯 H. Current State Assessment

### ✅ Strengths
- Clean TypeScript + React architecture
- MUI + Tailwind integration
- Theme system (light/dark mode)
- JWT security with HttpOnly cookies
- Responsive design consideration
- Component reusability
- Role-based access control

### ⚠️ Improvement Opportunities
1. **UI/UX Design**: Modern, professional look needs enhancement
2. **Mobile Responsiveness**: Need comprehensive mobile-first design
3. **Component Library**: Create more reusable UI components
4. **Accessibility**: WCAG compliance improvements
5. **Performance**: Lazy loading, code splitting
6. **Animation**: Micro-interactions missing
7. **Data Visualization**: More advanced charts
8. **Layout**: Unified, professional design system

---

## 🚀 I. Design Requirements for New UI

### 1. Responsive Design
- Desktop (1920px+)
- Tablet (768px - 1024px)
- Mobile (320px - 767px)
- All breakpoints covered

### 2. Theme Support
- Light Mode (Primary: #7B5BA4, Secondary: #F17422)
- Dark Mode (Consistent branding)
- Smooth transitions

### 3. Modern Design
- Professional appearance
- Consistent spacing & typography
- Smooth animations & transitions
- Micro-interactions
- Modern card-based layouts
- Visual hierarchy

### 4. Advanced Components
- Data grids with sorting/filtering
- Charts: Bar, Line, Pie, Area charts
- Timeline components
- Status indicators
- Progress trackers
- Calendar widgets
- Advanced forms

### 5. Accessibility
- ARIA labels
- Keyboard navigation
- Color contrast
- Focus management

---

## 📝 J. Summary

WorkSLA is a **well-architected SLA reporting system** with:
- React + TypeScript frontend
- FastAPI backend
- Docker containerization
- JWT security
- Theme support
- Role-based access control
- Clean API architecture

**Next Phase**: Complete UI redesign with modern, professional appearance while maintaining all functionality.

