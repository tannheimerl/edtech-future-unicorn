/**
 * Seed script: inserts a half-corrected demo exam (Prüfung) for all demo tenants.
 * Klasse 5a (k1), Mathematik (f2), Zahlen & Geometrie — 6 Lernziele, 6 of 7 students have results.
 *
 * Run with:  npx tsx --env-file=.env.local scripts/seed-demo-pruefung.ts
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

const PRUEFUNG_LERNZIEL_IDS = ['lma1a', 'lma1b', 'lma1c', 'lma2a', 'lma2b', 'lma2c']

// fact_lernziel_status: set realistic values for demo students (under 'shared')
const DEMO_LZ_STATUS: { schuelerId: string; lzId: string; status: string }[] = [
  // s1 Emma Bauer — Note 5.5
  { schuelerId: 's1', lzId: 'lma1a', status: 'reached' },
  { schuelerId: 's1', lzId: 'lma1b', status: 'reached' },
  { schuelerId: 's1', lzId: 'lma1c', status: 'reached' },
  { schuelerId: 's1', lzId: 'lma2a', status: 'reached' },
  { schuelerId: 's1', lzId: 'lma2b', status: 'reached' },
  { schuelerId: 's1', lzId: 'lma2c', status: 'reached' },
  // s2 Luca Müller — Note 4.5
  { schuelerId: 's2', lzId: 'lma1a', status: 'reached' },
  { schuelerId: 's2', lzId: 'lma1b', status: 'reached' },
  { schuelerId: 's2', lzId: 'lma1c', status: 'partially_reached' },
  { schuelerId: 's2', lzId: 'lma2a', status: 'reached' },
  { schuelerId: 's2', lzId: 'lma2b', status: 'partially_reached' },
  { schuelerId: 's2', lzId: 'lma2c', status: 'reached' },
  // s4 Noah Fischer — Note 5.0
  { schuelerId: 's4', lzId: 'lma1a', status: 'reached' },
  { schuelerId: 's4', lzId: 'lma1b', status: 'reached' },
  { schuelerId: 's4', lzId: 'lma1c', status: 'reached' },
  { schuelerId: 's4', lzId: 'lma2a', status: 'reached' },
  { schuelerId: 's4', lzId: 'lma2b', status: 'partially_reached' },
  { schuelerId: 's4', lzId: 'lma2c', status: 'reached' },
  // s13 Leon Wagner — Note 3.5
  { schuelerId: 's13', lzId: 'lma1a', status: 'partially_reached' },
  { schuelerId: 's13', lzId: 'lma1b', status: 'reached' },
  { schuelerId: 's13', lzId: 'lma1c', status: 'not_reached' },
  { schuelerId: 's13', lzId: 'lma2a', status: 'partially_reached' },
  { schuelerId: 's13', lzId: 'lma2b', status: 'not_reached' },
  { schuelerId: 's13', lzId: 'lma2c', status: 'partially_reached' },
  // s14 Anna Huber — zweiter Versuch (erster: Note 3.0)
  { schuelerId: 's14', lzId: 'lma1a', status: 'partially_reached' },
  { schuelerId: 's14', lzId: 'lma1b', status: 'not_reached' },
  { schuelerId: 's14', lzId: 'lma1c', status: 'not_reached' },
  { schuelerId: 's14', lzId: 'lma2a', status: 'not_reached' },
  { schuelerId: 's14', lzId: 'lma2b', status: 'not_reached' },
  { schuelerId: 's14', lzId: 'lma2c', status: 'partially_reached' },
  // s15 Paul Koch — laufend, teilweise korrigiert
  { schuelerId: 's15', lzId: 'lma1a', status: 'reached' },
  { schuelerId: 's15', lzId: 'lma1b', status: 'partially_reached' },
]

async function run() {
  // ── 1. fact_lernziel_status (shared, einmalig) ──────────────────────────────
  console.log('Upserting fact_lernziel_status for demo students…')
  const lzStatusRows = DEMO_LZ_STATUS.map((r) => ({
    schueler_id: r.schuelerId,
    lernziel_id: r.lzId,
    status: r.status,
    tenant_id: 'shared',
  }))
  const { error: eLZ } = await supabase.from('fact_lernziel_status').upsert(
    lzStatusRows,
    { onConflict: 'schueler_id,lernziel_id' }
  )
  if (eLZ) throw new Error(`fact_lernziel_status: ${eLZ.message}`)
  console.log(`  → ${lzStatusRows.length} LZ-Status upserted`)

  // ── 2. fact_pruefungen + fact_pruefung_ergebnisse (pro Tenant) ──────────────
  console.log(`Inserting demo Prüfung for ${ALL_TENANTS.length} tenants…`)

  for (const tenantId of ALL_TENANTS) {
    const pruefungId = `demo-pruefung-${tenantId}`

    // Prüfung
    const { error: eP } = await supabase.from('fact_pruefungen').upsert(
      {
        id: pruefungId,
        klasse_id: 'k1',
        fach_id: 'f2',
        name: 'Schriftliche Prüfung – Zahlen & Geometrie',
        datum: '2026-05-14',
        lernziel_ids: PRUEFUNG_LERNZIEL_IDS,
        typ: 'pruefung_schriftlich',
        status: 'laufend',
        punkte_enabled: true,
        note_enabled: true,
        anhang_enabled: false,
        max_punkte: 20,
        erstellt_von_id: 'lp2',
        tenant_id: tenantId,
      },
      { onConflict: 'id' }
    )
    if (eP) throw new Error(`fact_pruefungen [${tenantId}]: ${eP.message}`)

    // Ergebnisse
    const ergebnisse = [
      {
        id: `demo-erg-s1-${tenantId}`,
        pruefung_id: pruefungId,
        schueler_id: 's1',
        punkte: 18,
        note: '5.5',
        anzahl_versuche: 1,
        zweiter_versuch_ausstehend: false,
        abgeschlossen: true,
        versuch_snapshots: [],
        status: 'reached',
        anhang_urls: [],
        tenant_id: tenantId,
      },
      {
        id: `demo-erg-s2-${tenantId}`,
        pruefung_id: pruefungId,
        schueler_id: 's2',
        punkte: 14,
        note: '4.5',
        anzahl_versuche: 1,
        zweiter_versuch_ausstehend: false,
        abgeschlossen: true,
        versuch_snapshots: [],
        status: 'reached',
        anhang_urls: [],
        tenant_id: tenantId,
      },
      {
        id: `demo-erg-s4-${tenantId}`,
        pruefung_id: pruefungId,
        schueler_id: 's4',
        punkte: 16,
        note: '5.0',
        anzahl_versuche: 1,
        zweiter_versuch_ausstehend: false,
        abgeschlossen: true,
        versuch_snapshots: [],
        status: 'reached',
        anhang_urls: [],
        tenant_id: tenantId,
      },
      {
        id: `demo-erg-s13-${tenantId}`,
        pruefung_id: pruefungId,
        schueler_id: 's13',
        punkte: 11,
        note: '3.5',
        anzahl_versuche: 1,
        zweiter_versuch_ausstehend: false,
        abgeschlossen: true,
        versuch_snapshots: [],
        status: 'partially_reached',
        anhang_urls: [],
        tenant_id: tenantId,
      },
      {
        // Anna: zweiter Versuch ausstehend
        id: `demo-erg-s14-${tenantId}`,
        pruefung_id: pruefungId,
        schueler_id: 's14',
        punkte: null,
        note: null,
        anzahl_versuche: 1,
        zweiter_versuch_ausstehend: true,
        abgeschlossen: false,
        versuch_snapshots: [
          { nr: 1, date: '2026-05-14', punkte: 9, note: '3.0', status: 'not_reached' },
        ],
        status: null,
        anhang_urls: [],
        tenant_id: tenantId,
      },
      {
        // Paul: laufend, Punkte eingetragen, Note noch ausstehend
        id: `demo-erg-s15-${tenantId}`,
        pruefung_id: pruefungId,
        schueler_id: 's15',
        punkte: 7,
        note: null,
        anzahl_versuche: 1,
        zweiter_versuch_ausstehend: false,
        abgeschlossen: false,
        versuch_snapshots: [],
        status: null,
        anhang_urls: [],
        tenant_id: tenantId,
      },
    ]

    const { error: eE } = await supabase.from('fact_pruefung_ergebnisse').upsert(
      ergebnisse,
      { onConflict: 'id' }
    )
    if (eE) throw new Error(`fact_pruefung_ergebnisse [${tenantId}]: ${eE.message}`)
  }

  console.log('\n✅ Demo-Prüfung seed complete!')
  console.log(`   Tenants: ${ALL_TENANTS.length}`)
  console.log('   Prüfung: "Schriftliche Prüfung – Zahlen & Geometrie" (Klasse 5a, Mathematik)')
  console.log('   Ergebnisse: 4 abgeschlossen · 1 zweiter Versuch · 1 laufend · 1 ohne Ergebnis (RILZ)')
}

run().catch((err) => {
  console.error('❌ Demo-Seed failed:', err)
  process.exit(1)
})
