import { Injectable } from '@angular/core';
import { Player } from '../models/player';
import { Match } from '../models/match';
import { euro } from '../../../public/euro';
import { ondro_ticket } from '../../../public/tickets/ondro';
import { jergi_ticket } from '../../../public/tickets/jergi';
import { kubo_ticket } from '../../../public/tickets/kubo';
import { tabi_ticket } from '../../../public/tickets/tabi';
import { ivo_ticket } from '../../../public/tickets/ivo';
import { plcho_ticket } from '../../../public/tickets/plcho';
import { mato_ticket } from '../../../public/tickets/mato';

@Injectable({
  providedIn: 'root'
})
export class CalcService {

  constructor() { }
  private players: Player[] = [
    

    {
      name: 'Jergi',
      points: 0,
      ticket: jergi_ticket
    },
    {
      name: 'Ondro',
      points: 0,
      ticket: ondro_ticket
    },
    {
      name: 'Kubo',
      points: 0,
      ticket: kubo_ticket
    },
    {
      name: 'Tabi',
      points: 0,
      ticket: tabi_ticket
    },
    {
      name: 'Ivo',
      points: 0,
      ticket: ivo_ticket
    },
    {
      name: 'Plcho',
      points: 0,
      ticket: plcho_ticket
    },
    {
      name: 'Mato',
      points: 0,
      ticket: mato_ticket
    }

  ]

  private matches: Match[] = this.parseMatches()

  getPlayers(){
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
    matches[0].setScore(5,1)
    matches[1].setScore( 1,3)
    matches[2].setScore( 3,0)
    matches[3].setScore( 2,1)
    matches[4].setScore( 1,1)
    matches[5].setScore( 0,1)
    matches[6].setScore( 1,2)
    matches[7].setScore( 0,1)
    matches[8].setScore( 3,0)
    matches[9].setScore( 0,1)
    matches[10].setScore(3,1)
    matches[11].setScore(2,1)
    matches[12].setScore(2,0)
    matches[13].setScore(1,1)
    matches[14].setScore(2,2)
    matches[15].setScore(1,0)
    matches[16].setScore(1,1)
    matches[17].setScore(1,1)



    return matches
  }

  getMatchId(match: Match){
    return `${match.home.slice(0,4)}:${match.away.slice(0,4)}`
  }

  calcPoints(){
    for(let player of this.players){
      if(!player.ticket  ) continue
      player.points = 0
      let pm
      for(let m of this.matches){
        if( m.homeScore < 0) continue
        pm = player.ticket.matches[this.getMatchId(m)] as Match
        player.points += this.calcPointsForMatch(m, pm)
      
      }
    }
    this.sortPlayers()
  }

  calcPointsForMatch(match: Match, pm : Match){
    let points = 0
    points += 5 - (Math.abs( pm.homeScore - match.homeScore) + Math.abs( pm.awayScore - match.awayScore)) 
    points += match.getWinner() === this.abstractMatchWinner(pm)? 5 : 0
    return points
  }

  abstractMatchWinner(m : Match){
    if(m.homeScore > m.awayScore){
      return 1
    } else if(m.homeScore < m.awayScore){
        return 2
    }
    return 0
  }


}
