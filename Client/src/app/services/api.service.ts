import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  LeaderboardEntry,
  MatchDto,
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

  submitTicket(payload: TicketSubmitPayload): Observable<{ ok: boolean; player: string }> {
    return this.http.post<{ ok: boolean; player: string }>(
      `${environment.apiUrl}/tickets`,
      payload
    );
  }
}
