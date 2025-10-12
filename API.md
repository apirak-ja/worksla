# API Documentation

## Base URL

```
https://10.251.150.222:3346/worksla/api
```

## Authentication

WorkSLA ใช้ JWT-based authentication ผ่าน HttpOnly cookies

### Login

**POST** `/auth/login`

Request:
```json
{
  "username": "admin",
  "password": "admin123"
}
```

Response (200 OK):
```json
{
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z"
  },
  "message": "Login successful"
}
```

Sets cookies:
- `access_token` (HttpOnly, Secure, SameSite=strict)
- `refresh_token` (HttpOnly, Secure, SameSite=strict)

### Logout

**POST** `/auth/logout`

Response (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

### Get Current User

**GET** `/auth/me`

Response (200 OK):
```json
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "is_active": true,
  "created_at": "2025-01-01T00:00:00Z"
}
```

### Refresh Token

**POST** `/auth/refresh`

Response (200 OK):
```json
{
  "message": "Token refreshed successfully"
}
```

---

## Work Packages

### List Work Packages

**GET** `/wp`

Query Parameters:
- `page` (int, default: 1)
- `page_size` (int, default: 50, max: 200)
- `status` (string)
- `priority` (string)
- `type` (string)
- `assignee_id` (int)
- `project_id` (int)
- `search` (string)
- `sort_by` (string, default: "updated_at")
- `sort_order` (string, "asc" or "desc", default: "desc")

Response (200 OK):
```json
{
  "items": [
    {
      "wp_id": 34909,
      "subject": "ติดตั้งระบบ Network",
      "status": "In Progress",
      "priority": "High",
      "type": "Task",
      "assignee_id": 123,
      "assignee_name": "John Doe",
      "project_id": 1,
      "project_name": "IT Support",
      "start_date": "2025-01-01T00:00:00Z",
      "due_date": "2025-01-15T00:00:00Z",
      "created_at": "2025-01-01T00:00:00Z",
      "updated_at": "2025-01-10T00:00:00Z",
      "cached_at": "2025-01-10T12:00:00Z"
    }
  ],
  "total": 100,
  "page": 1,
  "page_size": 50,
  "pages": 2
}
```

### Get Dashboard Data

**GET** `/wp/dashboard`

Response (200 OK):
```json
{
  "stats": {
    "total": 150,
    "by_status": {
      "New": 20,
      "In Progress": 50,
      "Closed": 80
    },
    "by_priority": {
      "High": 30,
      "Normal": 80,
      "Low": 40
    },
    "overdue_count": 5,
    "due_soon_count": 10
  },
  "overdue": [],
  "due_soon": [],
  "recent_updates": []
}
```

### Get Work Package Detail

**GET** `/wp/{id}`

Response (200 OK):
```json
{
  "wp_id": 34909,
  "subject": "ติดตั้งระบบ Network",
  "status": "In Progress",
  "priority": "High",
  "type": "Task",
  "assignee_id": 123,
  "assignee_name": "John Doe",
  "project_id": 1,
  "project_name": "IT Support",
  "start_date": "2025-01-01T00:00:00Z",
  "due_date": "2025-01-15T00:00:00Z",
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-10T00:00:00Z",
  "cached_at": "2025-01-10T12:00:00Z",
  "raw": {}
}
```

### Get Work Package Activities

**GET** `/wp/{id}/activities`

Response (200 OK):
```json
{
  "wp_id": 34909,
  "activities": []
}
```

### Refresh Work Packages

**POST** `/wp/refresh`

Requires: `admin` or `analyst` role

Response (200 OK):
```json
{
  "message": "Refreshed 100 work packages"
}
```

---

## Admin - Users

### List Users

**GET** `/admin/users`

Requires: `admin` role

Response (200 OK):
```json
[
  {
    "id": 1,
    "username": "admin",
    "role": "admin",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### Create User

**POST** `/admin/users`

Requires: `admin` role

Request:
```json
{
  "username": "newuser",
  "password": "password123",
  "role": "viewer"
}
```

Response (200 OK):
```json
{
  "id": 2,
  "username": "newuser",
  "role": "viewer",
  "is_active": true,
  "created_at": "2025-01-10T00:00:00Z"
}
```

### Update User

**PUT** `/admin/users/{id}`

Requires: `admin` role

Request:
```json
{
  "role": "analyst",
  "is_active": true
}
```

### Delete User

**DELETE** `/admin/users/{id}`

Requires: `admin` role

Response (200 OK):
```json
{
  "message": "User deleted successfully"
}
```

---

## Admin - Assignees

### List Assignees

**GET** `/admin/assignees`

Query Parameters:
- `active_only` (boolean)

Response (200 OK):
```json
[
  {
    "id": 1,
    "op_user_id": 123,
    "display_name": "John Doe",
    "active": true,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

### Create Assignee

**POST** `/admin/assignees`

Request:
```json
{
  "op_user_id": 456,
  "display_name": "Jane Smith",
  "active": true
}
```

### Update Assignee

**PUT** `/admin/assignees/{id}`

Request:
```json
{
  "display_name": "Jane S.",
  "active": false
}
```

### Delete Assignee

**DELETE** `/admin/assignees/{id}`

---

## Admin - Settings

### List Settings

**GET** `/admin/settings`

### Get Setting

**GET** `/admin/settings/{key}`

### Create Setting

**POST** `/admin/settings`

Request:
```json
{
  "key": "SLA_THRESHOLD",
  "value": {"days": 7},
  "description": "SLA threshold in days"
}
```

### Update Setting

**PUT** `/admin/settings/{key}`

Request:
```json
{
  "value": {"days": 14},
  "description": "Updated SLA threshold"
}
```

---

## Reports

### SLA Report

**GET** `/reports/sla`

Query Parameters:
- `start_date` (datetime)
- `end_date` (datetime)
- `assignee_id` (int)
- `project_id` (int)

Response:
```json
{
  "period": {
    "start": "2025-01-01T00:00:00Z",
    "end": "2025-01-31T00:00:00Z"
  },
  "metrics": {
    "total": 100,
    "on_time": 85,
    "overdue": 15,
    "sla_percentage": 85.0
  }
}
```

### Productivity Report

**GET** `/reports/productivity`

Query Parameters:
- `start_date` (datetime)
- `end_date` (datetime)
- `group_by` ("assignee" or "project")

---

## Search

**GET** `/search`

Query Parameters:
- `q` (string, required, min 2 chars)
- `limit` (int, max 100)

Response:
```json
[
  {
    "wp_id": 34909,
    "subject": "ติดตั้งระบบ Network",
    "status": "In Progress",
    ...
  }
]
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Operation not permitted"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limiting

Currently no rate limiting implemented. Consider adding in production.

---

## CORS

CORS is configured to allow requests from:
- https://10.251.150.222:3346
- https://10.251.150.222
- http://localhost:5173 (development)
- http://localhost:3000 (development)
