import type { SQLiteColumn, SQLiteTable } from 'drizzle-orm/sqlite-core'
import { getDrizzle } from './client'

// Generic INSERT ... ON CONFLICT DO UPDATE for any drizzle table, mirroring
// the raw-SQL upsert() helper this replaces.
export const upsert = async (
  table: SQLiteTable,
  data: Record<string, unknown>,
  conflictCols: string[] = ['id'],
) => {
  const db = getDrizzle()
  const columns = table as unknown as Record<string, SQLiteColumn>
  const set = Object.fromEntries(
    Object.entries(data).filter(([k]) => !conflictCols.includes(k)),
  )
  await db.insert(table).values(data).onConflictDoUpdate({
    target: conflictCols.map((c) => columns[c]),
    set,
  })
}
