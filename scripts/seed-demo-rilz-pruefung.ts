/**
 * Seed script: inserts a RILZ exam for Mia Schneider (s3) across all demo tenants.
 * Klasse 5a (k1), Mathematik (f2), RILZ-Lernziele aus tma1_rilz.
 * Scenario: 1. Versuch abgeschlossen (4/10 Punkte, nicht erreicht) → 2. Versuch ausstehend.
 *
 * Run with:  npx tsx --env-file=.env.local scripts/seed-demo-rilz-pruefung.ts
 *
 * Idempotent: uses deterministic IDs, upserts on conflict.
 */

import { createClient } from '@supabase/supabase-js'
import { TENANT_TOKENS } from '../src/lib/tenants'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const ALL_TENANTS = ['dev', ...TENANT_TOKENS]

const RILZ_LZ_IDS = ['rilz_tma1_a', 'rilz_tma1_b', 'rilz_tma1_c']

async function run() {
  // ── 1. fact_lernziel_status (shared, einmalig) ──────────────────────────────
  console.log('Upserting fact_lernziel_status for Mia (s3) RILZ-Lernziele…')
  const lzStatusRows = [
    { schueler_id: 's3', lernziel_id: 'rilz_tma1_a', status: 'partially_reached', tenant_id: 'shared' },
    { schueler_id: 's3', lernziel_id: 'rilz_tma1_b', status: 'not_reached',        tenant_id: 'shared' },
    { schueler_id: 's3', lernziel_id: 'rilz_tma1_c', status: 'not_reached',        tenant_id: 'shared' },
  ]
  const { error: eLZ } = await supabase.from('fact_lernziel_status').upsert(
    lzStatusRows,
    { onConflict: 'schueler_id,lernziel_id' }
  )
  if (eLZ) throw new Error(`fact_lernziel_status: ${eLZ.message}`)
  console.log(`  → ${lzStatusRows.length} LZ-Status upserted`)

  // ── 2. fact_pruefungen + fact_pruefung_ergebnisse (pro Tenant) ──────────────
  console.log(`Inserting RILZ-Prüfung for ${ALL_TENANTS.length} tenants…`)

  for (const tenantId of ALL_TENANTS) {
    const pruefungId = `demo-rilz-pruefung-${tenantId}`

    const { error: eP } = await supabase.from('fact_pruefungen').upsert(
      {
        id: pruefungId,
        klasse_id: 'k1',
        fach_id: 'f2',
        name: 'Lernkontrolle Zahlen & Operationen (RILZ)',
        datum: '2026-06-01',
        lernziel_ids: RILZ_LZ_IDS,
        typ: 'pruefung_schriftlich',
        status: 'laufend',
        punkte_enabled: true,
        note_enabled: false,
        anhang_enabled: false,
        max_punkte: 10,
        erstellt_von_id: 'lp4',
        nur_rilz: true,
        rilz_schueler_ids: ['s3'],
        tenant_id: tenantId,
      },
      { onConflict: 'id' }
    )
    if (eP) throw new Error(`fact_pruefungen [${tenantId}]: ${eP.message}`)

    const { error: eE } = await supabase.from('fact_pruefung_ergebnisse').upsert(
      [
        {
          // Mia: 1. Versuch war 4/10 (nicht erreicht) → 2. Versuch ausstehend
          id: `demo-rilz-erg-s3-${tenantId}`,
          pruefung_id: pruefungId,
          schueler_id: 's3',
          punkte: null,
          note: null,
          anzahl_versuche: 1,
          zweiter_versuch_ausstehend: true,
          abgeschlossen: false,
          versuch_snapshots: [
            { nr: 1, date: '2026-06-01', punkte: 4, status: 'not_reached' },
          ],
          status: null,
          anhang_urls: [],
          tenant_id: tenantId,
        },
      ],
      { onConflict: 'id' }
    )
    if (eE) throw new Error(`fact_pruefung_ergebnisse [${tenantId}]: ${eE.message}`)
  }

  console.log('\n✅ RILZ Demo-Prüfung seed complete!')
  console.log(`   Tenants: ${ALL_TENANTS.length}`)
  console.log('   Prüfung: "Lernkontrolle Zahlen & Operationen (RILZ)" (Klasse 5a, Mathematik)')
  console.log('   Ergebnis: Mia Schneider (s3) – 2. Versuch ausstehend (1. Versuch: 4/10 Pkt.)')
}

run().catch((err) => {
  console.error('❌ RILZ Demo-Seed failed:', err)
  process.exit(1)
})
