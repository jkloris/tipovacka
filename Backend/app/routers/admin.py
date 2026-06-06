from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth_utils import get_admin_user
from app.database import get_db
from app.schemas import (
    AddMatchRequest,
    MatchOut,
    MatchResultUpdate,
    PendingUserOut,
    SettingsOut,
    SettingsUpdate,
)
from app.services import (
    add_match,
    approve_user_by_id,
    delete_match,
    delete_pending_user_by_id,
    get_pending_users,
    get_settings,
    save_settings,
    update_match_result,
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/settings", response_model=SettingsOut)
def read_admin_settings(
    user=Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    settings = get_settings(db)
    return SettingsOut(
        show_second_winner=settings.show_second_winner,
        winner_info_readonly=settings.winner_info_readonly,
    )


@router.put("/settings", response_model=SettingsOut)
def update_admin_settings(
    body: SettingsUpdate,
    user=Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    settings = save_settings(db, body.show_second_winner, body.winner_info_readonly)
    return SettingsOut(
        show_second_winner=settings.show_second_winner,
        winner_info_readonly=settings.winner_info_readonly,
    )


@router.post("/matches", response_model=MatchOut)
def create_match(
    body: AddMatchRequest,
    user=Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    try:
        return add_match(db, body.match_number, body.home, body.away, body.kickoff_at)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.put("/matches/{match_number}/result", response_model=MatchOut)
def set_match_result(
    match_number: int,
    body: MatchResultUpdate,
    user=Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    try:
        return update_match_result(db, match_number, body.home_score, body.away_score)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/matches/{match_number}")
def remove_match(
    match_number: int,
    user=Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    try:
        delete_match(db, match_number)
        return {"ok": True}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.get("/pending-users", response_model=list[PendingUserOut])
def get_pending_users_route(
    user=Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    pending = get_pending_users(db)
    return [
        PendingUserOut(
            id=u.id,
            username=u.username,
            is_admin=u.is_admin,
            is_validated=u.is_validated,
        )
        for u in pending
    ]


@router.post("/users/{user_id}/approve", response_model=PendingUserOut)
def approve_user(
    user_id: int,
    user=Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    try:
        approved = approve_user_by_id(db, user_id)
        return PendingUserOut(
            id=approved.id,
            username=approved.username,
            is_admin=approved.is_admin,
            is_validated=approved.is_validated,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.delete("/users/{user_id}")
def delete_pending_user(
    user_id: int,
    user=Depends(get_admin_user),
    db: Session = Depends(get_db),
):
    try:
        delete_pending_user_by_id(db, user_id)
        return {"ok": True}
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
