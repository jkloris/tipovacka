import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  EditableMatchDto,
  LeaderboardEntry,
  MatchDto,
  MyTicketDto,
  PredictionUpdatePayload,
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

  submitTicket(payload: TicketSubmitPayload): Observable<{ ok: boolean; player: string }> {
    return this.http.post<{ ok: boolean; player: string }>(
      `${environment.apiUrl}/tickets`,
      payload
    );
  }
}
