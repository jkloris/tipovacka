import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CalcService {
  getMatchId(home: string, away: string): string {
    return `${home.slice(0, 4)}:${away.slice(0, 4)}`;
  }
}
