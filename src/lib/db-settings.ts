import { invoke } from '@tauri-apps/api/core'
import { open, save } from '@tauri-apps/plugin-dialog'
import { getDb, resetDbConnection } from '@/lib/db'

const DB_FILTERS = [{ name: 'SQLite-Datenbank', extensions: ['db', 'sqlite', 'sqlite3'] }]

// Null until the user has picked a database location (first launch).
export const getDbPath = (): Promise<string | null> => invoke<string | null>('get_db_path')

export const isDbConfigured = async (): Promise<boolean> => (await getDbPath()) !== null

// Points the app at a new (not-yet-existing) file location and switches the
// live connection over to it. "Neue Datenbank anlegen".
export const createNewDb = async (): Promise<string | null> => {
  const target = await save({ filters: DB_FILTERS, defaultPath: 'lezio.db' })
  if (!target) return null
  await resetDbConnection()
  await invoke('set_db_path', { path: target })
  await getDb()
  return target
}

// Points the app directly at an existing database file (no copy) and
// switches the live connection over to it. "Bestehende Datenbank laden".
export const loadExistingDb = async (): Promise<string | null> => {
  const source = await open({ filters: DB_FILTERS, multiple: false, directory: false })
  if (!source || Array.isArray(source)) return null
  await resetDbConnection()
  await invoke('set_db_path', { path: source })
  await getDb()
  return source
}

// Copies an existing database file over the current one and switches to it.
export const importDb = async (): Promise<boolean> => {
  const source = await open({ filters: DB_FILTERS, multiple: false, directory: false })
  if (!source || Array.isArray(source)) return false
  await resetDbConnection()
  await invoke('import_db', { source })
  await getDb()
  return true
}

// Copies the current database file to a location the user picks.
export const exportDb = async (): Promise<string | null> => {
  const dest = await save({ filters: DB_FILTERS, defaultPath: 'lezio-export.db' })
  if (!dest) return null
  await invoke('export_db', { dest })
  return dest
}
