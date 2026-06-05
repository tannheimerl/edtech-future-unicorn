'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, Minus, X, ClipboardList, Star, Plus, ChevronDown, Search } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { cn } from '@/lib/utils'
import type { Status } from '@/types/domain'

function nextStatus(current: Status | undefined): Status | undefined {
  if (current === undefined) return 'reached'
  if (current === 'reached') return 'partially_reached'
  if (current === 'partially_reached') return 'not_reached'
  return undefined
}

function StatusCell({
  status,
  onSelect,
}: {
  status: Status | undefined
  onSelect: (s: Status | undefined) => void
}) {
  return (
    <div className="flex justify-center">
      <button
        onClick={() => onSelect(nextStatus(status))}
        title={
          status === 'reached' ? 'Erreicht'
          : status === 'partially_reached' ? 'Teilweise erreicht'
          : status === 'not_reached' ? 'Nicht erreicht'
          : 'Nicht bewertet'
        }
        className={cn(
          'w-7 h-7 rounded-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer',
          status === 'reached' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
          status === 'partially_reached' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
          status === 'not_reached' ? 'bg-red-100 text-red-500 hover:bg-red-200' :
          'bg-slate-100 text-slate-400 hover:bg-slate-200',
        )}
      >
        {status === 'reached' && <Check className="size-3 stroke-[2.5]" />}
        {status === 'partially_reached' && <Minus className="size-3 stroke-[2.5]" />}
        {status === 'not_reached' && <X className="size-2.5 stroke-[2]" />}
        {status === undefined && <span className="size-1.5 rounded-full bg-slate-300" />}
      </button>
    </div>
  )
}

function InlineKommentarCell({
  studentId,
  themaId,
}: {
  studentId: string
  themaId: string
}) {
  const { getThemaKommentar, upsertThemaKommentar, deleteThemaKommentar } = useData()
  const kommentar = getThemaKommentar(studentId, themaId)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(kommentar?.text ?? '')
  const taRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editing) taRef.current?.focus()
  }, [editing])

  useEffect(() => {
    if (!editing) setDraft(kommentar?.text ?? '')
  }, [kommentar?.text, editing])

  const save = () => {
    const trimmed = draft.trim()
    if (trimmed) upsertThemaKommentar(studentId, themaId, trimmed)
    else deleteThemaKommentar(studentId, themaId)
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setDraft(kommentar?.text ?? ''); setEditing(false) }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); save() }
  }

  if (editing) {
    return (
      <textarea
        ref={taRef}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={save}
        onKeyDown={handleKeyDown}
        rows={2}
        className="w-full resize-none rounded-md border border-ring bg-background px-2 py-1 text-xs leading-snug focus:outline-none"
        placeholder="Kommentar zur Prüfung …"
      />
    )
  }

  return (
    <button
      onClick={() => setEditing(true)}
      className={cn(
        'w-full text-left rounded-md px-2 py-0.5 text-xs leading-snug transition-colors min-h-[1.75rem]',
        kommentar
          ? 'text-foreground hover:bg-muted/60'
          : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-muted/40 italic',
      )}
    >
      {kommentar ? kommentar.text : '+ Kommentar'}
    </button>
  )
}

