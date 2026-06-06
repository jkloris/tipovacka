import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { MatchDto, PendingUserDto, SettingsDto } from '../../models/api.models';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css',
})
export class AdminComponent implements OnInit {
  loading = false;
  savingSettings = false;
  savingMatchResult: number | null = null;
  creatingMatch = false;
  error: string | null = null;

  pendingUsers: PendingUserDto[] = [];
  approvingUser: number | null = null;
  deletingUser: number | null = null;

  settings: SettingsDto = {
    show_second_winner: true,
    winner_info_readonly: false,
  };

  matches: MatchDto[] = [];
  resultInputs: Record<number, { homeScore: number | null; awayScore: number | null }> = {};

  newMatch = {
    matchNumber: 0,
    home: '',
    away: '',
    kickoffDate: null as Date | null,
    kickoffTime: '',
  };

  constructor(private api: ApiService) {}

  async ngOnInit(): Promise<void> {
    await this.loadAdminSettings();
    await this.loadPendingUsers();
    await this.loadMatches();
  }

  async loadPendingUsers(): Promise<void> {
    try {
      this.pendingUsers = await firstValueFrom(this.api.getPendingUsers());
    } catch {
      this.error = 'Nepodarilo sa načítať čakajúcich používateľov.';
    }
  }

  async loadAdminSettings(): Promise<void> {
    this.loading = true;
    try {
      this.settings = await firstValueFrom(this.api.getAdminSettings());
    } catch {
      this.error = 'Nepodarilo sa načítať administrátorské nastavenia.';
    } finally {
      this.loading = false;
    }
  }

  async loadMatches(): Promise<void> {
    this.loading = true;
    try {
      this.matches = await firstValueFrom(this.api.getMatches());
      this.resultInputs = {};
      for (const match of this.matches) {
        this.resultInputs[match.match_number] = {
          homeScore: match.home_score,
          awayScore: match.away_score,
        };
      }
      this.newMatch.matchNumber = this.matches.reduce((acc, match) => { return match.match_number > acc ? match.match_number : acc }, 0) + 1;
    } catch {
      this.error = 'Nepodarilo sa načítať zápasy.';
    } finally {
      this.loading = false;
    }
  }

  async saveSettings(): Promise<void> {
    this.error = null;
    this.savingSettings = true;
    try {
      this.settings = await firstValueFrom(
        this.api.updateAdminSettings(this.settings)
      );
    } catch {
      this.error = 'Nepodarilo sa uložiť nastavenia.';
    } finally {
      this.savingSettings = false;
    }
  }

  async saveMatchResult(matchNumber: number): Promise<void> {
    const entry = this.resultInputs[matchNumber];
    if (entry.homeScore == null || entry.awayScore == null) {
      this.error = 'Zadajte výsledok pre obidva tímy.';
      return;
    }
    this.error = null;
    this.savingMatchResult = matchNumber;
    try {
      await firstValueFrom(
        this.api.setMatchResult(matchNumber, {
          homeScore: entry.homeScore,
          awayScore: entry.awayScore,
        })
      );
      await this.loadMatches();
    } catch {
      this.error = `Nepodarilo sa uložiť výsledok zápasu ${matchNumber}.`;
    } finally {
      this.savingMatchResult = null;
    }
  }

  async deleteMatch(matchNumber: number): Promise<void> {
    if (!confirm(`Naozaj odstrániť zápas ${matchNumber}?`)) {
      return;
    }
    this.error = null;
    try {
      await firstValueFrom(this.api.deleteMatch(matchNumber));
      await this.loadMatches();
    } catch {
      this.error = `Nepodarilo sa odstrániť zápas ${matchNumber}.`;
    }
  }

  async approveUser(userId: number): Promise<void> {
    this.error = null;
    this.approvingUser = userId;
    try {
      await firstValueFrom(this.api.approveUser(userId));
      await this.loadPendingUsers();
    } catch {
      this.error = `Nepodarilo sa schváliť používateľa ${userId}.`;
    } finally {
      this.approvingUser = null;
    }
  }

  async deletePendingUser(userId: number): Promise<void> {
    if (!confirm('Naozaj odstrániť tento čakajúci účet?')) {
      return;
    }
    this.error = null;
    this.deletingUser = userId;
    try {
      await firstValueFrom(this.api.deletePendingUser(userId));
      await this.loadPendingUsers();
    } catch {
      this.error = `Nepodarilo sa odstrániť používateľa ${userId}.`;
    } finally {
      this.deletingUser = null;
    }
  }

  async addMatch(): Promise<void> {
    if (!this.newMatch.matchNumber || !this.newMatch.home || !this.newMatch.away) {
      this.error = 'Zadajte číslo zápasu, domácich aj hostí.';
      return;
    }
    if (!this.newMatch.kickoffDate) {
      this.error = 'Vyberte dátum výkopu.';
      return;
    }
    this.error = null;
    this.creatingMatch = true;
    try {
      const [hours, minutes] = this.newMatch.kickoffTime
        .split(':')
        .map((value) => parseInt(value, 10));
      const kickoffDate = new Date(this.newMatch.kickoffDate);
      kickoffDate.setHours(Number.isNaN(hours) ? 0 : hours);
      kickoffDate.setMinutes(Number.isNaN(minutes) ? 0 : minutes);
      kickoffDate.setSeconds(0);
      kickoffDate.setMilliseconds(0);

      const kickoffAt = kickoffDate.toISOString();
      await firstValueFrom(
        this.api.createMatch({
          matchNumber: this.newMatch.matchNumber,
          home: this.newMatch.home,
          away: this.newMatch.away,
          kickoffAt,
        })
      );
      this.newMatch = {
        matchNumber: 0,
        home: '',
        away: '',
        kickoffDate: null,
        kickoffTime: '',
      };
      await this.loadMatches();
    } catch {
      this.error = 'Nepodarilo sa pridať zápas.';
    } finally {
      this.creatingMatch = false;
    }
  }
}
