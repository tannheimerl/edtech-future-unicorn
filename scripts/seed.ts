/**
 * Seed script: inserts the base data (5a + 5b samt Bibliothek) once, using the
 * original IDs from seed-data.ts (no tenant, no per-tenant ID prefixing).
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// Seed 5a (k1) und 5b (k2), nicht 7c (k3).
const SHARED_CLASS_IDS = new Set(['k1', 'k2'])
// 5b (k2) bleibt eine LEERE Sandbox: Klasse + LP-Zuweisung werden angelegt, aber
// keine Schüler und keine Themen-Zuweisungen (siehe scripts/empty-5b.sql).
const POPULATED_CLASS_IDS = new Set(['k1'])
const classes = SEED_CLASSES.filter((k) => SHARED_CLASS_IDS.has(k.id))
const students = SEED_STUDENTS.filter((s) => POPULATED_CLASS_IDS.has(s.klassId))

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
  console.log('Inserting dim_lehrpersonen…')
  const { error: eLP } = await supabase.from('dim_lehrpersonen').upsert(
    SEED_LEHRPERSONEN.map((lp) => ({ id: lp.id, name: lp.name, kuerzel: lp.kuerzel })),
    { onConflict: 'id' }
  )
  if (eLP) throw new Error(`dim_lehrpersonen: ${eLP.message}`)

  console.log('Inserting dim_faecher…')
  await upsertBatched('dim_faecher', SEED_FAECHER.map((f) => ({ id: f.id, name: f.name })), 'id')

  // Standard-Themen zuerst (RILZ-Themen referenzieren sie via standard_thema_id).
  console.log('Inserting dim_themen…')
  const standardThemen = SEED_THEMEN.filter((t) => t.typ !== 'rilz')
  const rilzThemen = SEED_THEMEN.filter((t) => t.typ === 'rilz')

  await upsertBatched('dim_themen', standardThemen.map((th) => ({
    id: th.id, fach_id: th.fachId, name: th.name,
    typ: th.typ ?? 'standard',
    standard_thema_id: th.standardThemaId ?? null,
    faellig_am: th.faelligAm ?? null,
    stufe: th.stufe ?? null,
    zyklus: th.zyklus ?? null,
    autor: th.autor ?? null,
    autor_lp_id: th.autorLpId ?? null,
  })), 'id')

  await upsertBatched('dim_themen', rilzThemen.map((th) => ({
    id: th.id, fach_id: th.fachId, name: th.name,
    typ: 'rilz',
    standard_thema_id: th.standardThemaId ?? null,
    faellig_am: null, stufe: null, zyklus: null,
    autor: null, autor_lp_id: null,
  })), 'id')

  console.log('Inserting dim_lernziele…')
  const allLernziele = [...SEED_LERNZIELE, ...SEED_LERNZIELE_RILZ]
  await upsertBatched('dim_lernziele', allLernziele.map((l) => ({
    id: l.id, thema_id: l.themaId, kategorie: l.kategorie, label: l.label,
    kriterien: l.kriterien ?? null,
    stufe: l.stufe ?? null,
    beschreibung: l.beschreibung ?? null,
  })), 'id')

  console.log('Inserting dim_klassen…')
  await upsertBatched('dim_klassen', classes.map((k) => ({
    id: k.id, name: k.name, schuljahr: k.schuljahr ?? null,
    vorgaenger_klasse_id: k.vorgaengerKlasseId ?? null,
  })), 'id')

  // Constraint uq_thema_per_tenant (jetzt: UNIQUE(thema_id)): ein Thema darf nur
  // EINER Klasse zugewiesen sein. Behalte pro Thema die erste Klasse (k1 < k2).
  console.log('Inserting bridge_klasse_themen…')
  const seenThemen = new Set<string>()
  const bridgeRows = classes.filter((k) => POPULATED_CLASS_IDS.has(k.id)).flatMap((k) =>
    k.assignedThemaIds
      .filter((themaId) => !seenThemen.has(themaId) && seenThemen.add(themaId))
      .map((themaId) => ({ klasse_id: k.id, thema_id: themaId }))
  )
  await upsertBatched('bridge_klasse_themen', bridgeRows, 'klasse_id,thema_id')

  console.log('Inserting bridge_lp_zuweisungen…')
  await upsertBatched('bridge_lp_zuweisungen', classes.flatMap((k) =>
    (k.lpZuweisungen ?? []).map((z) => ({
      klasse_id: k.id, lp_id: z.lpId, fach_ids: z.fachIds, rolle: z.rolle ?? null,
    }))
  ), 'klasse_id,lp_id')

  console.log('Inserting dim_schueler…')
  await upsertBatched('dim_schueler', students.map((s) => ({
    id: s.id, klasse_id: s.klassId,
    vorname: s.vorname, nachname: s.nachname,
    note: s.note ?? '',
    bvsa: s.bvsa ?? false,
    rilz_fach_ids: s.rilzFachIds ?? [],
    rilz_thema_ids: s.rilzThemaIds ?? [],
    competency_status: s.competencyStatus ?? {},
    lernziel_versuche: s.lernzielVersuche ?? {},
    progress_history: s.progressHistory ?? [],
  })), 'id')

  console.log('Inserting fact_lernziel_status…')
  await upsertBatched('fact_lernziel_status', students.flatMap((s) =>
    Object.entries(s.lernzielStatus).map(([lzId, status]) => ({
      schueler_id: s.id, lernziel_id: lzId, status,
    }))
  ), 'schueler_id,lernziel_id')

  console.log('Inserting fact_rilz_lernziele…')
  const rilzRows = students.flatMap((s) =>
    (s.rilzLernziele ?? []).map((rlz) => ({
      id: rlz.id, schueler_id: s.id, thema_id: rlz.themaId,
      label: rlz.label, status: rlz.status,
    }))
  )
  if (rilzRows.length > 0) await upsertBatched('fact_rilz_lernziele', rilzRows, 'id')

  console.log('\n✅ Seed complete!')
  console.log(`   Fächer:    ${SEED_FAECHER.length}`)
  console.log(`   Themen:    ${SEED_THEMEN.length}`)
  console.log(`   Lernziele: ${allLernziele.length}`)
  console.log(`   Klassen:   ${classes.length} (5a + 5b)`)
  console.log(`   Schüler:   ${students.length}`)
}

run().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
