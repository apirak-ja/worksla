"""
User Repository
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.user import User

class UserRepository:
    """Repository for User model operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_id(self, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_by_username(self, username: str) -> Optional[User]:
        """Get user by username"""
        return self.db.query(User).filter(User.username == username).first()
    
    def get_all(self, skip: int = 0, limit: int = 100, active_only: bool = False) -> List[User]:
        """Get all users with pagination"""
        query = self.db.query(User)
        if active_only:
            query = query.filter(User.is_active == True)
        return query.offset(skip).limit(limit).all()
    
    def create(self, username: str, password: str, role: str = "viewer") -> User:
        """Create new user"""
        from app.core.security import get_password_hash
        password_hash = get_password_hash(password)
        user = User(
            username=username,
            password_hash=password_hash,
            role=role,
            is_active=True
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update(self, user_id: int, **kwargs) -> Optional[User]:
        """Update user"""
        user = self.get_by_id(user_id)
        if not user:
            return None
        
        # Handle password update separately
        if 'password' in kwargs:
            from app.core.security import get_password_hash
            kwargs['password_hash'] = get_password_hash(kwargs.pop('password'))
        
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def delete(self, user_id: int) -> bool:
        """Delete user"""
        user = self.get_by_id(user_id)
        if not user:
            return False
        
        self.db.delete(user)
        self.db.commit()
        return True
    
    def search(self, query: str, skip: int = 0, limit: int = 100) -> List[User]:
        """Search users by username"""
        return self.db.query(User).filter(
            User.username.ilike(f"%{query}%")
        ).offset(skip).limit(limit).all()
    
    def get_paginated(self, page: int = 1, page_size: int = 20, search: Optional[str] = None) -> tuple[List[User], int]:
        """Get paginated users with optional search"""
        query = self.db.query(User)
        
        if search:
            query = query.filter(User.username.ilike(f"%{search}%"))
        
        total = query.count()
        offset = (page - 1) * page_size
        users = query.offset(offset).limit(page_size).all()
        
        return users, total
    
    def reset_password(self, user_id: int, new_password: str) -> Optional[User]:
        """Reset user password"""
        user = self.get_by_id(user_id)
        if not user:
            return None
        
        from app.core.security import get_password_hash
        user.password_hash = get_password_hash(new_password)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def count(self, active_only: bool = False) -> int:
        """Count total users"""
        query = self.db.query(User)
        if active_only:
            query = query.filter(User.is_active == True)
        return query.count()
