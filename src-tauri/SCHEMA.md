# Lezio – Datenbankschema (aktueller Stand)

> Dieses Dokument immer aktuell halten wenn eine Migration hinzugefügt wird.
> Migrationsreihenfolge: `migrations/001_init.sql`
>
> Lokale SQLite-Datenbank (Tauri, `tauri-plugin-sql`), Datei `lezio.db` im
> App-Datenverzeichnis. Kein Server, kein Mandant, single-user Desktop-App.
> `TEXT (JSON)` / `TEXT (JSON-Array)` bedeutet: als JSON-String in einer
> TEXT-Spalte gespeichert, beim Lesen/Schreiben in `src/actions/db-read.ts`
> bzw. `db-write.ts` (de)serialisiert. `INTEGER (0/1)` sind Booleans.

---

## Architektur-Übersicht

- **Single-Tenant**: eine gemeinsame lokale Datenbasis, keine Mandantentrennung
- **Naming**: `dim_` = Stammdaten · `fact_` = Transaktionsdaten · `bridge_` = M:N-Verknüpfungen
- **IDs**: `TEXT PRIMARY KEY` (meist UUIDs oder sprechende Keys wie `k1`, `f1`, `lp1`)

```
dim_faecher
  └── dim_themen ──────────── dim_tag_kategorien
        └── dim_lernziele
dim_lehrpersonen
dim_klassen ─────────────────── bridge_klasse_themen (→ dim_themen)
  └── dim_schueler             bridge_lp_zuweisungen (→ dim_lehrpersonen)
        ├── fact_lernziel_status (→ dim_lernziele)
        ├── fact_rilz_lernziele  (→ dim_themen)
        ├── fact_kommentare      (→ dim_lernziele)
        ├── fact_thema_kommentare(→ dim_themen)
        └── fact_pruefung_ergebnisse (→ fact_pruefungen)
fact_pruefungen (→ dim_klassen, dim_faecher)
```

---

## Tabellen

### `dim_faecher`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | z.B. `'f1'` |
| name | TEXT NOT NULL | z.B. `'Deutsch'` |
| color_index | INTEGER | Index in FACH_COLORS (0–7), NULL = positions-basiert |
| created_at | TEXT (ISO-Timestamp) | |

---

### `dim_bericht_icons`

Konfigurierbare Status-Icons für die Spaltenköpfe der Lernziel-Tabellen im
Bericht (PDF, Vorschau, Word-Vorlage). Höchstens drei Zeilen — eine je Status.
Fehlt eine Zeile, gilt `DEFAULT_BERICHT_ICONS` aus `src/types/domain.ts`; es
wird also nichts geseedet.

| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| status | TEXT PK | `'not_reached'` \| `'partially_reached'` \| `'reached'` |
| kind | TEXT NOT NULL | `'symbol'` \| `'image'` |
| value | TEXT NOT NULL | Bei `symbol`: Material-Symbols-Ligaturname (z.B. `'check'`). Bei `image`: vollständige PNG-Data-URL des hochgeladenen Bildes — die Bytes liegen inline in der Datenbank und reisen so bei Export/Import mit |
| updated_at | TEXT (ISO-Timestamp) | |

Ein `symbol` wird bewusst **nicht** als Bild gespeichert: das PNG für
PDF/Word entsteht erst beim Rendern per Canvas (`src/lib/berichtIcons.ts`,
`resolveBerichtIcons`) und wird danach verworfen. Hochgeladene Bilder werden
vor dem Speichern auf 128×128 PNG normalisiert (max. 256 KB).

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
| stufe | TEXT (JSON-Array, int) | Jahrgangsstufen, z.B. `[5, 6]` |
| zyklus | TEXT (JSON-Array, int) | z.B. `[2]` |
| autor | TEXT | |
| autor_lp_id | TEXT → dim_lehrpersonen | |
| tags | TEXT (JSON) | Default `{}` — Key: tag-kategorie-id, Value: Tag-Label |
| created_at | TEXT (ISO-Timestamp) | |

