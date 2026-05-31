import { Component, Inject } from '@angular/core';
import { TicketDto } from '../models/api.models';
import { CommonModule } from '@angular/common';
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

  constructor(@Inject(MAT_DIALOG_DATA) public ticket: TicketDto) {}

  get breakdown() {
    return this.ticket.match_breakdown ?? [];
  }
}
