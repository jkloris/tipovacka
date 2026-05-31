import { Component, OnInit } from '@angular/core';
import { CalcService } from '../../services/calc.service';
import { CommonModule } from '@angular/common';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import {MatTableModule} from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { TicketComponent } from '../../ticket/ticket.component';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../services/api.service';
import { LeaderboardEntry, MatchDto } from '../../models/api.models';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, MatDividerModule, MatListModule, MatTableModule, MatIconModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent implements OnInit {
  constructor(
    public calcService: CalcService,
    public dialog: MatDialog,
    private api: ApiService
  ) {}

  displayedColumns: string[] = ['order', 'name', 'points'];
  dataSource: LeaderboardEntry[] = [];
  matches: MatchDto[] = [];

  async ngOnInit() {
    this.dataSource = await firstValueFrom(this.api.getLeaderboard());
    this.matches = await firstValueFrom(this.api.getMatches());
  }

  async onRowClick(row: LeaderboardEntry) {
    const ticket = await firstValueFrom(this.api.getPlayerTicket(row.name));
    this.dialog.open(TicketComponent, { data: ticket, width: '90vw', maxWidth: '600px' });
  }
}
