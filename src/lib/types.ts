import { InferSelectModel } from 'drizzle-orm'
import { auction, player, team, tournament } from '@/db/schema'

export type TSingleTournament = InferSelectModel<typeof tournament>
export type TSingleTeam = InferSelectModel<typeof team>
export type TSinglePlayer = InferSelectModel<typeof player>
export type TSingleAuction = InferSelectModel<typeof auction>

export type TReturnType =
  | string
  | TSingleTournament
  | TSingleTournament[]
  | TSingleTeam[]
  | TSingleTeam
  | TSinglePlayer[]
  | TSinglePlayer
  | TSingleAuction
  | TSingleAuction[]
  | null

export type TResponse = {
  data: TReturnType
  success: boolean
  error?: string
}
