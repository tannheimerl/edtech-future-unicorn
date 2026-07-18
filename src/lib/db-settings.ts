import { invoke } from '@tauri-apps/api/core'
import { open, save } from '@tauri-apps/plugin-dialog'
import { getDb, resetDbConnection } from '@/lib/db'

const DB_FILTERS = [{ name: 'SQLite-Datenbank', extensions: ['db', 'sqlite', 'sqlite3'] }]

export const getDbPath = (): Promise<string> => invoke<string>('get_db_path')

// Points the app at a new (possibly not-yet-existing) file location and
// switches the live connection over to it.
export const changeDbPath = async (): Promise<string | null> => {
  const target = await save({ filters: DB_FILTERS, defaultPath: 'lezio.db' })
  if (!target) return null
  await resetDbConnection()
  await invoke('set_db_path', { path: target })
  await getDb()
  return target
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

// Reverts to the default database location inside the app data directory.
export const resetDbPath = async (): Promise<string> => {
  await resetDbConnection()
  const path = await invoke<string>('reset_db_path')
  await getDb()
  return path
}
