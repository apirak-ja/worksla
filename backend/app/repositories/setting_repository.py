"""
Repository for settings management
"""
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional, Dict, Any
from ..models.setting import Setting


class SettingRepository:
    """Repository for managing settings"""

    def __init__(self, db: Session):
        self.db = db

    def get_by_key(self, key: str) -> Optional[Setting]:
        """Get setting by key"""
        stmt = select(Setting).where(Setting.key == key)
        return self.db.execute(stmt).scalar_one_or_none()
    
    def get_value(self, key: str, default: Any = None) -> Any:
        """Get setting value by key with default"""
        setting = self.get_by_key(key)
        if setting:
            # Extract actual value from nested structure
            value = setting.value
            if isinstance(value, dict) and 'data' in value:
                return value['data']
            return value
        return default

    def get_all(self) -> list[Setting]:
        """Get all settings"""
        stmt = select(Setting).order_by(Setting.key)
        result = self.db.execute(stmt)
        return list(result.scalars().all())

    def create_or_update(self, key: str, value: Any, description: str = None) -> Setting:
        """Create or update setting"""
        setting = self.get_by_key(key)
        
        if setting:
            # Update existing
            setting.value = value
            if description is not None:
                setting.description = description
        else:
            # Create new
            setting = Setting(
                key=key,
                value=value,
                description=description
            )
            self.db.add(setting)
        
        self.db.commit()
        self.db.refresh(setting)
        return setting

    def delete(self, key: str) -> bool:
        """Delete setting by key"""
        setting = self.get_by_key(key)
        if not setting:
            return False

        self.db.delete(setting)
        self.db.commit()
        return True

    def get_settings_by_prefix(self, prefix: str) -> Dict[str, Any]:
        """Get all settings with a specific prefix"""
        stmt = select(Setting).where(Setting.key.like(f"{prefix}.%"))
        result = self.db.execute(stmt)
        settings = result.scalars().all()
        
        return {setting.key: setting.value for setting in settings}

    def bulk_update(self, settings: Dict[str, Dict[str, Any]]) -> Dict[str, Setting]:
        """Bulk update multiple settings"""
        result = {}
        
        for key, data in settings.items():
            value = data.get('value', {})
            description = data.get('description')
            result[key] = self.create_or_update(key, value, description)
        
        return result