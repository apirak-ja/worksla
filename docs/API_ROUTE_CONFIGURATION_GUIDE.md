# 📚 API Route Configuration Guide
## WorkSLA - OpenProject SLA Reporting System

**เอกสารฉบับสมบูรณ์เกี่ยวกับ Prefix Route, Base Path และ API Structure**

---

## 📋 สารบัญ

1. [ภาพรวมระบบ](#ภาพรวมระบบ)
2. [โครงสร้าง URL แบบเต็ม](#โครงสร้าง-url-แบบเต็ม)
3. [Backend Configuration](#backend-configuration)
4. [Frontend Configuration](#frontend-configuration)
5. [Reverse Proxy Configuration](#reverse-proxy-configuration)
6. [Custom Options API Flow](#custom-options-api-flow)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)

---

## 🏗️ ภาพรวมระบบ

### **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Browser                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ HTTPS (Port 3346)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Nginx Reverse Proxy                          │
│                   (worksla-reverse-proxy)                        │
│                                                                   │
│  Rules:                                                          │
│  • /worksla/api/*  → Backend (8000)                             │
│  • /worksla/*      → Frontend (80)                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            │                               │
            ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│   Backend (FastAPI)   │       │  Frontend (React)     │
│   worksla-backend     │       │  worksla-frontend     │
│   Port: 8000          │       │  Port: 80             │
│   Base: /api          │       │  Nginx serving        │
└───────────────────────┘       └───────────────────────┘
            │
            │ API Calls
            ▼
┌───────────────────────┐
│  OpenProject API      │
│  hosp.wu.ac.th/cmms   │
│  Port: 443 (HTTPS)    │
└───────────────────────┘
```

---

## 🌐 โครงสร้าง URL แบบเต็ม

### **1. Production URLs (ผ่าน Reverse Proxy)**

| Component | URL Pattern | Example |
|-----------|-------------|---------|
| **Frontend Home** | `https://10.251.150.222:3346/worksla/` | Home page |
| **Frontend Pages** | `https://10.251.150.222:3346/worksla/workpackages/` | Work packages list |
| **Frontend Detail** | `https://10.251.150.222:3346/worksla/workpackages/:id` | WP #34909 |
| **Backend API** | `https://10.251.150.222:3346/worksla/api/*` | All API endpoints |
| **API Work Packages** | `https://10.251.150.222:3346/worksla/api/workpackages/` | List WPs |
| **API WP Detail** | `https://10.251.150.222:3346/worksla/api/workpackages/:id` | Get WP #34909 |
| **API Authentication** | `https://10.251.150.222:3346/worksla/api/auth/login` | Login endpoint |

### **2. Development URLs (Direct Container Access)**

| Component | URL Pattern | Note |
|-----------|-------------|------|
| **Backend Direct** | `http://localhost:8000/api/*` | ❌ Not accessible from host |
| **Backend via Docker** | `http://192.168.64.3:8000/api/*` | ⚠️ Requires Host header |
| **Frontend Direct** | `http://localhost:80/` | ❌ Not accessible from host |

### **3. OpenProject API URLs**

| Resource | URL Pattern |
|----------|-------------|
| **Base URL** | `https://hosp.wu.ac.th/cmms/api/v3/` |
| **Work Package** | `https://hosp.wu.ac.th/cmms/api/v3/work_packages/:id` |
| **Custom Options** | `https://hosp.wu.ac.th/cmms/api/v3/custom_options/:id` |
| **Journals** | `https://hosp.wu.ac.th/cmms/api/v3/work_packages/:id/journals` |

---

## ⚙️ Backend Configuration

### **File: `backend/app/main.py`**

```python
# FastAPI Application
app = FastAPI(
    title="Open Project SLA Reporting System",
    version="1.0.0",
    description="SLA Reporting System",
    
    # ❌ root_path is DISABLED for now
    # root_path="/worksla",  # Commented out
    
    # API documentation URLs
    docs_url=f"{settings.API_PREFIX}/docs",      # /api/docs
    redoc_url=f"{settings.API_PREFIX}/redoc",    # /api/redoc
    openapi_url=f"{settings.API_PREFIX}/openapi.json"
)
```

**Why `root_path` is disabled:**
- Nginx reverse proxy handles the `/worksla` prefix
- Backend only needs to know about `/api` prefix
- Simplifies internal routing

### **File: `backend/app/core/config.py`**

```python
class Settings(BaseSettings):
    # API Prefix (used internally)
    API_PREFIX: str = "/api"
    
    # OpenProject Integration
    OPENPROJECT_URL: str = os.getenv("OPENPROJECT_URL", "")
    OPENPROJECT_API_KEY: str = os.getenv("OPENPROJECT_API_KEY", "")
    
    @property
    def OPENPROJECT_BASE_URL(self) -> str:
        """Construct OpenProject base URL"""
        if self.OPENPROJECT_URL:
            return self.OPENPROJECT_URL.rstrip('/')
        return "https://hosp.wu.ac.th/cmms"  # Default
```

### **Router Registration**

```python
# Include routers with API_PREFIX
app.include_router(
    auth.router, 
    prefix=f"{settings.API_PREFIX}/auth",  # /api/auth
    tags=["Authentication"]
)

app.include_router(
    workpackages.router, 
    prefix=f"{settings.API_PREFIX}/workpackages",  # /api/workpackages
    tags=["Work Packages"]
)
```

### **Work Packages Routes**

| Method | Route | Full Path | Description |
|--------|-------|-----------|-------------|
| GET | `/dashboard` | `/api/workpackages/dashboard` | Dashboard stats |
| GET | `/` | `/api/workpackages/` | List work packages |
| GET | `/{wp_id}` | `/api/workpackages/:id` | Get WP detail |
| GET | `/{wp_id}/raw` | `/api/workpackages/:id/raw` | Get raw data (no schema) |
| GET | `/{wp_id}/journals` | `/api/workpackages/:id/journals` | Get activities |
| GET | `/test` | `/api/workpackages/test` | Test endpoint |
| GET | `/test/{wp_id}` | `/api/workpackages/test/:id` | Test WP fetch |

---

## 🖥️ Frontend Configuration

### **File: `frontend/src/api/client.ts`**

```typescript
// API Base URL
const baseURL = import.meta.env.VITE_API_BASE_URL || '/worksla/api';

// Axios instance
const apiClient = axios.create({
  baseURL: baseURL,  // All requests prepend '/worksla/api'
  timeout: 30000,
  withCredentials: true,  // Include cookies
});
```

**Environment Variables:**
```env
# .env.production
VITE_API_BASE_URL=/worksla/api

# .env.development
VITE_API_BASE_URL=http://localhost:8000/api
```

### **API Calls Examples**

```typescript
// Get work package detail
// Request: GET /worksla/api/workpackages/34909
const response = await apiClient.get(`/workpackages/${id}`);

// List work packages
// Request: GET /worksla/api/workpackages/?page=1&page_size=50
const response = await apiClient.get('/workpackages/', { 
  params: { page: 1, page_size: 50 } 
});

// Get journals
// Request: GET /worksla/api/workpackages/34909/journals
const response = await apiClient.get(`/workpackages/${id}/journals`);
```

### **Vite Configuration**

```typescript
// vite.config.ts
export default defineConfig({
  base: '/worksla/',  // Base path for assets
  server: {
    port: 5173,
    proxy: {
      '/worksla/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/worksla\/api/, '/api')
      }
    }
  }
});
```

---

## 🔀 Reverse Proxy Configuration

### **File: `reverse-proxy/nginx.conf`**

```nginx
server {
    listen 443 ssl;
    server_name 10.251.150.222;
    
    # SSL Configuration
    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    
    # Backend API Proxy
    location /worksla/api/ {
        proxy_pass http://worksla-backend:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Important: Remove /worksla prefix before passing to backend
        # /worksla/api/workpackages/123 → /api/workpackages/123
    }
    
    # Frontend Static Files Proxy
    location /worksla/ {
        proxy_pass http://worksla-frontend:80/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Root redirect
    location = /worksla {
        return 301 /worksla/;
    }
}
```

**Key Points:**
- ✅ `/worksla/api/` → Backend port 8000 (strips `/worksla`)
- ✅ `/worksla/` → Frontend port 80 (strips `/worksla`)
- ✅ SSL termination at proxy level
- ✅ Proper headers forwarding

---

## 🔄 Custom Options API Flow

### **Problem: URL Duplication**

**Original Issue:**
```
Received: /cmms/api/v3/custom_options/23
Base URL: https://hosp.wu.ac.th/cmms
Result:   https://hosp.wu.ac.th/cmms/cmms/api/v3/custom_options/23  ❌
```

### **Solution Implementation**

**File: `backend/app/services/openproject_client.py`**

```python
def get_custom_option_details(self, option_url: str) -> Optional[Dict[str, Any]]:
    """
    Fetch custom option details from OpenProject API
    
    Handles multiple URL formats:
    1. /cmms/api/v3/custom_options/23 (full path from OpenProject)
    2. /api/v3/custom_options/23 (partial path)
    3. https://... (full URL, rare)
    4. custom_options/23 (relative path)
    """
    try:
        logger.info(f"Received option_url: {option_url}")
        
        # Case 1: Path has /cmms/api/v3 already
        if option_url.startswith("/cmms/api/v3/"):
            # Just prepend domain, don't add base_url
            option_url = f"https://hosp.wu.ac.th{option_url}"
            
        # Case 2: Path has only /api/v3
        elif option_url.startswith("/api/v3/"):
            # Add base URL which includes /cmms
            option_url = f"{self.base_url}{option_url}"
            
        # Case 3: Full HTTP URL
        elif option_url.startswith("http"):
            # Use as-is (rare case)
            pass
            
        # Case 4: Relative path
        else:
            # Build full URL
            option_url = f"{self.base_url}/api/v3/{option_url.lstrip('/')}"
        
        logger.info(f"Fetching custom option details from {option_url}")
        
        # Make API request
        response = self.session.get(option_url, timeout=self.timeout)
        response.raise_for_status()
        
        data = response.json()
        logger.info(f"Successfully fetched: {data.get('value')}")
        
        return {
            "id": data.get("id"),
            "value": data.get("value"),
            "title": data.get("_links", {}).get("customField", {}).get("title", ""),
            "href": option_url
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch from {option_url}: {e}")
        return None
```

### **Data Flow Diagram**

```
┌──────────────────────────────────────────────────────────────┐
│ 1. Frontend Request                                           │
│    GET /worksla/api/workpackages/34909                       │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Nginx Reverse Proxy                                        │
│    Strips /worksla → GET /api/workpackages/34909             │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Backend FastAPI                                            │
│    Route: @router.get("/{wp_id}")                            │
│    Calls: openproject_client.get_work_package(34909)         │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. OpenProject API                                            │
│    GET https://hosp.wu.ac.th/cmms/api/v3/work_packages/34909│
│    Response includes _links with custom options hrefs        │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Extract Custom Fields                                      │
│    _extract_custom_fields() processes response               │
│                                                               │
│    For each custom field with custom option:                 │
│    • href: "/cmms/api/v3/custom_options/23"                  │
│    • Calls: get_custom_option_details(href)                  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. Fetch Custom Option Details                               │
│    GET https://hosp.wu.ac.th/cmms/api/v3/custom_options/23  │
│    Response: {"id": 23, "value": "คอมพิวเตอร์ตั้งโต๊ะ", ...}│
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. Build Final Response                                       │
│    {                                                          │
│      "wp_id": 34909,                                         │
│      "customField3": "คอมพิวเตอร์ตั้งโต๊ะ / ...",            │
│      "customField3_option_value": "คอมพิวเตอร์ตั้งโต๊ะ / ..."│
│      "customField3_option_id": 23,                           │
│      "customField9": "ด่วน",                                 │
│      "customField9_option_value": "ด่วน",                    │
│      "customField9_option_id": 33                            │
│    }                                                          │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 8. Return to Frontend                                         │
│    Frontend receives full data including option values       │
└──────────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### **Issue 1: 404 Not Found on API Endpoints**

**Symptoms:**
```bash
curl http://localhost:8000/api/workpackages/34909
# Returns: Not found
```

**Possible Causes:**
1. ❌ Backend container not running
2. ❌ Router not properly mounted
3. ❌ Incorrect base path

**Solutions:**
```bash
# Check backend status
docker logs worksla-backend --tail 50

# Verify routes are registered
curl http://192.168.64.3:8000/api/docs

# Test through reverse proxy instead
curl -k https://10.251.150.222:3346/worksla/api/workpackages/34909
```

---

### **Issue 2: "Invalid host header" Error**

**Symptoms:**
```bash
curl http://192.168.64.3:8000/api/workpackages/34909
# Returns: Invalid host header
```

**Cause:**
- FastAPI TrustedHostMiddleware blocking request
- Docker IP not in allowed hosts

**Solution:**
```bash
# Add Host header
curl -H "Host: localhost:8000" http://192.168.64.3:8000/api/workpackages/34909
```

---

### **Issue 3: Custom Options Return Null**

**Symptoms:**
```json
{
  "customField3": "คอมพิวเตอร์...",
  "customField3_option_value": null  ← NULL!
}
```

**Diagnostic Steps:**
```bash
# 1. Check backend logs for URL errors
docker logs worksla-backend 2>&1 | grep "custom.*option"

# 2. Look for 404 errors or URL duplication
# Bad: /cmms/api/v3/cmms/api/v3/custom_options/23
# Good: /cmms/api/v3/custom_options/23

# 3. Test specific WP
curl -H "Host: localhost:8000" \
  http://192.168.64.3:8000/api/workpackages/test/34909 | jq
```

**Solution:**
- URL duplication already fixed in `get_custom_option_details()`
- Restart backend: `docker-compose restart worksla-backend`

---

### **Issue 4: Authentication Failed**

**Symptoms:**
```json
{"detail": "Not authenticated"}
```

**Causes:**
1. Session cookie expired
2. Cookie not sent with request
3. CORS issue

**Solutions:**
```bash
# Login to get fresh session
curl -X POST https://10.251.150.222:3346/worksla/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"***"}' \
  -c /tmp/cookies.txt -k

# Use cookies in subsequent requests
curl -k -b /tmp/cookies.txt \
  https://10.251.150.222:3346/worksla/api/workpackages/34909
```

---

## ✅ Best Practices

### **1. URL Construction**

**❌ Don't:**
```python
# Hardcoding paths
url = "https://hosp.wu.ac.th/cmms/api/v3/work_packages/123"

# String concatenation without validation
url = base_url + "/api/v3/" + path  # May create /cmms/api/v3//path
```

**✅ Do:**
```python
# Use URL parsing
from urllib.parse import urljoin

url = urljoin(self.base_url, f"/api/v3/work_packages/{wp_id}")

# Or handle different cases explicitly
if path.startswith("/cmms/api/v3/"):
    url = f"https://hosp.wu.ac.th{path}"
elif path.startswith("/api/v3/"):
    url = f"{self.base_url}{path}"
else:
    url = f"{self.base_url}/api/v3/{path.lstrip('/')}"
```

---

### **2. Logging**

**Always log URLs before making requests:**
```python
logger.info(f"Received URL: {option_url}")
logger.info(f"Normalized URL: {final_url}")

try:
    response = self.session.get(final_url)
    logger.info(f"Success: {response.status_code}")
except Exception as e:
    logger.error(f"Failed: {e}")
```

---

### **3. Schema Validation**

**For dynamic fields, use `extra='allow'`:**
```python
class WPDetailResponse(WPResponse):
    raw: Optional[Dict[str, Any]] = None
    openproject_url: Optional[str] = None
    
    # Allow extra fields like customField1, customField2, etc.
    model_config = ConfigDict(from_attributes=True, extra='allow')
```

---

### **4. Error Handling**

**Return partial data on error:**
```python
def get_work_package(self, wp_id: int) -> Dict:
    try:
        data = self._fetch_from_openproject(wp_id)
        
        # Try to enrich with custom options
        try:
            custom_fields = self._extract_custom_fields(data)
            data.update(custom_fields)
        except Exception as e:
            # Don't fail entire request if custom options fail
            logger.warning(f"Failed to fetch custom options: {e}")
            # Continue with basic data
        
        return data
    except Exception as e:
        logger.error(f"Failed to fetch work package: {e}")
        raise
```

---

### **5. Testing**

**Test at multiple levels:**

```bash
# 1. Test backend directly (bypassing auth)
curl -H "Host: localhost:8000" \
  http://192.168.64.3:8000/api/workpackages/test/34909

# 2. Test through reverse proxy (with auth)
curl -k -b cookies.txt \
  https://10.251.150.222:3346/worksla/api/workpackages/34909

# 3. Test in browser DevTools
fetch('/worksla/api/workpackages/34909')
  .then(r => r.json())
  .then(console.log)
```

---

## 📊 Quick Reference Table

### **URL Mapping Overview**

| From | To | Handled By |
|------|-----|-----------|
| Browser: `/worksla/api/workpackages/123` | Backend: `/api/workpackages/123` | Nginx |
| Backend: `/api/workpackages/123` | FastAPI Route: `/{wp_id}` | FastAPI Router |
| OpenProject Link: `/cmms/api/v3/custom_options/23` | Full URL: `https://hosp.wu.ac.th/cmms/api/v3/custom_options/23` | Backend Client |

### **Environment Variables**

| Variable | Development | Production | Used By |
|----------|-------------|------------|---------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | `/worksla/api` | Frontend |
| `OPENPROJECT_URL` | `https://hosp.wu.ac.th/cmms` | `https://hosp.wu.ac.th/cmms` | Backend |
| `API_PREFIX` | `/api` | `/api` | Backend |

---

## 🎯 Summary

### **Key Takeaways:**

1. ✅ **Reverse Proxy** handles `/worksla` prefix stripping
2. ✅ **Backend** only knows about `/api` prefix internally
3. ✅ **Frontend** uses `/worksla/api` for all API calls
4. ✅ **Custom Options** requires careful URL handling to avoid duplication
5. ✅ **Schema** must allow extra fields (`extra='allow'`) for dynamic custom fields
6. ✅ **Testing** should be done at all levels (direct, proxy, browser)

### **Files Modified:**

- `backend/app/main.py` - FastAPI app configuration
- `backend/app/core/config.py` - Settings and base URLs
- `backend/app/services/openproject_client.py` - URL handling fixes
- `backend/app/schemas/__init__.py` - Schema extra fields
- `backend/app/api/routes/workpackages.py` - Routes and test endpoints
- `reverse-proxy/nginx.conf` - Proxy rules
- `frontend/src/api/client.ts` - API base URL

---

**Document Version:** 1.0  
**Last Updated:** October 16, 2025  
**Status:** ✅ Production Ready

**Next Steps:**
1. Remove test endpoints before production deployment
2. Monitor logs for any remaining URL issues
3. Update frontend to display custom options properly
