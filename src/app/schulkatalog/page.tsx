'use client'

import { useMemo, useState } from 'react'
import {
  Library, ChevronDown, ChevronRight, Copy, Check, Search,
  UserRound, ArrowRight, Lock,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { KatBadge } from '@/components/shared/KatBadge'
import { LzCountCluster } from '@/components/shared/LzCountCluster'
import { cn, getFachColor } from '@/lib/utils'

const CURRENT_LP = 'Lukas Meier'

function ThemaCard({
  themaId,
  onCopy,
  copiedNewId,
}: {
  themaId: string
  onCopy: (newId: string) => void
  copiedNewId: string | null
}) {
  const { themen, lernziele, faecher, copyThemaToEigene } = useData()
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [pickingFach, setPickingFach] = useState(false)
  const [pickedFachId, setPickedFachId] = useState('')

  const thema = themen.find(t => t.id === themaId)
  if (!thema) return null

  const fach = faecher.find(f => f.id === thema.fachId)
  const fachColor = getFachColor(thema.fachId, faecher.map(f => f.id))
  const themaLZ = lernziele.filter(l => l.themaId === themaId && l.source !== 'bibliothek')
  const gCount = themaLZ.filter(l => l.kategorie === 'grundlegend').length
  const aCount = themaLZ.filter(l => l.kategorie === 'anspruchsvoll').length
  const previewLZ = themaLZ.slice(0, 3)
  const stufeLabel = thema.stufe?.length
    ? `Kl. ${Math.min(...thema.stufe)}–${Math.max(...thema.stufe)}`
    : null

  const done = copiedNewId != null

  function handleUebernehmen() {
    if (faecher.length > 1) {
      setPickingFach(true)
      setPickedFachId('')
      return
    }
    const newId = copyThemaToEigene(themaId, faecher[0]?.id)
    if (newId) onCopy(newId)
  }

  function confirmFach() {
    const newId = copyThemaToEigene(themaId, pickedFachId || undefined)
    if (newId) onCopy(newId)
    setPickingFach(false)
    setPickedFachId('')
  }

  return (
    <div className={cn(
      'rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md overflow-hidden flex flex-col border-l-4',
      fachColor.border,
      done && 'border-emerald-200 bg-emerald-50/30',
    )}>
      {/* Card body */}
      <div className="px-3.5 pt-3 pb-2.5 space-y-2 flex-1">
        {/* Fach pill + stufe + lock */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {fach && (
            <span className={cn(
              'text-[9px] font-semibold px-1.5 py-px rounded-full',
              fachColor.bg, fachColor.text,
            )}>
              {fach.name}
            </span>
          )}
          {stufeLabel && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground">
              {stufeLabel}
            </span>
          )}
          <Lock className="size-2.5 text-muted-foreground/30 ml-auto shrink-0" />
        </div>

        {/* Thema name */}
        <p className="text-sm font-semibold leading-snug">{thema.name}</p>

        {/* LZ count cluster */}
        <LzCountCluster g={gCount} a={aCount} />

        {/* Fach picker */}
        {pickingFach && !done && (
          <div className="rounded-lg border border-border bg-muted/30 p-2.5 space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">In welches Fach kopieren?</p>
            <div className="flex flex-wrap gap-1">
              {faecher.map(f => {
                const fc = getFachColor(f.id, faecher.map(fx => fx.id))
                return (
                  <button key={f.id}
                    onClick={() => setPickedFachId(f.id)}
                    className={cn(
                      'rounded-lg border px-2 py-1 text-xs font-medium transition-all flex items-center gap-1',
                      pickedFachId === f.id
                        ? cn('border-l-4', fc.border, fc.bg, fc.text)
                        : 'border-border bg-background text-foreground hover:bg-accent',
                    )}
                  >
                    <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                    {pickedFachId === f.id && <Check className="inline size-2.5 mr-0.5" />}
                    {f.name}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-1.5">
              <Button size="sm" className="h-6 text-[10px] px-2" onClick={confirmFach} disabled={!pickedFachId}>
                Kopieren
              </Button>
              <Button size="sm" variant="outline" className="h-6 text-[10px] px-2" onClick={() => setPickingFach(false)}>
                Abbrechen
              </Button>
            </div>
          </div>
        )}

        {/* LZ preview */}
        {themaLZ.length > 0 && (
          <div>
            <div className="space-y-0.5">
              {previewLZ.map(lz => (
                <div key={lz.id} className="flex items-center gap-1.5">
                  <KatBadge kat={lz.kategorie} />
                  <p className="text-[11px] text-muted-foreground leading-snug truncate">{lz.label}</p>
                </div>
              ))}
            </div>
            {themaLZ.length > 3 && (
              <button
                onClick={() => setExpanded(p => !p)}
                className="flex items-center gap-0.5 mt-1 text-[10px] text-muted-foreground/60 hover:text-primary transition-colors"
              >
                {expanded ? (
                  <><ChevronDown className="size-3" /> Weniger anzeigen</>
                ) : (
                  <><ChevronRight className="size-3" /> {themaLZ.length - 3} weitere Lernziele</>
                )}
              </button>
            )}
            {expanded && themaLZ.slice(3).map(lz => (
              <div key={lz.id} className="flex items-center gap-1.5 mt-0.5">
                <KatBadge kat={lz.kategorie} />
                <p className="text-[11px] text-muted-foreground leading-snug truncate">{lz.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card footer — copy action */}
      <div className={cn(
        'px-3.5 py-2 border-t border-border/40 flex items-center justify-between gap-2',
        done && 'border-emerald-200/60',
      )}>
        {done ? (
          <>
            <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-700">
              <Check className="size-2.5" /> Kopiert
            </span>
            <button
              onClick={() => router.push('/lernziele')}
              className="flex items-center gap-1 text-[10px] text-emerald-600 hover:underline"
            >
              Bearbeiten <ArrowRight className="size-3" />
            </button>
          </>
        ) : (
          <Button size="sm" className="h-7 w-full text-xs" onClick={handleUebernehmen}>
            <Copy className="size-3" /> In meine Sammlung kopieren
          </Button>
        )}
      </div>
    </div>
  )
}

function LehrpersonSection({
  autor,
  themaIds,
  copiedMap,
  onCopy,
  defaultOpen,
}: {
  autor: string
  themaIds: string[]
  copiedMap: Map<string, string>
  onCopy: (themaId: string, newId: string) => void
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const isMe = autor === CURRENT_LP

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <button
        className="flex w-full items-center gap-2 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
        onClick={() => setOpen(p => !p)}
      >
        {open
          ? <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
          : <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
        }
        <UserRound className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="font-semibold flex-1 truncate">{autor}</span>
        {isMe && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-semibold text-primary">Ich</span>
        )}
        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {themaIds.length}
        </span>
      </button>
      {open && (
        <div className="border-t bg-muted/10 px-4 py-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {themaIds.map(tid => (
            <ThemaCard
              key={tid}
              themaId={tid}
              copiedNewId={copiedMap.get(tid) ?? null}
              onCopy={(newId) => onCopy(tid, newId)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function SchulkatalogPage() {
  const { faecher, themen } = useData()

  const [search, setSearch] = useState('')
  const [selectedFachId, setSelectedFachId] = useState<string | 'alle'>('alle')
  const [stufeFilter, setStufeFilter] = useState<number | 'alle'>('alle')
  const [zyklusFilter, setZyklusFilter] = useState<number | 'alle'>('alle')
  const [autorFilter, setAutorFilter] = useState<'alle' | string>('alle')
  const [autorOpen, setAutorOpen] = useState(false)
  const [copiedMap, setCopiedMap] = useState<Map<string, string>>(new Map())

  const libraryThemen = useMemo(
    () => themen.filter(t => t.autor != null && t.typ !== 'rilz'),
    [themen],
  )

  const allAutors = useMemo(() => {
    const names = Array.from(new Set(libraryThemen.map(t => t.autor!)))
    return names.sort((a, b) => {
      if (a === CURRENT_LP) return -1
      if (b === CURRENT_LP) return 1
      return a.localeCompare(b)
    })
  }, [libraryThemen])

  const allStufen = useMemo(() => {
    const grades = new Set<number>()
    for (const t of libraryThemen) {
      for (const s of (t.stufe ?? [])) grades.add(s)
    }
    return Array.from(grades).sort((a, b) => a - b)
  }, [libraryThemen])

  const q = search.trim().toLowerCase()

  const filteredThemen = useMemo(() => {
    return libraryThemen.filter(t => {
      if (selectedFachId !== 'alle' && t.fachId !== selectedFachId) return false
      if (q && !t.name.toLowerCase().includes(q)) return false
      if (autorFilter !== 'alle') {
        const target = autorFilter === 'ich' ? CURRENT_LP : autorFilter
        if (t.autor !== target) return false
      }
      if (stufeFilter !== 'alle') {
        if (t.stufe && !t.stufe.includes(stufeFilter as number)) return false
      }
      if (zyklusFilter !== 'alle') {
        if (!t.zyklus?.includes(zyklusFilter as number)) return false
      }
      return true
    })
  }, [libraryThemen, selectedFachId, q, autorFilter, stufeFilter, zyklusFilter])

  const byAutor = useMemo(() => {
    const map: Map<string, string[]> = new Map()
    for (const t of filteredThemen) {
      const a = t.autor!
      if (!map.has(a)) map.set(a, [])
      map.get(a)!.push(t.id)
    }
    return map
  }, [filteredThemen])

  const sortedAutors = useMemo(() => {
    const keys = Array.from(byAutor.keys())
    return keys.sort((a, b) => {
      if (a === CURRENT_LP) return -1
      if (b === CURRENT_LP) return 1
      return a.localeCompare(b)
    })
  }, [byAutor])

  function handleCopy(sourceThemaId: string, newThemaId: string) {
    setCopiedMap(prev => new Map(prev).set(sourceThemaId, newThemaId))
  }

  const totalLibraryCount = libraryThemen.length

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-3">
      <div className="mb-3">
        <div className="flex items-center gap-2 mb-0.5">
          <Library className="size-5 text-primary" />
          <h1 className="text-xl font-bold tracking-tight">Schulkatalog</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {totalLibraryCount} {totalLibraryCount === 1 ? 'Thema' : 'Themen'} von {new Set(libraryThemen.map(t => t.autor)).size} Lehrpersonen — kopiere Themen in deine eigene Sammlung und bearbeite sie dort
        </p>
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Thema suchen …"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 rounded-lg"
          />
        </div>

        <Select value={selectedFachId} onValueChange={v => setSelectedFachId(v ?? 'alle')}>
          <SelectTrigger className="w-[148px]">
            <span className="flex items-center gap-1.5 flex-1 text-left min-w-0">
              {selectedFachId !== 'alle' && (
                <span className={cn('size-2 rounded-full shrink-0', getFachColor(selectedFachId, faecher.map(f => f.id)).dot)} />
              )}
              <span className="truncate">{selectedFachId === 'alle' ? 'Alle Fächer' : (faecher.find(f => f.id === selectedFachId)?.name ?? 'Fach')}</span>
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Fächer</SelectItem>
            {faecher.map(f => {
              const fc = getFachColor(f.id, faecher.map(fx => fx.id))
              return (
                <SelectItem key={f.id} value={f.id}>
                  <span className="flex items-center gap-1.5">
                    <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                    {f.name}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {allStufen.length > 0 && (
          <Select
            value={String(stufeFilter)}
            onValueChange={v => setStufeFilter(!v || v === 'alle' ? 'alle' : Number(v))}
          >
            <SelectTrigger className="w-[140px]">
              <span className="flex flex-1 text-left">
                {stufeFilter === 'alle' ? 'Alle Stufen' : `${stufeFilter}. Klasse`}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alle">Alle Stufen</SelectItem>
              {allStufen.map(s => (
                <SelectItem key={s} value={String(s)}>{s}. Klasse</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select
          value={String(zyklusFilter)}
          onValueChange={v => setZyklusFilter(!v || v === 'alle' ? 'alle' : Number(v))}
        >
          <SelectTrigger className="w-[130px]">
            <span className="flex flex-1 text-left">
              {zyklusFilter === 'alle' ? 'Alle Zyklen' : `Zyklus ${zyklusFilter}`}
            </span>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="alle">Alle Zyklen</SelectItem>
            <SelectItem value="1">Zyklus 1</SelectItem>
            <SelectItem value="2">Zyklus 2</SelectItem>
            <SelectItem value="3">Zyklus 3</SelectItem>
          </SelectContent>
        </Select>

        <Popover open={autorOpen} onOpenChange={setAutorOpen}>
          <PopoverTrigger className="flex w-[190px] h-5 items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50">
            <span className="flex-1 text-left truncate">
              {autorFilter === 'alle' ? 'Alle Lehrpersonen'
                : autorFilter === 'ich' ? 'Ich'
                : autorFilter}
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted-foreground pointer-events-none" />
          </PopoverTrigger>
          <PopoverContent className="w-[220px] p-0">
            <Command>
              <CommandInput placeholder="Lehrperson suchen…" className="h-9" />
              <CommandList>
                <CommandEmpty>Keine Treffer.</CommandEmpty>
                <CommandItem value="alle" onSelect={() => { setAutorFilter('alle'); setAutorOpen(false) }}>
                  <Check className={cn('mr-2 size-4', autorFilter === 'alle' ? 'opacity-100' : 'opacity-0')} />
                  Alle Lehrpersonen
                </CommandItem>
                <CommandItem value="ich" onSelect={() => { setAutorFilter('ich'); setAutorOpen(false) }}>
                  <Check className={cn('mr-2 size-4', autorFilter === 'ich' ? 'opacity-100' : 'opacity-0')} />
                  Ich
                </CommandItem>
                {allAutors.filter(a => a !== CURRENT_LP).map(name => (
                  <CommandItem key={name} value={name} onSelect={() => { setAutorFilter(name); setAutorOpen(false) }}>
                    <Check className={cn('mr-2 size-4', autorFilter === name ? 'opacity-100' : 'opacity-0')} />
                    {name}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {/* Content */}
      {filteredThemen.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-12 text-center">
          <Library className="size-8 text-muted-foreground/50" />
          <div>
            <p className="font-semibold">Keine Themen gefunden</p>
            <p className="mt-0.5 text-sm text-muted-foreground">Versuche einen anderen Suchbegriff oder Filter.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {byAutor.has(CURRENT_LP) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-2">Meine früheren Themen</p>
              <LehrpersonSection
                autor={CURRENT_LP}
                themaIds={byAutor.get(CURRENT_LP)!}
                copiedMap={copiedMap}
                onCopy={handleCopy}
                defaultOpen={true}
              />
            </div>
          )}

          {sortedAutors.filter(a => a !== CURRENT_LP).length > 0 && (
            <div>
              {byAutor.has(CURRENT_LP) && (
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 mt-4">Andere Lehrpersonen</p>
              )}
              <div className="space-y-2">
                {sortedAutors.filter(a => a !== CURRENT_LP).map(autor => (
                  <LehrpersonSection
                    key={autor}
                    autor={autor}
                    themaIds={byAutor.get(autor)!}
                    copiedMap={copiedMap}
                    onCopy={handleCopy}
                    defaultOpen={false}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
