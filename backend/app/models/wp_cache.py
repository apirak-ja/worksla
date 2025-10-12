"""
Work Package Cache Model
"""
from sqlalchemy import Column, Integer, String, DateTime, JSON, Index
from sqlalchemy.sql import func
from app.core.database import Base

class WPCache(Base):
    __tablename__ = "wp_cache"
    
    wp_id = Column(Integer, primary_key=True)
    subject = Column(String(500), nullable=False)
    status = Column(String(100))
    priority = Column(String(100))
    type = Column(String(100))
    assignee_id = Column(Integer, index=True)
    assignee_name = Column(String(200))
    project_id = Column(Integer, index=True)
    project_name = Column(String(200))
    start_date = Column(DateTime(timezone=True))
    due_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True))
    updated_at = Column(DateTime(timezone=True), index=True)
    cached_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    raw = Column(JSON)
    
    # Create composite indexes for common queries
    __table_args__ = (
        Index('idx_wp_cache_status_priority', 'status', 'priority'),
        Index('idx_wp_cache_assignee_status', 'assignee_id', 'status'),
        Index('idx_wp_cache_project_status', 'project_id', 'status'),
        Index('idx_wp_cache_due_date', 'due_date'),
    )
    
    def __repr__(self):
        return f"<WPCache(wp_id={self.wp_id}, subject='{self.subject[:50]}')>"
