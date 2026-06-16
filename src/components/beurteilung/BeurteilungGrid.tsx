'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { StatusCell, nextStatus } from '@/components/shared/StatusCell'
import { PruefungAnhangUpload } from '@/components/pruefungen/PruefungAnhangUpload'
import { RilzStudentCard } from '@/components/lernkontrolle/RilzStudentCard'
import { cn } from '@/lib/utils'
import type { KlasseBeurteilungSettings, PruefungErgebnis, Schueler, Status, Thema } from '@/types/domain'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

interface RowState {
  punkte: string
  note: string
  kommentar: string
}

function useRowState(ergebnis: PruefungErgebnis | undefined) {
  const [state, setState] = useState<RowState>({
    punkte: ergebnis?.punkte != null ? String(ergebnis.punkte) : '',
    note: ergebnis?.note ?? '',
    kommentar: ergebnis?.kommentar ?? '',
  })
  const prevId = useRef(ergebnis?.id)
  useEffect(() => {
    if (ergebnis?.id !== prevId.current) {
      prevId.current = ergebnis?.id
      setState({
        punkte: ergebnis?.punkte != null ? String(ergebnis.punkte) : '',
        note: ergebnis?.note ?? '',
        kommentar: ergebnis?.kommentar ?? '',
      })
    }
  }, [ergebnis])
  return [state, setState] as const
}

interface StudentRowProps {
  student: Schueler
  pruefungId: string
  maxPunkte?: number
  lzGroups: { thema: Thema; grundlegend: { id: string; label: string }[]; anspruchsvoll: { id: string; label: string }[] }[]
  allLzIds: string[]
  ergebnis: PruefungErgebnis | undefined
  settings: KlasseBeurteilungSettings
  rowIdx: number
  totalRows: number
  rilzFachIds: string[]
  pruefungFachId: string
  onUpsert: (data: Omit<PruefungErgebnis, 'tenantId' | 'createdAt'>) => void
  onUpdateLz: (studentId: string, lzId: string, status: Status | undefined) => void
  onUpload: (pruefungId: string, schuelerId: string, file: File) => Promise<string | null>
  onDeleteAnhang: (ergebnisId: string, url: string) => Promise<void>
}

