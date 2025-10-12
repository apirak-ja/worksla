"""
Repository for system settings
"""
from sqlalchemy.orm import Session
from sqlalchemy import select
from typing import Optional
from ..models.setting import Setting


class SettingsRepository:
    """Repository for managing system settings"""

    def __init__(self, db: Session):
        self.db = db

    def get_by_key(self, key: str) -> Optional[Setting]:
        """Get setting by key"""
        stmt = select(Setting).where(Setting.key == key)
        return self.db.execute(stmt).scalar_one_or_none()

    def get_all(self) -> list[Setting]:
        """Get all settings"""
        stmt = select(Setting).order_by(Setting.key)
        result = self.db.execute(stmt)
        return list(result.scalars().all())

    def create(self, key: str, value: str, description: str = None) -> Setting:
        """Create new setting"""
        setting = Setting(
            key=key,
            value=value,
            description=description
        )
        self.db.add(setting)
        self.db.commit()
        self.db.refresh(setting)
        return setting

    def update(self, key: str, value: str) -> Optional[Setting]:
        """Update setting value"""
        setting = self.get_by_key(key)
        if not setting:
            return None

        setting.value = value
        self.db.commit()
        self.db.refresh(setting)
        return setting

    def upsert(self, key: str, value: str, description: str = None) -> Setting:
        """Create or update setting"""
        setting = self.get_by_key(key)
        if setting:
            setting.value = value
            if description:
                setting.description = description
        else:
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
        """Delete setting"""
        setting = self.get_by_key(key)
        if not setting:
            return False

        self.db.delete(setting)
        self.db.commit()
        return True

    def get_value(self, key: str, default: str = None) -> Optional[str]:
        """Get setting value or default"""
        setting = self.get_by_key(key)
        return setting.value if setting else default
