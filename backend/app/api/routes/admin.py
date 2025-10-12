"""
Admin Routes
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.security import require_role
from app.models.user import User
from app.models.assignee_allowlist import AssigneeAllowlist
from app.models.setting import Setting
from app.repositories.user_repository import UserRepository
from app.repositories.assignee_repository import AssigneeRepository
from app.repositories.setting_repository import SettingRepository
from app.services.openproject_client import OpenProjectClient
from app.schemas import (
    UserResponse,
    UserCreate,
    UserUpdate,
    UserListResponse,
    AssigneeResponse,
    AssigneeCreate,
    AssigneeUpdate,
    AssigneeListResponse,
    OpenProjectAssigneeResponse,
    SettingResponse,
    SettingUpdate,
)
from app.services.wp_sync import sync_once

router = APIRouter()

# ============ User Management ============
@router.get("/users", response_model=UserListResponse, dependencies=[Depends(require_role(["admin"]))])
async def list_users(
    page: int = 1,
    page_size: int = 20,
    search: str = None,
    db: Session = Depends(get_db)
):
    """Get paginated users with search (admin only)"""
    user_repo = UserRepository(db)
    users, total = user_repo.get_paginated(page=page, page_size=page_size, search=search)
    
    import math
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    
    return UserListResponse(
        items=[UserResponse.model_validate(user) for user in users],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
        has_next=page < total_pages,
        has_prev=page > 1
    )

@router.post("/users", response_model=UserResponse, dependencies=[Depends(require_role(["admin"]))])
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """Create new user (admin only)"""
    user_repo = UserRepository(db)
    
    # Check if username exists
    existing = user_repo.get_by_username(user_data.username)
    if existing:
        raise HTTPException(status_code=400, detail="ชื่อผู้ใช้นี้มีอยู่แล้ว")
    
    # Validate password policy (min 8 chars, must have letter and number)
    if len(user_data.password) < 8:
        raise HTTPException(status_code=400, detail="รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
    
    if not any(c.isalpha() for c in user_data.password) or not any(c.isdigit() for c in user_data.password):
        raise HTTPException(status_code=400, detail="รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข")
    
    # Validate role
    if user_data.role not in ["admin", "analyst", "viewer"]:
        raise HTTPException(status_code=400, detail="บทบาทไม่ถูกต้อง")
    
    user = user_repo.create(
        username=user_data.username,
        password=user_data.password,
        role=user_data.role
    )
    
    return UserResponse.model_validate(user)

@router.put("/users/{user_id}", response_model=UserResponse, dependencies=[Depends(require_role(["admin"]))])
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db)
):
    """Update user (admin only)"""
    user_repo = UserRepository(db)
    
    update_dict = user_data.model_dump(exclude_unset=True)
    user = user_repo.update(user_id, **update_dict)
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse.model_validate(user)

@router.delete("/users/{user_id}", dependencies=[Depends(require_role(["admin"]))])
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Delete user (admin only)"""
    user_repo = UserRepository(db)
    success = user_repo.delete(user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    return {"message": "User deleted successfully"}

# ============ Assignee Allowlist Management ============
@router.get("/assignees", response_model=List[AssigneeResponse], dependencies=[Depends(require_role(["admin", "analyst"]))])
async def list_assignees(
    active_only: bool = False,
    db: Session = Depends(get_db)
):
    """Get all assignees in allowlist"""
    query = db.query(AssigneeAllowlist)
    if active_only:
        query = query.filter(AssigneeAllowlist.active == True)
    
    assignees = query.all()
    return [AssigneeResponse.model_validate(a) for a in assignees]

@router.post("/assignees", response_model=AssigneeResponse, dependencies=[Depends(require_role(["admin"]))])
async def create_assignee(
    assignee_data: AssigneeCreate,
    db: Session = Depends(get_db)
):
    """Add assignee to allowlist (admin only)"""
    # Check if already exists
    existing = db.query(AssigneeAllowlist).filter(
        AssigneeAllowlist.op_user_id == assignee_data.op_user_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Assignee already in allowlist")
    
    assignee = AssigneeAllowlist(**assignee_data.model_dump())
    db.add(assignee)
    db.commit()
    db.refresh(assignee)
    
    return AssigneeResponse.model_validate(assignee)

@router.put("/assignees/{assignee_id}", response_model=AssigneeResponse, dependencies=[Depends(require_role(["admin"]))])
async def update_assignee(
    assignee_id: int,
    assignee_data: AssigneeUpdate,
    db: Session = Depends(get_db)
):
    """Update assignee in allowlist (admin only)"""
    assignee = db.query(AssigneeAllowlist).filter(AssigneeAllowlist.id == assignee_id).first()
    
    if not assignee:
        raise HTTPException(status_code=404, detail="Assignee not found")
    
    update_dict = assignee_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(assignee, key, value)
    
    db.commit()
    db.refresh(assignee)
    
    return AssigneeResponse.model_validate(assignee)

@router.delete("/assignees/{assignee_id}", dependencies=[Depends(require_role(["admin"]))])
async def delete_assignee(
    assignee_id: int,
    db: Session = Depends(get_db)
):
    """Remove assignee from allowlist (admin only)"""
    assignee = db.query(AssigneeAllowlist).filter(AssigneeAllowlist.id == assignee_id).first()
    
    if not assignee:
        raise HTTPException(status_code=404, detail="Assignee not found")
    
    db.delete(assignee)
    db.commit()
    
    return {"message": "Assignee removed from allowlist"}

# ============ Settings Management ============
@router.get("/settings", response_model=List[SettingResponse], dependencies=[Depends(require_role(["admin"]))])
async def list_settings(db: Session = Depends(get_db)):
    """Get all settings (admin only)"""
    settings = db.query(Setting).all()
    return [SettingResponse.model_validate(s) for s in settings]

@router.get("/settings/{key}", response_model=SettingResponse, dependencies=[Depends(require_role(["admin"]))])
async def get_setting(key: str, db: Session = Depends(get_db)):
    """Get specific setting (admin only)"""
    setting = db.query(Setting).filter(Setting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    return SettingResponse.model_validate(setting)

@router.put("/settings/{key}", response_model=SettingResponse, dependencies=[Depends(require_role(["admin"]))])
async def update_setting(
    key: str,
    setting_data: SettingUpdate,
    db: Session = Depends(get_db)
):
    """Update setting (admin only)"""
    setting = db.query(Setting).filter(Setting.key == key).first()
    
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    update_dict = setting_data.model_dump(exclude_unset=True)
    for k, v in update_dict.items():
        setattr(setting, k, v)
    
    db.commit()
    db.refresh(setting)
    
    return SettingResponse.model_validate(setting)

@router.delete("/settings/{key}", dependencies=[Depends(require_role(["admin"]))])
async def delete_setting(key: str, db: Session = Depends(get_db)):
    """Delete setting (admin only)"""
    setting = db.query(Setting).filter(Setting.key == key).first()
    
    if not setting:
        raise HTTPException(status_code=404, detail="Setting not found")
    
    db.delete(setting)
    db.commit()
    
    return {"message": "Setting deleted successfully"}

# ============ Additional Admin Endpoints ============
@router.post("/users/{user_id}/reset_password", dependencies=[Depends(require_role(["admin"]))])
async def reset_user_password(
    user_id: int,
    request: dict = None,
    db: Session = Depends(get_db)
):
    """Reset user password (admin only)"""
    import secrets
    import string
    
    user_repo = UserRepository(db)
    user = user_repo.get_by_id(user_id)
    
    if not user:
        raise HTTPException(status_code=404, detail="ไม่พบผู้ใช้")
    
    # Get new password from request or generate random
    new_password = None
    if request and 'new_password' in request:
        new_password = request['new_password']
        # Validate password policy
        if len(new_password) < 8:
            raise HTTPException(status_code=400, detail="รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร")
        if not any(c.isalpha() for c in new_password) or not any(c.isdigit() for c in new_password):
            raise HTTPException(status_code=400, detail="รหัสผ่านต้องมีทั้งตัวอักษรและตัวเลข")
    else:
        # Generate random password
        alphabet = string.ascii_letters + string.digits + "!@#$%"
        new_password = ''.join(secrets.choice(alphabet) for _ in range(12))
    
    # Reset password
    updated_user = user_repo.reset_password(user_id, new_password)
    
    return {
        "message": "รีเซ็ตรหัสผ่านสำเร็จ",
        "new_password": new_password if not request else None,
        "user": UserResponse.model_validate(updated_user)
    }
    db.commit()
    
    return {
        "message": "Password reset successfully",
        "username": user.username,
        "new_password": new_password
    }

@router.post("/assignees/sync", dependencies=[Depends(require_role(["admin"]))])
async def sync_assignees_from_openproject(db: Session = Depends(get_db)):
    """Sync assignees list from OpenProject (admin only)"""
    from app.services.openproject_client import openproject_client
    
    try:
        # Get assignees from OpenProject
        assignees = openproject_client.list_assignees()
        
        if not assignees:
            raise HTTPException(status_code=503, detail="Failed to fetch assignees from OpenProject")
        
        # Update database
        synced_count = 0
        for assignee in assignees:
            # Check if exists
            existing = db.query(AssigneeAllowlist).filter(
                AssigneeAllowlist.op_user_id == assignee["id"]
            ).first()
            
            if existing:
                # Update name if changed
                if existing.display_name != assignee["name"]:
                    existing.display_name = assignee["name"]
                    synced_count += 1
            else:
                # Create new entry (inactive by default)
                new_assignee = AssigneeAllowlist(
                    op_user_id=assignee["id"],
                    display_name=assignee["name"],
                    active=False
                )
                db.add(new_assignee)
                synced_count += 1
        
        db.commit()
        
        return {
            "message": "Assignees synced successfully",
            "total_assignees": len(assignees),
            "synced_count": synced_count
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")

@router.post("/assignees/allowlist", dependencies=[Depends(require_role(["admin"]))])
async def update_assignee_allowlist(
    assignee_ids: List[int],
    db: Session = Depends(get_db)
):
    """Bulk update assignee allowlist - set active for specified IDs (admin only)"""
    try:
        # Deactivate all
        db.query(AssigneeAllowlist).update({"active": False})
        
        # Activate specified IDs
        if assignee_ids:
            db.query(AssigneeAllowlist).filter(
                AssigneeAllowlist.op_user_id.in_(assignee_ids)
            ).update({"active": True}, synchronize_session=False)
        
        db.commit()
        
        return {
            "message": "Allowlist updated successfully",
            "active_count": len(assignee_ids)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Update failed: {str(e)}")

@router.get("/assignees/allowlist", dependencies=[Depends(require_role(["admin", "analyst"]))])
async def get_assignee_allowlist(db: Session = Depends(get_db)):
    """Get list of active assignee IDs in allowlist"""
    active_assignees = db.query(AssigneeAllowlist).filter(
        AssigneeAllowlist.active == True
    ).all()
    
    return {
        "assignee_ids": [a.op_user_id for a in active_assignees],
        "count": len(active_assignees)
    }


# ============ Assignee Allowlist Management ============

@router.get("/assignees", response_model=AssigneeListResponse)
async def get_assignees(
    page: int = 1,
    page_size: int = 20,
    search: str = None,
    active_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Get paginated assignee allowlist"""
    try:
        assignee_repo = AssigneeRepository(db)
        assignees, total = assignee_repo.get_paginated(
            page=page,
            page_size=page_size, 
            search=search,
            active_only=active_only
        )
        
        total_pages = (total + page_size - 1) // page_size
        
        return AssigneeListResponse(
            items=[AssigneeResponse.model_validate(assignee) for assignee in assignees],
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาดในการดึงข้อมูลผู้รับผิดชอบ: {str(e)}")


@router.get("/assignees/openproject", response_model=List[OpenProjectAssigneeResponse])
async def get_openproject_assignees(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Get assignees from OpenProject"""
    try:
        client = OpenProjectClient()
        assignees = client.list_assignees()
        # Map client fields (id, name, ...) to schema (op_user_id, display_name, ...)
        mapped = [
            OpenProjectAssigneeResponse(
                op_user_id=a.get("id"),
                display_name=a.get("name"),
                email=a.get("email"),
                firstName=a.get("firstname") or a.get("firstName"),
                lastName=a.get("lastname") or a.get("lastName"),
            )
            for a in assignees
        ]
        return mapped
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาดในการดึงข้อมูลจาก OpenProject: {str(e)}")


@router.post("/assignees", response_model=AssigneeResponse)
async def add_assignee_to_allowlist(
    assignee_data: AssigneeCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Add assignee to allowlist"""
    try:
        assignee_repo = AssigneeRepository(db)
        
        # Check if already exists
        existing = assignee_repo.get_by_op_user_id(assignee_data.op_user_id)
        if existing:
            raise HTTPException(status_code=400, detail="ผู้รับผิดชอบนี้มีอยู่ในรายการแล้ว")
        
        # Create new assignee
        assignee = AssigneeAllowlist(
            op_user_id=assignee_data.op_user_id,
            display_name=assignee_data.display_name,
            active=True
        )
        
        new_assignee = assignee_repo.create(assignee)
        return AssigneeResponse.model_validate(new_assignee)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาดในการเพิ่มผู้รับผิดชอบ: {str(e)}")


@router.put("/assignees/{assignee_id}", response_model=AssigneeResponse)
async def update_assignee(
    assignee_id: int,
    assignee_data: AssigneeUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Update assignee in allowlist"""
    try:
        assignee_repo = AssigneeRepository(db)
        assignee = assignee_repo.get_by_id(assignee_id)
        
        if not assignee:
            raise HTTPException(status_code=404, detail="ไม่พบผู้รับผิดชอบนี้")
        
        updated_assignee = assignee_repo.update(assignee_id, assignee_data.model_dump(exclude_unset=True))
        return AssigneeResponse.model_validate(updated_assignee)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาดในการอัปเดตผู้รับผิดชอบ: {str(e)}")


@router.delete("/assignees/{assignee_id}")
async def remove_assignee_from_allowlist(
    assignee_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Remove assignee from allowlist"""
    try:
        assignee_repo = AssigneeRepository(db)
        assignee = assignee_repo.get_by_id(assignee_id)
        
        if not assignee:
            raise HTTPException(status_code=404, detail="ไม่พบผู้รับผิดชอบนี้")
        
        assignee_repo.delete(assignee_id)
        return {"message": "ลบผู้รับผิดชอบสำเร็จ"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาดในการลบผู้รับผิดชอบ: {str(e)}")


# ============ Settings Management ============

@router.get("/settings", response_model=Dict[str, SettingResponse])
async def get_all_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Get all settings grouped by tab"""
    try:
        setting_repo = SettingRepository(db)
        settings = setting_repo.get_all()
        
        # Group settings by tab (prefix)
        grouped = {}
        for setting in settings:
            tab = setting.key.split('.')[0] if '.' in setting.key else 'general'
            if tab not in grouped:
                grouped[tab] = {}
            grouped[tab][setting.key] = SettingResponse.model_validate(setting)
        
        return grouped
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาดในการดึงการตั้งค่า: {str(e)}")


@router.get("/settings/{tab}")
async def get_settings_by_tab(
    tab: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Get settings for specific tab"""
    try:
        setting_repo = SettingRepository(db)
        
        # Get settings by tab prefix
        settings = setting_repo.get_settings_by_prefix(tab)
        
        # Return default values if no settings exist
        defaults = {
            'openproject': {
                'base_url': '',
                'api_key': '',
                'timeout': 30,
                'verify_ssl': True
            },
            'general': {
                'site_name': 'WorkSLA',
                'site_description': '',
                'default_timezone': 'Asia/Bangkok', 
                'date_format': 'dd/mm/yyyy',
                'items_per_page': 20
            },
            'sla': {
                'default_response_hours': 24,
                'default_resolution_hours': 72,
                'business_hours_start': '09:00',
                'business_hours_end': '18:00',
                'business_days': ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
                'escalation_enabled': True,
                'escalation_hours': 48
            },
            'security': {
                'session_timeout_minutes': 480,
                'max_login_attempts': 3,
                'lockout_duration_minutes': 15,
                'password_min_length': 8,
                'password_require_uppercase': True,
                'password_require_lowercase': True,
                'password_require_numbers': True,
                'password_require_symbols': False
            },
            'ui': {
                'theme': 'light',
                'primary_color': '#1976d2',
                'secondary_color': '#dc004e',
                'language': 'th',
                'show_tutorial': True,
                'compact_view': False
            }
        }
        
        # Merge with defaults
        result = defaults.get(tab, {})
        for key, value in settings.items():
            result[key.replace(f'{tab}.', '')] = value
            
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาดในการดึงการตั้งค่า: {str(e)}")


@router.put("/settings/{tab}")
async def update_settings_tab(
    tab: str,
    settings_data: Dict[str, Any],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Update settings for specific tab"""
    try:
        setting_repo = SettingRepository(db)
        
        # Validate tab
        valid_tabs = ['openproject', 'general', 'sla', 'security', 'ui']
        if tab not in valid_tabs:
            raise HTTPException(status_code=400, detail=f"แท็บ '{tab}' ไม่ถูกต้อง")
        
        # Update each setting with tab prefix
        updated_settings = {}
        for key, value in settings_data.items():
            full_key = f"{tab}.{key}"
            setting = setting_repo.create_or_update(
                key=full_key,
                value={'data': value},  # Wrap in object for JSON storage
                description=f"การตั้งค่า {tab}"
            )
            updated_settings[key] = value
        
        return {
            "message": f"อัปเดตการตั้งค่า {tab} สำเร็จ",
            "updated_settings": updated_settings
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาดในการอัปเดตการตั้งค่า: {str(e)}")


@router.put("/settings/{tab}/{key}")
async def update_single_setting(
    tab: str,
    key: str,
    setting_data: SettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Update single setting"""
    try:
        setting_repo = SettingRepository(db)
        
        full_key = f"{tab}.{key}"
        setting = setting_repo.create_or_update(
            key=full_key,
            value=setting_data.value,
            description=setting_data.description
        )
        
        return {
            "message": f"อัปเดตการตั้งค่า {key} สำเร็จ",
            "setting": SettingResponse.model_validate(setting)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาดในการอัปเดตการตั้งค่า: {str(e)}")


@router.delete("/settings/{tab}/{key}")
async def delete_setting(
    tab: str,
    key: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    """Delete specific setting"""
    try:
        setting_repo = SettingRepository(db)

        full_key = f"{tab}.{key}"
        deleted = setting_repo.delete(full_key)

        if not deleted:
            raise HTTPException(status_code=404, detail="ไม่พบการตั้งค่านี้")

        return {"message": f"ลบการตั้งค่า {key} สำเร็จ"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"เกิดข้อผิดพลาดในการลบการตั้งค่า: {str(e)}")


# ============ OpenProject Integration Test ============

@router.post("/settings/test_openproject", dependencies=[Depends(require_role(["admin"]))])
async def test_openproject_connection():
    """Test OpenProject API connection (admin only)"""
    from app.services.openproject_client import openproject_client
    
    try:
        # Try to fetch API root
        result = openproject_client._make_sync_request("/api/v3")
        
        if result:
            instance_name = result.get("instanceName", "Unknown")
            core_version = result.get("coreVersion", "Unknown")
            
            return {
                "success": True,
                "message": f"Connected to {instance_name}",
                "details": {
                    "instance_name": instance_name,
                    "version": core_version
                }
            }
        else:
            return {
                "success": False,
                "message": "Failed to connect to OpenProject",
                "details": None
            }
    except Exception as e:
        return {
            "success": False,
            "message": f"Connection error: {str(e)}",
            "details": None
        }

# ============ WP Cache Sync ============

@router.post("/wp_cache/sync", dependencies=[Depends(require_role(["admin"]))])
async def trigger_wp_cache_sync():
    """Manually trigger a sync of work packages into wp_cache"""
    try:
        processed, total = sync_once()
        return {
            "message": "WP cache sync completed",
            "processed": processed,
            "source_total": total
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Sync failed: {str(e)}")
