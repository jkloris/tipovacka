from dataclasses import dataclass


@dataclass
class MatchData:
    home: str
    away: str
    home_score: int
    away_score: int


@dataclass
class ScorePrediction:
    home_score: int
    away_score: int


def get_match_id(home: str, away: str) -> str:
    return f"{home[:4]}:{away[:4]}"


def abstract_match_winner(home_score: int, away_score: int) -> int:
    if home_score > away_score:
        return 1
    if home_score < away_score:
        return 2
    return 0


def get_winner(match: MatchData) -> int:
    return abstract_match_winner(match.home_score, match.away_score)


def calc_points_for_match(match: MatchData, prediction: ScorePrediction | None) -> int:
    if prediction is None:
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


def parse_prediction(raw: dict | None) -> ScorePrediction | None:
    if not raw or not isinstance(raw, dict):
        return None
    try:
        return ScorePrediction(
            home_score=int(raw.get("homeScore", raw.get("home_score", -1))),
            away_score=int(raw.get("awayScore", raw.get("away_score", -1))),
        )
    except (TypeError, ValueError):
        return None


def calc_player_points(
    player_name: str,
    matches: list[MatchData],
    ticket_matches: dict[str, ScorePrediction],
) -> int:
    total = 0
    for m in matches:
        if m.home_score < 0:
            continue
        mid = get_match_id(m.home, m.away)
        pred = ticket_matches.get(mid)
        total += calc_points_for_match(m, pred)
    return add_winner_points(player_name, total)
