-- ─────────────────────────────────────────────────────────────────────────────
-- Lezio – Prüfungen & Dateianhänge
-- Apply in Supabase SQL Editor after 001_init.sql
-- ─────────────────────────────────────────────────────────────────────────────

-- ── fact_pruefungen ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_pruefungen (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  klasse_id        TEXT NOT NULL REFERENCES dim_klassen(id) ON DELETE CASCADE,
  fach_id          TEXT NOT NULL REFERENCES dim_faecher(id),
  name             TEXT NOT NULL,
  datum            TEXT NOT NULL,           -- ISO YYYY-MM-DD
  lernziel_ids     TEXT[] NOT NULL DEFAULT '{}',
  max_punkte       NUMERIC,
  erstellt_von_id  TEXT REFERENCES dim_lehrpersonen(id),
  tenant_id        TEXT NOT NULL REFERENCES dim_tenants(id),
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fact_pruefungen_klasse  ON fact_pruefungen(klasse_id);
CREATE INDEX IF NOT EXISTS idx_fact_pruefungen_tenant  ON fact_pruefungen(tenant_id);

-- ── fact_pruefung_ergebnisse ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS fact_pruefung_ergebnisse (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  pruefung_id      TEXT NOT NULL REFERENCES fact_pruefungen(id) ON DELETE CASCADE,
  schueler_id      TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  punkte           NUMERIC,
  note             TEXT,                     -- Schweizer Note, z.B. "5.5"
  anzahl_versuche  INTEGER NOT NULL DEFAULT 1,
  kommentar        TEXT,
  anhang_urls      TEXT[] NOT NULL DEFAULT '{}',
  status           TEXT CHECK (status IN ('not_reached', 'partially_reached', 'reached')),
  tenant_id        TEXT NOT NULL REFERENCES dim_tenants(id),
  created_at       TIMESTAMPTZ DEFAULT now(),
  UNIQUE (pruefung_id, schueler_id)
);

CREATE INDEX IF NOT EXISTS idx_fact_pruefung_erg_pruefung ON fact_pruefung_ergebnisse(pruefung_id);
CREATE INDEX IF NOT EXISTS idx_fact_pruefung_erg_schueler ON fact_pruefung_ergebnisse(schueler_id);

-- ── Supabase Storage Bucket ───────────────────────────────────────────────────
-- Create bucket 'lezio-anhaenge' in the Supabase Dashboard under Storage.
-- Path convention: {tenant_id}/{pruefung_id}/{schueler_id}/{filename}
-- If using the Storage API directly:
--   INSERT INTO storage.buckets (id, name, public) VALUES ('lezio-anhaenge', 'lezio-anhaenge', false)
--   ON CONFLICT (id) DO NOTHING;
