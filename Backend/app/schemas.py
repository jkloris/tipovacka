from datetime import datetime

from pydantic import BaseModel, Field, field_serializer


def _serialize_utc_datetime(value: datetime | None) -> str | None:
    if value is None:
        return None
    return value.isoformat() + "Z"


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class LoginRequest(BaseModel):
    username: str
    password: str


class MatchOut(BaseModel):
    id: int
    match_number: int
    home: str
    away: str
    kickoff_at: datetime | None = None
    home_score: int | None = None
    away_score: int | None = None
    match_id: str

    model_config = {"from_attributes": True}

    @field_serializer("kickoff_at")
    def serialize_kickoff(self, value: datetime | None) -> str | None:
        return _serialize_utc_datetime(value)


class LeaderboardEntry(BaseModel):
    name: str
    points: int


class MatchPredictionOut(BaseModel):
    match_id: str
    home: str
    away: str
    home_score: int
    away_score: int
    actual_home_score: int
    actual_away_score: int
    points: int


class TicketOut(BaseModel):
    winner1: str
    winner2: str | None = None
    top_striker: str
    matches: dict
    match_breakdown: list[MatchPredictionOut]


class TicketSubmit(BaseModel):
    your_name: str = Field(alias="yourName")
    matches: dict[str, dict[str, int]]

    model_config = {"populate_by_name": True}


class TicketInfoUpdate(BaseModel):
    winner1: str
    winner2: str | None = None
    top_scorer: str

    model_config = {"populate_by_name": True}


class SettingsOut(BaseModel):
    show_second_winner: bool
    winner_info_readonly: bool


class SettingsUpdate(BaseModel):
    show_second_winner: bool
    winner_info_readonly: bool

    model_config = {"populate_by_name": True}


class AddMatchRequest(BaseModel):
    match_number: int
    home: str
    away: str
    kickoff_at: datetime | None = None

    model_config = {"populate_by_name": True}


class MatchResultUpdate(BaseModel):
    home_score: int
    away_score: int

    model_config = {"populate_by_name": True}


class UserOut(BaseModel):
    username: str
    player_name: str | None
    is_admin: bool = False


class EditableMatchOut(BaseModel):
    match_id: str
    match_number: int
    home: str
    away: str
    kickoff_at: datetime | None = None
    prediction_home: int | None = None
    prediction_away: int | None = None
    filled: bool
    editable: bool = True

    @field_serializer("kickoff_at")
    def serialize_kickoff(self, value: datetime | None) -> str | None:
        return _serialize_utc_datetime(value)


class MyTicketOut(BaseModel):
    winner1: str
    winner2: str | None = None
    top_scorer: str
    player_name: str | None
    editable_matches: list[EditableMatchOut]


class PredictionUpdate(BaseModel):
    match_id: str = Field(alias="matchId")
    home_score: int = Field(alias="homeScore")
    away_score: int = Field(alias="awayScore")

    model_config = {"populate_by_name": True}
