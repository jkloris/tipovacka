import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenResponse, UserDto } from '../models/api.models';

const ACCESS_KEY = 'tipovacka_access_token';
const REFRESH_KEY = 'tipovacka_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isLoggedIn = signal(false);
  readonly currentUser = signal<UserDto | null>(null);

  constructor(private http: HttpClient) {}

  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_KEY);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_KEY);
  }

  private storeTokens(tokens: TokenResponse): void {
    localStorage.setItem(ACCESS_KEY, tokens.access_token);
    localStorage.setItem(REFRESH_KEY, tokens.refresh_token);
    this.isLoggedIn.set(true);
  }

  async refreshIfNeeded(): Promise<void> {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      this.isLoggedIn.set(false);
      return;
    }
    try {
      const tokens = await firstValueFrom(
        this.http.post<TokenResponse>(`${environment.apiUrl}/auth/refresh`, {
          refresh_token: refresh,
        })
      );
      this.storeTokens(tokens);
      await this.loadMe();
    } catch {
      this.logout();
    }
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const tokens = await firstValueFrom(
        this.http.post<TokenResponse>(`${environment.apiUrl}/auth/login`, {
          username,
          password,
        })
      );
      this.storeTokens(tokens);
      await this.loadMe();
      return true;
    } catch {
      return false;
    }
  }

  async loadMe(): Promise<void> {
    try {
      const user = await firstValueFrom(
        this.http.get<UserDto>(`${environment.apiUrl}/auth/me`)
      );
      this.currentUser.set(user);
      this.isLoggedIn.set(true);
    } catch {
      this.logout();
    }
  }

  async refreshAccessToken(): Promise<string | null> {
    const refresh = this.getRefreshToken();
    if (!refresh) {
      return null;
    }
    try {
      const tokens = await firstValueFrom(
        this.http.post<TokenResponse>(`${environment.apiUrl}/auth/refresh`, {
          refresh_token: refresh,
        })
      );
      this.storeTokens(tokens);
      return tokens.access_token;
    } catch {
      this.logout();
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
  }
}
