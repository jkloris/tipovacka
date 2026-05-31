import json
from pathlib import Path

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.match_lookup import build_match_key_index
from app.models import Match, Prediction, Ticket, User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SEED_DIR = Path(__file__).resolve().parent.parent / "seed"

MATCH_SCORES = [
    (5, 1),
    (1, 3),
    (3, 0),
    (2, 1),
    (1, 1),
    (0, 1),
    (1, 2),
    (0, 1),
    (3, 0),
    (0, 1),
    (3, 1),
    (2, 1),
    (2, 0),
    (1, 1),
    (2, 2),
    (1, 0),
    (1, 1),
    (1, 1),
    (1, 3),
    (0, 0),
    (1, 2),
    (2, 0),
    (1, 1),
    (0, 3),
    (1, 1),
    (0, 1),
    (0, 1),
    (1, 1),
    (0, 0),
    (0, 0),
    (2, 3),
    (1, 1),
    (1, 1),
    (0, 0),
    (2, 0),
    (1, 2),
    (2, 0),
    (2, 0),
    (1, 1),
    (1, 1),
    (4, 1),
    (1, 0),
    (0, 0),
    (0, 3),
    (1, 2),
    (1, 1),
    (0, 0),
    (1, 1),
    (2, 1),
    (2, 1),
    (1, 2),
    (2, 1),
]

DEFAULT_USERS = [
    ("ondro", "Ondro"),
    ("jergi", "Jergi"),
    ("kubo", "Kubo"),
    ("tabi", "Tabi"),
    ("ivo", "Ivo"),
    ("plcho", "Plcho"),
    ("mato", "Mato"),
]


def _load_euro_matches() -> list[tuple[str, str]]:
    euro_path = SEED_DIR / "euro.json"
    with euro_path.open(encoding="utf-8") as f:
        euro = json.load(f)
    result: list[tuple[str, str]] = []
    for rnd in euro.get("rounds", []):
        for m in rnd.get("matches", []):
            result.append((m["team1"]["name"], m["team2"]["name"]))
    return result


def _add_predictions(
    db: Session,
    ticket: Ticket,
    matches_map: dict,
    match_index: dict[str, Match],
) -> None:
    for match_key, scores in matches_map.items():
        match = match_index.get(match_key)
        if not match:
            continue
        db.add(
            Prediction(
                ticket_id=ticket.id,
                match_id=match.id,
                home_score=int(scores.get("homeScore", scores.get("home_score", 0))),
                away_score=int(scores.get("awayScore", scores.get("away_score", 0))),
            )
        )


def seed_database(db: Session) -> None:
    if db.query(Match).count() > 0:
        return

    pairs = _load_euro_matches()
    for idx, (home, away) in enumerate(pairs):
        home_score, away_score = -1, -1
        if idx < len(MATCH_SCORES):
            home_score, away_score = MATCH_SCORES[idx]
        db.add(
            Match(
                home=home,
                away=away,
                home_score=home_score,
                away_score=away_score,
                sort_order=idx,
            )
        )
    db.flush()

    password_hash = pwd_context.hash(settings.seed_password)
    users_by_player: dict[str, User] = {}
    for username, player_name in DEFAULT_USERS:
        user = User(
            username=username,
            password_hash=password_hash,
            player_name=player_name,
        )
        db.add(user)
        users_by_player[player_name.lower()] = user
    db.flush()

    match_index = build_match_key_index(db)
    tickets_dir = SEED_DIR / "tickets"
    if tickets_dir.exists():
        for ticket_file in sorted(tickets_dir.glob("*.json")):
            with ticket_file.open(encoding="utf-8") as f:
                data = json.load(f)
            player_name = data.pop("player", ticket_file.stem.capitalize())
            user = users_by_player.get(player_name.lower())
            if not user:
                continue
            matches_map = data.get("matches", {})
            ticket = Ticket(
                user_id=user.id,
                winner1=data.get("winner1", ""),
                winner2=data.get("winner2"),
                top_scorer=data.get("topStriker", data.get("top_scorer", "")),
            )
            db.add(ticket)
            db.flush()
            _add_predictions(db, ticket, matches_map, match_index)

    db.commit()
