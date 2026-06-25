import { createClient } from '@supabase/supabase-js'

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const { data: klassen } = await sb.from('dim_klassen').select('id, name, stufe')
  console.log('Klassen im System:')
  klassen?.forEach(k => console.log(`  ${k.id} | ${k.name} | Stufe: ${k.stufe}`))

  const klassenStufen = new Set<number>(klassen?.map(k => k.stufe).filter(Boolean) ?? [])
  console.log('\nStufen der Klassen:', [...klassenStufen].sort())

  const { data: themen } = await sb.from('dim_themen').select('id, name, stufe, fach_id')
  const { data: bridge } = await sb.from('bridge_klasse_themen').select('thema_id, klasse_id')
  const assignedIds = new Set(bridge?.map(b => b.thema_id) ?? [])

  const fremd: typeof themen = []
  for (const t of themen ?? []) {
    const themaStufen: number[] = t.stufe ?? []
    const relevant = themaStufen.some(s => klassenStufen.has(s))
    if (!relevant) fremd.push(t)
  }

  console.log(`\n=== Themen mit Stufen, die KEINE eigene Klasse haben (${fremd?.length}) ===`)
  fremd?.forEach(t => console.log(`  [${assignedIds.has(t.id) ? 'IN KLASSE' : 'nur Sammlung'}] ${t.id} | "${t.name}" | stufe: [${t.stufe}] | fach: ${t.fach_id}`))
}

main().catch(console.error)
