import { getNextId } from '@/lib/utils'
import { relations } from 'drizzle-orm'
import {
  AnyPgColumn,
  date,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core'

export const powerOverVal = [
  'In first x Overs',
  'Any Over',
  'Last ball of Every Over',
] as const

export const powerOverEnum = pgEnum('powerOverEnum', powerOverVal)

export const playerRoleVal = ['Batsman', 'Bowler', 'All-Rounder'] as const

export const playerRoleEnum = pgEnum('playerRoleEnum', playerRoleVal)

export const tShirtSizeVal = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL'] as const

export const tShirtSizeEnum = pgEnum('tShirtSizeEnum', tShirtSizeVal)

export const auctionStatus = [
  'Not Started',
  'In Progress',
  'Paused',
  'Completed',
] as const

export const auctionStatusEnum = pgEnum('auctionStatusEnum', auctionStatus)

export type AuctionStatusValues = (typeof auctionStatusEnum.enumValues)[number]

export const changeKey = [
  'INIT',
  'STATUS_CHANGE',
  'GROUP_CHANGE',
  'PLAYER_CHANGE',
] as const

export const changeKeyEnum = pgEnum('changeKeyEnum', changeKey)

export type ChangeKeyValues = (typeof changeKeyEnum.enumValues)[number]

export type TournamentOtherSettings = {
  groups: string[]
  tShirtColors: Record<string, string>[]
}

export type TAuctionMeta = {
  currentGroup: string
  totalPlayers: number
  soldPlayers: number
  currentBid: number
  currentBidTeam: { name: ''; img_url: ''; id: '' }
  currentPlayer: { name: string; img_url: string; role: string; id: string }
  historyOfBids: { bidAmount: number; team: string }[]
}

export const tournament = pgTable('tournament', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => getNextId()),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text('name').notNull().unique(),
  totalTeams: integer('total_teams'),
  logo_url: text('logo_url'),
  banner_url: text('banner_url'),
  playersPerTeam: integer('players_per_team').default(0),
  numOfOvers: integer('num_of_overs').default(0),
  date: date('date', { mode: 'date' }),
  powerOver: powerOverEnum('powerOver').notNull().default('In first x Overs'),
  xOver: integer('xOver').default(0),
  totalMatches: integer('total_matches').default(0),
  otherSettings: jsonb('other_settings').$type<TournamentOtherSettings>(),
  currentAuctionId: text('current_auction_id').references(
    (): AnyPgColumn => auction.id,
    {
      onDelete: 'set null',
    },
  ),
})

export const tournamentRelations = relations(tournament, ({ one, many }) => ({
  teams: many(team, {
    relationName: 'relTeamTournament',
  }),
  players: many(player, {
    relationName: 'relPlayerTournament',
  }),
  auctions: many(auction, {
    relationName: 'relAuctionTournament',
  }),
  currentAuction: one(auction, {
    fields: [tournament.currentAuctionId],
    references: [auction.id],
    relationName: 'relCurrentAuctionTournament',
  }),
}))

export type TPowerOver = (typeof powerOverVal)[number]

export const team = pgTable('team', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => getNextId()),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text('name').notNull().unique(),
  logo_url: text('logo_url'),
  tShirtColor: text('tshirt_color'),
  ownerName: text('owner_name'),
  tournamentId: text('tournament_id')
    .notNull()
    .references(() => tournament.id, { onDelete: 'cascade' }),
})

export const teamRelations = relations(team, ({ one, many }) => ({
  tournament: one(tournament, {
    fields: [team.tournamentId],
    references: [tournament.id],
    relationName: 'relTeamTournament',
  }),
  players: many(player, {
    relationName: 'relPlayerTeam',
  }),
}))

export const player = pgTable('players', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => getNextId()),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  name: text('name').notNull().unique(),
  img_url: text('img_url'),
  tShirtSize: tShirtSizeEnum('size').notNull().default('L'),
  role: playerRoleEnum('role').notNull().default('Batsman'),
  basePrice: integer('base_price'),
  group: text('group'),
  teamId: text('team_id').references(() => team.id, { onDelete: 'cascade' }),
  tournamentId: text('tournament_id')
    .notNull()
    .references(() => tournament.id, { onDelete: 'cascade' }),
})

export const playerRelations = relations(player, ({ one, many }) => ({
  tournament: one(tournament, {
    fields: [player.tournamentId],
    references: [tournament.id],
    relationName: 'relPlayerTournament',
  }),
  team: one(team, {
    fields: [player.teamId],
    references: [team.id],
    relationName: 'relPlayerTeam',
  }),
}))

export const auction = pgTable('auction', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => getNextId()),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  changeKey: changeKeyEnum('change_key').notNull().default('INIT'),
  status: auctionStatusEnum('status').notNull().default('Not Started'),
  auctionMeta: jsonb('auction_Meta').$type<TAuctionMeta>(),
  tournamentId: text('tournament_id')
    .notNull()
    .references(() => tournament.id, { onDelete: 'cascade' }),
})

export const auctionRelations = relations(auction, ({ one, many }) => ({
  tournament: one(tournament, {
    fields: [auction.tournamentId],
    references: [tournament.id],
    relationName: 'relAuctionTournament',
  }),
}))

export const schema = {
  tournament,
  team,
  player,
  auction,
  tournamentRelations,
  teamRelations,
  playerRelations,
  auctionRelations,
}
