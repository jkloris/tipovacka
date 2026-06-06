from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth_utils import get_current_user
from app.database import get_db
from app.match_editing import is_prediction_editable, lock_reason
from app.match_lookup import find_match_by_key
from app.models import Prediction, Ticket, User
from app.schemas import (
    EditableMatchOut,
    MyTicketOut,
    PredictionUpdate,
    TicketInfoUpdate,
    TicketSubmit,
)
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


@router.put("/me", response_model=MyTicketOut)
def update_ticket_info(
    body: TicketInfoUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    winner1 = body.winner1.strip()
    top_scorer = body.top_scorer.strip()
    if not winner1 or not top_scorer:
        raise HTTPException(
            status_code=400,
            detail="Celkový víťaz aj najlepší strelec musia byť vyplnené.",
        )
    winner2 = body.winner2.strip() if body.winner2 and body.winner2.strip() else None

    ticket = db.query(Ticket).filter(Ticket.user_id == user.id).first()
    if not ticket:
        ticket = Ticket(
            user_id=user.id,
            winner1=winner1,
            winner2=winner2,
            top_scorer=top_scorer,
        )
        db.add(ticket)
        db.flush()
    else:
        ticket.winner1 = winner1
        ticket.winner2 = winner2
        ticket.top_scorer = top_scorer

    db.commit()
    return get_my_ticket(db, user)


@router.post("")
def submit_ticket(
    body: TicketSubmit,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    name = user.username

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
        if not is_prediction_editable(match.kickoff_at):
            raise HTTPException(
                status_code=403,
                detail=lock_reason(match.kickoff_at)
                or "Predictions are locked",
            )

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

    db.commit()
    return {"ok": True, "player": name}
