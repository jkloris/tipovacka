import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
  error: string | null = null;

  ticket: MyTicketDto | null = null;
  scores: Record<string, ScoreEntry> = {};
  private lastSaved = new Map<string, string>();

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

  async loadTicket(): Promise<void> {
    if (!this.auth.isLoggedIn()) {
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      this.ticket = await firstValueFrom(this.api.getMyTicket());
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

  async onScoreBlur(match: EditableMatchDto): Promise<void> {
    if (!(await this.ensureLoggedIn())) {
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
    } catch {
      this.error = `Uloženie zápasu ${match.home} vs ${match.away} zlyhalo.`;
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
