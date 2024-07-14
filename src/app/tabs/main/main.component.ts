import { Component } from '@angular/core';
import { CalcService } from '../../services/calc.service';
import { CommonModule } from '@angular/common';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import { Player } from '../../models/player';
import {MatTableModule} from '@angular/material/table';
import { TicketComponent } from '../../ticket/ticket.component';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, MatDividerModule, MatListModule, MatTableModule, TicketComponent, MatIconModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  constructor(public calcService: CalcService, public dialog: MatDialog){}

  displayedColumns: string[] = ['order', 'name', 'points'];
  dataSource: Player[] = [];
  
  ngOnInit(){
    this.calcService.calcPoints();
    this.dataSource = this.calcService.getPlayers();
  }

  ngAfterViewInit(){
    // alert("Nova funkcionalita! Klikni na hráča v tabuľke bodov pre zobrazenie tiketu.")
  }

  onRowClick(row:any){
    const ticket = this.calcService.getPlayers().filter(p=>p.name==row.name)[0].ticket
    console.log(ticket)
    this.dialog.open(TicketComponent, {data: ticket})
  }
 
}
