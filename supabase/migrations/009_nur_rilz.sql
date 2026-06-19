-- Migration 009: RILZ-Prüfungen (separate Prüfungen für RILZ-Schüler)
ALTER TABLE fact_pruefungen
  ADD COLUMN IF NOT EXISTS nur_rilz BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS rilz_schueler_ids TEXT[] NOT NULL DEFAULT '{}';
