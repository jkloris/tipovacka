from datetime import datetime

from sqlalchemy.orm import Session, joinedload

from app.models import Match, Prediction, Setting, Ticket, User
from app.scoring import (
    MatchData,
    ScorePrediction,
    calc_player_points,
    calc_points_for_match,
    get_match_key,
    match_is_played,
)
from app.match_editing import is_prediction_editable, lock_reason
from app.match_lookup import find_match_by_key
from app.schemas import (
    EditableMatchOut,
    LeaderboardEntry,
    MatchOut,
    MatchPredictionOut,
    MyTicketOut,
    TicketOut,
)


def match_to_data(m: Match) -> MatchData:
    return MatchData(
        m.home,
        m.away,
        m.home_score,
        m.away_score,
        m.match_number,
    )


def match_to_out(m: Match) -> MatchOut:
    return MatchOut(
        id=m.id,
        match_number=m.match_number,
        home=m.home,
        away=m.away,
        kickoff_at=m.kickoff_at,
        home_score=m.home_score,
        away_score=m.away_score,
        match_id=get_match_key(m),
    )


def predictions_to_map(ticket: Ticket) -> dict[str, ScorePrediction]:
    result: dict[str, ScorePrediction] = {}
    for pred in ticket.predictions:
        m = pred.match
        result[get_match_key(m)] = ScorePrediction(
            pred.home_score, pred.away_score
        )
    return result


def predictions_to_api_matches(ticket: Ticket) -> dict[str, dict[str, int]]:
    result: dict[str, dict[str, int]] = {}
    for pred in ticket.predictions:
        m = pred.match
        key = get_match_key(m)
        result[key] = {"homeScore": pred.home_score, "awayScore": pred.away_score}
    return result


def get_all_matches(db: Session) -> list[MatchOut]:
    rows = db.query(Match).order_by(Match.sort_order).all()
    return [match_to_out(m) for m in rows]


def get_open_matches(db: Session) -> list[MatchOut]:
    rows = (
        db.query(Match)
        .filter(Match.home_score.is_(None))
        .order_by(Match.sort_order)
        .all()
    )
    return [match_to_out(m) for m in rows]


def get_settings(db: Session) -> Setting:
    settings = db.query(Setting).first()
    if not settings:
        settings = Setting()
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


def save_settings(db: Session, show_second_winner: bool, winner_info_readonly: bool) -> Setting:
    settings = db.query(Setting).first()
    if not settings:
        settings = Setting(
            show_second_winner=show_second_winner,
            winner_info_readonly=winner_info_readonly,
        )
        db.add(settings)
    else:
        settings.show_second_winner = show_second_winner
        settings.winner_info_readonly = winner_info_readonly
    db.commit()
    db.refresh(settings)
    return settings


def add_match(db: Session, match_number: int, home: str, away: str, kickoff_at: datetime | None) -> MatchOut:
    existing = db.query(Match).filter(Match.match_number == match_number).first()
    if existing:
        raise ValueError(f"Match {match_number} already exists")

    match = Match(
        match_number=match_number,
        home=home,
        away=away,
        kickoff_at=kickoff_at,
        home_score=None,
        away_score=None,
        sort_order=match_number,
    )
    db.add(match)
    db.commit()
    db.refresh(match)
    return match_to_out(match)


def update_match_result(db: Session, match_number: int, home_score: int, away_score: int) -> MatchOut:
    match = db.query(Match).filter(Match.match_number == match_number).first()
    if not match:
        raise ValueError(f"Match {match_number} not found")
    match.home_score = home_score
    match.away_score = away_score
    db.commit()
    db.refresh(match)
    return match_to_out(match)


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
        mid = get_match_key(m)
        pred = preds.get(mid)
        points = 0
        home_score = -1
        away_score = -1
        if pred:
            home_score = pred.home_score
            away_score = pred.away_score
        md = match_to_data(m)
        if match_is_played(md) and pred:
            points = calc_points_for_match(md, pred)

        breakdown.append(
            MatchPredictionOut(
                match_id=mid,
                home=m.home,
                away=m.away,
                home_score=home_score,
                away_score=away_score,
                actual_home_score=m.home_score if m.home_score is not None else -1,
                actual_away_score=m.away_score if m.away_score is not None else -1,
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


def _prediction_map(ticket: Ticket | None) -> dict[str, Prediction]:
    if not ticket:
        return {}
    return {get_match_key(p.match): p for p in ticket.predictions}


def get_my_ticket(db: Session, user: User) -> MyTicketOut:
    ticket = db.query(Ticket).filter(Ticket.user_id == user.id).first()
    if ticket:
        db.refresh(ticket)
        ticket = (
            db.query(Ticket)
            .options(joinedload(Ticket.predictions).joinedload(Prediction.match))
            .filter(Ticket.id == ticket.id)
            .first()
        )
    pred_by_key = _prediction_map(ticket)

    unplayed = (
        db.query(Match)
        .filter(Match.home_score.is_(None))
        .order_by(Match.sort_order)
        .all()
    )

    editable: list[EditableMatchOut] = []
    for m in unplayed:
        key = get_match_key(m)
        pred = pred_by_key.get(key)
        ph = pred.home_score if pred else None
        pa = pred.away_score if pred else None
        editable.append(
            EditableMatchOut(
                match_id=key,
                match_number=m.match_number,
                home=m.home,
                away=m.away,
                kickoff_at=m.kickoff_at,
                prediction_home=ph,
                prediction_away=pa,
                filled=ph is not None and pa is not None,
                editable=is_prediction_editable(m.kickoff_at),
            )
        )

    return MyTicketOut(
        winner1=ticket.winner1 if ticket else "",
        winner2=ticket.winner2 if ticket else None,
        top_scorer=ticket.top_scorer if ticket else "",
        player_name=user.player_name,
        editable_matches=editable,
    )


def upsert_prediction(
    db: Session,
    user: User,
    match_key: str,
    home_score: int,
    away_score: int,
) -> EditableMatchOut:
    match = find_match_by_key(db, match_key)
    if not match:
        raise ValueError(f"Unknown match: {match_key}")
    if match.home_score is not None:
        raise ValueError("Match already played")
    if not is_prediction_editable(match.kickoff_at):
        raise ValueError(
            "Predictions are locked from 1 hour before kickoff"
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

    if not ticket.winner1.strip() or not ticket.top_scorer.strip():
        raise ValueError(
            "Predikcie zápasov je potrebné zadať až po vyplnení celkového víťaza a najlepšieho strelca."
        )

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

    return EditableMatchOut(
        match_id=match_key,
        match_number=match.match_number,
        home=match.home,
        away=match.away,
        kickoff_at=match.kickoff_at,
        prediction_home=home_score,
        prediction_away=away_score,
        filled=True,
        editable=is_prediction_editable(match.kickoff_at),
    )
