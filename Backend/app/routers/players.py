from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import LeaderboardEntry, TicketOut
from app.services import get_leaderboard, get_player_ticket

router = APIRouter(tags=["players"])


@router.get("/leaderboard", response_model=list[LeaderboardEntry])
def leaderboard(db: Session = Depends(get_db)):
    return get_leaderboard(db)


@router.get("/players/{name}/ticket", response_model=TicketOut)
def player_ticket(name: str, db: Session = Depends(get_db)):
    ticket = get_player_ticket(db, name)
    if not ticket:
        raise HTTPException(status_code=404, detail="Player or ticket not found")
    return ticket
