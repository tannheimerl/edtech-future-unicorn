'use client'

import { useMemo, useState } from 'react'
import {
  ChevronRight, ChevronDown, Copy, Check,
  ArrowRight, BookOpen, X, ArrowUp, ArrowDown, Search,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { EmptyState } from '@/components/shared/EmptyState'
import { FilterCombobox, type FilterComboboxOption } from '@/components/shared/FilterCombobox'
import { cn, getFachColor } from '@/lib/utils'
import type { Thema, Fach } from '@/types/domain'

const CURRENT_LP = 'Lukas Meier'
const RANK_CHARS = ['①', '②', '③', '④']

// ─── Types ────────────────────────────────────────────────────────────────────

type GroupBy = 'fach' | 'lehrperson' | 'zyklus' | 'stufe'
type SortField = 'name' | 'lehrperson' | 'zyklus' | 'stufe'
type SortKey = { field: SortField; dir: 'asc' | 'desc' }

type TreeNode = {
  key: string
  label: string
  fachId: string | null
  themaIds?: string[]
  children?: TreeNode[]
}

const GROUP_DIMENSIONS: { mode: GroupBy; label: string }[] = [
  { mode: 'fach', label: 'Fach' },
  { mode: 'lehrperson', label: 'Lehrperson' },
  { mode: 'zyklus', label: 'Zyklus' },
  { mode: 'stufe', label: 'Stufe' },
]

const SORT_DIMENSIONS: { field: SortField; label: string }[] = [
  { field: 'name', label: 'Name' },
  { field: 'lehrperson', label: 'Lehrperson' },
  { field: 'zyklus', label: 'Zyklus' },
  { field: 'stufe', label: 'Stufe' },
]

// ─── Pure helpers ──────────────────────────────────────────────────────────────

function getGroupKey(t: Thema, level: GroupBy): string {
  switch (level) {
    case 'fach':       return t.fachId
    case 'lehrperson': return t.autor ?? '—'
    case 'zyklus':     return t.zyklus?.[0] != null ? String(t.zyklus[0]) : '—'
    case 'stufe':      return t.stufe?.length ? String(Math.min(...t.stufe)) : '—'
  }
}

function getGroupLabel(key: string, level: GroupBy, faecher: Fach[]): string {
  switch (level) {
    case 'fach':       return faecher.find(f => f.id === key)?.name ?? key
    case 'lehrperson': return key === '—' ? 'Unbekannte Lehrperson' : key
    case 'zyklus':     return key === '—' ? 'Kein Zyklus' : `Zyklus ${key}`
    case 'stufe':      return key === '—' ? 'Keine Stufe' : `${key}. Klasse`
  }
}

function sortGroupKeys(keys: string[], level: GroupBy, faecher: Fach[]): string[] {
  if (level === 'zyklus' || level === 'stufe') {
    return [...keys].sort((a, b) => (a === '—' ? 99 : Number(a)) - (b === '—' ? 99 : Number(b)))
  }
  if (level === 'fach') {
    return [...keys].sort((a, b) => {
      const fa = faecher.find(f => f.id === a)?.name ?? ''
      const fb = faecher.find(f => f.id === b)?.name ?? ''
      return fa.localeCompare(fb)
    })
  }
  return [...keys].sort((a, b) => a.localeCompare(b))
}

function compareThemen(a: Thema, b: Thema, sortKeys: SortKey[]): number {
  for (const { field, dir } of sortKeys) {
    let cmp = 0
    if (field === 'name')        cmp = a.name.localeCompare(b.name)
    if (field === 'lehrperson')  cmp = (a.autor ?? '').localeCompare(b.autor ?? '')
    if (field === 'zyklus')      cmp = (a.zyklus?.[0] ?? 99) - (b.zyklus?.[0] ?? 99)
    if (field === 'stufe')       cmp = (a.stufe ? Math.min(...a.stufe) : 99) - (b.stufe ? Math.min(...b.stufe) : 99)
    if (cmp !== 0) return dir === 'asc' ? cmp : -cmp
  }
  return 0
}

function buildTree(
  themen: Thema[],
  levels: GroupBy[],
  faecher: Fach[],
  sortKeys: SortKey[],
  inheritedFachId: string | null = null,
): TreeNode[] {
  if (levels.length === 0) return []

  const [currentLevel, ...rest] = levels
  const map = new Map<string, Thema[]>()

  for (const t of themen) {
    const key = getGroupKey(t, currentLevel)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(t)
  }

  const sortedKeys = sortGroupKeys(Array.from(map.keys()), currentLevel, faecher)

  return sortedKeys.map(key => {
    const groupThemen = map.get(key)!
    const fachId = currentLevel === 'fach' ? key : inheritedFachId
    const label = getGroupLabel(key, currentLevel, faecher)
    const nodeKey = `${currentLevel}:${key}`

    if (rest.length === 0) {
      const sorted = [...groupThemen].sort((a, b) => compareThemen(a, b, sortKeys))
      return { key: nodeKey, label, fachId, themaIds: sorted.map(t => t.id) }
    }

    return {
      key: nodeKey,
      label,
      fachId,
      children: buildTree(groupThemen, rest, faecher, sortKeys, fachId),
    }
  })
}

function countThemas(node: TreeNode): number {
  if (node.themaIds) return node.themaIds.length
  return (node.children ?? []).reduce((sum, c) => sum + countThemas(c), 0)
}

// ─── UI sub-components ────────────────────────────────────────────────────────

function ZyklusBadge({ z }: { z: number }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 ring-1 ring-slate-200">
      Z{z}
    </span>
  )
}

