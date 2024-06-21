import { Component, Inject, Input } from '@angular/core';
import { Ticket } from '../models/ticket';
import { CommonModule } from '@angular/common';
import { Match } from '../models/match';
import { CalcService } from '../services/calc.service';
import {MatIconModule} from '@angular/material/icon'
import { MatDialogTitle, MatDialogContent, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-ticket',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatDialogTitle, MatDialogContent ],
  templateUrl: './ticket.component.html',
  styleUrl: './ticket.component.css'
})
export class TicketComponent {

  constructor(protected calcService: CalcService, @Inject(MAT_DIALOG_DATA) public ticket: Ticket){
  }

  ngOnInit(){

  }

  getMatch(match: Match){
    let id = this.calcService.getMatchId(match)
    return this.ticket.matches[id]
  }

  getPoints(match: Match){
    let pm = this.getMatch(match) as Match
    return this.calcService.calcPointsForMatch(match, pm)
  }


  
}
