'use client'

import { useState } from 'react'
import { Check, Minus, X, CheckCheck, ClipboardList } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { cn } from '@/lib/utils'
import type { Status } from '@/types/domain'

const STATUS_CYCLE: Status[] = ['not_reached', 'partially_reached', 'reached']

function cycleStatus(current: Status): Status {
  return STATUS_CYCLE[(STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length]
}

function StatusCell({ status, onClick }: { status: Status; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={
        status === 'reached' ? 'Erreicht' :
        status === 'partially_reached' ? 'Teilweise erreicht' :
        'Nicht erreicht'
      }
      className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer',
        status === 'reached'
          ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          : status === 'partially_reached'
          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
          : 'bg-muted text-muted-foreground hover:bg-muted/60',
      )}
    >
      {status === 'reached'
        ? <Check className="size-3.5 stroke-[2.5]" />
        : status === 'partially_reached'
        ? <Minus className="size-3.5 stroke-[2.5]" />
        : <X className="size-3 stroke-[2]" />}
    </button>
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

  const themenByFach = faecher
    .map(f => ({ fach: f, themen: assignedThemen.filter(t => t.fachId === f.id) }))
    .filter(f => f.themen.length > 0)

  const selectedThema = assignedThemen.find(t => t.id === selectedThemaId) ?? null
  const lernziele = selectedThemaId ? getLernzieleForThema(selectedThemaId) : []

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

  // summary: % reached per LZ (reached = 1, partially = 0.5)
  function lzReachedPct(lzId: string): number {
    if (students.length === 0) return 0
    const sum = students.reduce((acc, s) => {
      const st = s.lernzielStatus[lzId] ?? 'not_reached'
      return acc + (st === 'reached' ? 1 : st === 'partially_reached' ? 0.5 : 0)
    }, 0)
    return Math.round((sum / students.length) * 100)
  }

  // per-student % for this thema
  function studentThemaPct(studentId: string): number {
    if (lernziele.length === 0) return 0
    const s = students.find(s => s.id === studentId)!
    const sum = lernziele.reduce((acc, lz) => {
      const st = s.lernzielStatus[lz.id] ?? 'not_reached'
      return acc + (st === 'reached' ? 1 : st === 'partially_reached' ? 0.5 : 0)
    }, 0)
    return Math.round((sum / lernziele.length) * 100)
  }

  const sortedStudents = [...students].sort((a, b) => a.name.localeCompare(b.name, 'de'))

  const fachLabel = selectedThema
    ? (getFachForThema(selectedThema.id)?.name ?? '')
    : ''

  return (
    <div className="space-y-4">

      {/* Thema selector */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Thema wählen</p>
        {themenByFach.map(({ fach, themen }) => (
          <div key={fach.id} className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{fach.name}</p>
            <div className="flex flex-wrap gap-1.5">
              {themen.map(thema => {
                const lzCount = getLernzieleForThema(thema.id).length
                const isActive = thema.id === selectedThemaId
                return (
                  <button
                    key={thema.id}
                    onClick={() => setSelectedThemaId(thema.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all',
                      isActive
                        ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                        : 'border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    {thema.name}
                    <span className={cn('font-normal', isActive ? 'opacity-70' : 'opacity-50')}>
                      {lzCount} LZ
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
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
                <span className="inline-block size-2.5 rounded-sm bg-muted border border-border" /> Nicht erreicht
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
              <table className="w-full border-collapse" style={{ minWidth: `${220 + lernziele.length * 44 + 80}px` }}>
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {/* sticky name header */}
                    <th className="sticky left-0 z-10 bg-muted/20 text-left px-4 py-2 text-xs font-semibold text-muted-foreground w-48 min-w-48">
                      Schüler/in
                    </th>
                    {/* LZ headers */}
                    {lernziele.map((lz, i) => (
                      <th
                        key={lz.id}
                        className="px-1 py-2 text-center"
                        style={{ width: 44, minWidth: 44 }}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-semibold text-muted-foreground tabular-nums">
                            {i + 1}
                          </span>
                          <div
                            className="w-7 h-7 rounded-full bg-muted/60 flex items-center justify-center cursor-default"
                            title={lz.label}
                          >
                            <span className="text-[10px] font-bold text-muted-foreground">{i + 1}</span>
                          </div>
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
                  {/* LZ label row (abbreviated tooltips) */}
                  <tr className="border-b border-border bg-card">
                    <td className="sticky left-0 z-10 bg-card px-4 py-1.5 text-xs text-muted-foreground italic">
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
                    return (
                      <tr
                        key={student.id}
                        className={cn(
                          'transition-colors hover:bg-accent/30',
                          rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/10',
                        )}
                      >
                        {/* name */}
                        <td className={cn(
                          'sticky left-0 z-10 px-4 py-1.5 text-sm font-medium',
                          rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/10',
                        )}>
                          {student.name}
                        </td>
                        {/* status cells */}
                        {lernziele.map(lz => {
                          const status: Status = student.lernzielStatus[lz.id] ?? 'not_reached'
                          return (
                            <td key={lz.id} className="px-1 py-1.5 text-center">
                              <div className="flex justify-center">
                                <StatusCell
                                  status={status}
                                  onClick={() => updateLernzielStatus(student.id, lz.id, cycleStatus(status))}
                                />
                              </div>
                            </td>
                          )
                        })}
                        {/* % */}
                        <td className={cn(
                          'sticky right-0 z-10 px-3 py-1.5 text-center',
                          rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/10',
                        )}>
                          <span className={cn('text-xs font-bold tabular-nums', pctColor)}>
                            {pct}%
                          </span>
                        </td>
                        {/* quick actions */}
                        <td className="px-2 py-1.5">
                          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 [tr:hover_&]:opacity-100 transition-opacity">
                            <button
                              onClick={() => setAllReached(student.id)}
                              title="Alle Lernziele auf Erreicht setzen"
                              className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                              <CheckCheck className="size-3.5" />
                            </button>
                            <button
                              onClick={() => setAllNotReached(student.id)}
                              title="Alle Lernziele auf Nicht erreicht setzen"
                              className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                {/* summary footer */}
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td className="sticky left-0 z-10 bg-muted/30 px-4 py-2 text-xs font-semibold text-muted-foreground">
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
