import { Injectable } from '@angular/core';
import { Player } from '../models/player';
import { Match } from '../models/match';
import { euro } from '../../../public/euro';

@Injectable({
  providedIn: 'root'
})
export class CalcService {

  constructor() { }
  private players: Player[] = [
    {
      name: 'Alice',
      points: 0,
      ticket: null
    },
    {
      name: 'Bob',
      points: 2,
      ticket: null
    },
    {
      name: 'Cathy',
      points: 0,
      ticket: null
    },
    {
      name: 'Derek',
      points: 3,
      ticket: null
    },
    {
      name: 'Eric',
      points: 1,
      ticket: null
    }

  ]

  private matches: Match[] = this.parseMatches()

  getPlayers(){
    this.sortPlayers()
    return this.players
  }

  sortPlayers(){
    this.players.sort((a,b) => b.points - a.points)
  }

  getMatches(){
    return this.matches
  }

  parseMatches(){
    let matches = []
    for(let r of euro.rounds){
      for(let m of r.matches){
        matches.push(new Match(m.team1.name, m.team2.name))
      }
    }
    return matches
  }



}
