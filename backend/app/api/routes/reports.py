"""
Reports Routes
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.wp_cache_repository import WPCacheRepository
from app.repositories.assignee_repository import AssigneeRepository

router = APIRouter()

@router.get("/sla")
async def get_sla_report(
    # Accept both legacy and frontend params: from/to aliases and assignee_ids
    start_date: Optional[datetime] = Query(None, alias="from"),
    end_date: Optional[datetime] = Query(None, alias="to"),
    assignee_id: Optional[int] = None,
    project_id: Optional[int] = None,
    assignee_ids: Optional[str] = None,
    apply_assignee_filter: bool = Query(True, description="Apply assignee allowlist filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate SLA report
    """
    wp_repo = WPCacheRepository(db)
    
    # Default to last 30 days if not specified
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    filters = {
        'start_date_from': start_date,
        'start_date_to': end_date
    }
    
    # Map assignee filters: prefer explicit assignee_id, else first from assignee_ids
    if assignee_id:
        filters['assignee_id'] = assignee_id
    elif assignee_ids:
        try:
            first_id = int(str(assignee_ids).split(',')[0])
            filters['assignee_id'] = first_id
        except Exception:
            pass
    if project_id:
        filters['project_id'] = project_id
    
    # Get work packages in range
    wps = wp_repo.get_all(skip=0, limit=10000, filters=filters)
    
    # Apply assignee allowlist filter if enabled
    if apply_assignee_filter:
        assignee_repo = AssigneeRepository(db)
        allowed_assignees = assignee_repo.get_all(active_only=True)
        allowed_assignee_ids = {assignee.op_user_id for assignee in allowed_assignees if assignee.op_user_id}
        
        # Filter work packages to only include those with allowed assignees or no assignee
        wps = [
            wp for wp in wps
            if wp.assignee_id is None or wp.assignee_id in allowed_assignee_ids
        ]
    
    # Calculate SLA metrics
    total = len(wps)
    on_time = 0
    overdue = 0
    
    for wp in wps:
        if wp.due_date and wp.updated_at:
            if wp.updated_at <= wp.due_date:
                on_time += 1
            else:
                overdue += 1
    
    sla_percentage = (on_time / total * 100) if total > 0 else 0
    
    return {
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "filters": {
            "assignee_id": assignee_id,
            "project_id": project_id
        },
        "metrics": {
            "total": total,
            "on_time": on_time,
            "overdue": overdue,
            "sla_percentage": round(sla_percentage, 2)
        }
    }

@router.get("/productivity")
async def get_productivity_report(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    group_by: str = Query("assignee", regex="^(assignee|project)$"),
    apply_assignee_filter: bool = Query(True, description="Apply assignee allowlist filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate productivity report grouped by assignee or project
    """
    wp_repo = WPCacheRepository(db)
    
    # Default to last 30 days
    if not end_date:
        end_date = datetime.utcnow()
    if not start_date:
        start_date = end_date - timedelta(days=30)
    
    filters = {
        'start_date_from': start_date,
        'start_date_to': end_date
    }
    
    wps = wp_repo.get_all(skip=0, limit=10000, filters=filters)
    
    # Apply assignee allowlist filter if enabled
    if apply_assignee_filter:
        assignee_repo = AssigneeRepository(db)
        allowed_assignees = assignee_repo.get_all(active_only=True)
        allowed_assignee_ids = {assignee.op_user_id for assignee in allowed_assignees if assignee.op_user_id}
        
        # Filter work packages to only include those with allowed assignees or no assignee
        wps = [
            wp for wp in wps
            if wp.assignee_id is None or wp.assignee_id in allowed_assignee_ids
        ]
    
    # Group by specified field
    grouped = {}
    
    for wp in wps:
        if group_by == "assignee":
            key = wp.assignee_name or "Unassigned"
        else:  # project
            key = wp.project_name or "Unknown"
        
        if key not in grouped:
            grouped[key] = {
                "name": key,
                "total": 0,
                "completed": 0,
                "in_progress": 0,
                "overdue": 0
            }
        
        grouped[key]["total"] += 1
        
        if wp.status in ["Closed", "ดำเนินการเสร็จ"]:
            grouped[key]["completed"] += 1
        else:
            grouped[key]["in_progress"] += 1
        
        if wp.due_date and wp.due_date < datetime.utcnow() and wp.status not in ["Closed", "ดำเนินการเสร็จ"]:
            grouped[key]["overdue"] += 1
    
    return {
        "period": {
            "start": start_date.isoformat(),
            "end": end_date.isoformat()
        },
        "group_by": group_by,
        "data": list(grouped.values())
    }
