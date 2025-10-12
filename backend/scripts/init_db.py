"""
Initialize Database
Creates the worksla database if it doesn't exist
"""
import sys
import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from urllib.parse import quote_plus
import logging

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_database():
    """
    Create database if it doesn't exist
    """
    try:
        # Connect to postgres database
        encoded_password = quote_plus(settings.POSTGRES_PASSWORD)
        conn = psycopg2.connect(
            host=settings.POSTGRES_HOST,
            port=settings.POSTGRES_PORT,
            user=settings.POSTGRES_USER,
            password=settings.POSTGRES_PASSWORD,  # Use original password for psycopg2
            database='postgres'
        )
        
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute(
            "SELECT 1 FROM pg_database WHERE datname = %s",
            (settings.POSTGRES_DB,)
        )
        
        exists = cursor.fetchone()
        
        if not exists:
            logger.info(f"Creating database: {settings.POSTGRES_DB}")
            cursor.execute(f"""
                CREATE DATABASE {settings.POSTGRES_DB}
                OWNER {settings.POSTGRES_USER}
                TEMPLATE template0
                ENCODING 'UTF8'
                LC_COLLATE 'en_US.UTF-8'
                LC_CTYPE 'en_US.UTF-8'
            """)
            logger.info(f"Database {settings.POSTGRES_DB} created successfully")
        else:
            logger.info(f"Database {settings.POSTGRES_DB} already exists")
        
        cursor.close()
        conn.close()
        
        return True
        
    except Exception as e:
        logger.error(f"Error creating database: {e}")
        return False

def create_tables():
    """
    Create all tables using SQLAlchemy
    """
    try:
        from app.core.database import engine, Base
        from app.models import User, Session, Setting, AssigneeAllowlist, WPCache, AuditLog
        
        logger.info("Creating tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("Tables created successfully")
        
        return True
        
    except Exception as e:
        logger.error(f"Error creating tables: {e}")
        return False

def main():
    """
    Main function
    """
    logger.info("Starting database initialization...")
    
    # Create database
    if not create_database():
        logger.error("Failed to create database")
        sys.exit(1)
    
    # Create tables
    if not create_tables():
        logger.error("Failed to create tables")
        sys.exit(1)
    
    logger.info("Database initialization completed successfully")

if __name__ == "__main__":
    main()
