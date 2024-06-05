export class Match{
    home: string = ""
    away: string = ""
    homeScore: number = 0
    awayScore: number = 0

    constructor(home: string, away: string){
        this.home = home
        this.away = away
    }

    setScore(homeScore: number, awayScore: number){
        this.homeScore = homeScore
        this.awayScore = awayScore
    }

    
}