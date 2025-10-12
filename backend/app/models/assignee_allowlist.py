"""
Assignee Allowlist Model
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class AssigneeAllowlist(Base):
    __tablename__ = "assignee_allowlist"
    
    id = Column(Integer, primary_key=True, index=True)
    op_user_id = Column(Integer, unique=True, index=True, nullable=False)
    display_name = Column(String(200), nullable=False)
    active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<AssigneeAllowlist(op_user_id={self.op_user_id}, display_name='{self.display_name}')>"
