ALTER TABLE fact_pruefung_ergebnisse
  ADD COLUMN IF NOT EXISTS versuch_snapshots JSONB NOT NULL DEFAULT '[]';
