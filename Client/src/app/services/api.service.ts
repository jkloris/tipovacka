import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  EditableMatchDto,
  LeaderboardEntry,
  MatchDto,
  MyTicketDto,
  PendingUserDto,
  PredictionUpdatePayload,
  SettingsDto,
  TicketDto,
} from '../models/api.models';

export interface TicketSubmitPayload {
  yourName: string;
  matches: Record<string, { homeScore: number; awayScore: number }>;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getMatches(): Observable<MatchDto[]> {
    return this.http.get<MatchDto[]>(`${environment.apiUrl}/matches`);
  }

  getOpenMatches(): Observable<MatchDto[]> {
    return this.http.get<MatchDto[]>(`${environment.apiUrl}/matches/open`);
  }

  getLeaderboard(): Observable<LeaderboardEntry[]> {
    return this.http.get<LeaderboardEntry[]>(`${environment.apiUrl}/leaderboard`);
  }

  getPlayerTicket(name: string): Observable<TicketDto> {
    return this.http.get<TicketDto>(
      `${environment.apiUrl}/players/${encodeURIComponent(name)}/ticket`
    );
  }

  getMyTicket(): Observable<MyTicketDto> {
    return this.http.get<MyTicketDto>(`${environment.apiUrl}/tickets/me`);
  }

  savePrediction(payload: PredictionUpdatePayload): Observable<EditableMatchDto> {
    return this.http.put<EditableMatchDto>(
      `${environment.apiUrl}/tickets/me/predictions`,
      payload
    );
  }

  saveTicketInfo(payload: {
    winner1: string;
    winner2?: string | null;
    top_scorer: string;
  }): Observable<MyTicketDto> {
    return this.http.put<MyTicketDto>(`${environment.apiUrl}/tickets/me`, payload);
  }

  getSettings(): Observable<SettingsDto> {
    return this.http.get<SettingsDto>(`${environment.apiUrl}/settings`);
  }

  getAdminSettings(): Observable<SettingsDto> {
    return this.http.get<SettingsDto>(`${environment.apiUrl}/admin/settings`);
  }

  updateAdminSettings(payload: SettingsDto): Observable<SettingsDto> {
    return this.http.put<SettingsDto>(`${environment.apiUrl}/admin/settings`, payload);
  }

  createMatch(payload: {
    matchNumber: number;
    home: string;
    away: string;
    kickoffAt: string | null;
  }): Observable<MatchDto> {
    return this.http.post<MatchDto>(`${environment.apiUrl}/admin/matches`, {
      match_number: payload.matchNumber,
      home: payload.home,
      away: payload.away,
      kickoff_at: payload.kickoffAt,
    });
  }

  setMatchResult(
    matchNumber: number,
    payload: { homeScore: number; awayScore: number }
  ): Observable<MatchDto> {
    return this.http.put<MatchDto>(
      `${environment.apiUrl}/admin/matches/${matchNumber}/result`,
      {
        home_score: payload.homeScore,
        away_score: payload.awayScore,
      }
    );
  }

  deleteMatch(matchNumber: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${environment.apiUrl}/admin/matches/${matchNumber}`);
  }

  getPendingUsers(): Observable<PendingUserDto[]> {
    return this.http.get<PendingUserDto[]>(`${environment.apiUrl}/admin/pending-users`);
  }

  approveUser(userId: number): Observable<PendingUserDto> {
    return this.http.post<PendingUserDto>(`${environment.apiUrl}/admin/users/${userId}/approve`, {});
  }

  deletePendingUser(userId: number): Observable<{ ok: boolean }> {
    return this.http.delete<{ ok: boolean }>(`${environment.apiUrl}/admin/users/${userId}`);
  }

  submitTicket(payload: TicketSubmitPayload): Observable<{ ok: boolean; player: string }> {
    return this.http.post<{ ok: boolean; player: string }>(
      `${environment.apiUrl}/tickets`,
      payload
    );
  }
}
