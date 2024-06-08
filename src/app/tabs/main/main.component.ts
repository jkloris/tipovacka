import { Component } from '@angular/core';
import { CalcService } from '../../services/calc.service';
import { CommonModule } from '@angular/common';
import {MatDividerModule} from '@angular/material/divider';
import {MatListModule} from '@angular/material/list';
import { Player } from '../../models/player';
import {MatTableModule} from '@angular/material/table';
@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, MatDividerModule, MatListModule, MatTableModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css'
})
export class MainComponent {
  constructor(public calcService: CalcService){}

  displayedColumns: string[] = ['order', 'name', 'points'];
  dataSource: Player[] = [];
  
  ngOnInit(){
    this.calcService.calcPoints();
    this.dataSource = this.calcService.getPlayers();
  }
 
}
