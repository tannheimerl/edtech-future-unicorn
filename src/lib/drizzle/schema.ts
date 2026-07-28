// Drizzle schema mirroring src/lib/schema.ts (the source of truth for DDL).
// DDL is still applied at runtime via SCHEMA_STATEMENTS — this file exists
// purely to give the query builder types; keep it in sync by hand when
// schema.ts changes.
import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core'

const createdAt = () => text('created_at').default(sql`(datetime('now'))`)

export const dimFaecher = sqliteTable('dim_faecher', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  colorIndex: integer('color_index'),
  createdAt: createdAt(),
})

export const dimLehrpersonen = sqliteTable('dim_lehrpersonen', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  kuerzel: text('kuerzel').notNull(),
  createdAt: createdAt(),
})

export const dimLernkontrollen = sqliteTable('dim_lernkontrollen', {
  id: text('id').primaryKey(),
  fachId: text('fach_id').notNull().references(() => dimFaecher.id),
  name: text('name').notNull(),
  typ: text('typ').$type<'standard' | 'rilz'>().default('standard'),
  standardLernkontrolleId: text('standard_lernkontrolle_id'),
  faelligAm: text('faellig_am'),
  stufe: text('stufe'),
  zyklus: text('zyklus'),
  autor: text('autor'),
  autorLpId: text('autor_lp_id').references(() => dimLehrpersonen.id),
  createdAt: createdAt(),
})

export const dimLernziele = sqliteTable('dim_lernziele', {
  id: text('id').primaryKey(),
  lernkontrolleId: text('lernkontrolle_id').notNull().references(() => dimLernkontrollen.id),
  kategorie: text('kategorie').$type<'grundlegend' | 'anspruchsvoll'>().notNull(),
  label: text('label').notNull(),
  kriterien: text('kriterien'),
  stufe: text('stufe'),
  beschreibung: text('beschreibung'),
  createdAt: createdAt(),
})

export const dimKlassen = sqliteTable('dim_klassen', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  schuljahr: text('schuljahr'),
  vorgaengerKlasseId: text('vorgaenger_klasse_id'),
  settings: text('settings'),
  createdAt: createdAt(),
})

export const bridgeLpZuweisungen = sqliteTable('bridge_lp_zuweisungen', {
  id: text('id').primaryKey(),
  klasseId: text('klasse_id').notNull().references(() => dimKlassen.id),
  lpId: text('lp_id').notNull().references(() => dimLehrpersonen.id),
  fachIds: text('fach_ids').notNull().default('[]'),
  rolle: text('rolle').$type<'klassenlehrperson' | 'fachlehrperson' | 'heilpaedagogin'>(),
}, (t) => [
  uniqueIndex('bridge_lp_zuweisungen_klasse_lp').on(t.klasseId, t.lpId),
])

export const dimSchueler = sqliteTable('dim_schueler', {
  id: text('id').primaryKey(),
  klasseId: text('klasse_id').notNull().references(() => dimKlassen.id),
  vorname: text('vorname').notNull(),
  nachname: text('nachname').notNull(),
  note: text('note').default(''),
  bvsa: integer('bvsa').default(0),
  rilzFachIds: text('rilz_fach_ids').default('[]'),
  competencyStatus: text('competency_status').default('{}'),
  lernzielVersuche: text('lernziel_versuche').default('{}'),
  progressHistory: text('progress_history').default('[]'),
  createdAt: createdAt(),
})

export const factLernzielStatus = sqliteTable('fact_lernziel_status', {
  schuelerId: text('schueler_id').notNull().references(() => dimSchueler.id),
  lernzielId: text('lernziel_id').notNull().references(() => dimLernziele.id),
  status: text('status').$type<'not_reached' | 'partially_reached' | 'reached'>().notNull().default('not_reached'),
  updatedAt: text('updated_at').default(sql`(datetime('now'))`),
}, (t) => [
  primaryKey({ columns: [t.schuelerId, t.lernzielId] }),
])

export const factKommentare = sqliteTable('fact_kommentare', {
  schuelerId: text('schueler_id').notNull().references(() => dimSchueler.id),
  lernzielId: text('lernziel_id').notNull().references(() => dimLernziele.id),
  text: text('text').notNull(),
  createdAt: text('created_at').notNull(),
}, (t) => [
  primaryKey({ columns: [t.schuelerId, t.lernzielId] }),
])

export const factLernkontrolleKommentare = sqliteTable('fact_lernkontrolle_kommentare', {
  schuelerId: text('schueler_id').notNull().references(() => dimSchueler.id),
  lernkontrolleId: text('lernkontrolle_id').notNull().references(() => dimLernkontrollen.id),
  text: text('text').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (t) => [
  primaryKey({ columns: [t.schuelerId, t.lernkontrolleId] }),
])

export const factPruefungen = sqliteTable('fact_pruefungen', {
  id: text('id').primaryKey(),
  klasseId: text('klasse_id').notNull().references(() => dimKlassen.id),
  fachId: text('fach_id').notNull().references(() => dimFaecher.id),
  name: text('name').notNull(),
  datum: text('datum').notNull(),
  lernzielIds: text('lernziel_ids').notNull().default('[]'),
  maxPunkte: real('max_punkte'),
  erstelltVonId: text('erstellt_von_id').references(() => dimLehrpersonen.id),
  status: text('status').$type<'laufend' | 'abgeschlossen'>().notNull().default('laufend'),
  punkteEnabled: integer('punkte_enabled').notNull().default(0),
  noteEnabled: integer('note_enabled').notNull().default(0),
  anhangEnabled: integer('anhang_enabled').notNull().default(0),
  typ: text('typ').notNull().default('pruefung_schriftlich'),
  beschreibung: text('beschreibung'),
  nurRilz: integer('nur_rilz').notNull().default(0),
  rilzSchuelerIds: text('rilz_schueler_ids').notNull().default('[]'),
  createdAt: createdAt(),
})

export const factPruefungErgebnisse = sqliteTable('fact_pruefung_ergebnisse', {
  id: text('id').primaryKey(),
  pruefungId: text('pruefung_id').notNull().references(() => factPruefungen.id),
  schuelerId: text('schueler_id').notNull().references(() => dimSchueler.id),
  punkte: real('punkte'),
  note: text('note'),
  anzahlVersuche: integer('anzahl_versuche').notNull().default(1),
  kommentar: text('kommentar'),
  anhangUrls: text('anhang_urls').notNull().default('[]'),
  status: text('status').$type<'not_reached' | 'partially_reached' | 'reached'>(),
  zweiterVersuchAusstehend: integer('zweiter_versuch_ausstehend').notNull().default(0),
  versuchSnapshots: text('versuch_snapshots').notNull().default('[]'),
  abgeschlossen: integer('abgeschlossen').notNull().default(0),
  createdAt: createdAt(),
}, (t) => [
  uniqueIndex('fact_pruefung_ergebnisse_pruefung_schueler').on(t.pruefungId, t.schuelerId),
])
