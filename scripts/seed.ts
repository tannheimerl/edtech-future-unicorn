/**
 * Seed script: inserts all shared base data (5a + 5b) into Supabase under tenant_id = 'shared'.
 * Also inserts the 'dev' tenant and all 15 tester tenants.
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
} from '../src/lib/mock-data'
import { TENANT_TOKENS } from '../src/lib/tenants'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// Only seed 5a (k1) and 5b (k2), not 7c (k3)
const SHARED_CLASS_IDS = new Set(['k1', 'k2'])
const classes = SEED_CLASSES.filter((k) => SHARED_CLASS_IDS.has(k.id))
const students = SEED_STUDENTS.filter((s) => SHARED_CLASS_IDS.has(s.klassId))

async function run() {
  // ── 1. Tenants ──────────────────────────────────────────────────────────────
  console.log('Inserting tenants…')
  const { error: eT } = await supabase.from('dim_tenants').upsert(
    [
      { id: 'shared', name: 'Shared – Klasse 5a & 5b (read-only base data)' },
      { id: 'dev',    name: 'Development' },
      ...TENANT_TOKENS.map((token, i) => ({ id: token, name: `Tester ${i + 1}` })),
    ],
    { onConflict: 'id' }
  )
  if (eT) throw new Error(`tenants: ${eT.message}`)

  // ── 2. Fächer ───────────────────────────────────────────────────────────────
  console.log('Inserting dim_faecher…')
  const { error: eF } = await supabase.from('dim_faecher').upsert(
    SEED_FAECHER.map((f) => ({ id: f.id, name: f.name, tenant_id: 'shared' })),
    { onConflict: 'id' }
  )
  if (eF) throw new Error(`dim_faecher: ${eF.message}`)

  // ── 3. Lehrpersonen (before Themen — FK autor_lp_id) ────────────────────────
  console.log('Inserting dim_lehrpersonen…')
  const { error: eLP } = await supabase.from('dim_lehrpersonen').upsert(
    SEED_LEHRPERSONEN.map((lp) => ({
      id: lp.id, name: lp.name, kuerzel: lp.kuerzel, tenant_id: 'shared',
    })),
    { onConflict: 'id' }
  )
  if (eLP) throw new Error(`dim_lehrpersonen: ${eLP.message}`)

  // ── 4. Themen ────────────────────────────────────────────────────────────────
  console.log('Inserting dim_themen…')
  // Insert standard themen first (some RILZ themen reference them via standard_thema_id)
  const standardThemen = SEED_THEMEN.filter((t) => t.typ !== 'rilz')
  const rilzThemen = SEED_THEMEN.filter((t) => t.typ === 'rilz')

  const { error: eTS } = await supabase.from('dim_themen').upsert(
    standardThemen.map((t) => ({
      id: t.id, fach_id: t.fachId, name: t.name,
      typ: t.typ ?? 'standard',
      standard_thema_id: t.standardThemaId ?? null,
      faellig_am: t.faelligAm ?? null,
      stufe: t.stufe ?? null,
      zyklus: t.zyklus ?? null,
      autor: t.autor ?? null,
      autor_lp_id: t.autorLpId ?? null,
      tenant_id: 'shared',
    })),
    { onConflict: 'id' }
  )
  if (eTS) throw new Error(`dim_themen (standard): ${eTS.message}`)

  const { error: eTR } = await supabase.from('dim_themen').upsert(
    rilzThemen.map((t) => ({
      id: t.id, fach_id: t.fachId, name: t.name,
      typ: 'rilz',
      standard_thema_id: t.standardThemaId ?? null,
      faellig_am: null, stufe: null, zyklus: null,
      autor: null, autor_lp_id: null,
      tenant_id: 'shared',
    })),
    { onConflict: 'id' }
  )
  if (eTR) throw new Error(`dim_themen (rilz): ${eTR.message}`)

  // ── 4. Lernziele ─────────────────────────────────────────────────────────────
  console.log('Inserting dim_lernziele…')
  const allLernziele = [...SEED_LERNZIELE, ...SEED_LERNZIELE_RILZ]
  const { error: eLZ } = await supabase.from('dim_lernziele').upsert(
    allLernziele.map((l) => ({
      id: l.id, thema_id: l.themaId, kategorie: l.kategorie, label: l.label,
      kriterien: l.kriterien ?? null,
      stufe: l.stufe ?? null,
      beschreibung: l.beschreibung ?? null,
      tenant_id: 'shared',
    })),
    { onConflict: 'id' }
  )
  if (eLZ) throw new Error(`dim_lernziele: ${eLZ.message}`)

  // ── 6. Klassen (5a + 5b only) ────────────────────────────────────────────────
  console.log('Inserting dim_klassen…')
  const { error: eK } = await supabase.from('dim_klassen').upsert(
    classes.map((k) => ({
      id: k.id, name: k.name, schuljahr: k.schuljahr ?? null,
      vorgaenger_klasse_id: k.vorgaengerKlasseId ?? null,
      tenant_id: 'shared',
    })),
    { onConflict: 'id' }
  )
  if (eK) throw new Error(`dim_klassen: ${eK.message}`)

  // ── 7. bridge_klasse_themen ──────────────────────────────────────────────────
  console.log('Inserting bridge_klasse_themen…')
  const klasseThemenRows = classes.flatMap((k) =>
    k.assignedThemaIds.map((themaId) => ({
      klasse_id: k.id, thema_id: themaId, tenant_id: 'shared',
    }))
  )
  const { error: eKT } = await supabase.from('bridge_klasse_themen').upsert(
    klasseThemenRows, { onConflict: 'klasse_id,thema_id' }
  )
  if (eKT) throw new Error(`bridge_klasse_themen: ${eKT.message}`)

  // ── 8. bridge_lp_zuweisungen ─────────────────────────────────────────────────
  console.log('Inserting bridge_lp_zuweisungen…')
  const lpZuweisungRows = classes.flatMap((k) =>
    (k.lpZuweisungen ?? []).map((z) => ({
      klasse_id: k.id, lp_id: z.lpId,
      fach_ids: z.fachIds, rolle: z.rolle ?? null,
      tenant_id: 'shared',
    }))
  )
  const { error: eLPZ } = await supabase.from('bridge_lp_zuweisungen').upsert(
    lpZuweisungRows, { onConflict: 'klasse_id,lp_id' }
  )
  if (eLPZ) throw new Error(`bridge_lp_zuweisungen: ${eLPZ.message}`)

  // ── 9. dim_schueler ──────────────────────────────────────────────────────────
  console.log('Inserting dim_schueler…')
  const { error: eS } = await supabase.from('dim_schueler').upsert(
    students.map((s) => ({
      id: s.id, klasse_id: s.klassId,
      vorname: s.vorname, nachname: s.nachname,
      note: s.note ?? '',
      bvsa: s.bvsa ?? false,
      rilz_fach_ids: s.rilzFachIds ?? [],
      rilz_thema_ids: s.rilzThemaIds ?? [],
      competency_status: s.competencyStatus ?? {},
      lernziel_versuche: s.lernzielVersuche ?? {},
      progress_history: s.progressHistory ?? [],
      tenant_id: 'shared',
    })),
    { onConflict: 'id' }
  )
  if (eS) throw new Error(`dim_schueler: ${eS.message}`)

  // ── 10. fact_lernziel_status ──────────────────────────────────────────────────
  console.log('Inserting fact_lernziel_status…')
  const statusRows = students.flatMap((s) =>
    Object.entries(s.lernzielStatus).map(([lzId, status]) => ({
      schueler_id: s.id, lernziel_id: lzId, status, tenant_id: 'shared',
    }))
  )
  // Insert in batches to avoid request size limits
  const BATCH = 500
  for (let i = 0; i < statusRows.length; i += BATCH) {
    const batch = statusRows.slice(i, i + BATCH)
    const { error: eST } = await supabase.from('fact_lernziel_status').upsert(
      batch, { onConflict: 'schueler_id,lernziel_id' }
    )
    if (eST) throw new Error(`fact_lernziel_status batch ${i}: ${eST.message}`)
  }
  console.log(`  → ${statusRows.length} status rows inserted`)

  // ── 11. fact_rilz_lernziele ───────────────────────────────────────────────────
  console.log('Inserting fact_rilz_lernziele…')
  const rilzRows = students.flatMap((s) =>
    (s.rilzLernziele ?? []).map((rlz) => ({
      id: rlz.id, schueler_id: s.id, thema_id: rlz.themaId,
      label: rlz.label, status: rlz.status, tenant_id: 'shared',
    }))
  )
  if (rilzRows.length > 0) {
    const { error: eRL } = await supabase.from('fact_rilz_lernziele').upsert(
      rilzRows, { onConflict: 'id' }
    )
    if (eRL) throw new Error(`fact_rilz_lernziele: ${eRL.message}`)
  }
  console.log(`  → ${rilzRows.length} RILZ-Lernziel rows inserted`)

  console.log('\n✅ Seed complete!')
  console.log(`   Fächer: ${SEED_FAECHER.length}`)
  console.log(`   Themen: ${SEED_THEMEN.length}`)
  console.log(`   Lernziele: ${allLernziele.length}`)
  console.log(`   Klassen: ${classes.length} (5a + 5b)`)
  console.log(`   Schüler: ${students.length}`)
  console.log(`   Status-Einträge: ${statusRows.length}`)
}

run().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
