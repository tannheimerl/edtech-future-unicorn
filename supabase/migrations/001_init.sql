-- ─────────────────────────────────────────────────────────────────────────────
-- Lezio – Supabase Schema (single-tenant)
-- Run once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Tables are prefixed: dim_ (dimensions), fact_ (facts), bridge_ (M:N)
-- ─────────────────────────────────────────────────────────────────────────────

-- ── dim_faecher ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_faecher (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  color_index SMALLINT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── dim_themen ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_themen (
  id                  TEXT PRIMARY KEY,
  fach_id             TEXT NOT NULL REFERENCES dim_faecher(id),
  name                TEXT NOT NULL,
  typ                 TEXT DEFAULT 'standard',            -- 'standard' | 'rilz'
  standard_thema_id   TEXT REFERENCES dim_themen(id),      -- for RILZ themes
  faellig_am          TEXT,                                -- ISO YYYY-MM-DD
  stufe               INTEGER[],
  zyklus              INTEGER[],
  autor               TEXT,
  autor_lp_id         TEXT,                                -- FK added after dim_lehrpersonen
  tags                JSONB NOT NULL DEFAULT '{}',
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── dim_lernziele ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_lernziele (
  id           TEXT PRIMARY KEY,
  thema_id     TEXT NOT NULL REFERENCES dim_themen(id),
  kategorie    TEXT NOT NULL CHECK (kategorie IN ('grundlegend', 'anspruchsvoll')),
  label        TEXT NOT NULL,
  kriterien    TEXT[],
  stufe        INTEGER[],
  beschreibung TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ── dim_lehrpersonen ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_lehrpersonen (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  kuerzel     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Back-fill FK on dim_themen.autor_lp_id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'fk_dim_themen_autor_lp'
  ) THEN
    ALTER TABLE dim_themen
      ADD CONSTRAINT fk_dim_themen_autor_lp
      FOREIGN KEY (autor_lp_id) REFERENCES dim_lehrpersonen(id);
  END IF;
END $$;

-- ── dim_klassen ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_klassen (
  id                      TEXT PRIMARY KEY,
  name                    TEXT NOT NULL,
  schuljahr               TEXT,
  vorgaenger_klasse_id    TEXT REFERENCES dim_klassen(id),
  settings                JSONB,
  created_at              TIMESTAMPTZ DEFAULT now()
);

-- ── bridge_klasse_themen ──────────────────────────────────────────────────────
-- Ein Thema kann nur einer Klasse zugewiesen sein.
CREATE TABLE IF NOT EXISTS bridge_klasse_themen (
  klasse_id   TEXT NOT NULL REFERENCES dim_klassen(id) ON DELETE CASCADE,
  thema_id    TEXT NOT NULL REFERENCES dim_themen(id) ON DELETE CASCADE,
  PRIMARY KEY (klasse_id, thema_id),
  UNIQUE (thema_id)
);

-- ── bridge_lp_zuweisungen ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bridge_lp_zuweisungen (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  klasse_id   TEXT NOT NULL REFERENCES dim_klassen(id) ON DELETE CASCADE,
  lp_id       TEXT NOT NULL REFERENCES dim_lehrpersonen(id),
  fach_ids    TEXT[] NOT NULL DEFAULT '{}',
  rolle       TEXT CHECK (rolle IN ('klassenlehrperson', 'fachlehrperson', 'heilpaedagogin')),
  UNIQUE (klasse_id, lp_id)
);

-- ── dim_schueler ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_schueler (
  id                  TEXT PRIMARY KEY,
  klasse_id           TEXT NOT NULL REFERENCES dim_klassen(id),
  vorname             TEXT NOT NULL,
  nachname            TEXT NOT NULL,
  note                TEXT DEFAULT '',
  bvsa                BOOLEAN DEFAULT false,
  rilz_fach_ids       TEXT[] DEFAULT '{}',
  rilz_thema_ids      TEXT[] DEFAULT '{}',
  competency_status   JSONB DEFAULT '{}',
  lernziel_versuche   JSONB DEFAULT '{}',    -- Record<lzId, Versuch[]>
  progress_history    JSONB DEFAULT '[]',    -- StatusSnapshot[]
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── dim_tag_kategorien ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_tag_kategorien (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name       TEXT NOT NULL,
  lp_id      TEXT REFERENCES dim_lehrpersonen(id),
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ── fact_lernziel_status ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_lernziel_status (
  schueler_id TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  lernziel_id TEXT NOT NULL REFERENCES dim_lernziele(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'not_reached'
              CHECK (status IN ('not_reached', 'partially_reached', 'reached')),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (schueler_id, lernziel_id)
);

-- ── fact_rilz_lernziele ────────────────────────────────────────────────────────
-- Ad-hoc RILZ-Lernziele, die von der Heilpädagogin direkt auf einen Schüler geschrieben werden.
CREATE TABLE IF NOT EXISTS fact_rilz_lernziele (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  schueler_id TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  thema_id    TEXT NOT NULL REFERENCES dim_themen(id),
  label       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'not_reached'
              CHECK (status IN ('not_reached', 'partially_reached', 'reached')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── fact_kommentare ────────────────────────────────────────────────────────────
-- Kommentar pro Schüler + Lernziel.
CREATE TABLE IF NOT EXISTS fact_kommentare (
  schueler_id TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  lernziel_id TEXT NOT NULL REFERENCES dim_lernziele(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  PRIMARY KEY (schueler_id, lernziel_id)
);

-- ── fact_thema_kommentare ──────────────────────────────────────────────────────
-- Freitext-Kommentar pro Schüler + Thema (Beobachtungsnotiz).
CREATE TABLE IF NOT EXISTS fact_thema_kommentare (
  schueler_id TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  thema_id    TEXT NOT NULL REFERENCES dim_themen(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  PRIMARY KEY (schueler_id, thema_id)
);

-- ── fact_pruefungen ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_pruefungen (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  klasse_id        TEXT NOT NULL REFERENCES dim_klassen(id) ON DELETE CASCADE,
  fach_id          TEXT NOT NULL REFERENCES dim_faecher(id),
  name             TEXT NOT NULL,
  datum            TEXT NOT NULL,           -- ISO YYYY-MM-DD
  lernziel_ids     TEXT[] NOT NULL DEFAULT '{}',
  max_punkte       NUMERIC,
  erstellt_von_id  TEXT REFERENCES dim_lehrpersonen(id),
  status           TEXT NOT NULL DEFAULT 'laufend'
                   CHECK (status IN ('laufend', 'abgeschlossen')),
  punkte_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  note_enabled     BOOLEAN NOT NULL DEFAULT FALSE,
  anhang_enabled   BOOLEAN NOT NULL DEFAULT FALSE,
  typ              TEXT NOT NULL DEFAULT 'pruefung_schriftlich',
  beschreibung     TEXT,
  nur_rilz         BOOLEAN NOT NULL DEFAULT FALSE,
  rilz_schueler_ids TEXT[] NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ── fact_pruefung_ergebnisse ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_pruefung_ergebnisse (
  id                          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  pruefung_id                 TEXT NOT NULL REFERENCES fact_pruefungen(id) ON DELETE CASCADE,
  schueler_id                 TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  punkte                      NUMERIC,
  note                        TEXT,                     -- Schweizer Note, z.B. "5.5"
  anzahl_versuche             INTEGER NOT NULL DEFAULT 1,
  kommentar                   TEXT,
  anhang_urls                 TEXT[] NOT NULL DEFAULT '{}',
  status                      TEXT CHECK (status IN ('not_reached', 'partially_reached', 'reached')),
  zweiter_versuch_ausstehend  BOOLEAN NOT NULL DEFAULT FALSE,
  versuch_snapshots           JSONB NOT NULL DEFAULT '[]',
  abgeschlossen               BOOLEAN NOT NULL DEFAULT FALSE,
  created_at                  TIMESTAMPTZ DEFAULT now(),
  UNIQUE (pruefung_id, schueler_id)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
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

-- ── Supabase Storage Bucket ───────────────────────────────────────────────────
-- Create bucket 'lezio-anhaenge' in the Supabase Dashboard under Storage.
-- Path convention: {pruefung_id}/{schueler_id}/{filename}
--   INSERT INTO storage.buckets (id, name, public) VALUES ('lezio-anhaenge', 'lezio-anhaenge', false)
--   ON CONFLICT (id) DO NOTHING;
