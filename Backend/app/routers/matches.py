from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import MatchOut
from app.services import get_all_matches, get_open_matches

router = APIRouter(prefix="/matches", tags=["matches"])


@router.get("", response_model=list[MatchOut])
def list_matches(db: Session = Depends(get_db)):
    return get_all_matches(db)


@router.get("/open", response_model=list[MatchOut])
def list_open_matches(db: Session = Depends(get_db)):
    return get_open_matches(db)
