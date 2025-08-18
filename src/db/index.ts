import 'dotenv/config'
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { schema } from './schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
})
export const db: NodePgDatabase<typeof schema> = drizzle({
  schema: schema,
  client: pool,
})
