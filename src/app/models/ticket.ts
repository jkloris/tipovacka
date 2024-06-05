import { Match } from "./match"

export interface Ticket{
    winner1: string
    winner2: string
    topStriker: string

    matches: Match[]
}