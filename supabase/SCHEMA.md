# Lezio – Datenbankschema (aktueller Stand)

> Dieses Dokument immer aktuell halten wenn eine Migration hinzugefügt wird.
> Migrationsreihenfolge: `migrations/001_init.sql` → `012_fach_farbe.sql`

---

## Architektur-Übersicht

- **Multi-Tenant**: Jede Tabelle trägt `tenant_id` → Datenisolation pro Schule/Account
- **Naming**: `dim_` = Stammdaten · `fact_` = Transaktionsdaten · `bridge_` = M:N-Verknüpfungen
- **IDs**: `TEXT PRIMARY KEY` (meist UUIDs oder sprechende Keys wie `k1`, `f1`, `lp1`)

```
dim_tenants
  └── dim_faecher
        └── dim_themen ──────────── dim_tag_kategorien
              └── dim_lernziele
  └── dim_lehrpersonen
  └── dim_klassen ─────────────────── bridge_klasse_themen (→ dim_themen)
        └── dim_schueler             bridge_lp_zuweisungen (→ dim_lehrpersonen)
              ├── fact_lernziel_status (→ dim_lernziele)
              ├── fact_rilz_lernziele  (→ dim_themen)
              ├── fact_kommentare      (→ dim_lernziele)
              ├── fact_thema_kommentare(→ dim_themen)
              └── fact_pruefung_ergebnisse (→ fact_pruefungen)
  └── fact_pruefungen (→ dim_klassen, dim_faecher)
```

---

## Tabellen

### `dim_tenants`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | z.B. `'shared'`, `'demo_01'` |
| name | TEXT | |
| created_at | TIMESTAMPTZ | |

---

### `dim_faecher`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | z.B. `'f1'` |
| name | TEXT NOT NULL | z.B. `'Deutsch'` |
| color_index | SMALLINT | Index in FACH_COLORS (0–7), NULL = positions-basiert |
| tenant_id | TEXT → dim_tenants | |
| created_at | TIMESTAMPTZ | |

---

### `dim_themen`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | z.B. `'tde1'` |
| fach_id | TEXT → dim_faecher | |
| name | TEXT NOT NULL | |
| typ | TEXT | `'standard'` \| `'rilz'`, default `'standard'` |
| standard_thema_id | TEXT → dim_themen | Nur bei RILZ-Themen: Eltern-Thema |
| faellig_am | TEXT | ISO YYYY-MM-DD |
| stufe | INTEGER[] | Jahrgangsstufen, z.B. `[5, 6]` |
| zyklus | INTEGER[] | z.B. `[2]` |
| autor | TEXT | |
| autor_lp_id | TEXT → dim_lehrpersonen | |
| tags | JSONB | Default `{}` — Key: tag-kategorie-id, Value: Tag-Label |
| tenant_id | TEXT → dim_tenants | |
| created_at | TIMESTAMPTZ | |

---

### `dim_lernziele`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | |
| thema_id | TEXT → dim_themen | |
| kategorie | TEXT NOT NULL | `'grundlegend'` \| `'anspruchsvoll'` |
| label | TEXT NOT NULL | |
| kriterien | TEXT[] | |
| stufe | INTEGER[] | |
| beschreibung | TEXT | |
| tenant_id | TEXT → dim_tenants | |
| created_at | TIMESTAMPTZ | |

---

### `dim_lehrpersonen`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | z.B. `'lp1'` |
| name | TEXT NOT NULL | |
| kuerzel | TEXT NOT NULL | z.B. `'LM'` für Lukas Meier |
| tenant_id | TEXT → dim_tenants | |
| created_at | TIMESTAMPTZ | |

---

### `dim_klassen`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | z.B. `'k1'` |
| name | TEXT NOT NULL | z.B. `'5a'` |
| schuljahr | TEXT | |
| vorgaenger_klasse_id | TEXT → dim_klassen | Für Klassenübergabe |
| settings | JSONB | Beurteilungs-Einstellungen pro Fach |
| tenant_id | TEXT → dim_tenants | |
| created_at | TIMESTAMPTZ | |

---

### `dim_schueler`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | |
| klasse_id | TEXT → dim_klassen | |
| vorname | TEXT NOT NULL | |
| nachname | TEXT NOT NULL | |
| note | TEXT | Freitext-Notiz |
| bvsa | BOOLEAN | Besonderer Förderbedarf (Bericht auch ohne Noten) |
| rilz_fach_ids | TEXT[] | Fächer mit reduzierten Lernzielen |
| rilz_thema_ids | TEXT[] | RILZ-Themen aus der Bibliothek |
| competency_status | JSONB | `Record<kompetenzId, Status>` |
| lernziel_versuche | JSONB | `Record<lzId, Versuch[]>` — Übungsversuche |
| progress_history | JSONB | `StatusSnapshot[]` — Verlauf |
| tenant_id | TEXT → dim_tenants | |
| created_at | TIMESTAMPTZ | |

---

### `dim_tag_kategorien`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL | z.B. `'Lehrplan 21'` |
| lp_id | TEXT → dim_lehrpersonen | Erstellt von |
| tenant_id | TEXT → dim_tenants | |
| position | INTEGER | Sortierreihenfolge, default 0 |
| created_at | TIMESTAMPTZ | |

