from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth_utils import get_admin_user
from app.database import get_db
from app.schemas import (
    AddMatchRequest,
    MatchOut,
    MatchResultUpdate,
    SettingsOut,
    SettingsUpdate,
)
from app.services import add_match, get_settings, save_settings, update_match_result
from app.services import delete_match

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
