export interface MatchDto {
  id: number;
  home: string;
  away: string;
  home_score: number;
  away_score: number;
  match_id: string;
}

export interface LeaderboardEntry {
  name: string;
  points: number;
}

export interface MatchPredictionDto {
  match_id: string;
  home: string;
  away: string;
  home_score: number;
  away_score: number;
  actual_home_score: number;
  actual_away_score: number;
  points: number;
}

export interface TicketDto {
  winner1: string;
  winner2?: string;
  top_striker: string;
  matches: Record<string, { homeScore: number; awayScore: number }>;
  match_breakdown: MatchPredictionDto[];
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserDto {
  username: string;
  player_name: string | null;
}
