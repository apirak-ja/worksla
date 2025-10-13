"""
Work Package Routes
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
import math

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.assignee_repository import AssigneeRepository
from app.repositories.wp_cache_repository import WPCacheRepository
from app.services.openproject_client import openproject_client
from app.schemas import (
    WPResponse,
    WPDetailResponse,
    WPListResponse,
    WPFilterRequest,
    DashboardResponse,
    StatsResponse
)

router = APIRouter()

@router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get dashboard data with stats and highlights
    """
    try:
        # Get SLA metrics from OpenProject
        metrics = openproject_client.get_sla_metrics()
        
        # Get recent work packages
        recent_wp, _ = openproject_client.list_work_packages(
            offset=0,
            limit=10,
            sort_by="desc"
        )
        
        # Calculate overdue and due soon from recent data
        overdue = [wp for wp in recent_wp if wp.get('due_date') and wp.get('done_ratio', 0) < 100]
        due_soon = [wp for wp in recent_wp if wp.get('due_date')]  # Simplified for now
        
        stats = StatsResponse(
            total=metrics['total_work_packages'],
            by_status={'completed': metrics['completed'], 'in_progress': metrics['total_work_packages'] - metrics['completed']},
            by_priority={'high': 0, 'normal': 0, 'low': 0},  # TODO: implement priority stats
            overdue_count=metrics['overdue'],
            due_soon_count=metrics['due_soon']
        )
        
        return DashboardResponse(
            stats=stats,
            overdue=overdue[:5],  # Limit to 5 items
            due_soon=due_soon[:5],
            recent_updates=recent_wp[:10]
        )
        
    except Exception as e:
        # Fallback to empty dashboard if OpenProject is unavailable
        return DashboardResponse(
            stats=StatsResponse(
                total=0,
                by_status={},
                by_priority={},
                overdue_count=0,
                due_soon_count=0
            ),
            overdue=[],
            due_soon=[],
            recent_updates=[]
        )

@router.get("/", response_model=WPListResponse)
async def list_work_packages(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=200),
    status: Optional[str] = None,
    priority: Optional[str] = None,
    type: Optional[str] = None,
    assignee_id: Optional[int] = None,
    project_id: Optional[int] = None,
    search: Optional[str] = None,
    sort_by: str = "updated_at",
    sort_order: str = "desc",
    apply_assignee_filter: bool = Query(True, description="Apply assignee allowlist filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get paginated list of work packages with filters
    """
    try:
        # Get assignee allowlist first if filter is enabled
        allowed_assignee_ids = None
        if apply_assignee_filter:
            assignee_repo = AssigneeRepository(db)
            allowed_assignees = assignee_repo.get_all(active_only=True)
            allowed_assignee_ids = {assignee.op_user_id for assignee in allowed_assignees if assignee.op_user_id}
        
        # Prepare filters for OpenProject API
        filters = {}
        if status:
            filters['status'] = status
        if assignee_id:
            filters['assignee'] = str(assignee_id)
        elif apply_assignee_filter and allowed_assignee_ids:
            # Add assignee filter to OpenProject query
            # OpenProject supports multiple values with comma-separated IDs
            filters['assignee'] = ','.join(str(aid) for aid in allowed_assignee_ids)
        if project_id:
            filters['project'] = str(project_id)
        if type:
            filters['type'] = type
        
        # Calculate offset
        offset = (page - 1) * page_size
        
        # Get work packages from OpenProject
        work_packages, total_count = openproject_client.list_work_packages(
            offset=offset,
            limit=page_size,
            filters=filters,
            sort_by=sort_order
        )
        
        # Add cached_at timestamp to each work package
        from datetime import datetime
        cached_at = datetime.now().isoformat()
        for wp in work_packages:
            wp['cached_at'] = cached_at
        
        # Apply text search if provided
        if search:
            work_packages = [
                wp for wp in work_packages 
                if search.lower() in wp.get('subject', '').lower()
                or search.lower() in wp.get('description', '').lower()
            ]
            total_count = len(work_packages)
        
        # Calculate pagination
        total_pages = math.ceil(total_count / page_size) if total_count > 0 else 1
        
        return WPListResponse(
            items=work_packages,
            total=total_count,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch work packages: {str(e)}")

@router.get("/{wp_id}", response_model=WPDetailResponse)
async def get_work_package(
    wp_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get detailed work package information
    """
    try:
        work_package = openproject_client.get_work_package(wp_id)
        
        if not work_package:
            raise HTTPException(status_code=404, detail="Work package not found")
        
        return WPDetailResponse(
            **work_package,
            openproject_url=f"{openproject_client.base_url}/work_packages/{wp_id}"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch work package: {str(e)}")

@router.get("/{wp_id}/activities")
async def get_work_package_activities(
    wp_id: int,
    offset: int = Query(0, ge=0),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get work package activities/journal entries with pagination
    """
    try:
        # Get all activities (OpenProject API doesn't support pagination on activities endpoint)
        all_activities = openproject_client.get_work_package_activities(wp_id)
        
        if not all_activities:
            return {
                "wp_id": wp_id,
                "activities": [],
                "total": 0,
                "offset": offset,
                "page_size": page_size,
                "has_more": False
            }
        
        # Manual pagination
        total = len(all_activities)
        end_index = offset + page_size
        paginated_activities = all_activities[offset:end_index]
        
        return {
            "wp_id": wp_id,
            "activities": paginated_activities,
            "total": total,
            "offset": offset,
            "page_size": page_size,
            "has_more": end_index < total
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch activities: {str(e)}")

@router.post("/refresh")
async def refresh_work_packages(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Manually trigger work package refresh from OpenProject
    """
    try:
        # Get work packages from OpenProject
        work_packages, total = openproject_client.list_work_packages(
            offset=0,
            limit=100
        )
        
        return {
            "message": f"Refreshed {len(work_packages)} work packages",
            "total": total
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to refresh: {str(e)}")
