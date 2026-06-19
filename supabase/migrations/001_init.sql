-- ─────────────────────────────────────────────────────────────────────────────
-- Lezio MVP – Supabase Schema
-- Run once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).
-- Tables are prefixed: dim_ (dimensions), fact_ (facts), bridge_ (M:N)
-- All tables carry tenant_id for multi-tenant isolation.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── dim_tenants ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_tenants (
  id          TEXT PRIMARY KEY,
  name        TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── dim_faecher ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_faecher (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  tenant_id   TEXT NOT NULL REFERENCES dim_tenants(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── dim_themen ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_themen (
  id                  TEXT PRIMARY KEY,
  fach_id             TEXT NOT NULL REFERENCES dim_faecher(id),
  name                TEXT NOT NULL,
  typ                 TEXT DEFAULT 'standard',            -- 'standard' | 'rilz'
  standard_thema_id   TEXT REFERENCES dim_themen(id),    -- for RILZ themes
  faellig_am          TEXT,                               -- ISO YYYY-MM-DD
  stufe               INTEGER[],
  zyklus              INTEGER[],
  autor               TEXT,
  autor_lp_id         TEXT,                               -- FK added after dim_lehrpersonen
  tenant_id           TEXT NOT NULL REFERENCES dim_tenants(id),
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── dim_lernziele ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_lernziele (
  id          TEXT PRIMARY KEY,
  thema_id    TEXT NOT NULL REFERENCES dim_themen(id),
  kategorie   TEXT NOT NULL CHECK (kategorie IN ('grundlegend', 'anspruchsvoll')),
  label       TEXT NOT NULL,
  kriterien   TEXT[],
  stufe       INTEGER[],
  beschreibung TEXT,
  tenant_id   TEXT NOT NULL REFERENCES dim_tenants(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── dim_lehrpersonen ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dim_lehrpersonen (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  kuerzel     TEXT NOT NULL,
  tenant_id   TEXT NOT NULL REFERENCES dim_tenants(id),
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
  tenant_id               TEXT NOT NULL REFERENCES dim_tenants(id),
  created_at              TIMESTAMPTZ DEFAULT now()
);

-- ── bridge_klasse_themen ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bridge_klasse_themen (
  klasse_id   TEXT NOT NULL REFERENCES dim_klassen(id) ON DELETE CASCADE,
  thema_id    TEXT NOT NULL REFERENCES dim_themen(id) ON DELETE CASCADE,
  tenant_id   TEXT NOT NULL REFERENCES dim_tenants(id),
  PRIMARY KEY (klasse_id, thema_id)
);

-- ── bridge_lp_zuweisungen ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bridge_lp_zuweisungen (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  klasse_id   TEXT NOT NULL REFERENCES dim_klassen(id) ON DELETE CASCADE,
  lp_id       TEXT NOT NULL REFERENCES dim_lehrpersonen(id),
  fach_ids    TEXT[] NOT NULL DEFAULT '{}',
  rolle       TEXT CHECK (rolle IN ('klassenlehrperson', 'fachlehrperson', 'heilpaedagogin')),
  tenant_id   TEXT NOT NULL REFERENCES dim_tenants(id),
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
  tenant_id           TEXT NOT NULL REFERENCES dim_tenants(id),
  created_at          TIMESTAMPTZ DEFAULT now()
);

-- ── fact_lernziel_status ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_lernziel_status (
  schueler_id TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  lernziel_id TEXT NOT NULL REFERENCES dim_lernziele(id) ON DELETE CASCADE,
  status      TEXT NOT NULL DEFAULT 'not_reached'
              CHECK (status IN ('not_reached', 'partially_reached', 'reached')),
  tenant_id   TEXT NOT NULL REFERENCES dim_tenants(id),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (schueler_id, lernziel_id)
);

-- ── fact_rilz_lernziele ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_rilz_lernziele (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  schueler_id TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  thema_id    TEXT NOT NULL REFERENCES dim_themen(id),
  label       TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'not_reached'
              CHECK (status IN ('not_reached', 'partially_reached', 'reached')),
  tenant_id   TEXT NOT NULL REFERENCES dim_tenants(id),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── fact_kommentare ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_kommentare (
  schueler_id TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  lernziel_id TEXT NOT NULL REFERENCES dim_lernziele(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  tenant_id   TEXT NOT NULL REFERENCES dim_tenants(id),
  PRIMARY KEY (schueler_id, lernziel_id)
);

-- ── fact_thema_kommentare ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_thema_kommentare (
  schueler_id TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  thema_id    TEXT NOT NULL REFERENCES dim_themen(id) ON DELETE CASCADE,
  text        TEXT NOT NULL,
  updated_at  TEXT NOT NULL,
  tenant_id   TEXT NOT NULL REFERENCES dim_tenants(id),
  PRIMARY KEY (schueler_id, thema_id)
);

-- ── Indexes ───────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_dim_faecher_tenant       ON dim_faecher(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dim_themen_tenant        ON dim_themen(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dim_themen_fach          ON dim_themen(fach_id);
CREATE INDEX IF NOT EXISTS idx_dim_lernziele_tenant     ON dim_lernziele(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dim_lernziele_thema      ON dim_lernziele(thema_id);
CREATE INDEX IF NOT EXISTS idx_dim_klassen_tenant       ON dim_klassen(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dim_schueler_tenant      ON dim_schueler(tenant_id);
CREATE INDEX IF NOT EXISTS idx_dim_schueler_klasse      ON dim_schueler(klasse_id);
CREATE INDEX IF NOT EXISTS idx_fact_lz_status_schueler  ON fact_lernziel_status(schueler_id);
CREATE INDEX IF NOT EXISTS idx_fact_lz_status_tenant    ON fact_lernziel_status(tenant_id);
CREATE INDEX IF NOT EXISTS idx_fact_rilz_schueler       ON fact_rilz_lernziele(schueler_id);
CREATE INDEX IF NOT EXISTS idx_fact_kommentare_schueler ON fact_kommentare(schueler_id);
