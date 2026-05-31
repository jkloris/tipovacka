from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth_utils import get_current_user
from app.database import get_db
from app.match_lookup import find_match_by_key
from app.models import Prediction, Ticket, User
from app.schemas import EditableMatchOut, MyTicketOut, PredictionUpdate, TicketSubmit
from app.services import get_my_ticket, upsert_prediction

router = APIRouter(prefix="/tickets", tags=["tickets"])


@router.get("/me", response_model=MyTicketOut)
def my_ticket(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return get_my_ticket(db, user)


@router.put("/me/predictions", response_model=EditableMatchOut)
def save_prediction(
    body: PredictionUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    try:
        return upsert_prediction(db, user, body.match_id, body.home_score, body.away_score)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.post("")
def submit_ticket(
    body: TicketSubmit,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    name = body.your_name.strip()
    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    if user.player_name and user.player_name.lower() != name.lower():
        raise HTTPException(
            status_code=400,
            detail="Name must match your account player name",
        )

    ticket = db.query(Ticket).filter(Ticket.user_id == user.id).first()
    if not ticket:
        ticket = Ticket(
            user_id=user.id,
            winner1="",
            winner2=None,
            top_scorer="",
        )
        db.add(ticket)
        db.flush()

    for match_key, scores in body.matches.items():
        match = find_match_by_key(db, match_key)
        if not match:
            raise HTTPException(status_code=400, detail=f"Unknown match: {match_key}")

        home_score = int(scores.get("homeScore", scores.get("home_score", 0)))
        away_score = int(scores.get("awayScore", scores.get("away_score", 0)))

        pred = (
            db.query(Prediction)
            .filter(
                Prediction.ticket_id == ticket.id,
                Prediction.match_id == match.id,
            )
            .first()
        )
        if pred:
            pred.home_score = home_score
            pred.away_score = away_score
        else:
            db.add(
                Prediction(
                    ticket_id=ticket.id,
                    match_id=match.id,
                    home_score=home_score,
                    away_score=away_score,
                )
            )

    if not user.player_name:
        user.player_name = name

    db.commit()
    return {"ok": True, "player": user.player_name or name}
