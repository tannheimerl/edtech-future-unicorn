-- ── 010: Tag-Kategorien für Lernzielsammlung ─────────────────────────────────

CREATE TABLE IF NOT EXISTS dim_tag_kategorien (
  id         TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  name       TEXT NOT NULL,
  lp_id      TEXT REFERENCES dim_lehrpersonen(id),
  tenant_id  TEXT NOT NULL REFERENCES dim_tenants(id),
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dim_tag_kategorien_tenant ON dim_tag_kategorien(tenant_id);

ALTER TABLE dim_themen ADD COLUMN IF NOT EXISTS tags JSONB NOT NULL DEFAULT '{}';
