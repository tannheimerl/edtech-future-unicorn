'use client'

import { useMemo, useState } from 'react'
import {
  ChevronRight, ChevronDown, Copy, Check, Search,
  ArrowRight, BookOpen,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { KatBadge } from '@/components/shared/KatBadge'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn, getFachColor } from '@/lib/utils'

const CURRENT_LP = 'Lukas Meier'

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
                  <KatBadge kat={lz.kategorie} />
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

function FachSection({
  fachId, themaIds, selectedStufe, copiedMap, onCopy,
}: {
  fachId: string
  themaIds: string[]
  selectedStufe: number | null
  copiedMap: Map<string, string>
  onCopy: (sourceId: string, newId: string) => void
}) {
  const { faecher } = useData()
  const fach = faecher.find(f => f.id === fachId)
  const fachColor = getFachColor(fachId, faecher.map(f => f.id))

  return (
    <div className={cn('rounded-2xl border bg-card overflow-hidden shadow-sm border-l-4', fachColor.border)}>
      <div className={cn('flex items-center gap-3 px-4 py-2.5 border-b border-border/60 select-none', fachColor.bg)}>
        <span className="text-xs font-semibold uppercase tracking-wider text-foreground">{fach?.name}</span>
        {selectedStufe != null && (
          <span className="text-xs text-muted-foreground">{selectedStufe}. Klasse</span>
        )}
        <span className="ml-auto rounded-full bg-background/60 px-2.5 py-0.5 text-xs text-muted-foreground font-medium">
          {themaIds.length} {themaIds.length === 1 ? 'Thema' : 'Themen'}
        </span>
      </div>
      <KatalogTable themaIds={themaIds} copiedMap={copiedMap} onCopy={onCopy} />
    </div>
  )
}