function StudentRow({
  student, pruefungId, maxPunkte, lzGroups, allLzIds, ergebnis,
  settings, rowIdx, totalRows, rilzFachIds, pruefungFachId,
  onUpsert, onUpdateLz, onUpload, onDeleteAnhang,
}: StudentRowProps) {
  const [row, setRow] = useRowState(ergebnis)
  const debouncedRow = useDebounce(row, 500)
  const ergebnisId = useRef(ergebnis?.id ?? crypto.randomUUID())
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    if (!settings.punkteEnabled && !settings.noteEnabled) return
    onUpsert({
      id: ergebnisId.current,
      pruefungId,
      schuelerId: student.id,
      punkte: debouncedRow.punkte !== '' ? Number(debouncedRow.punkte) : undefined,
      note: debouncedRow.note || undefined,
      anzahlVersuche: ergebnis?.anzahlVersuche ?? 1,
      status: ergebnis?.status,
      kommentar: debouncedRow.kommentar || undefined,
      anhangUrls: ergebnis?.anhangUrls ?? [],
    })
  }, [debouncedRow]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpload = useCallback(
    (file: File) => onUpload(pruefungId, student.id, file),
    [pruefungId, student.id, onUpload]
  )
  const handleDeleteAnhang = useCallback(
    (url: string) => onDeleteAnhang(ergebnisId.current, url),
    [onDeleteAnhang]
  )

  const isRilzInFach = rilzFachIds.includes(pruefungFachId)
  const rowBg = rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/10'

  const pct = (() => {
    const applicable = allLzIds.filter(lzId => {
      // skip A-LZ for RILZ students in this fach
      const lzGroup = lzGroups.flatMap(g => g.anspruchsvoll).find(lz => lz.id === lzId)
      return !(isRilzInFach && lzGroup)
    })
    if (applicable.length === 0) return 0
    const sum = applicable.reduce((acc, lzId) => {
      const st = student.lernzielStatus[lzId] ?? 'not_reached'
      return acc + (st === 'reached' ? 1 : st === 'partially_reached' ? 0.5 : 0)
    }, 0)
    return Math.round((sum / applicable.length) * 100)
  })()

  const pctColor =
    pct >= 75 ? 'text-emerald-600' :
    pct >= 40 ? 'text-amber-600' :
    'text-red-500'

  return (
    <tr className={cn('transition-colors', rowBg)}>
      <td className="sticky left-0 z-10 bg-card px-3 py-1 text-sm font-medium border-r border-border whitespace-nowrap overflow-hidden text-ellipsis max-w-32 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
        {student.vorname} {student.nachname}
      </td>

      {lzGroups.map((group, gi) => {
        const isLastGroup = gi === lzGroups.length - 1
        const cells = [
          ...group.grundlegend.map((lz, lzIdx) => {
            const status = student.lernzielStatus[lz.id] as Status | undefined
            return (
              <td
                key={lz.id}
                className={cn(
                  'px-1 py-1 text-center',
                  rowBg,
                  lzIdx === group.grundlegend.length - 1 && group.anspruchsvoll.length > 0 && 'border-r border-dashed border-border/60',
                )}
              >
                <StatusCell
                  status={status}
                  onSelect={s => onUpdateLz(student.id, lz.id, s)}
                />
              </td>
            )
          }),
          ...group.anspruchsvoll.map((lz, lzIdx) => {
            const isSkipped = isRilzInFach
            const status = student.lernzielStatus[lz.id] as Status | undefined
            return (
              <td
                key={lz.id}
                className={cn(
                  'px-1 py-1 text-center',
                  rowBg,
                  isSkipped && 'opacity-25',
                  !isLastGroup && lzIdx === group.anspruchsvoll.length - 1 && 'border-r-2 border-border/50',
                )}
              >
                <StatusCell
                  status={isSkipped ? undefined : status}
                  onSelect={s => !isSkipped && onUpdateLz(student.id, lz.id, s)}
                />
              </td>
            )
          }),
        ]
        return <React.Fragment key={group.thema.id}>{cells}</React.Fragment>
      })}

      {/* % */}
      <td className={cn('sticky z-10 bg-card px-2 py-1 text-center border-l border-border', settings.punkteEnabled || settings.noteEnabled || settings.anhangEnabled ? '' : 'right-0')}>
        <span className={cn('text-xs font-bold tabular-nums', pctColor)}>{pct}%</span>
      </td>

      {settings.punkteEnabled && (
        <td className="py-1 px-2 border-l border-border/40">
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              max={maxPunkte}
              step={0.5}
              value={row.punkte}
              onChange={e => setRow(r => ({ ...r, punkte: e.target.value }))}
              placeholder="—"
              className="w-14 rounded-md border border-border bg-background px-2 py-0.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {maxPunkte != null && (
              <span className="text-xs text-muted-foreground shrink-0">/{maxPunkte}</span>
            )}
          </div>
        </td>
      )}

      {settings.noteEnabled && (
        <td className="py-1 px-2 border-l border-border/40">
          <input
            type="number"
            min={1}
            max={6}
            step={0.5}
            value={row.note}
            onChange={e => setRow(r => ({ ...r, note: e.target.value }))}
            placeholder="—"
            className="w-14 rounded-md border border-border bg-background px-2 py-0.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </td>
      )}

      {settings.anhangEnabled && (
        <td className="py-1 px-2 border-l border-border/40">
          <PruefungAnhangUpload
            urls={ergebnis?.anhangUrls ?? []}
            onUpload={handleUpload}
            onDelete={handleDeleteAnhang}
          />
        </td>
      )}
    </tr>
  )
}

interface Props {
  pruefungId: string
  klassId: string
  settings: KlasseBeurteilungSettings
}

