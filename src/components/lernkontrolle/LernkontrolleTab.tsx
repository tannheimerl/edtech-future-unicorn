'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, Minus, X, CheckCheck, ClipboardList, ChevronDown } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { cn } from '@/lib/utils'
import type { Status } from '@/types/domain'

const STATUS_OPTIONS: { value: Status; label: string; icon: React.ReactNode; bg: string; text: string }[] = [
  {
    value: 'reached',
    label: 'Erreicht',
    icon: <Check className="size-3.5 stroke-[2.5]" />,
    bg: 'bg-emerald-100 hover:bg-emerald-200',
    text: 'text-emerald-700',
  },
  {
    value: 'partially_reached',
    label: 'Teilweise',
    icon: <Minus className="size-3.5 stroke-[2.5]" />,
    bg: 'bg-amber-100 hover:bg-amber-200',
    text: 'text-amber-700',
  },
  {
    value: 'not_reached',
    label: 'Nicht erreicht',
    icon: <X className="size-3 stroke-[2]" />,
    bg: 'bg-red-100 hover:bg-red-200',
    text: 'text-red-500',
  },
]

function statusBg(status: Status) {
  return status === 'reached'
    ? 'bg-emerald-100 text-emerald-700'
    : status === 'partially_reached'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-red-100 text-red-500'
}

