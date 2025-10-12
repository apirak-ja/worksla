"""
Main FastAPI Application
Open Project - SLA Reporting System
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging
import sys

from app.core.config import settings
from app.core.database import engine, Base
from app.api.routes import auth, workpackages, admin, reports, search
import asyncio
from app.services.wp_sync import periodic_sync

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="SLA Reporting System for OpenProject",
    # Set root_path to "/worksla" so routes using API_PREFIX ("/api") are
    # exposed externally as "/worksla/api/..." which matches the frontend baseURL
    # configuration.
    root_path="/worksla",
    docs_url=f"{settings.API_PREFIX}/docs",
    redoc_url=f"{settings.API_PREFIX}/redoc",
    openapi_url=f"{settings.API_PREFIX}/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware
if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )

# Include routers
app.include_router(auth.router, prefix=f"{settings.API_PREFIX}/auth", tags=["Authentication"])
app.include_router(workpackages.router, prefix=f"{settings.API_PREFIX}/workpackages", tags=["Work Packages"])
app.include_router(admin.router, prefix=f"{settings.API_PREFIX}/admin", tags=["Administration"])
app.include_router(reports.router, prefix=f"{settings.API_PREFIX}/reports", tags=["Reports"])
app.include_router(search.router, prefix=f"{settings.API_PREFIX}/search", tags=["Search"])

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Database: {settings.DATABASE_URL.split('@')[1] if '@' in settings.DATABASE_URL else 'configured'}")
    # Start background periodic wp_cache sync task
    try:
        asyncio.create_task(periodic_sync())
        logger.info("Started periodic wp_cache sync task")
    except Exception as e:
        logger.warning(f"Failed to start periodic sync task: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info(f"Shutting down {settings.PROJECT_NAME}")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error",
            "message": str(exc) if settings.DEBUG else "An unexpected error occurred"
        }
    )

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
        "api_docs": f"{settings.API_PREFIX}/docs"
    }

@app.get(f"{settings.API_PREFIX}/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }
