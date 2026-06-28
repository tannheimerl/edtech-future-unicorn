/**
 * Read-only Diagnose: Woher kommt „Grössen, Daten und Zufall (RILZ)"?
 * Listet alle dim_themen-Treffer pro Tenant und markiert Seed- (<tenant>__tma3_rilz)
 * vs. UI-Ursprung (zufällige UUID). Nur SELECT, keine Schreibzugriffe.
 *
 * Run with:  npx tsx --env-file=.env.local scripts/check-thema-tma3-rilz.ts
 */
import { createClient } from '@supabase/supabase-js'
import { TENANT_TOKENS } from '../src/lib/tenants'

const BETTINA = 'lz_t01_k4rp9'

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  // Alle Themen laden, dann per Name ODER Seed-ID-Endung filtern.
  // (PostgREST .or() scheitert am Komma im Namen → Filter in JS.)
  const { data, error } = await sb
    .from('dim_themen')
    .select('id, name, typ, tenant_id')

  if (error) throw new Error(error.message)

  const rows = (data ?? []).filter(
    r => /grössen, daten und zufall/i.test(r.name) || r.id.endsWith('__tma3_rilz')
  )
  const isSeedId = (id: string) => id.endsWith('__tma3_rilz')
  const origin = (id: string) => (isSeedId(id) ? 'SEED' : 'UI (random UUID)')

  // Gruppiert nach Tenant ausgeben.
  const byTenant = new Map<string, typeof rows>()
  for (const r of rows) {
    const list = byTenant.get(r.tenant_id) ?? []
    list.push(r)
    byTenant.set(r.tenant_id, list)
  }

  const order = ['dev', ...TENANT_TOKENS]
  console.log(`=== Treffer „Grössen, Daten und Zufall" / *__tma3_rilz (${rows.length}) ===\n`)
  for (const tenant of order) {
    const list = byTenant.get(tenant)
    if (!list?.length) continue
    const tag = tenant === 'dev' ? ' (DEV)' : tenant === BETTINA ? ' (Bettina)' : ''
    console.log(`Tenant ${tenant}${tag}:`)
    for (const r of list) {
      console.log(`  [${origin(r.id)}] id=${r.id} | typ=${r.typ} | "${r.name}"`)
    }
  }
  // Tenants ohne Treffer, die nicht in der order-Liste auftauchten (z.B. shared)
  for (const [tenant, list] of byTenant) {
    if (!order.includes(tenant)) {
      console.log(`Tenant ${tenant} (unerwartet):`)
      list.forEach(r => console.log(`  [${origin(r.id)}] id=${r.id} | typ=${r.typ} | "${r.name}"`))
    }
  }

  // Direkter Vergleich dev ↔ Bettina
  const devHit = byTenant.get('dev')?.[0]
  const bettinaHit = byTenant.get(BETTINA)?.[0]
  console.log('\n--- Vergleich ---')
  console.log(`dev      : ${devHit ? `${origin(devHit.id)} | ${devHit.id}` : 'KEIN Treffer'}`)
  console.log(`Bettina  : ${bettinaHit ? `${origin(bettinaHit.id)} | ${bettinaHit.id}` : 'KEIN Treffer'}`)

  const seededTesters = TENANT_TOKENS.filter(t => byTenant.get(t)?.some(r => isSeedId(r.id)))
  console.log(`\nTester-Tenants mit Seed-Eintrag (…__tma3_rilz): ${seededTesters.length}/${TENANT_TOKENS.length}`)
  if (seededTesters.length) console.log(`  ${seededTesters.join(', ')}`)
}

main().catch((err) => { console.error('❌', err); process.exit(1) })