function StatusCell({
  status,
  onSelect,
}: {
  status: Status
  onSelect: (s: Status) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={ref}
      className="relative flex justify-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer',
          statusBg(status),
        )}
      >
        {status === 'reached'
          ? <Check className="size-3.5 stroke-[2.5]" />
          : status === 'partially_reached'
          ? <Minus className="size-3.5 stroke-[2.5]" />
          : <X className="size-3 stroke-[2]" />}
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 z-50 flex flex-row gap-1 rounded-xl border border-border bg-popover p-1 shadow-lg">
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onSelect(opt.value); setOpen(false) }}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-colors',
                opt.bg,
                opt.text,
                status === opt.value && 'ring-1 ring-inset ring-current',
              )}
            >
              {opt.icon}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function LernkontrolleTab({ klassId }: { klassId: string }) {
  const {
    getStudentsForClass,
    getThemenForKlasse,
    getLernzieleForThema,
    getFachForThema,
    faecher,
    updateLernzielStatus,
  } = useData()

  const students = getStudentsForClass(klassId)
  const assignedThemen = getThemenForKlasse(klassId)
  const [selectedThemaId, setSelectedThemaId] = useState<string | null>(
    assignedThemen.length > 0 ? assignedThemen[0].id : null,
  )
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set())

  const themenByFach = faecher
    .map(f => ({ fach: f, themen: assignedThemen.filter(t => t.fachId === f.id) }))
    .filter(f => f.themen.length > 0)

  const selectedThema = assignedThemen.find(t => t.id === selectedThemaId) ?? null
  const lernziele = selectedThemaId ? getLernzieleForThema(selectedThemaId) : []
  const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name, 'de'))

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

  function setAllReached(studentId: string) {
    lernziele.forEach(lz => updateLernzielStatus(studentId, lz.id, 'reached'))
  }

  function setAllNotReached(studentId: string) {
    lernziele.forEach(lz => updateLernzielStatus(studentId, lz.id, 'not_reached'))
  }

  function applyBulkStatus(status: Status) {
    selectedStudents.forEach(studentId => {
      lernziele.forEach(lz => updateLernzielStatus(studentId, lz.id, status))
    })
  }

  function toggleStudent(id: string) {
    setSelectedStudents(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selectedStudents.size === sortedStudents.length) {
      setSelectedStudents(new Set())
    } else {
      setSelectedStudents(new Set(sortedStudents.map(s => s.id)))
    }
  }

  function lzReachedPct(lzId: string): number {
    if (students.length === 0) return 0
    const sum = students.reduce((acc, s) => {
      const st = s.lernzielStatus[lzId] ?? 'not_reached'
      return acc + (st === 'reached' ? 1 : st === 'partially_reached' ? 0.5 : 0)
    }, 0)
    return Math.round((sum / students.length) * 100)
  }

  function studentThemaPct(studentId: string): number {
    if (lernziele.length === 0) return 0
    const s = students.find(s => s.id === studentId)!
    const sum = lernziele.reduce((acc, lz) => {
      const st = s.lernzielStatus[lz.id] ?? 'not_reached'
      return acc + (st === 'reached' ? 1 : st === 'partially_reached' ? 0.5 : 0)
    }, 0)
    return Math.round((sum / lernziele.length) * 100)
  }

  const fachLabel = selectedThema ? (getFachForThema(selectedThema.id)?.name ?? '') : ''
  const allChecked = sortedStudents.length > 0 && selectedStudents.size === sortedStudents.length
  const someChecked = selectedStudents.size > 0 && !allChecked
  const hasBulk = selectedStudents.size > 0

  return (
    <div className="space-y-4">

      {/* Floating bulk action bar */}
      {hasBulk && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full border border-border bg-card/95 backdrop-blur px-3 py-1.5 shadow-lg">
          <span className="text-xs text-muted-foreground pr-1 whitespace-nowrap">
            {selectedStudents.size} ausgewählt
          </span>
          <div className="w-px h-4 bg-border" />
          {STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => applyBulkStatus(opt.value)}
              title={opt.label}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors whitespace-nowrap',
                opt.bg,
                opt.text,
              )}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
          <div className="w-px h-4 bg-border" />
          <button
            onClick={() => setSelectedStudents(new Set())}
            className="p-1 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Abbrechen"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Thema selector */}
      <div className="flex flex-col gap-2 flex-wrap max-w-[640px]">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground shrink-0">
          Thema
        </span>
        <select
          value={selectedThemaId ?? ''}
          onChange={e => { setSelectedThemaId(e.target.value || null); setSelectedStudents(new Set()) }}
          className="h-9 rounded-lg border border-border bg-card px-3 pr-8 text-sm font-medium text-foreground shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 min-w-52"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
        >
          {themenByFach.map(({ fach, themen }) => (
            <optgroup key={fach.id} label={fach.name}>
              {themen.map(thema => {
                const lzCount = getLernzieleForThema(thema.id).length
                return (
                  <option key={thema.id} value={thema.id}>
                    {thema.name} ({lzCount} LZ)
                  </option>
                )
              })}
            </optgroup>
          ))}
        </select>
        {selectedThema && fachLabel && (
          <span className="text-xs text-muted-foreground">{fachLabel}</span>
        )}
      </div>

      {/* Grid */}
      {selectedThema && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">

          {/* Grid header */}
          <div className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-border bg-muted/30">
            <div>
              <span className="text-sm font-semibold">{selectedThema.name}</span>
              {fachLabel && (
                <span className="ml-2 text-xs text-muted-foreground">{fachLabel}</span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <span className="inline-block size-2.5 rounded-sm bg-emerald-200" /> Erreicht
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block size-2.5 rounded-sm bg-amber-200" /> Teilweise
              </span>
              <span className="flex items-center gap-1">
                <span className="inline-block size-2.5 rounded-sm bg-red-100 border border-red-300" /> Nicht erreicht
              </span>
            </div>
          </div>

          {lernziele.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Dieses Thema hat noch keine Lernziele.{' '}
              <a href="/lernziele" className="text-primary hover:underline">Jetzt anlegen →</a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: `${260 + lernziele.length * 44 + 80}px` }}>
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {/* checkbox header */}
                    <th className="sticky left-0 z-10 bg-muted/20 px-3 py-2 w-8 min-w-8">
                      <input
                        type="checkbox"
                        checked={allChecked}
                        ref={el => { if (el) el.indeterminate = someChecked }}
                        onChange={toggleAll}
                        className="size-3.5 rounded cursor-pointer accent-foreground"
                      />
                    </th>
                    {/* sticky name header */}
                    <th className="sticky left-8 z-10 bg-muted/20 text-left px-3 py-2 text-xs font-semibold text-muted-foreground w-44 min-w-44">
                      Schüler/in
                    </th>
                    {/* LZ headers */}
                    {lernziele.map((lz, i) => (
                      <th
                        key={lz.id}
                        className="px-1 py-2 text-center"
                        style={{ width: 44, minWidth: 44 }}
                      >
                        <div className="flex flex-col items-center gap-0.5">
                          <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                            {i + 1}
                          </span>
                          <span className={cn(
                            'rounded px-1 text-[8px] font-semibold leading-tight',
                            lz.kategorie === 'grundlegend'
                              ? 'bg-sky-100 text-sky-700'
                              : 'bg-amber-100 text-amber-700',
                          )}>
                            {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
                          </span>
                        </div>
                      </th>
                    ))}
                    {/* % header */}
                    <th className="sticky right-0 z-10 bg-muted/20 px-3 py-2 text-center text-xs font-semibold text-muted-foreground w-16 min-w-16">
                      %
                    </th>
                    {/* quick action header */}
                    <th className="px-2 py-2 w-10 min-w-10" />
                  </tr>
                  {/* LZ label row */}
                  <tr className="border-b border-border bg-card">
                    <td className="sticky left-0 z-10 bg-card px-3 py-1.5" />
                    <td className="sticky left-8 z-10 bg-card px-3 py-1.5 text-xs text-muted-foreground italic">
                      Lernziel-Beschreibung:
                    </td>
                    {lernziele.map(lz => (
                      <td key={lz.id} className="px-1 py-1.5" title={lz.label}>
                        <div
                          className="w-8 text-[9px] text-muted-foreground text-center leading-tight line-clamp-2 mx-auto"
                          style={{ wordBreak: 'break-word' }}
                          title={lz.label}
                        >
                          {lz.label.slice(0, 18)}{lz.label.length > 18 ? '…' : ''}
                        </div>
                      </td>
                    ))}
                    <td className="sticky right-0 z-10 bg-card" />
                    <td />
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedStudents.map((student, rowIdx) => {
                    const pct = studentThemaPct(student.id)
                    const pctColor =
                      pct >= 75 ? 'text-emerald-600' :
                      pct >= 40 ? 'text-amber-600' :
                      'text-red-500'
                    const isSelected = selectedStudents.has(student.id)
                    return (
                      <tr
                        key={student.id}
                        className={cn(
                          'transition-colors',
                          isSelected ? 'bg-accent/20' : rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/10',
                        )}
                      >
                        {/* checkbox */}
                        <td className={cn(
                          'sticky left-0 z-10 px-3 py-1.5',
                          isSelected ? 'bg-accent/20' : rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/10',
                        )}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleStudent(student.id)}
                            className="size-3.5 rounded cursor-pointer accent-foreground"
                          />
                        </td>
                        {/* name */}
                        <td className={cn(
                          'sticky left-8 z-10 px-3 py-1.5 text-sm font-medium',
                          isSelected ? 'bg-accent/20' : rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/10',
                        )}>
                          {student.name}
                        </td>
                        {/* status cells */}
                        {lernziele.map(lz => {
                          const status: Status = student.lernzielStatus[lz.id] ?? 'not_reached'
                          return (
                            <td key={lz.id} className="px-1 py-1.5 text-center">
                              <StatusCell
                                status={status}
                                onSelect={s => updateLernzielStatus(student.id, lz.id, s)}
                              />
                            </td>
                          )
                        })}
                        {/* % */}
                        <td className={cn(
                          'sticky right-0 z-10 px-3 py-1.5 text-center',
                          isSelected ? 'bg-accent/20' : rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/10',
                        )}>
                          <span className={cn('text-xs font-bold tabular-nums', pctColor)}>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                {/* summary footer */}
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td className="sticky left-0 z-10 bg-muted/30 px-3 py-2" />
                    <td className="sticky left-8 z-10 bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground">
                      Klasse (Ø)
                    </td>
                    {lernziele.map(lz => {
                      const pct = lzReachedPct(lz.id)
                      const color =
                        pct >= 75 ? 'text-emerald-600 bg-emerald-50' :
                        pct >= 40 ? 'text-amber-600 bg-amber-50' :
                        'text-red-500 bg-red-50'
                      return (
                        <td key={lz.id} className="px-1 py-2 text-center">
                          <span className={cn(
                            'inline-block text-[10px] font-bold tabular-nums rounded-md px-1 py-0.5',
                            color,
                          )}>
                            {pct}%
                          </span>
                        </td>
                      )
                    })}
                    <td className="sticky right-0 z-10 bg-muted/30" />
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}

      {/* LZ legend */}
      {selectedThema && lernziele.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Lernziele</p>
          <div className="space-y-1">
            {lernziele.map((lz, i) => (
              <div key={lz.id} className="flex items-start gap-2">
                <span className="text-xs font-bold text-muted-foreground w-5 shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-xs text-foreground">{lz.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
