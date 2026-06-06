from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.auth_utils import (
    create_access_token,
    create_refresh_token_value,
    get_current_user,
    store_refresh_token,
    validate_refresh_token,
    verify_password,
)
from app.database import get_db
from app.models import User
from app.schemas import LoginRequest, RefreshRequest, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access = create_access_token(user.id, user.username)
    refresh = create_refresh_token_value()
    store_refresh_token(db, user.id, refresh)
    return TokenResponse(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    user = validate_refresh_token(db, body.refresh_token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    access = create_access_token(user.id, user.username)
    new_refresh = create_refresh_token_value()
    store_refresh_token(db, user.id, new_refresh)
    return TokenResponse(access_token=access, refresh_token=new_refresh)


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return UserOut(
        username=user.username,
        player_name=user.player_name,
        is_admin=user.is_admin,
    )
