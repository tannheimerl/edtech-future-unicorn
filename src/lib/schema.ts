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

CREATE TABLE IF NOT EXISTS dim_themen (
  id                  TEXT PRIMARY KEY,
  fach_id             TEXT NOT NULL REFERENCES dim_faecher(id),
  name                TEXT NOT NULL,
  typ                 TEXT DEFAULT 'standard',
  standard_thema_id   TEXT REFERENCES dim_themen(id),
  faellig_am          TEXT,
  stufe               TEXT,
  zyklus              TEXT,
  autor               TEXT,
  autor_lp_id         TEXT REFERENCES dim_lehrpersonen(id),
  tags                TEXT NOT NULL DEFAULT '{}',
  created_at          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dim_lernziele (
  id           TEXT PRIMARY KEY,
  thema_id     TEXT NOT NULL REFERENCES dim_themen(id),
  kategorie    TEXT NOT NULL CHECK (kategorie IN ('grundlegend', 'anspruchsvoll')),
  label        TEXT NOT NULL,
  kriterien    TEXT,
  stufe        TEXT,
  beschreibung TEXT,
  created_at   TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dim_klassen (
  id                      TEXT PRIMARY KEY,
  name                    TEXT NOT NULL,
  schuljahr               TEXT,
  vorgaenger_klasse_id    TEXT REFERENCES dim_klassen(id),
  settings                TEXT,
  created_at              TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS bridge_klasse_themen (
  klasse_id   TEXT NOT NULL REFERENCES dim_klassen(id) ON DELETE CASCADE,
  thema_id    TEXT NOT NULL REFERENCES dim_themen(id) ON DELETE CASCADE,
  PRIMARY KEY (klasse_id, thema_id),
  UNIQUE (thema_id)
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
  klasse_id           TEXT NOT NULL REFERENCES dim_klassen(id),
  vorname             TEXT NOT NULL,
  nachname            TEXT NOT NULL,
  note                TEXT DEFAULT '',
  bvsa                INTEGER DEFAULT 0,
  rilz_fach_ids       TEXT DEFAULT '[]',
  rilz_thema_ids      TEXT DEFAULT '[]',
  competency_status   TEXT DEFAULT '{}',
  lernziel_versuche   TEXT DEFAULT '{}',
  progress_history    TEXT DEFAULT '[]',
  created_at          TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS dim_tag_kategorien (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  lp_id      TEXT REFERENCES dim_lehrpersonen(id),
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fact_lernziel_status (
  schueler_id TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  lernziel_id TEXT NOT NULL REFERENCES dim_lernziele(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'not_reached'
              CHECK (status IN ('not_reached', 'partially_reached', 'reached')),
  updated_at  TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (schueler_id, lernziel_id)
);

CREATE TABLE IF NOT EXISTS fact_rilz_lernziele (
  id          TEXT PRIMARY KEY,
  schueler_id TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  thema_id    TEXT NOT NULL REFERENCES dim_themen(id),
  label       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'not_reached'
              CHECK (status IN ('not_reached', 'partially_reached', 'reached')),
  created_at  TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fact_kommentare (
  schueler_id TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  lernziel_id TEXT NOT NULL REFERENCES dim_lernziele(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  PRIMARY KEY (schueler_id, lernziel_id)
);

CREATE TABLE IF NOT EXISTS fact_thema_kommentare (
  schueler_id TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  thema_id    TEXT NOT NULL REFERENCES dim_themen(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  PRIMARY KEY (schueler_id, thema_id)
);

CREATE TABLE IF NOT EXISTS fact_pruefungen (
  id                TEXT PRIMARY KEY,
  klasse_id         TEXT NOT NULL REFERENCES dim_klassen(id) ON DELETE CASCADE,
  fach_id           TEXT NOT NULL REFERENCES dim_faecher(id),
  name              TEXT NOT NULL,
  datum             TEXT NOT NULL,
  lernziel_ids      TEXT NOT NULL DEFAULT '[]',
  max_punkte        REAL,
  erstellt_von_id   TEXT REFERENCES dim_lehrpersonen(id),
  status            TEXT NOT NULL DEFAULT 'laufend'
                    CHECK (status IN ('laufend', 'abgeschlossen')),
  punkte_enabled    INTEGER NOT NULL DEFAULT 0,
  note_enabled      INTEGER NOT NULL DEFAULT 0,
  anhang_enabled    INTEGER NOT NULL DEFAULT 0,
  typ               TEXT NOT NULL DEFAULT 'pruefung_schriftlich',
  beschreibung      TEXT,
  nur_rilz          INTEGER NOT NULL DEFAULT 0,
  rilz_schueler_ids TEXT NOT NULL DEFAULT '[]',
  created_at        TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS fact_pruefung_ergebnisse (
  id                          TEXT PRIMARY KEY,
  pruefung_id                 TEXT NOT NULL REFERENCES fact_pruefungen(id) ON DELETE CASCADE,
  schueler_id                 TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  punkte                      REAL,
  note                        TEXT,
  anzahl_versuche             INTEGER NOT NULL DEFAULT 1,
  kommentar                   TEXT,
  anhang_urls                 TEXT NOT NULL DEFAULT '[]',
  status                      TEXT CHECK (status IN ('not_reached', 'partially_reached', 'reached')),
  zweiter_versuch_ausstehend  INTEGER NOT NULL DEFAULT 0,
  versuch_snapshots           TEXT NOT NULL DEFAULT '[]',
  abgeschlossen               INTEGER NOT NULL DEFAULT 0,
  created_at                  TEXT DEFAULT (datetime('now')),
  UNIQUE (pruefung_id, schueler_id)
);

CREATE INDEX IF NOT EXISTS idx_dim_themen_fach            ON dim_themen(fach_id);
CREATE INDEX IF NOT EXISTS idx_dim_lernziele_thema        ON dim_lernziele(thema_id);
CREATE INDEX IF NOT EXISTS idx_dim_schueler_klasse        ON dim_schueler(klasse_id);
CREATE INDEX IF NOT EXISTS idx_fact_lz_status_schueler    ON fact_lernziel_status(schueler_id);
CREATE INDEX IF NOT EXISTS idx_fact_rilz_schueler         ON fact_rilz_lernziele(schueler_id);
CREATE INDEX IF NOT EXISTS idx_fact_kommentare_schueler   ON fact_kommentare(schueler_id);
CREATE INDEX IF NOT EXISTS idx_fact_pruefungen_klasse     ON fact_pruefungen(klasse_id);
CREATE INDEX IF NOT EXISTS idx_fact_pruefung_erg_pruefung ON fact_pruefung_ergebnisse(pruefung_id);
CREATE INDEX IF NOT EXISTS idx_fact_pruefung_erg_schueler ON fact_pruefung_ergebnisse(schueler_id);
CREATE INDEX IF NOT EXISTS idx_dim_tag_kategorien_position ON dim_tag_kategorien(position);
`

// Split into individual statements — tauri-plugin-sql executes one
// statement per call, and none of the statements above contain a `;`
// inside a string literal or trigger body.
export const SCHEMA_STATEMENTS = SCHEMA_SQL
  .split(';')
  .map((s) => s.trim())
  .filter(Boolean)
