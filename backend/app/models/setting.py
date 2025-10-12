"""
Setting Model for system configuration
"""
from sqlalchemy import Column, Integer, String, JSON, DateTime
from sqlalchemy.sql import func
from app.core.database import Base

class Setting(Base):
    __tablename__ = "settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(100), unique=True, index=True, nullable=False)
    value = Column(JSON, nullable=False)
    description = Column(String(500))
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<Setting(key='{self.key}')>"
