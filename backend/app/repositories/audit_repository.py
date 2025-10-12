"""
Repository for audit logs
"""
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import Optional
from datetime import datetime, timedelta
from ..models.audit_log import AuditLog


class AuditRepository:
    """Repository for managing audit logs"""

    def __init__(self, db: Session):
        self.db = db

    def create_log(
        self,
        user_id: int,
        action: str,
        resource: str,
        details: dict = None,
        ip_address: str = None
    ) -> AuditLog:
        """Create audit log entry"""
        log = AuditLog(
            user_id=user_id,
            action=action,
            resource=resource,
            details=details,
            ip_address=ip_address
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)
        return log

    def get_by_id(self, log_id: int) -> Optional[AuditLog]:
        """Get log by ID"""
        return self.db.get(AuditLog, log_id)

    def get_paginated(
        self,
        page: int = 1,
        page_size: int = 50,
        user_id: int = None,
        action: str = None,
        resource: str = None,
        start_date: datetime = None,
        end_date: datetime = None
    ) -> tuple[list[AuditLog], int]:
        """Get paginated audit logs with filters"""
        # Build query
        stmt = select(AuditLog)

        # Apply filters
        if user_id:
            stmt = stmt.where(AuditLog.user_id == user_id)
        if action:
            stmt = stmt.where(AuditLog.action == action)
        if resource:
            stmt = stmt.where(AuditLog.resource.ilike(f"%{resource}%"))
        if start_date:
            stmt = stmt.where(AuditLog.created_at >= start_date)
        if end_date:
            stmt = stmt.where(AuditLog.created_at <= end_date)

        # Get total count
        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(count_stmt).scalar()

        # Apply pagination
        offset = (page - 1) * page_size
        stmt = stmt.order_by(AuditLog.created_at.desc()).offset(offset).limit(page_size)

        # Execute
        result = self.db.execute(stmt)
        logs = list(result.scalars().all())

        return logs, total

    def get_by_user(
        self,
        user_id: int,
        limit: int = 100
    ) -> list[AuditLog]:
        """Get recent logs for specific user"""
        stmt = (
            select(AuditLog)
            .where(AuditLog.user_id == user_id)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        )
        result = self.db.execute(stmt)
        return list(result.scalars().all())

    def get_by_action(
        self,
        action: str,
        limit: int = 100
    ) -> list[AuditLog]:
        """Get recent logs for specific action"""
        stmt = (
            select(AuditLog)
            .where(AuditLog.action == action)
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        )
        result = self.db.execute(stmt)
        return list(result.scalars().all())

    def get_by_resource(
        self,
        resource: str,
        limit: int = 100
    ) -> list[AuditLog]:
        """Get recent logs for specific resource"""
        stmt = (
            select(AuditLog)
            .where(AuditLog.resource.ilike(f"%{resource}%"))
            .order_by(AuditLog.created_at.desc())
            .limit(limit)
        )
        result = self.db.execute(stmt)
        return list(result.scalars().all())

    def get_statistics(
        self,
        start_date: datetime = None,
        end_date: datetime = None
    ) -> dict:
        """Get audit log statistics"""
        stmt = select(AuditLog)

        if start_date:
            stmt = stmt.where(AuditLog.created_at >= start_date)
        if end_date:
            stmt = stmt.where(AuditLog.created_at <= end_date)

        # Total logs
        total_stmt = select(func.count()).select_from(stmt.subquery())
        total = self.db.execute(total_stmt).scalar()

        # By action
        action_stmt = (
            select(AuditLog.action, func.count(AuditLog.id))
            .group_by(AuditLog.action)
        )
        if start_date:
            action_stmt = action_stmt.where(AuditLog.created_at >= start_date)
        if end_date:
            action_stmt = action_stmt.where(AuditLog.created_at <= end_date)

        action_result = self.db.execute(action_stmt)
        by_action = {row[0]: row[1] for row in action_result.all()}

        # By user
        user_stmt = (
            select(AuditLog.user_id, func.count(AuditLog.id))
            .group_by(AuditLog.user_id)
            .order_by(func.count(AuditLog.id).desc())
            .limit(10)
        )
        if start_date:
            user_stmt = user_stmt.where(AuditLog.created_at >= start_date)
        if end_date:
            user_stmt = user_stmt.where(AuditLog.created_at <= end_date)

        user_result = self.db.execute(user_stmt)
        by_user = {row[0]: row[1] for row in user_result.all()}

        return {
            "total_logs": total,
            "by_action": by_action,
            "top_users": by_user
        }

    def delete_old_logs(self, days: int = 90) -> int:
        """Delete logs older than specified days"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)
        stmt = select(AuditLog).where(AuditLog.created_at < cutoff_date)
        result = self.db.execute(stmt)
        logs = list(result.scalars().all())

        count = len(logs)
        for log in logs:
            self.db.delete(log)

        self.db.commit()
        return count