export default function SchulkatalogPage() {
  const { faecher, themen } = useData()

  const [selectedFachId, setSelectedFachId] = useState<string | null>(null)
  const [selectedStufe, setSelectedStufe] = useState<number | null>(null)
  const [autorFilter, setAutorFilter] = useState<'alle' | string>('alle')
  const [search, setSearch] = useState('')
  const [copiedMap, setCopiedMap] = useState<Map<string, string>>(new Map())

  const libraryThemen = useMemo(() => themen.filter(t => t.autor != null), [themen])

  // Only show Lehrpersonen who have themen matching the current Fach+Stufe selection
  const allAutors = useMemo(() => {
    const relevant = libraryThemen.filter(t => {
      if (selectedFachId && t.fachId !== selectedFachId) return false
      if (selectedStufe != null && !t.stufe?.includes(selectedStufe)) return false
      return true
    })
    const names = Array.from(new Set(relevant.map(t => t.autor!)))
    return names.sort((a, b) => {
      if (a === CURRENT_LP) return -1
      if (b === CURRENT_LP) return 1
      return a.localeCompare(b)
    })
  }, [libraryThemen, selectedFachId, selectedStufe])

  // Only show Fächer that the selected LP has published
  const availableFaecher = useMemo(() => {
    if (autorFilter === 'alle') return faecher
    const target = autorFilter === 'ich' ? CURRENT_LP : autorFilter
    const fachIds = new Set(libraryThemen.filter(t => t.autor === target).map(t => t.fachId))
    return faecher.filter(f => fachIds.has(f.id))
  }, [faecher, libraryThemen, autorFilter])

  // Stufen filtered by both Fach and LP selection
  const allStufen = useMemo(() => {
    const grades = new Set<number>()
    for (const t of libraryThemen) {
      if (selectedFachId && t.fachId !== selectedFachId) continue
      if (autorFilter !== 'alle') {
        const target = autorFilter === 'ich' ? CURRENT_LP : autorFilter
        if (t.autor !== target) continue
      }
      for (const s of (t.stufe ?? [])) grades.add(s)
    }
    return Array.from(grades).sort((a, b) => a - b)
  }, [libraryThemen, selectedFachId, autorFilter])

  const q = search.trim().toLowerCase()

  // Show table when: Fach+Stufe both set, OR a specific LP is selected
  const ready = (selectedFachId != null && selectedStufe != null) || autorFilter !== 'alle'

  const filteredThemen = useMemo(() => {
    if (!ready) return []
    return libraryThemen.filter(t => {
      if (selectedFachId && t.fachId !== selectedFachId) return false
      if (selectedStufe != null && !t.stufe?.includes(selectedStufe)) return false
      if (autorFilter !== 'alle') {
        const target = autorFilter === 'ich' ? CURRENT_LP : autorFilter
        if (t.autor !== target) return false
      }
      if (q && !t.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [ready, libraryThemen, selectedFachId, selectedStufe, autorFilter, q])

  // Group by Fach for rendering (supports multi-fach when LP-only mode)
  const byFach = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const t of filteredThemen) {
      if (!map.has(t.fachId)) map.set(t.fachId, [])
      map.get(t.fachId)!.push(t.id)
    }
    return map
  }, [filteredThemen])

  const sortedFachIds = useMemo(() => {
    return Array.from(byFach.keys()).sort((a, b) => {
      const fa = faecher.find(f => f.id === a)?.name ?? ''
      const fb = faecher.find(f => f.id === b)?.name ?? ''
      return fa.localeCompare(fb)
    })
  }, [byFach, faecher])

  function handleCopy(sourceThemaId: string, newThemaId: string) {
    setCopiedMap(prev => new Map(prev).set(sourceThemaId, newThemaId))
  }

  const selectedFachColor = selectedFachId
    ? getFachColor(selectedFachId, faecher.map(f => f.id))
    : null

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-8">
      {/* Filter row — all filters always visible; search pushed to far right */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {/* Fach */}
        <Select
          value={selectedFachId ?? ''}
          onValueChange={v => { setSelectedFachId(v || null); setSelectedStufe(null) }}
        >
          <SelectTrigger className="min-w-[160px] h-10 font-medium">
            <span className="flex items-center gap-2 flex-1 text-left min-w-0">
              {selectedFachId && selectedFachColor && (
                <span className={cn('size-2.5 rounded-full shrink-0', selectedFachColor.dot)} />
              )}
              <span className="truncate">
                {faecher.find(f => f.id === selectedFachId)?.name ?? 'Alle Fächer'}
              </span>
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Alle Fächer</SelectItem>
            {availableFaecher.map(f => {
              const fc = getFachColor(f.id, faecher.map(fx => fx.id))
              return (
                <SelectItem key={f.id} value={f.id}>
                  <span className="flex items-center gap-2">
                    <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                    {f.name}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {/* Stufe */}
        <Select
          value={selectedStufe != null ? String(selectedStufe) : ''}
          onValueChange={v => setSelectedStufe(v ? Number(v) : null)}
        >
          <SelectTrigger className="min-w-[140px] h-10 font-medium">
            <span className="flex-1 text-left truncate">
              {selectedStufe != null ? `${selectedStufe}. Klasse` : 'Alle Stufen'}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">Alle Stufen</SelectItem>
            {allStufen.map(s => (
              <SelectItem key={s} value={String(s)}>{s}. Klasse</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Lehrperson */}
        <Select value={autorFilter} onValueChange={v => setAutorFilter(v ?? 'alle')}>
          <SelectTrigger className="min-w-[180px] h-10">
            <span className="flex-1 text-left truncate">
              {autorFilter === 'alle' ? 'Alle Lehrpersonen' : autorFilter === 'ich' ? 'Ich' : autorFilter}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Lehrpersonen</SelectItem>
            <SelectItem value="ich">Ich</SelectItem>
            {allAutors.filter(a => a !== CURRENT_LP).map(name => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search — far right */}
        <div className="relative ml-auto min-w-[200px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Thema suchen …"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      {/* Content */}
      {!ready ? (
        <div className="mt-12">
          <EmptyState
            icon={<BookOpen className="size-6 text-muted-foreground" />}
            title="Filter setzen"
            description="Wähle ein Fach + Stufe, oder eine Lehrperson, um Themen anzuzeigen."
          />
        </div>
      ) : filteredThemen.length === 0 ? (
        <div>
          <EmptyState
            title="Keine Themen gefunden"
            description="Für diese Kombination wurden noch keine Themen veröffentlicht."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {sortedFachIds.map(fachId => (
            <FachSection
              key={fachId}
              fachId={fachId}
              themaIds={byFach.get(fachId)!}
              selectedStufe={selectedStufe}
              copiedMap={copiedMap}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}
    </div>
  )
}
