import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client.js'
import dotenv from 'dotenv'
import path from 'path'
import pg from 'pg'

dotenv.config({ path: path.resolve(process.cwd(), '.env') })

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('DATABASE_URL is not set')
}

const pool = new pg.Pool({
  connectionString,
  max: 5,
  idleTimeoutMillis: 0,
  connectionTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

export default prisma