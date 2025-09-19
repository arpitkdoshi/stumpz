import { reset } from 'drizzle-seed'
//import { drizzle } from 'drizzle-orm/node-postgres'
import { schema } from './schema'
import { db } from '@/db/index'
import { tournaments } from '@/db/seed-data'
import { eq } from 'drizzle-orm'

const main = async () => {
  // const db = drizzle(process.env.DATABASE_URL!, {
  //   schema,
  // })
  await reset(db, schema)

  const ids: { tournamentId: string; auctionId: string }[] = []
  let tournamentId = ''
  for (let i = 0; i < tournaments.length; i++) {
    const tournament = await db
      .insert(schema.tournament)
      .values({
        name: tournaments[i].name,
        totalTeams: tournaments[i].totalTeams,
        playersPerTeam: tournaments[i].playersPerTeam,
        numOfOvers: tournaments[i].numOfOvers,
        xOver: tournaments[i].xOver,
        otherSettings: JSON.parse(tournaments[i].otherSettings),
      })
      .returning()
    tournamentId = tournament[0].id
    for (let j = 0; j < tournaments[i].teams.length; j++) {
      await db.insert(schema.team).values({
        name: tournaments[i].teams[j].name,
        tournamentId: tournamentId,
        ownerName: tournaments[i].teams[j].ownerName,
        tShirtColor: tournaments[i].teams[j].tShirtColor,
      })
    }
    const strIds: string[] = []
    for (let k = 0; k < tournaments[i].players.length; k++) {
      const p = await db
        .insert(schema.player)
        .values({
          name: tournaments[i].players[k].name,
          tournamentId: tournamentId,
          group: tournaments[i].players[k].group,
          role: tournaments[i].players[k].role as
            | 'Batsman'
            | 'All-Rounder'
            | 'Bowler',
        })
        .returning()
      strIds.push(p[0].id)
    }
    const auc = await db
      .insert(schema.auction)
      .values({
        auctionMeta: {
          currentGroup: '',
          totalPlayers: 0,
          soldPlayers: 0,
          currentBid: 0,
          currentBidTeam: { name: '', img_url: '', id: '' },
          currentPlayer: { name: '', img_url: '', role: '', id: '' },
          historyOfBids: [],
        },
        tournamentId: tournamentId,
      })
      .returning()
    ids.push({ tournamentId, auctionId: auc[0].id })
    // Update Auction Id to tournament
    await db
      .update(schema.tournament)
      .set({ currentAuctionId: auc[0].id })
      .where(eq(schema.tournament.id, tournamentId))
  }
  console.log(`-----Tournament records created------`)
  console.log(JSON.stringify(ids, null, 2))

  process.exit(0)
}

main().then(() => console.log('Completed'))
