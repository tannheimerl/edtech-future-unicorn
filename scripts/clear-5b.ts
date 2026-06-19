/**
 * One-time script: clear all class-specific data for 5b (k2) under tenant 'shared'.
 * Keeps: dim_klassen, bridge_lp_zuweisungen, and all global Lernzielsammlung.
 * Run: npx tsx --env-file=.env.local scripts/clear-5b.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

const KLASSE_ID = 'k2'
const TENANT_ID = 'shared'

async function run() {
  // Step 1: Delete students (cascades: fact_lernziel_status, fact_rilz_lernziele,
  //         fact_kommentare, fact_thema_kommentare)
  console.log('Deleting students of 5b…')
  const { error: eS, count: cS } = await supabase
    .from('dim_schueler')
    .delete({ count: 'exact' })
    .eq('klasse_id', KLASSE_ID)
    .eq('tenant_id', TENANT_ID)
  if (eS) throw new Error(`dim_schueler: ${eS.message}`)
  console.log(`  → ${cS} student(s) deleted (+ all cascaded fact data)`)

  // Step 2: Delete class-topic assignments
  console.log('Deleting bridge_klasse_themen for 5b…')
  const { error: eBKT, count: cBKT } = await supabase
    .from('bridge_klasse_themen')
    .delete({ count: 'exact' })
    .eq('klasse_id', KLASSE_ID)
    .eq('tenant_id', TENANT_ID)
  if (eBKT) throw new Error(`bridge_klasse_themen: ${eBKT.message}`)
  console.log(`  → ${cBKT} theme assignment(s) deleted`)

  // Verify
  console.log('\nVerification:')
  const { count: vS } = await supabase
    .from('dim_schueler')
    .select('*', { count: 'exact', head: true })
    .eq('klasse_id', KLASSE_ID)
    .eq('tenant_id', TENANT_ID)
  console.log(`  dim_schueler for k2: ${vS} (expected 0)`)

  const { count: vBKT } = await supabase
    .from('bridge_klasse_themen')
    .select('*', { count: 'exact', head: true })
    .eq('klasse_id', KLASSE_ID)
    .eq('tenant_id', TENANT_ID)
  console.log(`  bridge_klasse_themen for k2: ${vBKT} (expected 0)`)

  const { count: vK } = await supabase
    .from('dim_klassen')
    .select('*', { count: 'exact', head: true })
    .eq('id', KLASSE_ID)
    .eq('tenant_id', TENANT_ID)
  console.log(`  dim_klassen for k2: ${vK} (expected 1 — class still exists)`)

  console.log('\nDone.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
