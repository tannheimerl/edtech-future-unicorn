// Lezio – local SQLite schema (single-tenant, single-user desktop app).
// Applied idempotently after every `Database.load` (see lib/db.ts) since the
// database path is user-configurable at runtime — every `CREATE` here must
// stay `IF NOT EXISTS` so re-applying it against an already-initialized file
// (or an imported one) is a no-op.
export const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS dim_faecher (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  color_index INTEGER,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dim_lehrpersonen (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  kuerzel     TEXT NOT NULL,
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dim_lernkontrollen (
  id                        TEXT PRIMARY KEY,
  fach_id                   TEXT NOT NULL REFERENCES dim_faecher(id),
  name                      TEXT NOT NULL,
  typ                       TEXT DEFAULT 'standard',
  standard_lernkontrolle_id TEXT REFERENCES dim_lernkontrollen(id),
  faellig_am                TEXT,
  stufe                     TEXT,
  zyklus                    TEXT,
  autor                     TEXT,
  autor_lp_id               TEXT REFERENCES dim_lehrpersonen(id),
  created_at                TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dim_lernziele (
  id                TEXT PRIMARY KEY,
  lernkontrolle_id  TEXT NOT NULL REFERENCES dim_lernkontrollen(id),
  kategorie         TEXT NOT NULL CHECK (kategorie IN ('grundlegend', 'anspruchsvoll')),
  label             TEXT NOT NULL,
  kriterien         TEXT,
  stufe             TEXT,
  beschreibung      TEXT,
  created_at        TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dim_klassen (
  id                      TEXT PRIMARY KEY,
  name                    TEXT NOT NULL,
  schuljahr               TEXT,
  vorgaenger_klasse_id    TEXT REFERENCES dim_klassen(id),
  created_at              TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bridge_lp_zuweisungen (
  id          TEXT PRIMARY KEY,
  klasse_id   TEXT NOT NULL REFERENCES dim_klassen(id) ON DELETE CASCADE,
  lp_id       TEXT NOT NULL REFERENCES dim_lehrpersonen(id),
  fach_ids    TEXT NOT NULL DEFAULT '[]',
  rolle       TEXT CHECK (rolle IN ('klassenlehrperson', 'fachlehrperson', 'heilpaedagogin')),
  UNIQUE (klasse_id, lp_id)
);

CREATE TABLE IF NOT EXISTS dim_schueler (
  id                  TEXT PRIMARY KEY,
  klasse_id           TEXT NOT NULL REFERENCES dim_klassen(id) ON DELETE CASCADE,
  vorname             TEXT NOT NULL,
  nachname            TEXT NOT NULL,
  note                TEXT DEFAULT '',
  bvsa                INTEGER DEFAULT 0,
  rilz_fach_ids       TEXT DEFAULT '[]',
  competency_status   TEXT DEFAULT '{}',
  lernziel_versuche   TEXT DEFAULT '{}',
  progress_history    TEXT DEFAULT '[]',
  created_at          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fact_lernziel_status (
  schueler_id TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  lernziel_id TEXT NOT NULL REFERENCES dim_lernziele(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'not_reached'
              CHECK (status IN ('not_reached', 'partially_reached', 'reached')),
  updated_at  TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (schueler_id, lernziel_id)
);

CREATE TABLE IF NOT EXISTS fact_kommentare (
  schueler_id TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  lernziel_id TEXT NOT NULL REFERENCES dim_lernziele(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  PRIMARY KEY (schueler_id, lernziel_id)
);

CREATE TABLE IF NOT EXISTS fact_lernkontrolle_kommentare (
  schueler_id      TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  lernkontrolle_id TEXT NOT NULL REFERENCES dim_lernkontrollen(id) ON DELETE CASCADE,
  text             TEXT NOT NULL,
  updated_at       TEXT NOT NULL,
  PRIMARY KEY (schueler_id, lernkontrolle_id)
);

CREATE TABLE IF NOT EXISTS fact_pruefungen (
  id                TEXT PRIMARY KEY,
  klasse_id         TEXT NOT NULL REFERENCES dim_klassen(id) ON DELETE CASCADE,
  fach_id           TEXT NOT NULL REFERENCES dim_faecher(id),
  name              TEXT NOT NULL,
  datum             TEXT NOT NULL,
  lernziel_ids      TEXT NOT NULL DEFAULT '[]',
  erstellt_von_id   TEXT REFERENCES dim_lehrpersonen(id),
  status            TEXT NOT NULL DEFAULT 'laufend'
                    CHECK (status IN ('laufend', 'abgeschlossen')),
  typ               TEXT NOT NULL DEFAULT 'pruefung_schriftlich',
  nur_rilz          INTEGER NOT NULL DEFAULT 0,
  schueler_ids      TEXT NOT NULL DEFAULT '[]',
  created_at        TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fact_pruefung_ergebnisse (
  id                          TEXT PRIMARY KEY,
  pruefung_id                 TEXT NOT NULL REFERENCES fact_pruefungen(id) ON DELETE CASCADE,
  schueler_id                 TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  anzahl_versuche             INTEGER NOT NULL DEFAULT 1,
  kommentar                   TEXT,
  status                      TEXT CHECK (status IN ('not_reached', 'partially_reached', 'reached')),
  zweiter_versuch_ausstehend  INTEGER NOT NULL DEFAULT 0,
  versuch_snapshots           TEXT NOT NULL DEFAULT '[]',
  abgeschlossen               INTEGER NOT NULL DEFAULT 0,
  created_at                  TEXT DEFAULT (datetime('now')),
  UNIQUE (pruefung_id, schueler_id)
);

-- Konfigurierbare Status-Icons für die Berichts-Kopfzeilen. Höchstens drei
-- Zeilen, eine je Status. Fehlt eine, greift DEFAULT_BERICHT_ICONS. 'value'
-- hält bei kind='symbol' den Material-Symbols-Ligaturnamen, bei kind='image'
-- die PNG-Data-URL des hochgeladenen Bildes (die Bytes liegen also inline in
-- der Datenbank und reisen so bei Export/Import mit).
CREATE TABLE IF NOT EXISTS dim_bericht_icons (
  status      TEXT PRIMARY KEY CHECK (status IN ('not_reached', 'partially_reached', 'reached')),
  kind        TEXT NOT NULL CHECK (kind IN ('symbol', 'image')),
  value       TEXT NOT NULL,
  updated_at  TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_dim_lernkontrollen_fach    ON dim_lernkontrollen(fach_id);
CREATE INDEX IF NOT EXISTS idx_dim_lernziele_lernkontrolle ON dim_lernziele(lernkontrolle_id);
CREATE INDEX IF NOT EXISTS idx_dim_schueler_klasse        ON dim_schueler(klasse_id);
CREATE INDEX IF NOT EXISTS idx_fact_lz_status_schueler    ON fact_lernziel_status(schueler_id);
CREATE INDEX IF NOT EXISTS idx_fact_kommentare_schueler   ON fact_kommentare(schueler_id);
CREATE INDEX IF NOT EXISTS idx_fact_pruefungen_klasse     ON fact_pruefungen(klasse_id);
CREATE INDEX IF NOT EXISTS idx_fact_pruefung_erg_pruefung ON fact_pruefung_ergebnisse(pruefung_id);
CREATE INDEX IF NOT EXISTS idx_fact_pruefung_erg_schueler ON fact_pruefung_ergebnisse(schueler_id);

-- Tag-Kategorien (custom Lernkontrolle filter columns) were removed. Drop
-- the table on any pre-existing database that still has it.
DROP TABLE IF EXISTS dim_tag_kategorien;

-- 'lp1' historically satisfied FK constraints on dim_lehrpersonen for a
-- hardcoded "current teacher" concept the app no longer uses (each teacher
-- now has their own private local DB, so per-teacher scoping was removed).
-- Kept so any pre-existing bridge_lp_zuweisungen rows referencing it stay valid.
INSERT OR IGNORE INTO dim_lehrpersonen (id, name, kuerzel) VALUES ('lp1', 'Lukas Meier', 'LM');
`

// Split into individual statements — tauri-plugin-sql executes one
// statement per call, and none of the statements above contain a `;`
// inside a string literal or trigger body.
export const SCHEMA_STATEMENTS = SCHEMA_SQL
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean)

// ── Best-effort migrations ───────────────────────────────────────────────────
// `CREATE TABLE IF NOT EXISTS` above is a no-op on databases created by an
// older version, so column-level changes need explicit ALTERs. SQLite has no
// `ADD/DROP COLUMN IF (NOT) EXISTS`, so these are run in order and each one is
// allowed to fail (see lib/db.ts): on an already-migrated database every
// statement below errors out harmlessly.
//
// Ordering is what makes the backfills safe to re-run: they reference the
// *old* `rilz_schueler_ids` column, so once it has been dropped they can no
// longer fire and overwrite a teacher's own Teilnehmer-Auswahl.
export const MIGRATION_STATEMENTS = [
  // Punkte / Noten / Anhänge wurden entfernt — die Spalten mit.
  `ALTER TABLE fact_pruefungen ADD COLUMN schueler_ids TEXT NOT NULL DEFAULT '[]'`,
  // Bisher implizite Teilnehmer explizit machen: RILZ-Lernkontrollen hatten
  // ihre Schüler in rilz_schueler_ids, alle anderen liefen über "alle Schüler
  // der Klasse, die in diesem Fach kein RILZ haben".
  `UPDATE fact_pruefungen SET schueler_ids = rilz_schueler_ids WHERE nur_rilz = 1`,
  `UPDATE fact_pruefungen SET schueler_ids = (
     SELECT COALESCE(json_group_array(s.id), '[]')
     FROM dim_schueler s
     WHERE s.klasse_id = fact_pruefungen.klasse_id
       AND NOT EXISTS (
         SELECT 1 FROM json_each(COALESCE(s.rilz_fach_ids, '[]')) j
         WHERE j.value = fact_pruefungen.fach_id
       )
   ) WHERE nur_rilz = 0 AND rilz_schueler_ids IS NOT NULL`,
  `ALTER TABLE fact_pruefungen DROP COLUMN rilz_schueler_ids`,
  `ALTER TABLE fact_pruefungen DROP COLUMN max_punkte`,
  `ALTER TABLE fact_pruefungen DROP COLUMN punkte_enabled`,
  `ALTER TABLE fact_pruefungen DROP COLUMN note_enabled`,
  `ALTER TABLE fact_pruefungen DROP COLUMN anhang_enabled`,
  `ALTER TABLE fact_pruefung_ergebnisse DROP COLUMN punkte`,
  `ALTER TABLE fact_pruefung_ergebnisse DROP COLUMN note`,
  `ALTER TABLE fact_pruefung_ergebnisse DROP COLUMN anhang_urls`,
  // dim_klassen.settings hielt ausschliesslich die Punkte/Note/Anhang-Schalter.
  `ALTER TABLE dim_klassen DROP COLUMN settings`,
]
