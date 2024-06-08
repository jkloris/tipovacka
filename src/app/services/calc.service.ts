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
      name: 'Ondro',
      points: 0,
      ticket: null
    },
    {
      name: 'Jergi',
      points: 0,
      ticket: {"winner1":"Germany","topStriker":"Mbappe","matches":{"Germ:Scot":{"homeScore":2,"awayScore":0},"Hung:Swit":{"homeScore":1,"awayScore":1},"Spai:Croa":{"homeScore":2,"awayScore":0},"Ital:Alba":{"homeScore":3,"awayScore":0},"Slov:Denm":{"homeScore":1,"awayScore":1},"Serb:Engl":{"homeScore":1,"awayScore":2},"Pola:Neth":{"homeScore":0,"awayScore":2},"Aust:Fran":{"homeScore":1,"awayScore":3},"Roma:Ukra":{"homeScore":1,"awayScore":1},"Belg:Slov":{"homeScore":2,"awayScore":0},"Turk:Geor":{"homeScore":1,"awayScore":1},"Port:Czec":{"homeScore":2,"awayScore":1},"Germ:Hung":{"homeScore":2,"awayScore":2},"Scot:Swit":{"homeScore":0,"awayScore":1},"Croa:Alba":{"homeScore":2,"awayScore":1},"Spai:Ital":{"homeScore":2,"awayScore":1},"Slov:Serb":{"homeScore":1,"awayScore":2},"Denm:Engl":{"homeScore":1,"awayScore":3},"Pola:Aust":{"homeScore":1,"awayScore":3},"Neth:Fran":{"homeScore":1,"awayScore":2},"Slov:Ukra":{"homeScore":1,"awayScore":0},"Belg:Roma":{"homeScore":3,"awayScore":0},"Geor:Czec":{"homeScore":1,"awayScore":3},"Turk:Port":{"homeScore":0,"awayScore":2},"Swit:Germ":{"homeScore":1,"awayScore":2},"Scot:Hung":{"homeScore":2,"awayScore":1},"Alba:Spai":{"homeScore":0,"awayScore":3},"Croa:Ital":{"homeScore":1,"awayScore":2},"Engl:Slov":{"homeScore":3,"awayScore":0},"Denm:Serb":{"homeScore":1,"awayScore":1},"Neth:Aust":{"homeScore":2,"awayScore":1},"Fran:Pola":{"homeScore":3,"awayScore":1},"Slov:Roma":{"homeScore":2,"awayScore":1},"Ukra:Belg":{"homeScore":0,"awayScore":1},"Geor:Port":{"homeScore":0,"awayScore":2},"Czec:Turk":{"homeScore":2,"awayScore":0}}}
    },
    {
      name: 'Kubo',
      points: 0,
      ticket: null
    },
    {
      name: 'Tabi',
      points: 0,
      ticket: null
    },
    {
      name: 'Ivo',
      points: 0,
      ticket: null
    },
    {
      name: 'Plcho',
      points: 0,
      ticket: null
    },
    {
      name: 'Reno',
      points: 0,
      ticket: null
    },
    {
      name: 'Mato',
      points: 0,
      ticket: null
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
    // matches[0].setScore(1,0)
    // matches[1].setScore(1,4)
    // matches[2].setScore(2,1)
    // matches[3].setScore(2,2)
    // matches[4].setScore(4,0)
    // matches[5].setScore(1,0)
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
        player.points += 5 - (Math.abs( pm.homeScore - m.homeScore) + Math.abs( pm.awayScore - m.awayScore)) 
        player.points += m.getWinner() === this.abstractMatchWinner(pm)? 5 : 0
      
      }
    }
    this.sortPlayers()
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