function ThemaRow({
  themaId,
  copiedNewId,
  onCopy,
}: {
  themaId: string
  copiedNewId: string | null
  onCopy: (newId: string) => void
}) {
  const { themen, lernziele, faecher, copyThemaToEigene } = useData()
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [pickingFach, setPickingFach] = useState(false)
  const [pickedFachId, setPickedFachId] = useState('')

  const thema = themen.find(t => t.id === themaId)
  if (!thema) return null

  const isRilz = thema.typ === 'rilz'
  const isMe = thema.autor === CURRENT_LP
  const done = copiedNewId != null
  const themaLZ = lernziele.filter(l => l.themaId === themaId && l.source !== 'bibliothek')
  const stufeLabel = thema.stufe?.length
    ? `${Math.min(...thema.stufe)}–${Math.max(...thema.stufe)}`
    : '—'

  function handleKopieren() {
    if (faecher.length > 1) { setPickingFach(true); setPickedFachId(''); return }
    const newId = copyThemaToEigene(themaId, faecher[0]?.id)
    if (newId) onCopy(newId)
  }

  function confirmFach() {
    const newId = copyThemaToEigene(themaId, pickedFachId || undefined)
    if (newId) onCopy(newId)
    setPickingFach(false); setPickedFachId('')
  }

  return (
    <>
      <tr className={cn(
        'border-b border-border/50 transition-colors group',
        done ? 'bg-emerald-50/40' : 'hover:bg-muted/20',
      )}>
        <td className="py-2.5 pl-3 pr-3">
          <button
            onClick={() => setExpanded(p => !p)}
            className="flex items-center gap-2 w-full text-left"
            disabled={themaLZ.length === 0}
          >
            {themaLZ.length > 0
              ? expanded
                ? <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                : <ChevronRight className="size-3.5 shrink-0 text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity" />
              : <span className="size-3.5 shrink-0" />
            }
            <span className="text-sm font-medium leading-snug line-clamp-1" title={thema.name}>
              {thema.name}
            </span>
          </button>
        </td>

        <td className="py-2.5 px-3 w-[160px]">
          <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
            {thema.autor ?? '—'}
            {isMe && (
              <span className="rounded-full bg-primary/10 px-1.5 py-px text-[9px] font-semibold text-primary leading-none">Ich</span>
            )}
          </span>
        </td>

        <td className="py-2.5 px-3 w-[80px]">
          <div className="flex gap-1 flex-wrap">
            {thema.zyklus?.length
              ? thema.zyklus.map(z => <ZyklusBadge key={z} z={z} />)
              : <span className="text-sm text-muted-foreground/40">—</span>
            }
          </div>
        </td>

        <td className="py-2.5 px-3 w-[70px]">
          <span className="text-sm text-muted-foreground">{stufeLabel}</span>
        </td>

        <td className="py-2.5 px-3 w-[64px]">
          {isRilz
            ? <span className="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-semibold text-orange-700 ring-1 ring-orange-200">RILZ</span>
            : <span className="text-muted-foreground/30 text-sm">—</span>
          }
        </td>

        <td className="py-2.5 pl-3 pr-4 w-[120px] text-right">
          {done ? (
            <span className="flex items-center justify-end gap-1 text-[11px] font-medium text-emerald-700">
              <Check className="size-3" /> Kopiert
              <button onClick={() => router.push('/lernziele')} className="ml-1 flex items-center gap-0.5 text-emerald-600 hover:underline">
                <ArrowRight className="size-3" />
              </button>
            </span>
          ) : (
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 px-2.5" onClick={handleKopieren}>
              <Copy className="size-3" /> Kopieren
            </Button>
          )}
        </td>
      </tr>

      {expanded && themaLZ.length > 0 && (
        <tr className="border-b border-border/40 bg-muted/10">
          <td colSpan={6} className="pl-10 pr-4 py-2.5">
            <div className="space-y-1">
              {themaLZ.map(lz => (
                <div key={lz.id} className="flex items-start gap-2">
                  <span className="text-[12px] text-muted-foreground leading-snug">{lz.label}</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}

      {pickingFach && !done && (
        <tr className="border-b border-border/50 bg-muted/20">
          <td colSpan={6} className="px-4 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide shrink-0">In welches Fach kopieren?</span>
              <div className="flex flex-wrap gap-1.5">
                {faecher.map(f => {
                  const fc = getFachColor(f.id, faecher.map(fx => fx.id))
                  return (
                    <button key={f.id} onClick={() => setPickedFachId(f.id)} className={cn(
                      'rounded-lg border px-2.5 py-1 text-xs font-medium transition-all flex items-center gap-1.5',
                      pickedFachId === f.id ? cn('border-l-4', fc.border, fc.bg, fc.text) : 'border-border bg-background text-foreground hover:bg-accent',
                    )}>
                      <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                      {pickedFachId === f.id && <Check className="size-3" />}
                      {f.name}
                    </button>
                  )
                })}
              </div>
              <div className="flex gap-1.5 ml-auto">
                <Button size="sm" className="h-7 text-xs" onClick={confirmFach} disabled={!pickedFachId}>Kopieren</Button>
                <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setPickingFach(false)}>Abbrechen</Button>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function KatalogTable({
  themaIds, copiedMap, onCopy,
}: {
  themaIds: string[]
  copiedMap: Map<string, string>
  onCopy: (sourceId: string, newId: string) => void
}) {
  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="border-b border-border/60 bg-muted/30">
          <th className="py-2 pl-10 pr-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Thema</th>
          <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[160px]">Lehrperson</th>
          <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[80px]">Zyklus</th>
          <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[70px]">Klasse</th>
          <th className="py-2 px-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide w-[64px]">RILZ</th>
          <th className="py-2 pl-3 pr-4 w-[120px]" />
        </tr>
      </thead>
      <tbody>
        {themaIds.map(tid => (
          <ThemaRow key={tid} themaId={tid} copiedNewId={copiedMap.get(tid) ?? null} onCopy={(newId) => onCopy(tid, newId)} />
        ))}
      </tbody>
    </table>
  )
}

// Recursive sub-section (depth 1+) rendered inside a RootSection card
function InnerSection({
  node, depth, copiedMap, onCopy,
}: {
  node: TreeNode
  depth: number
  copiedMap: Map<string, string>
  onCopy: (sourceId: string, newId: string) => void
}) {
  const total = countThemas(node)

  return (
    <>
      <div className={cn(
        'flex items-center gap-3 select-none',
        depth === 1
          ? 'px-4 py-2 bg-muted/15 border-b border-border/30'
          : 'px-6 py-1.5 bg-muted/5 border-b border-border/20',
      )}>
        <span className={cn(
          'font-semibold text-foreground/80',
          depth === 1 ? 'text-[11px] uppercase tracking-wide' : 'text-[10px] uppercase tracking-widest text-muted-foreground',
        )}>
          {node.label}
        </span>
        <span className="ml-auto text-xs text-muted-foreground">
          {total} {total === 1 ? 'Thema' : 'Themen'}
        </span>
      </div>

      {node.themaIds ? (
        <KatalogTable themaIds={node.themaIds} copiedMap={copiedMap} onCopy={onCopy} />
      ) : (
        <div className="divide-y divide-border/30">
          {(node.children ?? []).map(child => (
            <InnerSection key={child.key} node={child} depth={depth + 1} copiedMap={copiedMap} onCopy={onCopy} />
          ))}
        </div>
      )}
    </>
  )
}

// Depth-0 card section
function RootSection({
  node, copiedMap, onCopy,
}: {
  node: TreeNode
  copiedMap: Map<string, string>
  onCopy: (sourceId: string, newId: string) => void
}) {
  const { faecher } = useData()
  const fachColor = node.fachId ? getFachColor(node.fachId, faecher.map(f => f.id)) : null
  const total = countThemas(node)

  return (
    <div className={cn(
      'rounded-xl border bg-card overflow-hidden shadow-sm border-l-4',
      fachColor?.border ?? 'border-l-slate-300',
    )}>
      <div className={cn(
        'flex items-center gap-3 px-4 py-2.5 border-b border-border/60 select-none',
        fachColor?.bg ?? 'bg-muted/20',
      )}>
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {node.label}
        </span>
        <span className="ml-auto rounded-full bg-background/60 px-2.5 py-0.5 text-xs text-muted-foreground font-medium">
          {total} {total === 1 ? 'Thema' : 'Themen'}
        </span>
      </div>

      {node.themaIds ? (
        <KatalogTable themaIds={node.themaIds} copiedMap={copiedMap} onCopy={onCopy} />
      ) : (
        <div className="divide-y divide-border/40">
          {(node.children ?? []).map(child => (
            <InnerSection key={child.key} node={child} depth={1} copiedMap={copiedMap} onCopy={onCopy} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SchulkatalogPage() {
  const { faecher, themen } = useData()

  // Filter state
  const [selectedFachId, setSelectedFachId] = useState<string | null>(null)
  const [selectedStufe, setSelectedStufe] = useState<number | null>(null)
  const [selectedZyklus, setSelectedZyklus] = useState<number | null>(null)
  const [autorFilter, setAutorFilter] = useState<string>('')  // '' = alle
  const [search, setSearch] = useState('')
  const [copiedMap, setCopiedMap] = useState<Map<string, string>>(new Map())

  const q = search.trim().toLowerCase()

  // Grouping / sorting state
  const [groupByLevels, setGroupByLevels] = useState<GroupBy[]>(['fach'])
  const [sortKeys, setSortKeys] = useState<SortKey[]>([{ field: 'name', dir: 'asc' }])

  const libraryThemen = useMemo(() => themen.filter(t => t.autor != null), [themen])

  const allAutors = useMemo(() => {
    const relevant = libraryThemen.filter(t => {
      if (selectedFachId && t.fachId !== selectedFachId) return false
      if (selectedStufe != null && !t.stufe?.includes(selectedStufe)) return false
      if (selectedZyklus != null && !t.zyklus?.includes(selectedZyklus)) return false
      return true
    })
    const names = Array.from(new Set(relevant.map(t => t.autor!)))
    return names.sort((a, b) => {
      if (a === CURRENT_LP) return -1
      if (b === CURRENT_LP) return 1
      return a.localeCompare(b)
    })
  }, [libraryThemen, selectedFachId, selectedStufe, selectedZyklus])

  const availableFaecher = useMemo(() => {
    if (autorFilter === '') return faecher
    const target = autorFilter === 'ich' ? CURRENT_LP : autorFilter
    const fachIds = new Set(libraryThemen.filter(t => t.autor === target).map(t => t.fachId))
    return faecher.filter(f => fachIds.has(f.id))
  }, [faecher, libraryThemen, autorFilter])

  const allStufen = useMemo(() => {
    const grades = new Set<number>()
    for (const t of libraryThemen) {
      if (selectedFachId && t.fachId !== selectedFachId) continue
      if (selectedZyklus != null && !t.zyklus?.includes(selectedZyklus)) continue
      if (autorFilter !== '') {
        const target = autorFilter === 'ich' ? CURRENT_LP : autorFilter
        if (t.autor !== target) continue
      }
      for (const s of (t.stufe ?? [])) grades.add(s)
    }
    return Array.from(grades).sort((a, b) => a - b)
  }, [libraryThemen, selectedFachId, selectedZyklus, autorFilter])

  const allZyklen = useMemo(() => {
    const z = new Set<number>()
    for (const t of libraryThemen) {
      if (selectedFachId && t.fachId !== selectedFachId) continue
      if (autorFilter !== '') {
        const target = autorFilter === 'ich' ? CURRENT_LP : autorFilter
        if (t.autor !== target) continue
      }
      for (const cycle of (t.zyklus ?? [])) z.add(cycle)
    }
    return Array.from(z).sort((a, b) => a - b)
  }, [libraryThemen, selectedFachId, autorFilter])

  const ready = selectedFachId != null || selectedZyklus != null
    || selectedStufe != null || autorFilter !== ''

  const filteredThemen = useMemo(() => {
    if (!ready) return []
    return libraryThemen.filter(t => {
      if (selectedFachId && t.fachId !== selectedFachId) return false
      if (selectedStufe != null && !t.stufe?.includes(selectedStufe)) return false
      if (selectedZyklus != null && !t.zyklus?.includes(selectedZyklus)) return false
      if (autorFilter !== '') {
        const target = autorFilter === 'ich' ? CURRENT_LP : autorFilter
        if (t.autor !== target) return false
      }
      if (q && !t.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [ready, libraryThemen, selectedFachId, selectedStufe, selectedZyklus, autorFilter, q])

  const tree = useMemo(
    () => buildTree(filteredThemen, groupByLevels, faecher, sortKeys),
    [filteredThemen, groupByLevels, faecher, sortKeys],
  )

  function toggleGroupLevel(mode: GroupBy) {
    setGroupByLevels(prev => {
      if (prev.includes(mode)) {
        if (prev.length === 1) return prev
        return prev.filter(m => m !== mode)
      }
      return [...prev, mode]
    })
  }

  function toggleSortKey(field: SortField) {
    setSortKeys(prev => {
      const existing = prev.find(k => k.field === field)
      if (!existing)               return [...prev, { field, dir: 'asc' }]
      if (existing.dir === 'asc')  return prev.map(k => k.field === field ? { ...k, dir: 'desc' } : k)
      return prev.filter(k => k.field !== field)
    })
  }

  function handleCopy(sourceThemaId: string, newThemaId: string) {
    setCopiedMap(prev => new Map(prev).set(sourceThemaId, newThemaId))
  }

  // Build option arrays for FilterCombobox
  const fachOptions: FilterComboboxOption[] = [
    { value: '', label: 'Alle Fächer' },
    ...availableFaecher.map(f => ({
      value: f.id,
      label: f.name,
      dot: getFachColor(f.id, faecher.map(fx => fx.id)).dot,
    })),
  ]

  const zyklusOptions: FilterComboboxOption[] = [
    { value: '', label: 'Alle Zyklen' },
    ...allZyklen.map(z => ({ value: String(z), label: `Zyklus ${z}` })),
  ]

  const stufeOptions: FilterComboboxOption[] = [
    { value: '', label: 'Alle Stufen' },
    ...allStufen.map(s => ({ value: String(s), label: `${s}. Klasse` })),
  ]

  const lehrpersonOptions: FilterComboboxOption[] = [
    { value: '', label: 'Alle Lehrpersonen' },
    { value: 'ich', label: 'Ich' },
    ...allAutors.filter(a => a !== CURRENT_LP).map(name => ({ value: name, label: name })),
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <FilterCombobox
          options={fachOptions}
          value={selectedFachId ?? ''}
          onChange={v => { setSelectedFachId(v || null); setSelectedStufe(null) }}
        />

        <FilterCombobox
          options={zyklusOptions}
          value={selectedZyklus != null ? String(selectedZyklus) : ''}
          onChange={v => setSelectedZyklus(v ? Number(v) : null)}
        />

        <FilterCombobox
          options={stufeOptions}
          value={selectedStufe != null ? String(selectedStufe) : ''}
          onChange={v => setSelectedStufe(v ? Number(v) : null)}
        />

        <FilterCombobox
          options={lehrpersonOptions}
          value={autorFilter}
          onChange={v => setAutorFilter(v)}
          popoverClassName="max-w-[280px]"
          showSearch
        />

        {/* Search — far right */}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Thema suchen …"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 w-[200px] rounded-full border-border/60 bg-transparent shadow-none focus-visible:ring-1"
          />
        </div>
      </div>

      {/* Grouping + Sorting toolbar */}
      {ready && (
        <div className="mb-5 py-3 border-y border-border/40 space-y-2">
          {/* Grouping row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0 w-28">
              Gruppieren nach
            </span>
            <div className="flex flex-wrap gap-1.5">
              {GROUP_DIMENSIONS.map(({ mode, label }) => {
                const idx = groupByLevels.indexOf(mode)
                const isActive = idx !== -1
                const canRemove = isActive && groupByLevels.length > 1
                return (
                  <button
                    key={mode}
                    onClick={() => toggleGroupLevel(mode)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium transition-colors flex items-center gap-1',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    {isActive && groupByLevels.length > 1 && (
                      <span className="text-[9px] font-bold opacity-80">{RANK_CHARS[idx]}</span>
                    )}
                    {label}
                    {canRemove && <X className="size-2.5 ml-0.5 opacity-60" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Sorting row */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide shrink-0 w-28">
              Sortieren
            </span>
            <div className="flex flex-wrap gap-1.5">
              {SORT_DIMENSIONS.map(({ field, label }) => {
                const sortKey = sortKeys.find(k => k.field === field)
                const isActive = sortKey != null
                const idx = sortKeys.findIndex(k => k.field === field)
                return (
                  <button
                    key={field}
                    onClick={() => toggleSortKey(field)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium transition-colors flex items-center gap-1',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    {isActive && sortKeys.length > 1 && (
                      <span className="text-[9px] font-bold opacity-80">{RANK_CHARS[idx]}</span>
                    )}
                    {label}
                    {isActive && (
                      sortKey!.dir === 'asc'
                        ? <ArrowUp className="size-3 ml-0.5" />
                        : <ArrowDown className="size-3 ml-0.5" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!ready ? (
        <div className="mt-12">
          <EmptyState
            icon={<BookOpen className="size-6 text-muted-foreground" />}
            title="Filter setzen"
            description="Wähle mindestens einen Filter, um Themen anzuzeigen."
          />
        </div>
      ) : filteredThemen.length === 0 ? (
        <EmptyState
          title="Keine Themen gefunden"
          description="Für diese Kombination wurden noch keine Themen veröffentlicht."
        />
      ) : (
        <div className="space-y-3">
          {tree.map(node => (
            <RootSection
              key={node.key}
              node={node}
              copiedMap={copiedMap}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}
    </div>
  )
}
