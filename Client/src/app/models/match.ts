export class Match{
    home: string = ""
    away: string = ""
    homeScore: number = -1
    awayScore: number = -1

    constructor(home: string, away: string){
        this.home = home
        this.away = away
    }

    setScore(homeScore: number, awayScore: number){
        this.homeScore = homeScore
        this.awayScore = awayScore
    }

    getWinner(): number{
        if(this.homeScore > this.awayScore){
            return 1
        } else if(this.homeScore < this.awayScore){
            return 2
        }
        return 0
    }

    
}