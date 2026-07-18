import { drizzle } from 'drizzle-orm/sqlite-proxy'
import { getDb } from '@/lib/db'
import * as schema from './schema'

type ProxyDb = ReturnType<typeof drizzle<typeof schema>>

let instance: ProxyDb | null = null

// tauri-plugin-sql returns SELECT rows as objects (column -> value); the
// sqlite-proxy driver needs each row as a plain array of values in the same
// order the query selected them, so it can map them back onto typed fields.
const toValueRows = (rows: Record<string, unknown>[]): unknown[][] =>
  rows.map((row) => Object.values(row))

export const getDrizzle = (): ProxyDb => {
  if (!instance) {
    instance = drizzle<typeof schema>(
      async (sqlText, params, method) => {
        const conn = await getDb()
        if (method === 'run') {
          await conn.execute(sqlText, params)
          return { rows: [] }
        }
        const rows = toValueRows(await conn.select<Record<string, unknown>[]>(sqlText, params))
        if (method === 'get') return { rows: (rows[0] ?? []) as unknown[] }
        return { rows }
      },
      { schema },
    )
  }
  return instance
}
