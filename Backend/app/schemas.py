from pydantic import BaseModel, Field


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
    home: str
    away: str
    home_score: int
    away_score: int
    match_id: str

    model_config = {"from_attributes": True}


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


class UserOut(BaseModel):
    username: str
    player_name: str | None