function ThemaSelect({
  value,
  onChange,
  placeholder,
  themenByFach,
  themaIds,
  getLernzieleForThema,
}: {
  value: string | null
  onChange: (id: string) => void
  placeholder: string
  themenByFach: { fach: { id: string; name: string }; themen: { id: string; name: string }[] }[]
  themaIds: (string | null)[]
  getLernzieleForThema: (id: string) => unknown[]
}) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  useEffect(() => {
    if (open) { inputRef.current?.focus(); setSearch('') }
  }, [open])

  const filtered = themenByFach
    .map(({ fach, themen }) => ({
      fach,
      themen: themen.filter(
        t => (t.id === value || !themaIds.includes(t.id)) &&
             t.name.toLowerCase().includes(search.toLowerCase()),
      ),
    }))
    .filter(f => f.themen.length > 0)

  const selectedName = value
    ? themenByFach.flatMap(f => f.themen).find(t => t.id === value)?.name ?? null
    : null

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="h-7 min-w-44 rounded-md border border-border bg-card px-2 pr-6 text-xs font-medium shadow-sm flex items-center cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
      >
        <span className={cn('truncate flex-1 text-left', selectedName ? 'text-foreground' : 'text-muted-foreground')}>
          {selectedName ?? placeholder}
        </span>
        <ChevronDown className="size-3 shrink-0 absolute right-1.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 z-50 w-64 rounded-lg border border-border bg-card shadow-lg">
          <div className="flex items-center gap-1.5 px-2 py-1.5 border-b border-border">
            <Search className="size-3 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Escape' && setOpen(false)}
              placeholder="Thema suchen …"
              className="flex-1 text-xs bg-transparent focus:outline-none placeholder:text-muted-foreground/50"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="px-3 py-2 text-xs text-muted-foreground">Keine Treffer</p>
            ) : (
              filtered.map(({ fach, themen }) => (
                <div key={fach.id}>
                  <p className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/60">
                    {fach.name}
                  </p>
                  {themen.map(thema => {
                    const lzCount = getLernzieleForThema(thema.id).length
                    const isSelected = thema.id === value
                    return (
                      <button
                        key={thema.id}
                        onClick={() => { onChange(thema.id); setOpen(false) }}
                        className={cn(
                          'w-full text-left px-3 py-1.5 text-xs flex items-center justify-between gap-2 hover:bg-muted/60 transition-colors',
                          isSelected && 'bg-primary/5 text-primary font-medium',
                        )}
                      >
                        <span className="truncate">{thema.name}</span>
                        <span className="text-[10px] text-muted-foreground shrink-0">{lzCount} LZ</span>
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Visual identity for each selection slot
const SLOT_STYLES = [
  {
    badge: 'bg-primary text-primary-foreground',
    groupHeader: 'bg-primary/5 text-primary',
    swatch: 'bg-primary/30',
  },
  {
    badge: 'bg-amber-500 text-white',
    groupHeader: 'bg-amber-500/5 text-amber-700',
    swatch: 'bg-amber-300',
  },
  {
    badge: 'bg-violet-500 text-white',
    groupHeader: 'bg-violet-500/5 text-violet-700',
    swatch: 'bg-violet-300',
  },
  {
    badge: 'bg-teal-500 text-white',
    groupHeader: 'bg-teal-500/5 text-teal-700',
    swatch: 'bg-teal-300',
  },
]


export function LernkontrolleTab({ klassId, filterFachIds }: { klassId: string; filterFachIds?: string[] }) {
  const {
    getStudentsForClass,
    getThemenForKlasse,
    getLernzieleForThema,
    getFachForThema,
    faecher,
    updateLernzielStatus,
    students: allStudents,
  } = useData()

  const students = getStudentsForClass(klassId)
  const allAssignedThemen = getThemenForKlasse(klassId)
  const assignedThemen = filterFachIds && filterFachIds.length > 0
    ? allAssignedThemen.filter(t => filterFachIds.includes(t.fachId))
    : allAssignedThemen

  const [themaIds, setThemaIds] = useState<(string | null)[]>(
    assignedThemen.length > 0 ? [assignedThemen[0].id] : [],
  )

  const addThema = () => {
    setThemaIds(prev => [...prev, null])
  }

  const removeThema = (idx: number) => {
    setThemaIds(prev => prev.filter((_, i) => i !== idx))
  }

  const updateThema = (idx: number, id: string) => {
    setThemaIds(prev => {
      const next = [...prev]
      next[idx] = id
      return next
    })
  }

  const themenByFach = faecher
    .map(f => ({ fach: f, themen: assignedThemen.filter(t => t.fachId === f.id) }))
    .filter(f => f.themen.length > 0)

  const SLOT_PLACEHOLDERS = [
    '',
    '2. Thema auswählen …',
    '3. Thema auswählen …',
    '4. Thema auswählen …',
  ]

  const selectedThemen = themaIds
    .map(id => (id ? assignedThemen.find(t => t.id === id) : undefined))
    .filter((t): t is NonNullable<typeof t> => t != null)

  const lernzieleGroups = selectedThemen.map(t => ({
    thema: t,
    lernziele: getLernzieleForThema(t.id),
  }))

  const allLernziele = lernzieleGroups.flatMap(g => g.lernziele)
  const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name, 'de'))
  const showComment = lernzieleGroups.length === 1
  const kommentarWidth = 160
  const pctRight = showComment ? kommentarWidth : 0

  const [focusedCell, setFocusedCell] = useState<{ row: number; col: number } | null>(null)
  const [tableScrollWidth, setTableScrollWidth] = useState(0)
  const topScrollRef = useRef<HTMLDivElement>(null)
  const tableScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (tableScrollRef.current) setTableScrollWidth(tableScrollRef.current.scrollWidth)
  }, [allLernziele.length])

  useEffect(() => {
    if (!focusedCell || !tableScrollRef.current) return
    const cell = tableScrollRef.current.querySelector<HTMLElement>(
      `[data-cell="${focusedCell.row}-${focusedCell.col}"]`
    )
    cell?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [focusedCell])

  if (assignedThemen.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-12 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-accent">
          <ClipboardList className="size-6 text-accent-foreground" />
        </div>
        <div>
          <p className="font-semibold">Keine Themen zugewiesen</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Weise dieser Klasse zuerst Themen unter <em>Einstellungen</em> zu.
          </p>
        </div>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card py-12 text-center">
        <p className="font-semibold text-muted-foreground">Noch keine Schüler in dieser Klasse.</p>
      </div>
    )
  }

  function handleTableKeyDown(e: React.KeyboardEvent) {
    if (!focusedCell) return
    const { row, col } = focusedCell
    const maxRow = sortedStudents.length - 1
    const maxCol = allLernziele.length - 1
    if (e.key === 'ArrowRight') {
      e.preventDefault(); setFocusedCell({ row, col: Math.min(col + 1, maxCol) })
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault(); setFocusedCell({ row, col: Math.max(col - 1, 0) })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault(); setFocusedCell({ row: Math.min(row + 1, maxRow), col })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); setFocusedCell({ row: Math.max(row - 1, 0), col })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const student = sortedStudents[row]
      const lz = allLernziele[col]
      const s = allStudents.find(s => s.id === student.id)
      const fach = getFachForThema(lz.themaId)
      const isSkipped = !!(s?.rilzFachIds?.length && fach && s.rilzFachIds.includes(fach.id)) && lz.kategorie === 'anspruchsvoll'
      if (!isSkipped) updateLernzielStatus(student.id, lz.id, nextStatus(student.lernzielStatus[lz.id] as Status | undefined))
    } else if (e.key === 'Escape') {
      setFocusedCell(null)
    }
  }

  function lzReachedPct(lzId: string): number {
    if (students.length === 0) return 0
    const lz = allLernziele.find(l => l.id === lzId)
    const fach = lz ? getFachForThema(lz.themaId) : null
    const eligible = lz?.kategorie === 'anspruchsvoll' && fach
      ? students.filter(s => !s.rilzFachIds?.includes(fach.id))
      : students
    if (eligible.length === 0) return 0
    const sum = eligible.reduce((acc, s) => {
      const st = s.lernzielStatus[lzId] ?? 'not_reached'
      return acc + (st === 'reached' ? 1 : st === 'partially_reached' ? 0.5 : 0)
    }, 0)
    return Math.round((sum / eligible.length) * 100)
  }

  function studentTotalPct(studentId: string): number {
    if (allLernziele.length === 0) return 0
    const s = students.find(s => s.id === studentId)!
    const applicable = allLernziele.filter(lz => {
      if (lz.kategorie !== 'anspruchsvoll') return true
      if (!s.rilzFachIds?.length) return true
      const fach = getFachForThema(lz.themaId)
      return !fach || !s.rilzFachIds.includes(fach.id)
    })
    if (applicable.length === 0) return 0
    const sum = applicable.reduce((acc, lz) => {
      const st = s.lernzielStatus[lz.id] ?? 'not_reached'
      return acc + (st === 'reached' ? 1 : st === 'partially_reached' ? 0.5 : 0)
    }, 0)
    return Math.round((sum / applicable.length) * 100)
  }

  return (
    <div className="space-y-4">

      {/* Thema selector — dynamic */}
      <div className="flex flex-wrap items-end gap-1.5">
        {themaIds.map((id, i) => {
          const slot = SLOT_STYLES[i % SLOT_STYLES.length]
          return (
            <div key={i} className="flex flex-col gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <span className={cn('size-3 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0', slot.badge)}>
                  {i + 1}
                </span>
                Thema
              </span>
              <div className="flex items-center gap-1">
                <ThemaSelect
                  value={id}
                  onChange={newId => updateThema(i, newId)}
                  placeholder={SLOT_PLACEHOLDERS[i] ?? 'Thema auswählen …'}
                  themenByFach={themenByFach}
                  themaIds={themaIds}
                  getLernzieleForThema={getLernzieleForThema}
                />
                {i > 0 && (
                  <button
                    onClick={() => removeThema(i)}
                    className="h-5 w-5 rounded flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted transition-colors"
                    title="Thema entfernen"
                  >
                    <X className="size-3" />
                  </button>
                )}
              </div>
            </div>
          )
        })}

        {/* Add thema button */}
        {themaIds.length < assignedThemen.length && themaIds.length < SLOT_STYLES.length && (
          <div className="flex flex-col gap-1">
            <span className="text-[10px] opacity-0 select-none">.</span>
            <button
              onClick={addThema}
              className="h-7 w-7 rounded-md border border-dashed border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border/80 hover:bg-muted/40 transition-colors"
              title="Weiteres Thema hinzufügen"
            >
              <Plus className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Legend */}
      {selectedThemen.length > 0 && allLernziele.length > 0 && (
        <div className="flex justify-end gap-3">
          {([
            ['bg-emerald-200', 'Erreicht'],
            ['bg-amber-200', 'Teilweise erreicht'],
            ['bg-red-100 border border-red-300', 'Nicht erreicht'],
            ['bg-slate-200', 'Nicht bewertet'],
          ] as const).map(([cls, label]) => (
            <span key={label} className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
              <span className={cn('inline-block size-2.5 rounded-sm shrink-0', cls)} />
              {label}
            </span>
          ))}
        </div>
      )}

      {/* Grid */}
      {selectedThemen.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">


          {allLernziele.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {selectedThemen.length === 1
                ? 'Dieses Thema hat noch keine Lernziele.'
                : 'Diese Themen haben noch keine Lernziele.'}{' '}
              <a href="/lernziele" className="text-primary hover:underline">Jetzt anlegen →</a>
            </div>
          ) : (
            <>
              {/* Top scrollbar mirror */}
              <div
                ref={topScrollRef}
                onScroll={() => { if (tableScrollRef.current) tableScrollRef.current.scrollLeft = topScrollRef.current!.scrollLeft }}
                className="overflow-x-auto border-b border-border/40"
                style={{ height: 12 }}
              >
                <div style={{ width: tableScrollWidth, height: 1 }} />
              </div>
              {/* Table with keyboard nav */}
              <div
                ref={tableScrollRef}
                onScroll={() => { if (topScrollRef.current) topScrollRef.current.scrollLeft = tableScrollRef.current!.scrollLeft }}
                onKeyDown={handleTableKeyDown}
                tabIndex={0}
                className="overflow-x-auto outline-none"
              >
              <table className="border-collapse w-max min-w-full">
                <thead>
                  {/* Thema group header — shown when multiple themes selected */}
                  {lernzieleGroups.length > 1 && (
                    <tr className="border-b border-border/50">
                      <th className="sticky left-0 z-10 bg-card border-r border-border" />
                      {lernzieleGroups.map(({ thema, lernziele }, gi) => {
                        const slot = SLOT_STYLES[gi % SLOT_STYLES.length]
                        const isLast = gi === lernzieleGroups.length - 1
                        return (
                          <th
                            key={thema.id}
                            colSpan={lernziele.length}
                            className={cn(
                              'px-2 py-1 text-xs font-semibold text-center',
                              slot.groupHeader,
                              !isLast && 'border-r-2 border-border/60',
                            )}
                          >
                            <span className="flex items-center justify-center gap-1">
                              <span className={cn('size-3.5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0', slot.badge)}>
                                {gi + 1}
                              </span>
                              {thema.name}
                            </span>
                          </th>
                        )
                      })}
                      <th className="sticky z-10 bg-card border-l border-border" style={{ right: pctRight > 0 ? kommentarWidth : 0 }} />
                      {showComment && <th className="sticky right-0 z-10 bg-card border-l border-border" style={{ width: kommentarWidth }} />}
                    </tr>
                  )}

                  {/* LZ column headers */}
                  <tr className="border-b border-border bg-muted/20">
                    <th className="sticky left-0 z-10 bg-card w-32 min-w-32 border-r border-border px-2 py-1.5 align-bottom" />
                    {lernzieleGroups.map(({ thema, lernziele }, gi) =>
                      lernziele.map((lz, lzIdx) => {
                        const isLastInGroup = lzIdx === lernziele.length - 1 && gi < lernzieleGroups.length - 1
                        return (
                          <th
                            key={lz.id}
                            className={cn(
                              'bg-muted/20 px-1.5 py-2 text-left align-top',
                              isLastInGroup && 'border-r-2 border-primary/25',
                            )}
                            style={{ width: 72, minWidth: 72 }}
                          >
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-0.5 flex-wrap">
                                <span className={cn(
                                  'rounded px-1 py-px text-[9px] font-semibold',
                                  lz.kategorie === 'grundlegend' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700',
                                )}>
                                  {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
                                </span>
                                {lz.wichtig && (
                                  <span title="Wichtig"><Star className="size-2.5 text-yellow-500 fill-yellow-400" /></span>
                                )}
                              </div>
                              <span className="text-[11px] font-medium text-foreground leading-snug">{lz.label}</span>
                            </div>
                          </th>
                        )
                      })
                    )}
                    {/* % header */}
                    <th
                      className="sticky z-10 bg-card px-2 text-center text-xs font-semibold text-muted-foreground w-12 min-w-12 border-l border-border"
                      style={{ right: pctRight, verticalAlign: 'bottom', paddingBottom: 6 }}
                    >
                      %
                    </th>
                    {/* Kommentar header — only when 1 theme */}
                    {showComment && (
                      <th
                        className="sticky right-0 z-10 bg-card px-2 py-2 text-left text-xs font-semibold text-muted-foreground border-l border-border"
                        style={{ width: kommentarWidth, minWidth: kommentarWidth, verticalAlign: 'bottom', paddingBottom: 6 }}
                      >
                        Kommentar
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedStudents.map((student, rowIdx) => {
                    const pct = studentTotalPct(student.id)
                    const pctColor =
                      pct >= 75 ? 'text-emerald-600' :
                      pct >= 40 ? 'text-amber-600' :
                      'text-red-500'
                    const rowBg = rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/10'
                    return (
                      <tr key={student.id} className={cn('transition-colors', rowBg)}>
                        {/* name — click to enter keyboard mode */}
                        <td
                          className={cn(
                            'sticky left-0 z-10 bg-card px-3 py-1 text-sm font-medium border-r border-border whitespace-nowrap overflow-hidden text-ellipsis max-w-32 cursor-pointer select-none hover:bg-muted/40 transition-colors',
                            focusedCell?.row === rowIdx && 'bg-primary/5 text-primary',
                          )}
                          onClick={() => { setFocusedCell({ row: rowIdx, col: 0 }); tableScrollRef.current?.focus() }}
                          title="Klicken, dann Pfeiltasten + Enter zum Bewerten"
                        >
                          {student.name}
                        </td>
                        {/* status cells */}
                        {lernzieleGroups.map(({ lernziele }, gi) =>
                          lernziele.map((lz, lzIdx) => {
                            const hasRilz = (() => {
                              const s = allStudents.find(s => s.id === student.id)
                              if (!s?.rilzFachIds?.length) return false
                              const fach = getFachForThema(lz.themaId)
                              return fach ? s.rilzFachIds.includes(fach.id) : false
                            })()
                            const isSkipped = hasRilz && lz.kategorie === 'anspruchsvoll'
                            const status = student.lernzielStatus[lz.id] as Status | undefined
                            const isLastInGroup = lzIdx === lernziele.length - 1 && gi < lernzieleGroups.length - 1
                            const colIdx = allLernziele.findIndex(l => l.id === lz.id)
                            const isFocused = focusedCell?.row === rowIdx && focusedCell?.col === colIdx
                            return (
                              <td
                                key={lz.id}
                                data-cell={`${rowIdx}-${colIdx}`}
                                className={cn(
                                  'px-1 py-1 text-center',
                                  rowBg,
                                  isSkipped && 'opacity-25',
                                  isLastInGroup && 'border-r-2 border-primary/25',
                                  isFocused && 'ring-2 ring-inset ring-primary/50 bg-primary/5',
                                )}
                              >
                                <StatusCell
                                  status={isSkipped ? undefined : status}
                                  onSelect={s => !isSkipped && updateLernzielStatus(student.id, lz.id, s)}
                                />
                              </td>
                            )
                          })
                        )}
                        {/* % — solid bg-card */}
                        <td className="sticky z-10 bg-card px-2 py-1 text-center border-l border-border" style={{ right: pctRight }}>
                          <span className={cn('text-xs font-bold tabular-nums', pctColor)}>
                            {pct}%
                          </span>
                        </td>
                        {/* Kommentar — only when 1 theme */}
                        {showComment && (
                          <td className="sticky right-0 z-10 bg-card px-1 py-0.5 border-l border-border">
                            <InlineKommentarCell studentId={student.id} themaId={selectedThemen[0].id} />
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
                {/* summary footer */}
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td className="sticky left-0 z-10 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground border-r border-border">
                      Klasse (Ø)
                    </td>
                    {lernzieleGroups.map(({ lernziele }, gi) =>
                      lernziele.map((lz, lzIdx) => {
                        const pct = lzReachedPct(lz.id)
                        const color =
                          pct >= 75 ? 'text-emerald-600 bg-emerald-50' :
                          pct >= 40 ? 'text-amber-600 bg-amber-50' :
                          'text-red-500 bg-red-50'
                        const isLastInGroup = lzIdx === lernziele.length - 1 && gi < lernzieleGroups.length - 1
                        return (
                          <td
                            key={lz.id}
                            className={cn('px-1 py-1.5 text-center', isLastInGroup && 'border-r-2 border-primary/25')}
                          >
                            <span className={cn(
                              'inline-block text-[10px] font-bold tabular-nums rounded-md px-1 py-0.5',
                              color,
                            )}>
                              {pct}%
                            </span>
                          </td>
                        )
                      })
                    )}
                    <td className="sticky z-10 bg-card border-l border-border" style={{ right: pctRight }} />
                    {showComment && <td className="sticky right-0 z-10 bg-card border-l border-border" style={{ width: kommentarWidth }} />}
                  </tr>
                </tfoot>
              </table>
              </div>
            </>
          )}
        </div>
      )}

    </div>
  )
}
