"""
Search Routes
"""
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.repositories.wp_cache_repository import WPCacheRepository
from app.repositories.assignee_repository import AssigneeRepository
from app.schemas import WPResponse

router = APIRouter()

@router.get("/", response_model=List[WPResponse])
async def search_work_packages(
    q: str = Query(..., min_length=2),
    limit: int = Query(20, le=100),
    apply_assignee_filter: bool = Query(True, description="Apply assignee allowlist filter"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Global search across work packages
    """
    wp_repo = WPCacheRepository(db)
    
    results = wp_repo.get_all(
        skip=0,
        limit=limit,
        filters={'search': q},
        sort_by="updated_at",
        sort_order="desc"
    )
    
    # Apply assignee allowlist filter if enabled
    if apply_assignee_filter:
        assignee_repo = AssigneeRepository(db)
        allowed_assignees = assignee_repo.get_all(active_only=True)
        allowed_assignee_ids = {assignee.op_user_id for assignee in allowed_assignees if assignee.op_user_id}
        
        # Filter work packages to only include those with allowed assignees or no assignee
        results = [
            wp for wp in results
            if wp.assignee_id is None or wp.assignee_id in allowed_assignee_ids
        ]
    
    return [WPResponse.model_validate(wp) for wp in results]
