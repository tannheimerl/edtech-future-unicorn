// Seeds a local Lezio SQLite database with the sample data from seed-data.ts.
//
// Usage:
//   npm run seed                          # seeds the app's *currently configured* DB
//   npm run seed -- --db=/path/to/lezio.db  # seeds a specific file (e.g. a fresh dev DB)
//
// Path resolution mirrors src-tauri/src/db_settings.rs::get_db_path(): if the
// app has a custom path saved in db-settings.json (set via the in-app
// Datenbank-Einstellungen), that file is seeded — NOT the per-OS default —
// since that's the file the running app actually reads from. Only falls back
// to the default app-data location if no custom path is configured. Existing
// rows in every seeded table are cleared first, so the script is safe to re-run.
import Database from 'better-sqlite3'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync, existsSync, readFileSync } from 'node:fs'
import { SCHEMA_STATEMENTS } from '../src/lib/schema'
import {
  SEED_FAECHER, SEED_LERNKONTROLLEN, SEED_LERNZIELE, SEED_LERNZIELE_RILZ,
  SEED_LEHRPERSONEN, SEED_CLASSES, SEED_STUDENTS, SEED_KOMMENTARE,
} from './seed-data'

const APP_IDENTIFIER = 'com.lezio.app'

// Mirrors the per-OS app-data directory Tauri resolves for this app identifier.
const appDataDir = (): string => {
  switch (process.platform) {
    case 'darwin':
      return join(homedir(), 'Library', 'Application Support', APP_IDENTIFIER)
    case 'win32':
      return join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), APP_IDENTIFIER)
    default:
      return join(process.env.XDG_DATA_HOME ?? join(homedir(), '.local', 'share'), APP_IDENTIFIER)
  }
}

const defaultDbPath = (): string => join(appDataDir(), 'lezio.db')

// Reads db-settings.json the same way db_settings.rs::get_db_path() does:
// a custom path set via the in-app "Datenbank" settings takes priority over
// the default location.
const configuredDbPath = (): string | null => {
  const settingsPath = join(appDataDir(), 'db-settings.json')
  if (!existsSync(settingsPath)) return null
  try {
    const raw = JSON.parse(readFileSync(settingsPath, 'utf-8')) as { db_path?: string }
    return raw.db_path || null
  } catch {
    return null
  }
}

const dbArg = process.argv.find((a) => a.startsWith('--db='))
const dbPath = dbArg ? dbArg.slice('--db='.length) : (configuredDbPath() ?? defaultDbPath())
console.log(`Seeding ${dbPath}${dbArg ? ' (--db flag)' : configuredDbPath() ? ' (custom path from db-settings.json)' : ' (default app-data path)'}`)

mkdirSync(join(dbPath, '..'), { recursive: true })
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

for (const statement of SCHEMA_STATEMENTS) db.exec(statement)

const arr = (v: unknown): string => JSON.stringify(v ?? [])
const int = (b: boolean | undefined): number => (b ? 1 : 0)

