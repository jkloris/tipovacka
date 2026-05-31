from sqlalchemy.orm import Session

from app.models import Match
from app.scoring import get_match_id


def build_match_key_index(db: Session) -> dict[str, Match]:
    return {get_match_id(m.home, m.away): m for m in db.query(Match).all()}


def find_match_by_key(db: Session, match_key: str) -> Match | None:
    return build_match_key_index(db).get(match_key)
