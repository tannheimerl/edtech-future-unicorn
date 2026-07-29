import Database from '@tauri-apps/plugin-sql'
import { invoke } from '@tauri-apps/api/core'
import { SCHEMA_STATEMENTS } from '@/lib/schema'

let dbPromise: Promise<Database> | null = null

const openDb = async (): Promise<Database> => {
  const path = await invoke<string | null>('get_db_path')
  if (!path) throw new Error('Kein Datenbankpfad konfiguriert.')
  const db = await Database.load(`sqlite:${path}`)
  for (const statement of SCHEMA_STATEMENTS) await db.execute(statement)
  return db
}

export const getDb = (): Promise<Database> => {
  if (!dbPromise) dbPromise = openDb()
  return dbPromise
}

// Closes the active connection and drops the cache so the next getDb() call
// reopens against whatever path is now configured (see lib/db-settings.ts).
export const resetDbConnection = async (): Promise<void> => {
  if (dbPromise) {
    const db = await dbPromise
    await db.close()
  }
  dbPromise = null
}

export const toInt = (b: boolean): number => (b ? 1 : 0)
