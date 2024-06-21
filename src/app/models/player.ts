import { Ticket } from "./ticket"

export class Player{
    
    name: string = ""
    points: number = 0
    ticket!: Ticket

    constructor(name: string){
        this.name = name
    }
}