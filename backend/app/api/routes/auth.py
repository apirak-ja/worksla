"""
Authentication Routes
"""
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request, Cookie
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import timedelta

from app.core.database import get_db
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    create_csrf_token,
    decode_token,
    get_current_user,
    set_auth_cookies,
    clear_auth_cookies,
    verify_csrf_token
)
from app.core.config import settings
from app.repositories.user_repository import UserRepository
from app.schemas import LoginRequest, LoginResponse, UserResponse
from app.models.user import User

router = APIRouter()

@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):
    """
    Login endpoint - sets HttpOnly cookies with CSRF protection
    """
    user_repo = UserRepository(db)
    user = user_repo.get_by_username(credentials.username)
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    # Create tokens
    access_token = create_access_token({"sub": user.username, "role": user.role})
    refresh_token = create_refresh_token({"sub": user.username})
    csrf_token = create_csrf_token()
    
    # Set secure cookies
    set_auth_cookies(response, access_token, refresh_token, csrf_token)
    
    return LoginResponse(
        user=UserResponse.model_validate(user),
        message="Login successful"
    )

@router.post("/refresh")
async def refresh(
    response: Response,
    refresh_token: str = Cookie(None),
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token
    """
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not found"
        )
    
    try:
        payload = decode_token(refresh_token)
        username = payload.get("sub")
        token_type = payload.get("type")
        
        if username is None or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )
    except HTTPException:
        raise
    
    # Verify user exists and is active
    user_repo = UserRepository(db)
    user = user_repo.get_by_username(username)
    
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new tokens
    access_token = create_access_token({"sub": user.username, "role": user.role})
    csrf_token = create_csrf_token()
    
    # Update cookies
    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=True,
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/worksla"
    )
    
    response.set_cookie(
        key="XSRF-TOKEN",
        value=csrf_token,
        httponly=False,
        secure=True,
        samesite="strict",
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/worksla"
    )
    
    return {"message": "Token refreshed successfully"}

@router.post("/logout")
async def logout(response: Response):
    """
    Logout endpoint - clears cookies
    """
    clear_auth_cookies(response)
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """
    Get current user information
    """
    return UserResponse.model_validate(current_user)

@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    """
    Get current user information
    """
    return UserResponse.model_validate(current_user)
