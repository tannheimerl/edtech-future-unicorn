/**
 * Seed script: gibt jedem Tester-Tenant (und 'dev') eine EIGENE, vollständige Kopie
 * der Basisdaten (5a + 5b samt Bibliothek) unter seiner tenant_id. Die IDs werden dabei
 * pro Tenant geprefixt (`<tenant>__<id>`), damit der einspaltige TEXT-PK eindeutig bleibt
 * und Tester sich gegenseitig nicht beeinflussen können (delete/upsert by id trifft nur
 * die eigene Kopie).
 *
 * Ausnahme: dim_lehrpersonen bleibt einmalig unter 'shared' (reine Identitäts-Referenz,
 * keine Schreibpfade in der App). Alle lp_id/autor_lp_id-Referenzen bleiben deshalb original.
 *
 * Run with:  npx tsx --env-file=.env.local scripts/seed.ts
 */

import { createClient } from '@supabase/supabase-js'
import {
  SEED_FAECHER,
  SEED_THEMEN,
  SEED_LERNZIELE,
  SEED_LERNZIELE_RILZ,
  SEED_LEHRPERSONEN,
  SEED_CLASSES,
  SEED_STUDENTS,
} from './seed-data'
import { TENANT_TOKENS } from '../src/lib/tenants'
import type { Status, StatusSnapshot } from '../src/types/domain'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// Jeder Tester + 'dev' (für lokale Entwicklung via NEXT_PUBLIC_DEV_TENANT) bekommt eine Kopie.
// Optionaler CLI-Filter: werden Tenant-IDs als Argumente übergeben, werden NUR diese
// befüllt (z.B. um neue Tester anzulegen, ohne bestehende live-Tester zu überschreiben):
//   npx tsx --env-file=.env.local scripts/seed.ts lz_t16_a3wmq lz_t17_t8kpz …
const ONLY = process.argv.slice(2).filter((a) => !a.startsWith('-'))
const ALL_DATA_TENANTS = [...TENANT_TOKENS, 'dev']
const DATA_TENANTS = ONLY.length > 0 ? ONLY : ALL_DATA_TENANTS

// Seed 5a (k1) und 5b (k2), nicht 7c (k3).
const SHARED_CLASS_IDS = new Set(['k1', 'k2'])
// 5b (k2) bleibt eine LEERE Sandbox: Klasse + LP-Zuweisung werden angelegt, aber
// keine Schüler und keine Themen-Zuweisungen (siehe scripts/empty-5b.sql).
const POPULATED_CLASS_IDS = new Set(['k1'])
const classes = SEED_CLASSES.filter((k) => SHARED_CLASS_IDS.has(k.id))
const students = SEED_STUDENTS.filter((s) => POPULATED_CLASS_IDS.has(s.klassId))

// ── ID-Remapping ───────────────────────────────────────────────────────────────
// Prefixt eine Basis-ID mit dem Tenant. lp-Referenzen bleiben original (shared).
const rid = (t: string, id: string) => `${t}__${id}`
const ridArr = (t: string, ids: string[] | undefined) => (ids ?? []).map((id) => rid(t, id))
// Remappt die KEYS eines Records (z.B. lernzielStatus: { <lzId>: status }).
const ridKeys = <V>(t: string, obj: Record<string, V> | undefined): Record<string, V> =>
  Object.fromEntries(Object.entries(obj ?? {}).map(([k, v]) => [rid(t, k), v]))
// Remappt die Lernziel-Referenzen in den progress_history-Snapshots.
const ridHistory = (t: string, history: StatusSnapshot[] | undefined): StatusSnapshot[] =>
  (history ?? []).map((snap) => ({
    ...snap,
    lernzielStatus: ridKeys<Status>(t, snap.lernzielStatus),
    ...(snap.activeLzIds ? { activeLzIds: ridArr(t, snap.activeLzIds) } : {}),
  }))

// ── Batched upsert ───────────────────────────────────────────────────────────────
async function upsertBatched(
  table: string,
  rows: Record<string, unknown>[],
  onConflict: string,
) {
  const BATCH = 500
  for (let i = 0; i < rows.length; i += BATCH) {
    const { error } = await supabase.from(table).upsert(rows.slice(i, i + BATCH), { onConflict })
    if (error) throw new Error(`${table} batch ${i}: ${error.message}`)
  }
  console.log(`  → ${rows.length} rows`)
}