export function BeurteilungGrid({ pruefungId, klassId, settings }: Props) {
  const {
    pruefungen, getPruefungErgebnisse, getStudentsForClass, lernziele, themen,
    faecher, updateLernzielStatus, upsertPruefungErgebnis, uploadAnhang, deleteAnhang,
  } = useData()

  const pruefung = pruefungen.find(p => p.id === pruefungId)
  const ergebnisse = getPruefungErgebnisse(pruefungId)

  const topScrollRef = useRef<HTMLDivElement>(null)
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const [tableScrollWidth, setTableScrollWidth] = useState(0)

  const allStudents = getStudentsForClass(klassId).sort(
    (a, b) => a.vorname.localeCompare(b.vorname, 'de')
  )

  const pruefungFachId = pruefung?.fachId ?? ''
  const rilzStudents = allStudents.filter(s => s.rilzFachIds?.includes(pruefungFachId))
  const mainStudents = allStudents.filter(s => !s.rilzFachIds?.includes(pruefungFachId))

  // Build LZ groups from pruefung.lernzielIds → grouped by Thema → split G/A
  const lzGroups = (() => {
    if (!pruefung) return []
    // collect unique thema ids in order
    const themaOrder: string[] = []
    for (const lzId of pruefung.lernzielIds) {
      const lz = lernziele.find(l => l.id === lzId)
      if (lz && !themaOrder.includes(lz.themaId)) themaOrder.push(lz.themaId)
    }
    return themaOrder.map(themaId => {
      const thema = themen.find(t => t.id === themaId)!
      const lzsForThema = pruefung.lernzielIds
        .map(id => lernziele.find(l => l.id === id))
        .filter((l): l is NonNullable<typeof l> => l != null && l.themaId === themaId)
      return {
        thema,
        grundlegend: lzsForThema.filter(l => l.kategorie === 'grundlegend'),
        anspruchsvoll: lzsForThema.filter(l => l.kategorie === 'anspruchsvoll'),
      }
    })
  })()

  const allLzIds = pruefung?.lernzielIds ?? []

  useEffect(() => {
    if (tableScrollRef.current) setTableScrollWidth(tableScrollRef.current.scrollWidth)
  }, [allLzIds.length])

  const selectedFachObj = faecher.find(f => f.id === pruefungFachId)

  if (!pruefung) return null

  const bewertet = allStudents.filter(s =>
    ergebnisse.some(e => e.schuelerId === s.id && e.status)
  ).length

  const hasExtra = settings.punkteEnabled || settings.noteEnabled || settings.anhangEnabled

  return (
    <div className="space-y-3">
      {/* Meta */}
      <p className="text-sm text-muted-foreground">
        {selectedFachObj?.name} · {new Date(pruefung.datum).toLocaleDateString('de-CH')} ·{' '}
        {allLzIds.length} Lernziel{allLzIds.length !== 1 ? 'e' : ''} ·{' '}
        {bewertet}/{allStudents.length} bewertet
        {pruefung.maxPunkte != null && ` · max. ${pruefung.maxPunkte} Pkt.`}
      </p>

      {/* Legend */}
      <div className="flex justify-end gap-3">
        {([
          ['bg-emerald-200', 'Erreicht'],
          ['bg-amber-200', 'Teilweise'],
          ['bg-red-100 border border-red-300', 'Nicht erreicht'],
          ['bg-slate-200', 'Nicht bewertet'],
        ] as const).map(([cls, label]) => (
          <span key={label} className="flex items-center gap-1 text-[10px] text-muted-foreground/70">
            <span className={cn('inline-block size-2.5 rounded-sm shrink-0', cls)} />
            {label}
          </span>
        ))}
      </div>

      {/* Top scroll mirror */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div
          ref={topScrollRef}
          onScroll={() => { if (tableScrollRef.current) tableScrollRef.current.scrollLeft = topScrollRef.current!.scrollLeft }}
          className="overflow-x-auto border-b border-border/40"
          style={{ height: 12 }}
        >
          <div style={{ width: tableScrollWidth, height: 1 }} />
        </div>

        <div
          ref={tableScrollRef}
          onScroll={() => { if (topScrollRef.current) topScrollRef.current.scrollLeft = tableScrollRef.current!.scrollLeft }}
          className="overflow-x-auto outline-none"
        >
          <table className="border-collapse w-max min-w-full">
            <thead>
              {/* Thema group row */}
              {lzGroups.length > 0 && (
                <tr className="border-b border-border/50">
                  <th className="sticky left-0 z-10 bg-card border-r border-border" />
                  {lzGroups.map((group, gi) => {
                    const colSpan = group.grundlegend.length + group.anspruchsvoll.length
                    const isLast = gi === lzGroups.length - 1
                    return (
                      <th
                        key={group.thema.id}
                        colSpan={colSpan}
                        className={cn(
                          'px-2 py-1 text-xs font-semibold text-center bg-muted/20',
                          !isLast && 'border-r-2 border-border/60',
                        )}
                      >
                        {group.thema.name}
                      </th>
                    )
                  })}
                  {/* % + extra cols */}
                  <th className="sticky z-10 bg-card border-l border-border" />
                  {settings.punkteEnabled && <th className="bg-card border-l border-border/40" />}
                  {settings.noteEnabled && <th className="bg-card border-l border-border/40" />}
                  {settings.anhangEnabled && <th className="bg-card border-l border-border/40" />}
                </tr>
              )}

              {/* G/A + LZ label headers */}
              <tr className="border-b border-border bg-muted/20">
                <th className="sticky left-0 z-10 bg-card w-32 min-w-32 border-r border-border px-2 py-1.5 align-bottom shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]" />

                {lzGroups.map((group, gi) => {
                  const isLastGroup = gi === lzGroups.length - 1
                  return (
                    <React.Fragment key={group.thema.id}>
                      {group.grundlegend.map((lz, lzIdx) => (
                        <th
                          key={lz.id}
                          className={cn(
                            'bg-muted/20 px-1.5 py-2 text-left align-top',
                            lzIdx === group.grundlegend.length - 1 && group.anspruchsvoll.length > 0 && 'border-r border-dashed border-border/60',
                          )}
                          style={{ width: 72, minWidth: 72 }}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="rounded px-1 py-px text-[9px] font-semibold bg-slate-100 text-slate-700 w-fit">G</span>
                            <span className="text-[11px] font-medium text-foreground leading-snug">{lz.label}</span>
                          </div>
                        </th>
                      ))}
                      {group.anspruchsvoll.map((lz, lzIdx) => (
                        <th
                          key={lz.id}
                          className={cn(
                            'bg-muted/20 px-1.5 py-2 text-left align-top',
                            !isLastGroup && lzIdx === group.anspruchsvoll.length - 1 && 'border-r-2 border-border/50',
                          )}
                          style={{ width: 72, minWidth: 72 }}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="rounded px-1 py-px text-[9px] font-semibold bg-violet-100 text-violet-700 w-fit">A</span>
                            <span className="text-[11px] font-medium text-foreground leading-snug">{lz.label}</span>
                          </div>
                        </th>
                      ))}
                    </React.Fragment>
                  )
                })}

                <th
                  className={cn(
                    'sticky z-10 bg-card px-2 text-center text-xs font-semibold text-muted-foreground w-12 min-w-12 border-l border-border',
                    !hasExtra && 'right-0',
                  )}
                  style={{ verticalAlign: 'bottom', paddingBottom: 6 }}
                >
                  %
                </th>

                {settings.punkteEnabled && (
                  <th
                    className="bg-card px-2 py-2 text-left text-xs font-semibold text-muted-foreground border-l border-border/40 whitespace-nowrap"
                    style={{ verticalAlign: 'bottom' }}
                  >
                    Punkte{pruefung.maxPunkte != null ? ` / ${pruefung.maxPunkte}` : ''}
                  </th>
                )}

                {settings.noteEnabled && (
                  <th
                    className="bg-card px-2 py-2 text-left text-xs font-semibold text-muted-foreground border-l border-border/40"
                    style={{ verticalAlign: 'bottom' }}
                  >
                    Note
                  </th>
                )}

                {settings.anhangEnabled && (
                  <th
                    className="sticky right-0 z-10 bg-card px-2 py-2 text-left text-xs font-semibold text-muted-foreground border-l border-border/40"
                    style={{ verticalAlign: 'bottom' }}
                  >
                    Anhang
                  </th>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {mainStudents.map((student, rowIdx) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  pruefungId={pruefungId}
                  maxPunkte={pruefung.maxPunkte}
                  lzGroups={lzGroups}
                  allLzIds={allLzIds}
                  ergebnis={ergebnisse.find(e => e.schuelerId === student.id)}
                  settings={settings}
                  rowIdx={rowIdx}
                  totalRows={mainStudents.length}
                  rilzFachIds={student.rilzFachIds ?? []}
                  pruefungFachId={pruefungFachId}
                  onUpsert={upsertPruefungErgebnis}
                  onUpdateLz={updateLernzielStatus}
                  onUpload={uploadAnhang}
                  onDeleteAnhang={deleteAnhang}
                />
              ))}
            </tbody>

            {/* Class avg footer */}
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30">
                <td className="sticky left-0 z-10 bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground border-r border-border">
                  Klasse (Ø)
                </td>
                {lzGroups.map((group, gi) => {
                  const isLastGroup = gi === lzGroups.length - 1
                  return (
                    <React.Fragment key={group.thema.id}>
                      {[...group.grundlegend, ...group.anspruchsvoll].map((lz, lzIdx) => {
                        const eligible = mainStudents
                        const sum = eligible.reduce((acc, s) => {
                          const st = s.lernzielStatus[lz.id] ?? 'not_reached'
                          return acc + (st === 'reached' ? 1 : st === 'partially_reached' ? 0.5 : 0)
                        }, 0)
                        const pct = eligible.length > 0 ? Math.round((sum / eligible.length) * 100) : 0
                        const color =
                          pct >= 75 ? 'text-emerald-600 bg-emerald-50' :
                          pct >= 40 ? 'text-amber-600 bg-amber-50' :
                          'text-red-500 bg-red-50'
                        const isAEnd = lz.kategorie === 'anspruchsvoll' && !isLastGroup && lzIdx === group.grundlegend.length + group.anspruchsvoll.length - 1
                        const isGEnd = lz.kategorie === 'grundlegend' && group.anspruchsvoll.length > 0 && lzIdx === group.grundlegend.length - 1
                        return (
                          <td key={lz.id} className={cn(
                            'px-1 py-1.5 text-center',
                            isAEnd && 'border-r-2 border-border/50',
                            isGEnd && 'border-r border-dashed border-border/60',
                          )}>
                            <span className={cn('inline-block text-[10px] font-bold tabular-nums rounded-md px-1 py-0.5', color)}>
                              {pct}%
                            </span>
                          </td>
                        )
                      })}
                    </React.Fragment>
                  )
                })}
                <td className={cn('sticky z-10 bg-card border-l border-border', !hasExtra && 'right-0')} />
                {settings.punkteEnabled && <td className="border-l border-border/40" />}
                {settings.noteEnabled && <td className="border-l border-border/40" />}
                {settings.anhangEnabled && <td className="sticky right-0 z-10 bg-card border-l border-border/40" />}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* RILZ students */}
      {rilzStudents.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-orange-700">
            RILZ – Individuelle Beurteilung
          </p>
          {rilzStudents.map(student => {
            const rilzLibraryThemen = (student.rilzThemaIds ?? [])
              .map(id => themen.find(t => t.id === id))
              .filter((t): t is NonNullable<typeof t> => t != null)
              .filter(t => lzGroups.some(g => g.thema.id === t.standardThemaId))
            return (
              <RilzStudentCard
                key={student.id}
                student={student}
                selectedThemen={lzGroups.map(g => g.thema)}
                grundlegendLernziele={lzGroups.flatMap(g => g.grundlegend).map(lz => ({
                  id: lz.id, themaId: lzGroups.find(g => g.grundlegend.includes(lz))?.thema.id ?? '',
                  kategorie: 'grundlegend' as const, label: lz.label,
                }))}
                faecher={faecher}
                rilzLibraryThemen={rilzLibraryThemen}
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
