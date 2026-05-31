from sqlalchemy.orm import Session, joinedload

from app.models import Match, Prediction, Ticket, User
from app.scoring import (
    MatchData,
    ScorePrediction,
    calc_player_points,
    calc_points_for_match,
    get_match_id,
)
from app.schemas import LeaderboardEntry, MatchOut, MatchPredictionOut, TicketOut


def match_to_data(m: Match) -> MatchData:
    return MatchData(m.home, m.away, m.home_score, m.away_score)


def match_to_out(m: Match) -> MatchOut:
    return MatchOut(
        id=m.id,
        home=m.home,
        away=m.away,
        home_score=m.home_score,
        away_score=m.away_score,
        match_id=get_match_id(m.home, m.away),
    )


def predictions_to_map(ticket: Ticket) -> dict[str, ScorePrediction]:
    result: dict[str, ScorePrediction] = {}
    for pred in ticket.predictions:
        m = pred.match
        result[get_match_id(m.home, m.away)] = ScorePrediction(
            pred.home_score, pred.away_score
        )
    return result


def predictions_to_api_matches(ticket: Ticket) -> dict[str, dict[str, int]]:
    result: dict[str, dict[str, int]] = {}
    for pred in ticket.predictions:
        m = pred.match
        key = get_match_id(m.home, m.away)
        result[key] = {"homeScore": pred.home_score, "awayScore": pred.away_score}
    return result


def get_all_matches(db: Session) -> list[MatchOut]:
    rows = db.query(Match).order_by(Match.sort_order).all()
    return [match_to_out(m) for m in rows]


def get_open_matches(db: Session) -> list[MatchOut]:
    rows = (
        db.query(Match)
        .filter(Match.home_score < 0)
        .order_by(Match.sort_order)
        .all()
    )
    return [match_to_out(m) for m in rows]


def get_leaderboard(db: Session) -> list[LeaderboardEntry]:
    matches = db.query(Match).order_by(Match.sort_order).all()
    match_data = [match_to_data(m) for m in matches]
    entries: list[LeaderboardEntry] = []

    users = (
        db.query(User)
        .options(joinedload(User.ticket).joinedload(Ticket.predictions).joinedload(Prediction.match))
        .filter(User.player_name.isnot(None))
        .all()
    )

    for user in users:
        name = user.player_name or user.username
        if not user.ticket:
            entries.append(LeaderboardEntry(name=name, points=0))
            continue
        preds = predictions_to_map(user.ticket)
        points = calc_player_points(name, match_data, preds)
        entries.append(LeaderboardEntry(name=name, points=points))

    entries.sort(key=lambda e: e.points, reverse=True)
    return entries


def get_player_ticket(db: Session, player_name: str) -> TicketOut | None:
    user = db.query(User).filter(User.player_name == player_name).first()
    if not user or not user.ticket:
        return None

    ticket = (
        db.query(Ticket)
        .options(joinedload(Ticket.predictions).joinedload(Prediction.match))
        .filter(Ticket.id == user.ticket.id)
        .first()
    )
    if not ticket:
        return None

    matches = db.query(Match).order_by(Match.sort_order).all()
    preds = predictions_to_map(ticket)
    breakdown = []

    for m in matches:
        mid = get_match_id(m.home, m.away)
        pred = preds.get(mid)
        points = 0
        home_score = -1
        away_score = -1
        if pred:
            home_score = pred.home_score
            away_score = pred.away_score
        if m.home_score >= 0 and pred:
            points = calc_points_for_match(match_to_data(m), pred)

        breakdown.append(
            MatchPredictionOut(
                match_id=mid,
                home=m.home,
                away=m.away,
                home_score=home_score,
                away_score=away_score,
                actual_home_score=m.home_score,
                actual_away_score=m.away_score,
                points=points,
            )
        )

    return TicketOut(
        winner1=ticket.winner1,
        winner2=ticket.winner2,
        top_striker=ticket.top_scorer,
        matches=predictions_to_api_matches(ticket),
        match_breakdown=breakdown,
    )
