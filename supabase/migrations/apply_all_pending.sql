-- Alle ausstehenden Migrationen für Lezio Prüfungsmodus
-- Einfügen im Supabase Dashboard → SQL Editor → Run
-- Alle Statements sind idempotent (IF NOT EXISTS / IF NOT EXISTS).

-- ── 002: fact_pruefungen & fact_pruefung_ergebnisse ───────────────────────────

CREATE TABLE IF NOT EXISTS fact_pruefungen (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  klasse_id        TEXT NOT NULL REFERENCES dim_klassen(id) ON DELETE CASCADE,
  fach_id          TEXT NOT NULL REFERENCES dim_faecher(id),
  name             TEXT NOT NULL,
  datum            TEXT NOT NULL,
  lernziel_ids     TEXT[] NOT NULL DEFAULT '{}',
  max_punkte       NUMERIC,
  erstellt_von_id  TEXT REFERENCES dim_lehrpersonen(id),
  tenant_id        TEXT NOT NULL REFERENCES dim_tenants(id),
  created_at       TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fact_pruefungen_klasse  ON fact_pruefungen(klasse_id);
CREATE INDEX IF NOT EXISTS idx_fact_pruefungen_tenant  ON fact_pruefungen(tenant_id);

CREATE TABLE IF NOT EXISTS fact_pruefung_ergebnisse (
  id               TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  pruefung_id      TEXT NOT NULL REFERENCES fact_pruefungen(id) ON DELETE CASCADE,
  schueler_id      TEXT NOT NULL REFERENCES dim_schueler(id) ON DELETE CASCADE,
  punkte           NUMERIC,
  note             TEXT,
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

-- ── 003: Klassen-Einstellungen ────────────────────────────────────────────────

ALTER TABLE dim_klassen ADD COLUMN IF NOT EXISTS settings jsonb;

-- ── 004: Prüfungs-Einstellungen ───────────────────────────────────────────────

ALTER TABLE fact_pruefungen ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'laufend'
  CHECK (status IN ('laufend', 'abgeschlossen'));
ALTER TABLE fact_pruefungen ADD COLUMN IF NOT EXISTS punkte_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE fact_pruefungen ADD COLUMN IF NOT EXISTS note_enabled   BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE fact_pruefungen ADD COLUMN IF NOT EXISTS anhang_enabled BOOLEAN NOT NULL DEFAULT FALSE;

-- ── 005: Zweiter Versuch ──────────────────────────────────────────────────────

ALTER TABLE fact_pruefung_ergebnisse
  ADD COLUMN IF NOT EXISTS zweiter_versuch_ausstehend BOOLEAN NOT NULL DEFAULT FALSE;

-- ── 006: Versuch-Snapshots ────────────────────────────────────────────────────

ALTER TABLE fact_pruefung_ergebnisse
  ADD COLUMN IF NOT EXISTS versuch_snapshots JSONB NOT NULL DEFAULT '[]';

-- ── 007: Abgeschlossen-Flag ───────────────────────────────────────────────────

ALTER TABLE fact_pruefung_ergebnisse
  ADD COLUMN IF NOT EXISTS abgeschlossen BOOLEAN NOT NULL DEFAULT FALSE;

-- ── 008: Prüfungs-Typ & Beschreibung ─────────────────────────────────────────

ALTER TABLE fact_pruefungen ADD COLUMN IF NOT EXISTS typ TEXT NOT NULL DEFAULT 'pruefung_schriftlich';
ALTER TABLE fact_pruefungen ADD COLUMN IF NOT EXISTS beschreibung TEXT;

-- ── 009: RILZ-Prüfungen ───────────────────────────────────────────────────────

ALTER TABLE fact_pruefungen
  ADD COLUMN IF NOT EXISTS nur_rilz BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rilz_schueler_ids TEXT[] NOT NULL DEFAULT '{}';