const seed = db.transaction(() => {
  // Clear seeded tables (children before parents) so re-running is safe.
  for (const table of [
    'fact_kommentare', 'fact_lernkontrolle_kommentare', 'fact_pruefung_ergebnisse', 'fact_pruefungen',
    'fact_lernziel_status', 'dim_schueler',
    'bridge_lp_zuweisungen', 'dim_klassen',
    'dim_lernziele', 'dim_lernkontrollen', 'dim_lehrpersonen', 'dim_faecher',
  ]) db.exec(`DELETE FROM ${table}`)

  const insertFach = db.prepare(`
    INSERT INTO dim_faecher (id, name, color_index) VALUES (@id, @name, @colorIndex)
  `)
  for (const f of SEED_FAECHER) insertFach.run({ id: f.id, name: f.name, colorIndex: f.colorIndex ?? null })

  const insertLp = db.prepare(`
    INSERT INTO dim_lehrpersonen (id, name, kuerzel) VALUES (@id, @name, @kuerzel)
    ON CONFLICT (id) DO UPDATE SET name = excluded.name, kuerzel = excluded.kuerzel
  `)
  for (const lp of SEED_LEHRPERSONEN) insertLp.run(lp)

  const insertLernkontrolle = db.prepare(`
    INSERT INTO dim_lernkontrollen (id, fach_id, name, typ, standard_lernkontrolle_id, faellig_am, stufe, zyklus, autor, autor_lp_id)
    VALUES (@id, @fachId, @name, @typ, @standardLernkontrolleId, @faelligAm, @stufe, @zyklus, @autor, @autorLpId)
  `)
  for (const t of SEED_LERNKONTROLLEN) insertLernkontrolle.run({
    id: t.id, fachId: t.fachId, name: t.name,
    typ: t.typ ?? 'standard',
    standardLernkontrolleId: t.standardLernkontrolleId ?? null,
    faelligAm: t.faelligAm ?? null,
    stufe: t.stufe ? arr(t.stufe) : null,
    zyklus: t.zyklus ? arr(t.zyklus) : null,
    autor: t.autor ?? null,
    autorLpId: t.autorLpId ?? null,
  })

  const insertLernziel = db.prepare(`
    INSERT INTO dim_lernziele (id, lernkontrolle_id, kategorie, label, kriterien, stufe, beschreibung)
    VALUES (@id, @lernkontrolleId, @kategorie, @label, @kriterien, @stufe, @beschreibung)
  `)
  for (const l of [...SEED_LERNZIELE, ...SEED_LERNZIELE_RILZ]) insertLernziel.run({
    id: l.id, lernkontrolleId: l.lernkontrolleId, kategorie: l.kategorie, label: l.label,
    kriterien: l.kriterien ? arr(l.kriterien) : null,
    stufe: l.stufe ? arr(l.stufe) : null,
    beschreibung: l.beschreibung ?? null,
  })

  const insertKlasse = db.prepare(`
    INSERT INTO dim_klassen (id, name, schuljahr, vorgaenger_klasse_id, settings)
    VALUES (@id, @name, @schuljahr, @vorgaengerKlasseId, @settings)
  `)
  const insertLpZuweisung = db.prepare(`
    INSERT INTO bridge_lp_zuweisungen (id, klasse_id, lp_id, fach_ids, rolle)
    VALUES (@id, @klasseId, @lpId, @fachIds, @rolle)
  `)
  for (const k of SEED_CLASSES) {
    insertKlasse.run({
      id: k.id, name: k.name,
      schuljahr: k.schuljahr ?? null,
      vorgaengerKlasseId: k.vorgaengerKlasseId ?? null,
      settings: k.beurteilungSettings ? JSON.stringify(k.beurteilungSettings) : null,
    })
    for (const z of k.lpZuweisungen ?? []) insertLpZuweisung.run({
      id: crypto.randomUUID(), klasseId: k.id, lpId: z.lpId,
      fachIds: arr(z.fachIds), rolle: z.rolle ?? null,
    })
  }

  const insertSchueler = db.prepare(`
    INSERT INTO dim_schueler (id, klasse_id, vorname, nachname, note, bvsa, rilz_fach_ids, competency_status, lernziel_versuche, progress_history)
    VALUES (@id, @klasseId, @vorname, @nachname, @note, @bvsa, @rilzFachIds, @competencyStatus, @lernzielVersuche, @progressHistory)
  `)
  const insertLernzielStatus = db.prepare(`
    INSERT INTO fact_lernziel_status (schueler_id, lernziel_id, status) VALUES (@schuelerId, @lernzielId, @status)
  `)
  for (const s of SEED_STUDENTS) {
    insertSchueler.run({
      id: s.id, klasseId: s.klassId, vorname: s.vorname, nachname: s.nachname,
      note: s.note ?? '', bvsa: int(s.bvsa),
      rilzFachIds: arr(s.rilzFachIds),
      competencyStatus: JSON.stringify(s.competencyStatus),
      lernzielVersuche: JSON.stringify(s.lernzielVersuche ?? {}),
      progressHistory: arr(s.progressHistory),
    })
    for (const [lernzielId, status] of Object.entries(s.lernzielStatus)) {
      insertLernzielStatus.run({ schuelerId: s.id, lernzielId, status })
    }
  }

  const insertKommentar = db.prepare(`
    INSERT INTO fact_kommentare (schueler_id, lernziel_id, text, created_at)
    VALUES (@schuelerId, @lernzielId, @text, @createdAt)
  `)
  for (const k of SEED_KOMMENTARE) insertKommentar.run({
    schuelerId: k.studentId, lernzielId: k.lernzielId, text: k.text, createdAt: k.createdAt,
  })
})

seed()
db.close()

console.log(`Seeded ${SEED_STUDENTS.length} Schüler across ${SEED_CLASSES.length} Klassen into ${dbPath}`)
