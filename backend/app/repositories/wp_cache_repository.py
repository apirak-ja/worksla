"""
WP Cache Repository
"""
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, desc, asc
from datetime import datetime

from app.models.wp_cache import WPCache

class WPCacheRepository:
    """Repository for WPCache model operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, wp_id: int) -> Optional[WPCache]:
        """Get work package by ID"""
        return self.db.query(WPCache).filter(WPCache.wp_id == wp_id).first()
    
    def get_all(
        self,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
        sort_by: Optional[str] = None,
        sort_order: str = "desc"
    ) -> List[WPCache]:
        """Get all work packages with filters and sorting"""
        query = self.db.query(WPCache)
        
        # Apply filters
        if filters:
            if filters.get('status'):
                query = query.filter(WPCache.status == filters['status'])
            if filters.get('priority'):
                query = query.filter(WPCache.priority == filters['priority'])
            if filters.get('type'):
                query = query.filter(WPCache.type == filters['type'])
            if filters.get('assignee_id'):
                query = query.filter(WPCache.assignee_id == filters['assignee_id'])
            if filters.get('project_id'):
                query = query.filter(WPCache.project_id == filters['project_id'])
            if filters.get('start_date_from'):
                query = query.filter(WPCache.start_date >= filters['start_date_from'])
            if filters.get('start_date_to'):
                query = query.filter(WPCache.start_date <= filters['start_date_to'])
            if filters.get('due_date_from'):
                query = query.filter(WPCache.due_date >= filters['due_date_from'])
            if filters.get('due_date_to'):
                query = query.filter(WPCache.due_date <= filters['due_date_to'])
            if filters.get('search'):
                search_term = f"%{filters['search']}%"
                query = query.filter(
                    or_(
                        WPCache.subject.ilike(search_term),
                        WPCache.assignee_name.ilike(search_term)
                    )
                )
        
        # Apply sorting
        if sort_by:
            column = getattr(WPCache, sort_by, None)
            if column is not None:
                if sort_order == "asc":
                    query = query.order_by(asc(column))
                else:
                    query = query.order_by(desc(column))
        else:
            # Default sort by updated_at desc
            query = query.order_by(desc(WPCache.updated_at))
        
        return query.offset(skip).limit(limit).all()
    
    def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Count work packages with filters"""
        query = self.db.query(WPCache)
        
        # Apply same filters as get_all
        if filters:
            if filters.get('status'):
                query = query.filter(WPCache.status == filters['status'])
            if filters.get('priority'):
                query = query.filter(WPCache.priority == filters['priority'])
            if filters.get('type'):
                query = query.filter(WPCache.type == filters['type'])
            if filters.get('assignee_id'):
                query = query.filter(WPCache.assignee_id == filters['assignee_id'])
            if filters.get('project_id'):
                query = query.filter(WPCache.project_id == filters['project_id'])
            if filters.get('start_date_from'):
                query = query.filter(WPCache.start_date >= filters['start_date_from'])
            if filters.get('start_date_to'):
                query = query.filter(WPCache.start_date <= filters['start_date_to'])
            if filters.get('due_date_from'):
                query = query.filter(WPCache.due_date >= filters['due_date_from'])
            if filters.get('due_date_to'):
                query = query.filter(WPCache.due_date <= filters['due_date_to'])
            if filters.get('search'):
                search_term = f"%{filters['search']}%"
                query = query.filter(
                    or_(
                        WPCache.subject.ilike(search_term),
                        WPCache.assignee_name.ilike(search_term)
                    )
                )
        
        return query.count()
    
    def upsert(self, wp_data: Dict[str, Any]) -> WPCache:
        """Insert or update work package"""
        wp_id = wp_data['wp_id']
        existing = self.get_by_id(wp_id)
        
        if existing:
            # Update
            for key, value in wp_data.items():
                if hasattr(existing, key):
                    setattr(existing, key, value)
            self.db.commit()
            self.db.refresh(existing)
            return existing
        else:
            # Insert
            wp = WPCache(**wp_data)
            self.db.add(wp)
            self.db.commit()
            self.db.refresh(wp)
            return wp
    
    def bulk_upsert(self, wp_data_list: List[Dict[str, Any]]) -> int:
        """Bulk insert or update work packages"""
        count = 0
        for wp_data in wp_data_list:
            self.upsert(wp_data)
            count += 1
        return count
    
    def delete(self, wp_id: int) -> bool:
        """Delete work package"""
        wp = self.get_by_id(wp_id)
        if not wp:
            return False
        
        self.db.delete(wp)
        self.db.commit()
        return True
    
    def get_overdue(self, limit: int = 10) -> List[WPCache]:
        """Get overdue work packages"""
        now = datetime.utcnow()
        return self.db.query(WPCache).filter(
            and_(
                WPCache.due_date < now,
                WPCache.status != 'Closed',
                WPCache.status != 'ดำเนินการเสร็จ'
            )
        ).order_by(asc(WPCache.due_date)).limit(limit).all()
    
    def get_due_soon(self, days: int = 7, limit: int = 10) -> List[WPCache]:
        """Get work packages due soon"""
        from datetime import timedelta
        now = datetime.utcnow()
        future = now + timedelta(days=days)
        
        return self.db.query(WPCache).filter(
            and_(
                WPCache.due_date >= now,
                WPCache.due_date <= future,
                WPCache.status != 'Closed',
                WPCache.status != 'ดำเนินการเสร็จ'
            )
        ).order_by(asc(WPCache.due_date)).limit(limit).all()
    
    def get_stats(self, filters: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Get statistics"""
        query = self.db.query(WPCache)
        
        # Apply filters if provided
        if filters:
            if filters.get('assignee_id'):
                query = query.filter(WPCache.assignee_id == filters['assignee_id'])
            if filters.get('project_id'):
                query = query.filter(WPCache.project_id == filters['project_id'])
        
        total = query.count()
        
        # Count by status
        status_counts = {}
        for status, count in self.db.query(WPCache.status, self.db.func.count(WPCache.wp_id)).group_by(WPCache.status).all():
            status_counts[status or 'Unknown'] = count
        
        # Count by priority
        priority_counts = {}
        for priority, count in self.db.query(WPCache.priority, self.db.func.count(WPCache.wp_id)).group_by(WPCache.priority).all():
            priority_counts[priority or 'Unknown'] = count
        
        return {
            'total': total,
            'by_status': status_counts,
            'by_priority': priority_counts
        }
