from datetime import datetime, timedelta, timezone

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import  settings
from app.models import Match, User, Setting
from app.seed_matches import MATCH_SEEDS

TEST_MATCH_NUMBER = 996

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEFAULT_USERS = [
    ("admin", "Admin", True),
    ("ondro", "Ondro", False),
    ("jergi", "Jergi", False),
    ("kubo", "Kubo", False),
    ("tabi", "Tabi", False),
    ("ivo", "Ivo", False),
    ("plcho", "Plcho", False),
    ("mato", "Mato", False),
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
    password_hash = pwd_context.hash(settings.seed_password)
    for username, player_name, is_admin in DEFAULT_USERS:
        db.add(
            User(
                username=username,
                password_hash=password_hash,
                player_name=player_name,
                is_admin=is_admin,
            )
        )
    db.add(Setting(show_second_winner=False, winner_info_readonly=False))

    db.commit()


def ensure_test_match(db: Session) -> None:
    """Add test match #999 once (kickoff now+2h UTC). Kickoff is not reset on restart."""
    existing = (
        db.query(Match).filter(Match.match_number == TEST_MATCH_NUMBER).first()
    )
    if existing:
        return

    test_kickoff = datetime.now(timezone.utc) + timedelta(
        hours=1,
        minutes=1
    )
    db.add(
        Match(
            match_number=TEST_MATCH_NUMBER,
            home="Test Homea",
            away="Test Away",
            kickoff_at=test_kickoff,
            home_score=None,
            away_score=None,
            sort_order=0,
        )
    )
    db.commit()
