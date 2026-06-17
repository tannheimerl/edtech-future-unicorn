ALTER TABLE fact_pruefungen ADD COLUMN IF NOT EXISTS typ TEXT NOT NULL DEFAULT 'pruefung_schriftlich';
ALTER TABLE fact_pruefungen ADD COLUMN IF NOT EXISTS beschreibung TEXT;