async function run() {
  // ── 1. Tenants ──────────────────────────────────────────────────────────────
  console.log('Inserting tenants…')
  const { error: eT } = await supabase.from('dim_tenants').upsert(
    [
      { id: 'shared', name: 'Shared – Lehrpersonen-Referenz' },
      { id: 'dev',    name: 'Development' },
      ...TENANT_TOKENS.map((token, i) => ({ id: token, name: `Tester ${i + 1}` })),
    ],
    { onConflict: 'id' }
  )
  if (eT) throw new Error(`tenants: ${eT.message}`)

  // ── 2. Lehrpersonen (geteilt unter 'shared', vor Themen wegen FK autor_lp_id) ──
  console.log('Inserting dim_lehrpersonen (shared)…')
  const { error: eLP } = await supabase.from('dim_lehrpersonen').upsert(
    SEED_LEHRPERSONEN.map((lp) => ({
      id: lp.id, name: lp.name, kuerzel: lp.kuerzel, tenant_id: 'shared',
    })),
    { onConflict: 'id' }
  )
  if (eLP) throw new Error(`dim_lehrpersonen: ${eLP.message}`)

  // ── 3. Fächer (pro Tenant) ────────────────────────────────────────────────────
  console.log('Inserting dim_faecher…')
  await upsertBatched('dim_faecher', DATA_TENANTS.flatMap((t) =>
    SEED_FAECHER.map((f) => ({ id: rid(t, f.id), name: f.name, tenant_id: t }))
  ), 'id')

  // ── 4. Themen (pro Tenant) ──────────────────────────────────────────────────
  // Standard-Themen zuerst (RILZ-Themen referenzieren sie via standard_thema_id).
  console.log('Inserting dim_themen…')
  const standardThemen = SEED_THEMEN.filter((t) => t.typ !== 'rilz')
  const rilzThemen = SEED_THEMEN.filter((t) => t.typ === 'rilz')

  await upsertBatched('dim_themen', DATA_TENANTS.flatMap((t) =>
    standardThemen.map((th) => ({
      id: rid(t, th.id), fach_id: rid(t, th.fachId), name: th.name,
      typ: th.typ ?? 'standard',
      standard_thema_id: th.standardThemaId ? rid(t, th.standardThemaId) : null,
      faellig_am: th.faelligAm ?? null,
      stufe: th.stufe ?? null,
      zyklus: th.zyklus ?? null,
      autor: th.autor ?? null,
      autor_lp_id: th.autorLpId ?? null, // referenziert shared Lehrperson → original
      tenant_id: t,
    }))
  ), 'id')

  await upsertBatched('dim_themen', DATA_TENANTS.flatMap((t) =>
    rilzThemen.map((th) => ({
      id: rid(t, th.id), fach_id: rid(t, th.fachId), name: th.name,
      typ: 'rilz',
      standard_thema_id: th.standardThemaId ? rid(t, th.standardThemaId) : null,
      faellig_am: null, stufe: null, zyklus: null,
      autor: null, autor_lp_id: null,
      tenant_id: t,
    }))
  ), 'id')

  // ── 5. Lernziele (pro Tenant) ─────────────────────────────────────────────────
  console.log('Inserting dim_lernziele…')
  const allLernziele = [...SEED_LERNZIELE, ...SEED_LERNZIELE_RILZ]
  await upsertBatched('dim_lernziele', DATA_TENANTS.flatMap((t) =>
    allLernziele.map((l) => ({
      id: rid(t, l.id), thema_id: rid(t, l.themaId), kategorie: l.kategorie, label: l.label,
      kriterien: l.kriterien ?? null,
      stufe: l.stufe ?? null,
      beschreibung: l.beschreibung ?? null,
      tenant_id: t,
    }))
  ), 'id')

  // ── 6. Klassen (5a + 5b, pro Tenant) ────────────────────────────────────────
  console.log('Inserting dim_klassen…')
  await upsertBatched('dim_klassen', DATA_TENANTS.flatMap((t) =>
    classes.map((k) => ({
      id: rid(t, k.id), name: k.name, schuljahr: k.schuljahr ?? null,
      vorgaenger_klasse_id: k.vorgaengerKlasseId ? rid(t, k.vorgaengerKlasseId) : null,
      tenant_id: t,
    }))
  ), 'id')

  // ── 7. bridge_klasse_themen (pro Tenant) ──────────────────────────────────────
  // Constraint uq_thema_per_tenant: ein Thema darf pro Tenant nur EINER Klasse zugewiesen
  // sein. Das Seed-Data weist manche Themen (z.B. tma1) mehreren Klassen zu → wir behalten
  // pro Tenant die erste Klasse (k1 < k2), analog zur Bereinigung in Migration 011.
  console.log('Inserting bridge_klasse_themen…')
  await upsertBatched('bridge_klasse_themen', DATA_TENANTS.flatMap((t) => {
    const seenThemen = new Set<string>()
    return classes.filter((k) => POPULATED_CLASS_IDS.has(k.id)).flatMap((k) =>
      k.assignedThemaIds
        .filter((themaId) => !seenThemen.has(themaId) && seenThemen.add(themaId))
        .map((themaId) => ({
          klasse_id: rid(t, k.id), thema_id: rid(t, themaId), tenant_id: t,
        }))
    )
  }), 'klasse_id,thema_id')

  // ── 8. bridge_lp_zuweisungen (pro Tenant; lp_id bleibt original) ──────────────
  console.log('Inserting bridge_lp_zuweisungen…')
  await upsertBatched('bridge_lp_zuweisungen', DATA_TENANTS.flatMap((t) =>
    classes.flatMap((k) =>
      (k.lpZuweisungen ?? []).map((z) => ({
        klasse_id: rid(t, k.id), lp_id: z.lpId,
        fach_ids: ridArr(t, z.fachIds), rolle: z.rolle ?? null,
        tenant_id: t,
      }))
    )
  ), 'klasse_id,lp_id')

  // ── 9. dim_schueler (pro Tenant) ───────────────────────────────────────────────
  console.log('Inserting dim_schueler…')
  await upsertBatched('dim_schueler', DATA_TENANTS.flatMap((t) =>
    students.map((s) => ({
      id: rid(t, s.id), klasse_id: rid(t, s.klassId),
      vorname: s.vorname, nachname: s.nachname,
      note: s.note ?? '',
      bvsa: s.bvsa ?? false,
      rilz_fach_ids: ridArr(t, s.rilzFachIds),
      rilz_thema_ids: ridArr(t, s.rilzThemaIds),
      competency_status: s.competencyStatus ?? {}, // Kompetenz-Konstanten → nicht remappen
      lernziel_versuche: ridKeys(t, s.lernzielVersuche), // Keys = Lernziel-IDs
      progress_history: ridHistory(t, s.progressHistory),
      tenant_id: t,
    }))
  ), 'id')

  // ── 10. fact_lernziel_status (pro Tenant) ──────────────────────────────────────
  console.log('Inserting fact_lernziel_status…')
  await upsertBatched('fact_lernziel_status', DATA_TENANTS.flatMap((t) =>
    students.flatMap((s) =>
      Object.entries(s.lernzielStatus).map(([lzId, status]) => ({
        schueler_id: rid(t, s.id), lernziel_id: rid(t, lzId), status, tenant_id: t,
      }))
    )
  ), 'schueler_id,lernziel_id')

  // ── 11. fact_rilz_lernziele (pro Tenant) ──────────────────────────────────────
  console.log('Inserting fact_rilz_lernziele…')
  const rilzRows = DATA_TENANTS.flatMap((t) =>
    students.flatMap((s) =>
      (s.rilzLernziele ?? []).map((rlz) => ({
        id: rid(t, rlz.id), schueler_id: rid(t, s.id), thema_id: rid(t, rlz.themaId),
        label: rlz.label, status: rlz.status, tenant_id: t,
      }))
    )
  )
  if (rilzRows.length > 0) await upsertBatched('fact_rilz_lernziele', rilzRows, 'id')

  console.log('\n✅ Seed complete!')
  console.log(`   Tenants mit Daten: ${DATA_TENANTS.length}`)
  console.log(`   Fächer:    ${SEED_FAECHER.length} × ${DATA_TENANTS.length}`)
  console.log(`   Themen:    ${SEED_THEMEN.length} × ${DATA_TENANTS.length}`)
  console.log(`   Lernziele: ${allLernziele.length} × ${DATA_TENANTS.length}`)
  console.log(`   Klassen:   ${classes.length} × ${DATA_TENANTS.length} (5a + 5b)`)
  console.log(`   Schüler:   ${students.length} × ${DATA_TENANTS.length}`)
}

run().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
