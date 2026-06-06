import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { firstValueFrom } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { MatchDto, SettingsDto } from '../../models/api.models';

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
    kickoffAt: '',
  };

  constructor(private api: ApiService) {}

  async ngOnInit(): Promise<void> {
    await this.loadAdminSettings();
    await this.loadMatches();
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

  async addMatch(): Promise<void> {
    if (!this.newMatch.matchNumber || !this.newMatch.home || !this.newMatch.away) {
      this.error = 'Zadajte číslo zápasu, domácich aj hostí.';
      return;
    }
    this.error = null;
    this.creatingMatch = true;
    try {
      const kickoffAt = this.newMatch.kickoffAt
        ? new Date(this.newMatch.kickoffAt).toISOString()
        : null;
      await firstValueFrom(
        this.api.createMatch({
          matchNumber: this.newMatch.matchNumber,
          home: this.newMatch.home,
          away: this.newMatch.away,
          kickoffAt,
        })
      );
      this.newMatch = { matchNumber: 0, home: '', away: '', kickoffAt: '' };
      await this.loadMatches();
    } catch {
      this.error = 'Nepodarilo sa pridať zápas.';
    } finally {
      this.creatingMatch = false;
    }
  }
}
