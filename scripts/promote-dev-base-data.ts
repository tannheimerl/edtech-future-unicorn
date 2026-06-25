/**
 * One-off data repair: promote the 5a/5b demo *base data* from tenant 'dev'
 * to tenant 'shared' so it is visible to every tenant (all testers).
 *
 * Why: base data created via the local app UI gets written under
 * NEXT_PUBLIC_DEV_TENANT='dev'. The loader queries ['shared', <tenant>], so
 * 'dev'-only rows are invisible to testers (tenant lz_tXX). Moving them to
 * 'shared' (the always-queried, read-only base layer) fixes that.
 *
 * Safe: all PKs are id-based/global and the 'dev' ids are disjoint from the
 * 'shared' ids, so a plain tenant_id update cannot collide.
 *
 * Intentionally NOT moved (these are read per exact tenant, not via 'shared'):
 *   fact_pruefungen, fact_pruefung_ergebnisse, dim_tag_kategorien
 *
 * Run with:  npx tsx --env-file=.env.local scripts/promote-dev-base-data.ts
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// Parent → child order (FKs are id-only, so order is just for readability).
const TABLES = [
  'dim_faecher',
  'dim_themen',
  'dim_lernziele',
  'dim_klassen',
  'dim_schueler',
  'fact_lernziel_status',
] as const

const ALL_TENANT_TABLES = [
  ...TABLES,
  'fact_rilz_lernziele',
  'fact_kommentare',
  'fact_thema_kommentare',
  'bridge_klasse_themen',
  'bridge_lp_zuweisungen',
  'dim_lehrpersonen',
  'fact_pruefungen',
  'fact_pruefung_ergebnisse',
] as const

async function run() {
  console.log('Promoting dev → shared base data…\n')

  for (const table of TABLES) {
    // Count first so we can report exactly how many rows move. Use a head-count
    // (no column projection) since some fact tables have a composite PK and no
    // `id` column.
    const { count: pre, error: eSel } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', 'dev')
    if (eSel) throw new Error(`${table} count: ${eSel.message}`)

    const count = pre ?? 0
    if (count === 0) {
      console.log(`  ${table}: 0 dev rows (nothing to do)`)
      continue
    }

    const { error: eUpd } = await supabase
      .from(table)
      .update({ tenant_id: 'shared' })
      .eq('tenant_id', 'dev')
    if (eUpd) throw new Error(`${table} update: ${eUpd.message}`)

    console.log(`  ${table}: moved ${count} row(s) dev → shared`)
  }

  // ── Verification: counts per tenant for every tenant-scoped table ──────────
  console.log('\nVerification (rows per tenant for shared/dev):')
  for (const table of ALL_TENANT_TABLES) {
    const [shared, dev] = await Promise.all([
      supabase.from(table).select('*', { count: 'exact', head: true }).eq('tenant_id', 'shared'),
      supabase.from(table).select('*', { count: 'exact', head: true }).eq('tenant_id', 'dev'),
    ])
    if (shared.error) throw new Error(`${table} count shared: ${shared.error.message}`)
    if (dev.error) throw new Error(`${table} count dev: ${dev.error.message}`)
    console.log(`  ${table.padEnd(24)} shared=${shared.count ?? 0}  dev=${dev.count ?? 0}`)
  }

  console.log('\n✅ Done. dim_klassen should now be shared=2 / dev=0.')
}

run().catch((err) => {
  console.error('❌ Migration failed:', err)
  process.exit(1)
})
