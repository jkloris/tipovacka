import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { EditableMatchDto, MyTicketDto } from '../../models/api.models';
import { LoginDialogComponent } from '../../auth/login-dialog.component';

interface ScoreEntry {
  home: number | null;
  away: number | null;
}

@Component({
  selector: 'app-my-ticket',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './my-ticket.component.html',
  styleUrl: './my-ticket.component.css',
})
export class MyTicketComponent implements OnInit {
  loading = false;
  savingMatchId: string | null = null;
  savedMatchId: string | null = null;
  savingInfo = false;
  infoSaved = false;
  error: string | null = null;
  infoError: string | null = null;

  ticket: MyTicketDto | null = null;
  scores: Record<string, ScoreEntry> = {};
  private lastSaved = new Map<string, string>();
  private originalTicketInfo = { winner1: '', winner2: null as string | null, top_scorer: '' };

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private dialog: MatDialog
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.auth.isLoggedIn()) {
      await this.loadTicket();
    }
  }

  get matches(): EditableMatchDto[] {
    return this.ticket?.editable_matches ?? [];
  }

  get filledCount(): number {
    return this.matches.filter((m) => m.filled).length;
  }

  async ensureLoggedIn(): Promise<boolean> {
    if (this.auth.isLoggedIn()) {
      return true;
    }
    const ref = this.dialog.open(LoginDialogComponent, { width: '360px' });
    const ok = (await firstValueFrom(ref.afterClosed())) === true;
    if (ok) {
      await this.loadTicket();
    }
    return ok;
  }

  get hasTicketInfo(): boolean {
    return (
      !!this.ticket &&
      this.ticket.winner1.trim() !== '' &&
      this.ticket.top_scorer.trim() !== ''
    );
  }

  get hasSavedTicketInfo(): boolean {
    return this.hasTicketInfo && !this.ticketInfoChanged;
  }

  get ticketInfoChanged(): boolean {
    if (!this.ticket) {
      return false;
    }
    return (
      this.ticket.winner1.trim() !== this.originalTicketInfo.winner1.trim() ||
      (this.ticket.winner2 ?? '').trim() !==
        (this.originalTicketInfo.winner2 ?? '').trim() ||
      this.ticket.top_scorer.trim() !== this.originalTicketInfo.top_scorer.trim()
    );
  }

  async saveTicketInfo(): Promise<void> {
    if (!(await this.ensureLoggedIn()) || !this.ticket) {
      return;
    }
    const winner1 = this.ticket.winner1?.trim() ?? '';
    const top_scorer = this.ticket.top_scorer?.trim() ?? '';
    if (!winner1 || !top_scorer) {
      this.infoError =
        'Celkový víťaz a najlepší strelec sú povinné pred uložením tiketových predikcií.';
      return;
    }

    this.infoError = null;
    this.savingInfo = true;
    this.infoSaved = false;

    try {
      this.ticket = await firstValueFrom(
        this.api.saveTicketInfo({
          winner1,
          winner2: this.ticket.winner2 ?? null,
          top_scorer,
        })
      );
      this.originalTicketInfo = {
        winner1: this.ticket.winner1 || '',
        winner2: this.ticket.winner2 ?? null,
        top_scorer: this.ticket.top_scorer || '',
      };
      this.infoSaved = true;
      setTimeout(() => {
        this.infoSaved = false;
      }, 2000);
    } catch (err: unknown) {
      const detail =
        err instanceof HttpErrorResponse
          ? (err.error?.detail as string | undefined)
          : undefined;
      this.infoError =
        detail || 'Uloženie tiketových údajov zlyhalo. Skúste to znova.';
    } finally {
      this.savingInfo = false;
    }
  }

  async loadTicket(): Promise<void> {
    if (!this.auth.isLoggedIn()) {
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      this.ticket = await firstValueFrom(this.api.getMyTicket());
      this.originalTicketInfo = {
        winner1: this.ticket.winner1 || '',
        winner2: this.ticket.winner2 ?? null,
        top_scorer: this.ticket.top_scorer || '',
      };
      this.scores = {};
      this.lastSaved.clear();
      for (const m of this.ticket.editable_matches) {
        this.scores[m.match_id] = {
          home: m.prediction_home,
          away: m.prediction_away,
        };
        if (m.filled) {
          this.lastSaved.set(m.match_id, this.fingerprint(m.match_id));
        }
      }
    } catch {
      this.error = 'Nepodarilo sa načítať tiket.';
      this.ticket = null;
    } finally {
      this.loading = false;
    }
  }

  isUnfilled(match: EditableMatchDto): boolean {
    const entry = this.scores[match.match_id];
    if (!entry || entry.home == null || entry.away == null) {
      return true;
    }
    return !match.filled;
  }

  isLocked(match: EditableMatchDto): boolean {
    if (match.editable === false) {
      return true;
    }
    if (!match.kickoff_at) {
      return false;
    }
    const kickoffMs = this.parseKickoffUtcMs(match.kickoff_at);
    const now = Date.now();
    const lockFromMs = kickoffMs - 60 * 60 * 1000;
    return now >= lockFromMs;
  }

  /** kickoff_at from API is UTC (with Z suffix). */
  private parseKickoffUtcMs(iso: string): number {
    const normalized =
      iso.endsWith('Z') || iso.includes('+') ? iso : `${iso}Z`;
    return Date.parse(normalized);
  }

  lockLabel(match: EditableMatchDto): string {
    if (!match.kickoff_at) {
      return 'Uzamknuté';
    }
    const kickoffMs = this.parseKickoffUtcMs(match.kickoff_at);
    if (Date.now() >= kickoffMs) {
      return 'Uzamknuté (zápas už začal)';
    }
    return 'Uzamknuté (1 h pred výkopom)';
  }

  getDate(match: EditableMatchDto): string | null {
    if (!match.kickoff_at) {
      return null;
    }
    return new Date(match.kickoff_at).toLocaleDateString('sk-SK', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  async onScoreBlur(match: EditableMatchDto): Promise<void> {
    if (!(await this.ensureLoggedIn())) {
      return;
    }

    if (!this.hasSavedTicketInfo) {
      this.error =
        'Predikcie zápasov je možné zadávať až po uložení celkového víťaza a najlepšieho strelca.';
      return;
    }

    if (this.isLocked(match)) {
      return;
    }

    const entry = this.scores[match.match_id];
    if (
      entry.home == null ||
      entry.away == null ||
      entry.home === ('' as unknown as number) ||
      entry.away === ('' as unknown as number)
    ) {
      return;
    }
    const home = Number(entry.home);
    const away = Number(entry.away);
    if (Number.isNaN(home) || Number.isNaN(away) || home < 0 || away < 0) {
      return;
    }

    const fp = this.fingerprint(match.match_id);
    if (this.lastSaved.get(match.match_id) === fp) {
      return;
    }

    this.savingMatchId = match.match_id;
    this.savedMatchId = null;
    this.error = null;

    try {
      const updated = await firstValueFrom(
        this.api.savePrediction({
          matchId: match.match_id,
          homeScore: home,
          awayScore: away,
        })
      );
      this.applyMatchUpdate(updated);
      this.lastSaved.set(match.match_id, fp);
      this.savedMatchId = match.match_id;
      setTimeout(() => {
        if (this.savedMatchId === match.match_id) {
          this.savedMatchId = null;
        }
      }, 2000);
    } catch (err: unknown) {
      const detail =
        err instanceof HttpErrorResponse
          ? (err.error?.detail as string | undefined)
          : undefined;
      this.error =
        detail || `Uloženie zápasu ${match.home} vs ${match.away} zlyhalo.`;
    } finally {
      this.savingMatchId = null;
    }
  }

  private fingerprint(matchId: string): string {
    const e = this.scores[matchId];
    return `${e.home}:${e.away}`;
  }

  private applyMatchUpdate(updated: EditableMatchDto): void {
    if (!this.ticket) {
      return;
    }
    const idx = this.ticket.editable_matches.findIndex(
      (m) => m.match_id === updated.match_id
    );
    if (idx >= 0) {
      this.ticket.editable_matches[idx] = updated;
    }
  }
}
