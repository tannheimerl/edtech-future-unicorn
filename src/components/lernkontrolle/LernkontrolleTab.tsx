'use client'

import { useState } from 'react'
import { Check, Minus, X, ClipboardList } from 'lucide-react'
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
          'w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer',
          status === 'reached' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
          status === 'partially_reached' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
          status === 'not_reached' ? 'bg-red-100 text-red-500 hover:bg-red-200' :
          'bg-slate-100 text-slate-400 hover:bg-slate-200',
        )}
      >
        {status === 'reached' && <Check className="size-3.5 stroke-[2.5]" />}
        {status === 'partially_reached' && <Minus className="size-3.5 stroke-[2.5]" />}
        {status === 'not_reached' && <X className="size-3 stroke-[2]" />}
        {status === undefined && <span className="size-2 rounded-full bg-slate-300" />}
      </button>
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

  return (
    <div className="space-y-4">

      {/* Thema selector */}
      <div className="flex flex-col gap-2 flex-wrap max-w-[640px]">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground shrink-0">
          Thema
        </span>
        <select
          value={selectedThemaId ?? ''}
          onChange={e => setSelectedThemaId(e.target.value || null)}
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
                <span className="inline-block size-2.5 rounded-sm bg-slate-200" /> –
              </span>
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
              <table className="border-collapse w-max min-w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="sticky left-0 z-10 bg-muted/20 w-44 min-w-44" />
                    {/* LZ headers — wrapped text */}
                    {lernziele.map((lz) => (
                      <th
                        key={lz.id}
                        className="bg-muted/20 px-2 py-3 text-left align-top"
                        style={{ width: 90, minWidth: 90 }}
                      >
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            'self-start rounded px-1 py-px text-[9px] font-semibold',
                            lz.kategorie === 'grundlegend' ? 'bg-sky-100 text-sky-700' : 'bg-amber-100 text-amber-700',
                          )}>
                            {lz.kategorie === 'grundlegend' ? 'G' : 'A'}
                          </span>
                          <span className="text-xs font-medium text-foreground leading-snug">{lz.label}</span>
                        </div>
                      </th>
                    ))}
                    {/* % header */}
                    <th
                      className="sticky right-0 z-10 bg-muted/20 px-3 text-center text-xs font-semibold text-muted-foreground w-16 min-w-16"
                      style={{ verticalAlign: 'bottom', paddingBottom: 8 }}
                    >
                      %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sortedStudents.map((student, rowIdx) => {
                    const pct = studentThemaPct(student.id)
                    const pctColor =
                      pct >= 75 ? 'text-emerald-600' :
                      pct >= 40 ? 'text-amber-600' :
                      'text-red-500'
                    const rowBg = rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/10'
                    return (
                      <tr key={student.id} className={cn('transition-colors', rowBg)}>
                        {/* name */}
                        <td className={cn('sticky left-0 z-10 px-3 py-1.5 text-sm font-medium', rowBg)}>
                          {student.name}
                        </td>
                        {/* status cells */}
                        {lernziele.map(lz => {
                          const status = student.lernzielStatus[lz.id] as Status | undefined
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
                        <td className={cn('sticky right-0 z-10 px-3 py-1.5 text-center', rowBg)}>
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
                    <td className="sticky left-0 z-10 bg-muted/30 px-3 py-2 text-xs font-semibold text-muted-foreground">
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
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
