import Database from '@tauri-apps/plugin-sql'
import { invoke } from '@tauri-apps/api/core'
import { MIGRATION_STATEMENTS, SCHEMA_STATEMENTS } from '@/lib/schema'

let dbPromise: Promise<Database> | null = null

const openDb = async (): Promise<Database> => {
  const path = await invoke<string | null>('get_db_path')
  if (!path) throw new Error('Kein Datenbankpfad konfiguriert.')
  const db = await Database.load(`sqlite:${path}`)
  for (const statement of SCHEMA_STATEMENTS) await db.execute(statement)
  // Column-level migrations are best-effort by design: SQLite can't express
  // "ADD/DROP COLUMN IF (NOT) EXISTS", so on an up-to-date database each one
  // simply errors out and is skipped. Order matters — see MIGRATION_STATEMENTS.
  for (const statement of MIGRATION_STATEMENTS) {
    try {
      await db.execute(statement)
    } catch {
      // Already applied (or never applicable) — nothing to do.
    }
  }
  return db
}

export const getDb = (): Promise<Database> => {
  if (!dbPromise) {
    // Drop a *failed* attempt from the cache. A rejected promise is still
    // truthy, so caching it would make every later call — retries, and the
    // "andere Datenbank wählen" recovery flows — fail with the original
    // error forever, locking the user out with no way back.
    const attempt = openDb()
    attempt.catch(() => {
      if (dbPromise === attempt) dbPromise = null
    })
    dbPromise = attempt
  }
  return dbPromise
}

// Closes the active connection and drops the cache so the next getDb() call
// reopens against whatever path is now configured (see lib/db-settings.ts).
export const resetDbConnection = async (): Promise<void> => {
  const pending = dbPromise
  // Clear first: the cache must end up empty even if the pending attempt
  // rejected, otherwise switching away from a broken database is impossible.
  dbPromise = null
  if (!pending) return
  try {
    await (await pending).close()
  } catch {
    // Never opened, or already closed — nothing left to release.
  }
}

export const toInt = (b: boolean): number => (b ? 1 : 0)
