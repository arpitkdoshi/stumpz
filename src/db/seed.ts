import { reset } from 'drizzle-seed'
//import { drizzle } from 'drizzle-orm/node-postgres'
import { schema } from './schema'
import { db } from '@/db/index'

const main = async () => {
  // const db = drizzle(process.env.DATABASE_URL!, {
  //   schema,
  // })
  await reset(db, schema)

  // let tournamentId = ''
  // for (let i = 0; i < tournaments.length; i++) {
  //   const tournament = await db
  //     .insert(schema.tournament)
  //     .values({
  //       name: tournaments[i].name,
  //     })
  //     .returning()
  //   tournamentId = tournament[0].id
  //   for (let j = 0; j < tournaments[i].teams.length; j++) {
  //     await db.insert(schema.team).values({
  //       name: tournaments[i].teams[j].name,
  //       tournamentId: tournamentId,
  //     })
  //   }
  //   const strIds: string[] = []
  //   for (let k = 0; k < tournaments[i].players.length; k++) {
  //     const p = await db
  //       .insert(schema.player)
  //       .values({
  //         name: tournaments[i].players[k].name,
  //         tournamentId: tournamentId,
  //       })
  //       .returning()
  //     strIds.push(p[0].id)
  //   }
  //   for (let l = 0; l < tournaments[i].boards.length; l++) {
  //     await db.insert(schema.board).values({
  //       name: tournaments[i].boards[l].name,
  //       tournamentId: tournamentId,
  //       data: [],
  //     })
  //   }
  //   await db.insert(schema.board).values({
  //     name: 'Ungrouped',
  //     tournamentId: tournamentId,
  //     data: strIds,
  //   })
  // }
  // console.log(`-----Tournament records created------`)

  process.exit(0)
}

main().then(() => console.log('Completed'))
