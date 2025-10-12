"""
Pydantic Schemas for API
"""
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

# ============ Pagination Schemas ============
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool

# ============ User Schemas ============
class UserBase(BaseModel):
    username: str
    role: str = "viewer"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserListResponse(BaseModel):
    items: List[UserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool

# ============ Auth Schemas ============
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    user: UserResponse
    message: str = "Login successful"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

# ============ Work Package Schemas ============
class WPBase(BaseModel):
    wp_id: int
    subject: str
    status: Optional[str] = None
    priority: Optional[str] = None
    type: Optional[str] = None
    assignee_id: Optional[int] = None
    assignee_name: Optional[str] = None
    project_id: Optional[int] = None
    project_name: Optional[str] = None
    start_date: Optional[str] = None
    due_date: Optional[str] = None
    done_ratio: Optional[int] = None
    estimated_hours: Optional[float] = None
    description: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None

class WPResponse(WPBase):
    cached_at: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class WPDetailResponse(WPResponse):
    raw: Optional[Dict[str, Any]] = None

class WPListResponse(BaseModel):
    items: List[WPResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool

# ============ Filter Schemas ============
class WPFilterRequest(BaseModel):
    status: Optional[str] = None
    priority: Optional[str] = None
    type: Optional[str] = None
    assignee_id: Optional[int] = None
    project_id: Optional[int] = None
    start_date_from: Optional[datetime] = None
    start_date_to: Optional[datetime] = None
    due_date_from: Optional[datetime] = None
    due_date_to: Optional[datetime] = None
    search: Optional[str] = None
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=50, ge=1, le=200)
    sort_by: Optional[str] = "updated_at"
    sort_order: str = "desc"

# ============ Setting Schemas ============
class SettingResponse(BaseModel):
    id: int
    key: str
    value: Dict[str, Any]
    description: Optional[str] = None
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class SettingUpdate(BaseModel):
    value: Dict[str, Any]
    description: Optional[str] = None

# Specific setting schemas for different tabs
class OpenProjectSettings(BaseModel):
    base_url: str
    api_key: str
    timeout: int = 30
    verify_ssl: bool = True

class GeneralSettings(BaseModel):
    site_name: str = "WorkSLA"
    site_description: str = ""
    default_timezone: str = "Asia/Bangkok"
    date_format: str = "dd/mm/yyyy"
    items_per_page: int = 20

class SLASettings(BaseModel):
    default_response_hours: int = 24
    default_resolution_hours: int = 72
    business_hours_start: str = "09:00"
    business_hours_end: str = "18:00"
    business_days: List[str] = ["monday", "tuesday", "wednesday", "thursday", "friday"]
    escalation_enabled: bool = True
    escalation_hours: int = 48

class SecuritySettings(BaseModel):
    session_timeout_minutes: int = 480
    max_login_attempts: int = 3
    lockout_duration_minutes: int = 15
    password_min_length: int = 8
    password_require_uppercase: bool = True
    password_require_lowercase: bool = True
    password_require_numbers: bool = True
    password_require_symbols: bool = False

class UISettings(BaseModel):
    theme: str = "light"
    primary_color: str = "#1976d2"
    secondary_color: str = "#dc004e"
    language: str = "th"
    show_tutorial: bool = True
    compact_view: bool = False

# ============ Assignee Allowlist Schemas ============
class AssigneeBase(BaseModel):
    op_user_id: int
    display_name: str
    active: bool = True

class AssigneeCreate(AssigneeBase):
    pass

class AssigneeUpdate(BaseModel):
    display_name: Optional[str] = None
    active: Optional[bool] = None

class AssigneeResponse(AssigneeBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class AssigneeListResponse(BaseModel):
    items: List[AssigneeResponse]
    total: int
    page: int
    page_size: int
    total_pages: int
    has_next: bool
    has_prev: bool

# OpenProject assignee schema
class OpenProjectAssigneeResponse(BaseModel):
    op_user_id: int
    display_name: str
    email: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None

# ============ Audit Log Schemas ============
class AuditLogResponse(BaseModel):
    id: int
    user_id: Optional[int]
    username: Optional[str]
    action: str
    resource_type: Optional[str]
    resource_id: Optional[str]
    meta: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# ============ Dashboard/Stats Schemas ============
class StatsResponse(BaseModel):
    total: int
    by_status: Dict[str, int]
    by_priority: Dict[str, int]
    overdue_count: int
    due_soon_count: int

class DashboardResponse(BaseModel):
    stats: StatsResponse
    overdue: List[WPResponse]
    due_soon: List[WPResponse]
    recent_updates: List[WPResponse]
