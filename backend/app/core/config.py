"""
Configuration Settings
"""
from pydantic_settings import BaseSettings
from typing import List, Optional
from urllib.parse import quote_plus
import os
from pathlib import Path

class Settings(BaseSettings):
    """Application settings"""
    
    # Project Info
    PROJECT_NAME: str = "Open Project SLA Reporting System"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "SLA Reporting System developed by Digital Medical Infrastructure Team, Medical Center, Walailak University"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # API
    API_PREFIX: str = "/api"
    
    # OpenProject Integration
    OPENPROJECT_URL: str = os.getenv("OPENPROJECT_URL", "")
    OPENPROJECT_API_KEY: str = os.getenv("OPENPROJECT_API_KEY", "")
    WORK_PACKAGE_ID: str = os.getenv("WORK_PACKAGE_ID", "")
    
    @property
    def OPENPROJECT_BASE_URL(self) -> str:
        """Construct OpenProject base URL"""
        if self.OPENPROJECT_URL:
            return self.OPENPROJECT_URL.rstrip('/')
        return "https://hosp.wu.ac.th/cmms"
    
    # Database
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "apirak.ja")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "10.251.150.222")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5210"))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "worksla")
    
    @property
    def DATABASE_URL(self) -> str:
        """Construct database URL with properly encoded password"""
        encoded_password = quote_plus(self.POSTGRES_PASSWORD)
        return f"postgresql://{self.POSTGRES_USER}:{encoded_password}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-minimum-32-characters-long")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "https://10.251.150.222:3346",
        "https://10.251.150.222",
        "http://localhost:5173",
        "http://localhost:3000"
    ]
    
    # Trusted Hosts
    ALLOWED_HOSTS: List[str] = ["10.251.150.222", "localhost"]
    
    # OpenProject API
    OPENPROJECT_API_KEY: str = os.getenv("OPENPROJECT_API_KEY", "")
    OPENPROJECT_VERIFY_SSL: bool = os.getenv("OPENPROJECT_VERIFY_SSL", "false").lower() == "true"
    
    # Cache Settings
    WP_CACHE_TTL_SECONDS: int = int(os.getenv("WP_CACHE_TTL_SECONDS", "120"))
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 50
    MAX_PAGE_SIZE: int = 200
    
    # Redis (Optional)
    REDIS_HOST: str = os.getenv("REDIS_HOST", "worksla-redis")
    REDIS_PORT: int = int(os.getenv("REDIS_PORT", "6379"))
    REDIS_DB: int = int(os.getenv("REDIS_DB", "0"))
    USE_REDIS: bool = os.getenv("USE_REDIS", "false").lower() == "true"
    
    @property
    def REDIS_URL(self) -> Optional[str]:
        """Construct Redis URL"""
        if self.USE_REDIS:
            return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return None
    
    # Celery (Optional)
    CELERY_BROKER_URL: Optional[str] = os.getenv("CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: Optional[str] = os.getenv("CELERY_RESULT_BACKEND")
    USE_CELERY: bool = os.getenv("USE_CELERY", "false").lower() == "true"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
