// Seeds a local Lezio SQLite database with the sample data from seed-data.ts.
//
// Usage:
//   npm run seed                          # seeds the default per-OS app-data location
//   npm run seed -- --db=/path/to/lezio.db  # seeds a specific file (e.g. a fresh dev DB)
//
// The default path mirrors src-tauri/src/db_settings.rs::default_db_path() so
// running this against a freshly-installed app "just works". Existing rows in
// every seeded table are cleared first, so the script is safe to re-run.
import Database from 'better-sqlite3'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { mkdirSync } from 'node:fs'
import { SCHEMA_STATEMENTS } from '../src/lib/schema'
import {
  SEED_FAECHER, SEED_THEMEN, SEED_LERNZIELE, SEED_LERNZIELE_RILZ,
  SEED_LEHRPERSONEN, SEED_CLASSES, SEED_STUDENTS, SEED_KOMMENTARE,
} from './seed-data'

const APP_IDENTIFIER = 'com.lezio.app'

const defaultDbPath = (): string => {
  switch (process.platform) {
    case 'darwin':
      return join(homedir(), 'Library', 'Application Support', APP_IDENTIFIER, 'lezio.db')
    case 'win32':
      return join(process.env.APPDATA ?? join(homedir(), 'AppData', 'Roaming'), APP_IDENTIFIER, 'lezio.db')
    default:
      return join(process.env.XDG_DATA_HOME ?? join(homedir(), '.local', 'share'), APP_IDENTIFIER, 'lezio.db')
  }
}

const dbArg = process.argv.find((a) => a.startsWith('--db='))
const dbPath = dbArg ? dbArg.slice('--db='.length) : defaultDbPath()

mkdirSync(join(dbPath, '..'), { recursive: true })
const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

for (const statement of SCHEMA_STATEMENTS) db.exec(statement)

const arr = (v: unknown): string => JSON.stringify(v ?? [])
const int = (b: boolean | undefined): number => (b ? 1 : 0)

const seed = db.transaction(() => {
  // Clear seeded tables (children before parents) so re-running is safe.
  for (const table of [
    'fact_kommentare', 'fact_thema_kommentare', 'fact_pruefung_ergebnisse', 'fact_pruefungen',
    'fact_rilz_lernziele', 'fact_lernziel_status', 'dim_schueler',
    'bridge_lp_zuweisungen', 'bridge_klasse_themen', 'dim_klassen',
    'dim_lernziele', 'dim_themen', 'dim_lehrpersonen', 'dim_faecher',
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

  const insertThema = db.prepare(`
    INSERT INTO dim_themen (id, fach_id, name, typ, standard_thema_id, faellig_am, stufe, zyklus, autor, autor_lp_id, tags)
    VALUES (@id, @fachId, @name, @typ, @standardThemaId, @faelligAm, @stufe, @zyklus, @autor, @autorLpId, @tags)
  `)
  for (const t of SEED_THEMEN) insertThema.run({
    id: t.id, fachId: t.fachId, name: t.name,
    typ: t.typ ?? 'standard',
    standardThemaId: t.standardThemaId ?? null,
    faelligAm: t.faelligAm ?? null,
    stufe: t.stufe ? arr(t.stufe) : null,
    zyklus: t.zyklus ? arr(t.zyklus) : null,
    autor: t.autor ?? null,
    autorLpId: t.autorLpId ?? null,
    tags: t.tags ? JSON.stringify(t.tags) : '{}',
  })

  const insertLernziel = db.prepare(`
    INSERT INTO dim_lernziele (id, thema_id, kategorie, label, kriterien, stufe, beschreibung)
    VALUES (@id, @themaId, @kategorie, @label, @kriterien, @stufe, @beschreibung)
  `)
  for (const l of [...SEED_LERNZIELE, ...SEED_LERNZIELE_RILZ]) insertLernziel.run({
    id: l.id, themaId: l.themaId, kategorie: l.kategorie, label: l.label,
    kriterien: l.kriterien ? arr(l.kriterien) : null,
    stufe: l.stufe ? arr(l.stufe) : null,
    beschreibung: l.beschreibung ?? null,
  })

  const insertKlasse = db.prepare(`
    INSERT INTO dim_klassen (id, name, schuljahr, vorgaenger_klasse_id, settings)
    VALUES (@id, @name, @schuljahr, @vorgaengerKlasseId, @settings)
  `)
  const insertKlasseThema = db.prepare(`
    INSERT INTO bridge_klasse_themen (klasse_id, thema_id) VALUES (@klasseId, @themaId)
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
    for (const themaId of k.assignedThemaIds) insertKlasseThema.run({ klasseId: k.id, themaId })
    for (const z of k.lpZuweisungen ?? []) insertLpZuweisung.run({
      id: crypto.randomUUID(), klasseId: k.id, lpId: z.lpId,
      fachIds: arr(z.fachIds), rolle: z.rolle ?? null,
    })
  }

  const insertSchueler = db.prepare(`
    INSERT INTO dim_schueler (id, klasse_id, vorname, nachname, note, bvsa, rilz_fach_ids, rilz_thema_ids, competency_status, lernziel_versuche, progress_history)
    VALUES (@id, @klasseId, @vorname, @nachname, @note, @bvsa, @rilzFachIds, @rilzThemaIds, @competencyStatus, @lernzielVersuche, @progressHistory)
  `)
  const insertLernzielStatus = db.prepare(`
    INSERT INTO fact_lernziel_status (schueler_id, lernziel_id, status) VALUES (@schuelerId, @lernzielId, @status)
  `)
  const insertRilzLernziel = db.prepare(`
    INSERT INTO fact_rilz_lernziele (id, schueler_id, thema_id, label, status)
    VALUES (@id, @schuelerId, @themaId, @label, @status)
  `)
  for (const s of SEED_STUDENTS) {
    insertSchueler.run({
      id: s.id, klasseId: s.klassId, vorname: s.vorname, nachname: s.nachname,
      note: s.note ?? '', bvsa: int(s.bvsa),
      rilzFachIds: arr(s.rilzFachIds), rilzThemaIds: arr(s.rilzThemaIds),
      competencyStatus: JSON.stringify(s.competencyStatus),
      lernzielVersuche: JSON.stringify(s.lernzielVersuche ?? {}),
      progressHistory: arr(s.progressHistory),
    })
    for (const [lernzielId, status] of Object.entries(s.lernzielStatus)) {
      insertLernzielStatus.run({ schuelerId: s.id, lernzielId, status })
    }
    for (const rl of s.rilzLernziele ?? []) {
      insertRilzLernziel.run({ id: rl.id, schuelerId: s.id, themaId: rl.themaId, label: rl.label, status: rl.status })
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