---

### `dim_lernziele`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | |
| thema_id | TEXT → dim_themen | |
| kategorie | TEXT NOT NULL | `'grundlegend'` \| `'anspruchsvoll'` |
| label | TEXT NOT NULL | |
| kriterien | TEXT (JSON-Array) | |
| stufe | TEXT (JSON-Array, int) | |
| beschreibung | TEXT | |
| created_at | TEXT (ISO-Timestamp) | |

---

### `dim_lehrpersonen`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | z.B. `'lp1'` |
| name | TEXT NOT NULL | |
| kuerzel | TEXT NOT NULL | z.B. `'LM'` für Lukas Meier |
| created_at | TEXT (ISO-Timestamp) | |

---

### `dim_klassen`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | z.B. `'k1'` |
| name | TEXT NOT NULL | z.B. `'5a'` |
| schuljahr | TEXT | |
| vorgaenger_klasse_id | TEXT → dim_klassen | Für Klassenübergabe |
| created_at | TEXT (ISO-Timestamp) | |

---

### `dim_schueler`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | |
| klasse_id | TEXT → dim_klassen (CASCADE) | |
| vorname | TEXT NOT NULL | |
| nachname | TEXT NOT NULL | |
| note | TEXT | Freitext-Notiz |
| bvsa | INTEGER (0/1) | Besonderer Förderbedarf (Bericht auch ohne Noten) |
| rilz_fach_ids | TEXT (JSON-Array) | Fächer mit reduzierten Lernzielen |
| rilz_thema_ids | TEXT (JSON-Array) | RILZ-Themen aus der Bibliothek |
| competency_status | TEXT (JSON) | `Record<kompetenzId, Status>` |
| lernziel_versuche | TEXT (JSON) | `Record<lzId, Versuch[]>` — Übungsversuche |
| progress_history | TEXT (JSON) | `StatusSnapshot[]` — Verlauf |
| created_at | TEXT (ISO-Timestamp) | |

---

### `dim_tag_kategorien`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | UUID |
| name | TEXT NOT NULL | z.B. `'Lehrplan 21'` |
| lp_id | TEXT → dim_lehrpersonen | Erstellt von |
| position | INTEGER | Sortierreihenfolge, default 0 |
| created_at | TEXT (ISO-Timestamp) | |

---

### `bridge_klasse_themen`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| klasse_id | TEXT → dim_klassen (CASCADE) | PK |
| thema_id | TEXT → dim_themen (CASCADE) | PK |

**Constraint:** `UNIQUE (thema_id)` — ein Thema nur einer Klasse zuweisbar

---

### `bridge_lp_zuweisungen`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | UUID |
| klasse_id | TEXT → dim_klassen (CASCADE) | |
| lp_id | TEXT → dim_lehrpersonen | |
| fach_ids | TEXT (JSON-Array) | Fächer die diese LP in dieser Klasse unterrichtet |
| rolle | TEXT | `'klassenlehrperson'` \| `'fachlehrperson'` \| `'heilpaedagogin'` |

**Constraint:** `UNIQUE (klasse_id, lp_id)`

---

### `fact_lernziel_status`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| schueler_id | TEXT → dim_schueler (CASCADE) | PK |
| lernziel_id | TEXT → dim_lernziele (CASCADE) | PK |
| status | TEXT | `'not_reached'` \| `'partially_reached'` \| `'reached'` |
| updated_at | TEXT (ISO-Timestamp) | |

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
| created_at | TEXT (ISO-Timestamp) | |

---

### `fact_kommentare`
Kommentar pro Schüler + Lernziel.

| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| schueler_id | TEXT → dim_schueler (CASCADE) | PK |
| lernziel_id | TEXT → dim_lernziele (CASCADE) | PK |
| text | TEXT NOT NULL | |
| created_at | TEXT NOT NULL | ISO-Timestamp |

