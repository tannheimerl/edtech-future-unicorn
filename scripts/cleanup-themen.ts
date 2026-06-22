/**
 * Cleanup script: finds and optionally deletes unused Themen from Supabase.
 * A Thema is "unused" if it has no Lernziele, is not assigned to any Klasse,
 * has no RILZ references, and has no teacher comments.
 *
 * Dry-run (default):  npx tsx --env-file=.env.local scripts/cleanup-themen.ts
 * Delete mode:        npx tsx --env-file=.env.local scripts/cleanup-themen.ts --delete
 */

import { createClient } from '@supabase/supabase-js'

const DRY_RUN = process.argv[2] !== '--delete'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

async function main() {
  console.log(DRY_RUN ? '\n🔍 DRY RUN — keine Änderungen werden vorgenommen\n' : '\n🗑️  DELETE MODE\n')

  // 1. Alle Themen laden
  const { data: themen, error: themenErr } = await supabase.from('dim_themen').select('*')
  if (themenErr) throw themenErr

  // 2. Genutzte Thema-IDs aus allen referenzierenden Tabellen sammeln
  const [lzRows, bridgeRows, rilzRows, komRows] = await Promise.all([
    supabase.from('dim_lernziele').select('thema_id'),
    supabase.from('bridge_klasse_themen').select('thema_id'),
    supabase.from('fact_rilz_lernziele').select('thema_id'),
    supabase.from('fact_thema_kommentare').select('thema_id'),
  ])

  const usedIds = new Set<string>([
    ...(lzRows.data ?? []).map((r: { thema_id: string }) => r.thema_id),
    ...(bridgeRows.data ?? []).map((r: { thema_id: string }) => r.thema_id),
    ...(rilzRows.data ?? []).map((r: { thema_id: string }) => r.thema_id),
    ...(komRows.data ?? []).map((r: { thema_id: string }) => r.thema_id),
  ])

  const all = themen ?? []
  const unused = all.filter((t) => !usedIds.has(t.id))
  const used = all.filter((t) => usedIds.has(t.id))
  const missingStufe = used.filter((t) => !t.stufe?.length)

  // 3. Report
  console.log(`📊 Themen gesamt: ${all.length} | genutzt: ${used.length} | ungenutzt: ${unused.length}\n`)

  if (unused.length > 0) {
    console.log(`=== Ungenutzte Themen (werden gelöscht) ===`)
    unused.forEach((t) =>
      console.log(`  ❌ [${t.id}] "${t.name}" | fach: ${t.fach_id} | typ: ${t.typ ?? 'standard'} | tenant: ${t.tenant_id}`)
    )
  } else {
    console.log('✅ Keine ungenutzten Themen gefunden.')
  }

  if (missingStufe.length > 0) {
    console.log(`\n=== Genutzte Themen ohne stufe-Feld (manuell in App befüllen) ===`)
    missingStufe.forEach((t) =>
      console.log(`  ⚠️  [${t.id}] "${t.name}" | fach: ${t.fach_id} | tenant: ${t.tenant_id}`)
    )
  } else {
    console.log('\n✅ Alle genutzten Themen haben ein stufe-Feld.')
  }

  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN abgeschlossen. Zum wirklichen Löschen:\n   npx tsx --env-file=.env.local scripts/cleanup-themen.ts --delete\n')
    return
  }

  // 4. Löschen (ON DELETE CASCADE kümmert sich um abhängige Zeilen)
  if (unused.length === 0) {
    console.log('\n✅ Nichts zu löschen.')
    return
  }

  const { error: delErr } = await supabase
    .from('dim_themen')
    .delete()
    .in('id', unused.map((t) => t.id))

  if (delErr) throw delErr
  console.log(`\n✅ ${unused.length} Themen erfolgreich gelöscht.`)
}

main().catch((err) => {
  console.error('\n❌ Fehler:', err)
  process.exit(1)
})
