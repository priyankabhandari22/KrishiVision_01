"""
auth.py
-------
REST endpoints for farmer registration, login, session check, and logout:
  POST /auth/register
  POST /auth/login
  GET  /auth/me
  POST /auth/logout
"""

from fastapi import APIRouter, Depends, status
from backend.controllers import handle_login, handle_logout, handle_me, handle_register
from backend.middleware import get_current_user
from backend.models import AuthResponse, LoginRequest, RegisterRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a New Farmer Account",
)
async def register(payload: RegisterRequest):
    return handle_register(payload)


@router.post(
    "/login",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Sign In",
)
async def login(payload: LoginRequest):
    return handle_login(email=payload.email, password=payload.password)


@router.get(
    "/me",
    response_model=AuthResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Current User",
)
async def me(user: dict = Depends(get_current_user)):
    return handle_me(user)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Sign Out",
)
async def logout():
    return handle_logout()