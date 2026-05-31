from dataclasses import dataclass

from app.models import Match


@dataclass
class MatchData:
    home: str
    away: str
    home_score: int | None
    away_score: int | None
    match_number: int


@dataclass
class ScorePrediction:
    home_score: int
    away_score: int


def get_match_id(home: str, away: str) -> str:
    """Legacy team-based key (first 4 chars). Prefer get_match_key(match)."""
    return f"{home[:4]}:{away[:4]}"


def get_match_key(match: Match) -> str:
    return str(match.match_number)


def match_is_played(match: MatchData) -> bool:
    return match.home_score is not None and match.away_score is not None


def abstract_match_winner(home_score: int, away_score: int) -> int:
    if home_score > away_score:
        return 1
    if home_score < away_score:
        return 2
    return 0


def get_winner(match: MatchData) -> int:
    assert match.home_score is not None and match.away_score is not None
    return abstract_match_winner(match.home_score, match.away_score)


def calc_points_for_match(match: MatchData, prediction: ScorePrediction | None) -> int:
    if prediction is None or not match_is_played(match):
        return 0
    points = 0
    points += 5 - (
        abs(prediction.home_score - match.home_score)
        + abs(prediction.away_score - match.away_score)
    )
    points += (
        5
        if get_winner(match)
        == abstract_match_winner(prediction.home_score, prediction.away_score)
        else 0
    )
    return points


def add_winner_points(player_name: str, points: int) -> int:
    if player_name in ("Ondro", "Ivo"):
        return points + 10
    return points


def calc_player_points(
    player_name: str,
    matches: list[MatchData],
    ticket_matches: dict[str, ScorePrediction],
) -> int:
    total = 0
    for m in matches:
        if not match_is_played(m):
            continue
        key = str(m.match_number)
        pred = ticket_matches.get(key)
        total += calc_points_for_match(m, pred)
    return add_winner_points(player_name, total)
