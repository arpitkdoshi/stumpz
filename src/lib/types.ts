import { InferSelectModel } from 'drizzle-orm'
import { player, team, tournament } from '@/db/schema'

export type TSingleTournament = InferSelectModel<typeof tournament>
export type TSingleTeam = InferSelectModel<typeof team>
export type TSinglePlayer = InferSelectModel<typeof player>

export type TReturnType =
  | string
  | TSingleTournament
  | TSingleTournament[]
  | TSingleTeam[]
  | TSingleTeam
  | TSinglePlayer[]
  | TSinglePlayer
  | null

export type TResponse = {
  data: TReturnType
  success: boolean
  error?: string
}
