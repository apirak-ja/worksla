"""
Seed Admin User
Creates default admin user if it doesn't exist
"""
import sys
import os
import argparse

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import SessionLocal
from app.repositories.user_repository import UserRepository
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_admin(username: str = "admin", password: str = "admin123", force: bool = False):
    """
    Create admin user
    """
    db = SessionLocal()
    
    try:
        user_repo = UserRepository(db)
        
        # Check if admin exists
        existing = user_repo.get_by_username(username)
        
        if existing:
            if force:
                logger.info(f"Admin user '{username}' exists. Updating password...")
                user_repo.update(existing.id, password=password)
                logger.info("Admin password updated successfully")
            else:
                logger.info(f"Admin user '{username}' already exists. Use --force to update password.")
            return
        
        # Create admin user
        logger.info(f"Creating admin user '{username}'...")
        # Truncate password to 72 bytes for bcrypt compatibility
        truncated_password = password[:72] if len(password) > 72 else password
        if len(password) > 72:
            logger.warning(f"Password truncated from {len(password)} to 72 bytes for bcrypt compatibility")
        
        user = user_repo.create(
            username=username,
            password=truncated_password,
            role="admin"
        )
        
        logger.info(f"Admin user created successfully:")
        logger.info(f"  Username: {user.username}")
        logger.info(f"  Role: {user.role}")
        logger.info(f"  Password: {password}")
        logger.info("\n⚠️  IMPORTANT: Please change the admin password after first login!")
        
    except Exception as e:
        logger.error(f"Error seeding admin user: {e}")
        raise
    finally:
        db.close()

def main():
    parser = argparse.ArgumentParser(description="Seed admin user")
    parser.add_argument("--username", default="admin", help="Admin username")
    parser.add_argument("--password", default="admin123", help="Admin password")
    parser.add_argument("--force", action="store_true", help="Force update if exists")
    
    args = parser.parse_args()
    
    seed_admin(args.username, args.password, args.force)

if __name__ == "__main__":
    main()