---

### `fact_thema_kommentare`
Freitext-Kommentar pro Schüler + Thema (Beobachtungsnotiz).

| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| schueler_id | TEXT → dim_schueler (CASCADE) | PK |
| thema_id | TEXT → dim_themen (CASCADE) | PK |
| text | TEXT NOT NULL | |
| updated_at | TEXT NOT NULL | ISO-Timestamp |

---

### `fact_pruefungen`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | UUID |
| klasse_id | TEXT → dim_klassen (CASCADE) | |
| fach_id | TEXT → dim_faecher | |
| name | TEXT NOT NULL | |
| datum | TEXT NOT NULL | ISO YYYY-MM-DD |
| lernziel_ids | TEXT (JSON-Array) | Verknüpfte Lernziele |
| erstellt_von_id | TEXT → dim_lehrpersonen | |
| status | TEXT | `'laufend'` \| `'abgeschlossen'`, default `'laufend'` |
| typ | TEXT | Prüfungstyp (z.B. `'pruefung_schriftlich'`), default `'pruefung_schriftlich'` |
| nur_rilz | INTEGER (0/1) | RILZ-Lernkontrolle (A-Lernziele werden nicht ausgegraut), default FALSE |
| schueler_ids | TEXT (JSON-Array) | Teilnehmende Schüler — in Schritt 2 des Erstellen-Modals gewählt |
| created_at | TEXT (ISO-Timestamp) | |

---

### `fact_pruefung_ergebnisse`
| Spalte | Typ | Bemerkung |
|--------|-----|-----------|
| id | TEXT PK | UUID |
| pruefung_id | TEXT → fact_pruefungen (CASCADE) | |
| schueler_id | TEXT → dim_schueler (CASCADE) | |
| anzahl_versuche | INTEGER | Default 1 |
| kommentar | TEXT | |
| status | TEXT | `'not_reached'` \| `'partially_reached'` \| `'reached'` |
| zweiter_versuch_ausstehend | INTEGER (0/1) | Default FALSE |
| versuch_snapshots | TEXT (JSON) | `VersuchSnapshot[]` — Kommentar/Status je Versuch |
| abgeschlossen | INTEGER (0/1) | Default FALSE |
| created_at | TEXT (ISO-Timestamp) | |

**Constraint:** `UNIQUE (pruefung_id, schueler_id)`

---

## Migrationen

`CREATE TABLE IF NOT EXISTS` in `src/lib/schema.ts` greift auf bestehenden
Datenbanken nicht, deshalb liegen Spalten-Änderungen in
`MIGRATION_STATEMENTS` (gleiche Datei). Die laufen bei jedem `Database.load`
nach dem Schema durch und dürfen einzeln fehlschlagen (siehe `src/lib/db.ts`) —
SQLite kennt kein `ADD/DROP COLUMN IF (NOT) EXISTS`, auf einer aktuellen
Datenbank schlagen also alle fehl und werden übersprungen.

Bisherige Migrationen:

- **Punkte / Noten / Anhänge entfernt.** Gestrichen: `fact_pruefungen.max_punkte`,
  `punkte_enabled`, `note_enabled`, `anhang_enabled`,
  `fact_pruefung_ergebnisse.punkte`, `note`, `anhang_urls` sowie
  `dim_klassen.settings` (hielt ausschliesslich diese drei Schalter).
- **Teilnehmer explizit.** `fact_pruefungen.rilz_schueler_ids` → `schueler_ids`.
  Backfill: bei `nur_rilz = 1` die bisherigen RILZ-Schüler, sonst alle Schüler
  der Klasse ohne RILZ in diesem Fach — also genau die Menge, die die alte
  Version implizit angezeigt hat. Die Backfill-UPDATEs referenzieren
  `rilz_schueler_ids` und können darum nach dessen DROP nicht erneut feuern
  (sonst würden sie bei jedem Start die Auswahl der Lehrperson überschreiben).
