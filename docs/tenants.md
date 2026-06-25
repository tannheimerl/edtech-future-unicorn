# Tenant-Modell

Lezio speichert alle Daten mehrmandantenfähig über die Spalte `tenant_id`. Es gibt drei Ebenen:

| Tenant | Zweck | Sichtbarkeit |
|---|---|---|
| `shared` | Gemeinsame Demo-/Basisdaten (Klassen 5a/5b, Schüler, Fächer, Themen, Lernziele, Lehrpersonen) | **read-only, für jeden Tenant sichtbar** |
| `dev` | Lokale Entwicklung | nur lokal bzw. Production-Fallback ohne Cookie |
| `lz_t01…lz_t15` | Die 15 Tester | jeweils isolierte Kopie + `shared` |

## Wie der Loader liest

[`src/actions/db-read.ts`](../src/actions/db-read.ts) fragt Basisdaten immer mit
`['shared', <aktueller-tenant>]` ab — jeder Tenant sieht also die `shared`-Basis **plus** seine eigenen Daten.

**Ausnahme:** transaktionale Tabellen werden nur mit dem exakten Tenant gelesen (ohne `shared`):
`fact_pruefungen`, `fact_pruefung_ergebnisse`, `dim_tag_kategorien`. Diese Daten dürfen **nicht** nach `shared` verschoben werden, sonst werden sie unsichtbar.

## Welcher Tenant ist aktiv?

[`src/lib/tenants.ts`](../src/lib/tenants.ts) → `resolveTenantId()`:

1. **Lokal** (`NODE_ENV !== 'production'`): `NEXT_PUBLIC_DEV_TENANT` aus `.env.local`.
2. **Production**: Cookie `lezio_tenant` (gesetzt über Tester-Link `?t=lz_tXX`), sonst Fallback `dev`.

## ⚠️ Stolperfalle: UI-Edits landen im Dev-Tenant

Lokale Schreibvorgänge über die App-UI gehen an `NEXT_PUBLIC_DEV_TENANT` (= `dev`).
Demo-/Basisdaten, die du lokal über die UI anlegst, liegen damit in `dev` und sind
für Tester (eigener Tenant) **nicht sichtbar** — die App wirkt auf Vercel „leer".

**So vermeiden:**

- Setze lokal `NEXT_PUBLIC_DEV_TENANT=shared` in `.env.local`, wenn du Basis-Demodaten
  pflegst — dann landen UI-Änderungen direkt in `shared` (für alle sichtbar).
  Caveat: lokal erstellte Prüfungen landen dann ebenfalls in `shared` und sind für
  Tester nicht sichtbar (Prüfungen sind tenant-spezifisch, siehe oben).
- Oder repariere nachträglich mit dem Promote-Script (siehe unten).

## Reparatur-Werkzeug

[`scripts/promote-dev-base-data.ts`](../scripts/promote-dev-base-data.ts) verschiebt die
Basis-Tabellen von `dev` nach `shared` (Werte bleiben erhalten, idempotent):

```
npx tsx --env-file=.env.local scripts/promote-dev-base-data.ts
```

Es bewegt bewusst nur Basisdaten — `fact_pruefungen`/`fact_pruefung_ergebnisse`/
`dim_tag_kategorien` bleiben tenant-spezifisch.

## Seed

[`scripts/seed.ts`](../scripts/seed.ts) schreibt die kanonische Basis korrekt nach
`shared`. Der ursprüngliche Datendrift entstand nicht durch den Seed, sondern durch
nachträgliche UI-Edits im `dev`-Tenant.