---

### `bridge_klasse_themen`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| klasse_id | TEXT → dim_klassen (CASCADE) | PK |
| thema_id | TEXT → dim_themen (CASCADE) | PK |
| tenant_id | TEXT → dim_tenants | |

**Constraint:** `UNIQUE (thema_id, tenant_id)` — ein Thema pro Tenant nur einer Klasse zuweisbar

---

### `bridge_lp_zuweisungen`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | UUID |
| klasse_id | TEXT → dim_klassen (CASCADE) | |
| lp_id | TEXT → dim_lehrpersonen | |
| fach_ids | TEXT[] | Fächer die diese LP in dieser Klasse unterrichtet |
| rolle | TEXT | `'klassenlehrperson'` \| `'fachlehrperson'` \| `'heilpaedagogin'` |
| tenant_id | TEXT → dim_tenants | |

**Constraint:** `UNIQUE (klasse_id, lp_id)`

---

### `fact_lernziel_status`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| schueler_id | TEXT → dim_schueler (CASCADE) | PK |
| lernziel_id | TEXT → dim_lernziele (CASCADE) | PK |
| status | TEXT | `'not_reached'` \| `'partially_reached'` \| `'reached'` |
| tenant_id | TEXT → dim_tenants | |
| updated_at | TIMESTAMPTZ | |

---

### `fact_rilz_lernziele`
Ad-hoc RILZ-Lernziele, die von der Heilpädagogin direkt auf einen Schüler geschrieben werden.

| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | UUID |
| schueler_id | TEXT → dim_schueler (CASCADE) | |
| thema_id | TEXT → dim_themen | |
| label | TEXT NOT NULL | Freitext |
| status | TEXT | `'not_reached'` \| `'partially_reached'` \| `'reached'` |
| tenant_id | TEXT → dim_tenants | |
| created_at | TIMESTAMPTZ | |

---

### `fact_kommentare`
Kommentar pro Schüler + Lernziel.

| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| schueler_id | TEXT → dim_schueler (CASCADE) | PK |
| lernziel_id | TEXT → dim_lernziele (CASCADE) | PK |
| text | TEXT NOT NULL | |
| created_at | TEXT NOT NULL | ISO-Timestamp |
| tenant_id | TEXT → dim_tenants | |

---

### `fact_thema_kommentare`
Freitext-Kommentar pro Schüler + Thema (Beobachtungsnotiz).

| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| schueler_id | TEXT → dim_schueler (CASCADE) | PK |
| thema_id | TEXT → dim_themen (CASCADE) | PK |
| text | TEXT NOT NULL | |
| updated_at | TEXT NOT NULL | ISO-Timestamp |
| tenant_id | TEXT → dim_tenants | |

---

### `fact_pruefungen`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | UUID |
| klasse_id | TEXT → dim_klassen (CASCADE) | |
| fach_id | TEXT → dim_faecher | |
| name | TEXT NOT NULL | |
| datum | TEXT NOT NULL | ISO YYYY-MM-DD |
| lernziel_ids | TEXT[] | Verknüpfte Lernziele |
| max_punkte | NUMERIC | |
| erstellt_von_id | TEXT → dim_lehrpersonen | |
| status | TEXT | `'laufend'` \| `'abgeschlossen'`, default `'laufend'` |
| punkte_enabled | BOOLEAN | Default FALSE |
| note_enabled | BOOLEAN | Default FALSE |
| anhang_enabled | BOOLEAN | Default FALSE |
| typ | TEXT | Prüfungstyp (z.B. `'pruefung_schriftlich'`), default `'pruefung_schriftlich'` |
| beschreibung | TEXT | |
| nur_rilz | BOOLEAN | Nur für RILZ-Schüler, default FALSE |
| rilz_schueler_ids | TEXT[] | Explizite RILZ-Schüler-IDs |
| tenant_id | TEXT → dim_tenants | |
| created_at | TIMESTAMPTZ | |

---

### `fact_pruefung_ergebnisse`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | UUID |
| pruefung_id | TEXT → fact_pruefungen (CASCADE) | |
| schueler_id | TEXT → dim_schueler (CASCADE) | |
| punkte | NUMERIC | |
| note | TEXT | Schweizer Note, z.B. `'5.5'` |
| anzahl_versuche | INTEGER | Default 1 |
| kommentar | TEXT | |
| anhang_urls | TEXT[] | Storage-Pfade |
| status | TEXT | `'not_reached'` \| `'partially_reached'` \| `'reached'` |
| zweiter_versuch_ausstehend | BOOLEAN | Default FALSE |
| versuch_snapshots | JSONB | `VersuchSnapshot[]` — Punkte/Note je Versuch |
| abgeschlossen | BOOLEAN | Default FALSE |
| tenant_id | TEXT → dim_tenants | |
| created_at | TIMESTAMPTZ | |

**Constraint:** `UNIQUE (pruefung_id, schueler_id)`

---

## Storage

| Bucket | Zugriff | Pfad-Konvention |
|--------|---------|-----------------|
| `lezio-anhaenge` | privat | `{tenant_id}/{pruefung_id}/{schueler_id}/{filename}` |
