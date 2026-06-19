ALTER TABLE fact_pruefung_ergebnisse
  ADD COLUMN IF NOT EXISTS zweiter_versuch_ausstehend BOOLEAN NOT NULL DEFAULT FALSE;
