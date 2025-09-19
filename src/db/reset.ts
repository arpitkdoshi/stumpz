import { reset } from 'drizzle-seed'
//import { drizzle } from 'drizzle-orm/node-postgres'
import { schema } from './schema'
import { db } from '@/db/index'

const main = async () => {
  // const db = drizzle(process.env.DATABASE_URL!, {
  //   schema,
  // })
  await reset(db, schema)
  console.log(`-----Database reset completed-----`)

  process.exit(0)
}

main().then(() => console.log('Completed'))
