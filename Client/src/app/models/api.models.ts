export interface MatchDto {
  id: number;
  match_number: number;
  home: string;
  away: string;
  kickoff_at: string | null;
  home_score: number | null;
  away_score: number | null;
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

export interface EditableMatchDto {
  match_id: string;
  match_number: number;
  home: string;
  away: string;
  kickoff_at: string | null;
  prediction_home: number | null;
  prediction_away: number | null;
  filled: boolean;
}

export interface MyTicketDto {
  winner1: string;
  winner2?: string | null;
  top_scorer: string;
  player_name: string | null;
  editable_matches: EditableMatchDto[];
}

export interface PredictionUpdatePayload {
  matchId: string;
  homeScore: number;
  awayScore: number;
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
