"""
Repository for assignee allowlist
"""
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Optional
from ..models.assignee_allowlist import AssigneeAllowlist


class AssigneeRepository:
    """Repository for managing assignee allowlist"""

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, allowlist_id: int) -> Optional[AssigneeAllowlist]:
        """Get allowlist entry by ID"""
        return self.db.get(AssigneeAllowlist, allowlist_id)

    def get_by_name(self, name: str) -> Optional[AssigneeAllowlist]:
        """Get allowlist entry by name"""
        stmt = select(AssigneeAllowlist).where(AssigneeAllowlist.name == name)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_all(self, active_only: bool = False) -> list[AssigneeAllowlist]:
        """Get all assignees"""
        stmt = select(AssigneeAllowlist).order_by(AssigneeAllowlist.display_name)
        if active_only:
            stmt = stmt.where(AssigneeAllowlist.active == True)
        result = self.db.execute(stmt)
        return list(result.scalars().all())
    
    def get_paginated(self, page: int = 1, page_size: int = 20, search: str = None, active_only: bool = False) -> tuple[list[AssigneeAllowlist], int]:
        """Get paginated assignees with optional search"""
        # Build base query
        stmt = select(AssigneeAllowlist)
        
        # Apply filters
        if active_only:
            stmt = stmt.where(AssigneeAllowlist.active == True)
        
        if search:
            search_pattern = f"%{search}%"
            stmt = stmt.where(AssigneeAllowlist.display_name.ilike(search_pattern))
        
        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar() or 0
        
        # Apply pagination and ordering
        stmt = stmt.order_by(AssigneeAllowlist.display_name)
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        
        result = self.db.execute(stmt)
        items = list(result.scalars().all())
        
        return items, total
    
    def get_by_op_user_id(self, op_user_id: int) -> Optional[AssigneeAllowlist]:
        """Get allowlist entry by OpenProject user ID"""
        stmt = select(AssigneeAllowlist).where(AssigneeAllowlist.op_user_id == op_user_id)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_active_names(self) -> list[str]:
        """Get list of active assignee names"""
        stmt = select(AssigneeAllowlist.name).where(
            AssigneeAllowlist.active == True
        ).order_by(AssigneeAllowlist.name)
        result = self.db.execute(stmt)
        return [row[0] for row in result.all()]

    def create(self, assignee: AssigneeAllowlist) -> AssigneeAllowlist:
        """Create new assignee allowlist entry"""
        self.db.add(assignee)
        self.db.commit()
        self.db.refresh(assignee)
        return assignee

    def update(self, allowlist_id: int, update_data: dict) -> Optional[AssigneeAllowlist]:
        """Update assignee allowlist entry"""
        assignee = self.get_by_id(allowlist_id)
        if not assignee:
            return None

        for field, value in update_data.items():
            if hasattr(assignee, field):
                setattr(assignee, field, value)

        self.db.commit()
        self.db.refresh(assignee)
        return assignee

    def delete(self, allowlist_id: int) -> bool:
        """Delete assignee"""
        assignee = self.get_by_id(allowlist_id)
        if not assignee:
            return False

        self.db.delete(assignee)
        self.db.commit()
        return True

    def toggle_active(self, allowlist_id: int) -> Optional[AssigneeAllowlist]:
        """Toggle active status"""
        assignee = self.get_by_id(allowlist_id)
        if not assignee:
            return None

        assignee.active = not assignee.active
        self.db.commit()
        self.db.refresh(assignee)
        return assignee

    def is_allowed(self, name: str) -> bool:
        """Check if assignee name is in active allowlist"""
        stmt = select(AssigneeAllowlist).where(
            AssigneeAllowlist.name == name,
            AssigneeAllowlist.active == True
        )
        result = self.db.execute(stmt).scalar_one_or_none()
        return result is not None

    def bulk_import(self, names: list[str]) -> int:
        """Bulk import assignee names (skip duplicates)"""
        count = 0
        for name in names:
            existing = self.get_by_name(name)
            if not existing:
                self.db.add(AssigneeAllowlist(name=name, active=True))
                count += 1

        self.db.commit()
        return count
