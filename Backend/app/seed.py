from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.models import Match, User
from app.seed_matches import MATCH_SEEDS

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEFAULT_USERS = [
    ("ondro", "Ondro"),
    ("jergi", "Jergi"),
    ("kubo", "Kubo"),
    ("tabi", "Tabi"),
    ("ivo", "Ivo"),
    ("plcho", "Plcho"),
    ("mato", "Mato"),
]


def seed_database(db: Session) -> None:
    if db.query(Match).count() > 0:
        return

    for match_number, home, away, kickoff_at in MATCH_SEEDS:
        db.add(
            Match(
                match_number=match_number,
                home=home,
                away=away,
                kickoff_at=kickoff_at,
                home_score=None,
                away_score=None,
                sort_order=match_number,
            )
        )
    db.flush()

    password_hash = pwd_context.hash(settings.seed_password)
    for username, player_name in DEFAULT_USERS:
        db.add(
            User(
                username=username,
                password_hash=password_hash,
                player_name=player_name,
            )
        )

    db.commit()
