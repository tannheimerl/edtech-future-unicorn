'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'

import { useData } from '@/contexts/DataContext'
import { StatusCell } from '@/components/shared/StatusCell'
import { PruefungAnhangUpload } from '@/components/pruefungen/PruefungAnhangUpload'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { PruefungErgebnis, Schueler, Status, Thema, VersuchSnapshot } from '@/types/domain'

const useDebounce = <T,>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

type RowState = {
  punkte: string
  note: string
  kommentar: string
}

const useRowState = (ergebnis: PruefungErgebnis | undefined) => {
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

type AssessmentSettings = { punkteEnabled: boolean; noteEnabled: boolean; anhangEnabled: boolean }

type StudentRowProps = {
  student: Schueler
  pruefungId: string
  maxPunkte?: number
  lzGroups: { thema: Thema; grundlegend: { id: string; label: string }[]; anspruchsvoll: { id: string; label: string }[] }[]
  allLzIds: string[]
  ergebnis: PruefungErgebnis | undefined
  settings: AssessmentSettings
  rowIdx: number
  totalRows: number
  rilzFachIds: string[]
  pruefungFachId: string
  onUpsert: (data: Omit<PruefungErgebnis, 'createdAt'>) => void
  onUpdateLz: (studentId: string, lzId: string, status: Status | undefined) => void
  onUpload: (pruefungId: string, schuelerId: string, file: File) => Promise<string | null>
  onDeleteAnhang: (ergebnisId: string, url: string) => Promise<void>
}

const buildUpsertBase = (
  id: string, pruefungId: string, schuelerId: string, ergebnis: PruefungErgebnis | undefined
): Omit<PruefungErgebnis, 'createdAt'> => {
  return {
    id,
    pruefungId,
    schuelerId,
    punkte: ergebnis?.punkte,
    note: ergebnis?.note,
    anzahlVersuche: ergebnis?.anzahlVersuche ?? 1,
    zweiterVersuchAusstehend: ergebnis?.zweiterVersuchAusstehend ?? false,
    abgeschlossen: ergebnis?.abgeschlossen ?? false,
    versuchSnapshots: ergebnis?.versuchSnapshots ?? [],
    status: ergebnis?.status,
    kommentar: ergebnis?.kommentar,
    anhangUrls: ergebnis?.anhangUrls ?? [],
  }
}

const StudentRow = ({
  student, pruefungId, maxPunkte, lzGroups, allLzIds, ergebnis,
  settings, rowIdx, totalRows, rilzFachIds, pruefungFachId,
  onUpsert, onUpdateLz, onUpload, onDeleteAnhang,
}: StudentRowProps) => {
  const [row, setRow] = useRowState(ergebnis)
  const debouncedRow = useDebounce(row, 500)
  const ergebnisId = useRef(ergebnis?.id ?? crypto.randomUUID())
  const firstRender = useRef(true)

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return }
    onUpsert({
      ...buildUpsertBase(ergebnisId.current, pruefungId, student.id, ergebnis),
      punkte: debouncedRow.punkte !== '' ? Number(debouncedRow.punkte) : undefined,
      note: debouncedRow.note || undefined,
      kommentar: debouncedRow.kommentar || undefined,
    })
  }, [debouncedRow]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleVersuchChange = useCallback((val: 'laufend' | 'zweiter_versuch' | 'dritter_versuch' | 'abgeschlossen') => {
    const base = buildUpsertBase(ergebnisId.current, pruefungId, student.id, ergebnis)
    if (val === 'abgeschlossen') {
      const extra = ergebnis?.zweiterVersuchAusstehend
        ? {
            anzahlVersuche: (ergebnis.anzahlVersuche ?? 1) + 1,
            versuchSnapshots: [...(ergebnis.versuchSnapshots ?? []), {
              nr: ergebnis.anzahlVersuche ?? 1,
              date: new Date().toISOString().slice(0, 10),
              ...(ergebnis.punkte != null ? { punkte: ergebnis.punkte } : {}),
              ...(ergebnis.note ? { note: ergebnis.note } : {}),
              ...(ergebnis.kommentar ? { kommentar: ergebnis.kommentar } : {}),
              ...(ergebnis.status ? { status: ergebnis.status } : {}),
            } satisfies VersuchSnapshot],
          }
        : {}
      onUpsert({ ...base, abgeschlossen: true, zweiterVersuchAusstehend: false, ...extra })
    } else if (val === 'zweiter_versuch' || val === 'dritter_versuch') {
      onUpsert({ ...base, zweiterVersuchAusstehend: true, abgeschlossen: false })
    } else {
      onUpsert({ ...base, zweiterVersuchAusstehend: false, abgeschlossen: false })
    }
  }, [ergebnis, pruefungId, student.id, onUpsert])

  const handleUpload = useCallback(
    (file: File) => onUpload(pruefungId, student.id, file),
    [pruefungId, student.id, onUpload]
  )
  const handleDeleteAnhang = useCallback(
    (url: string) => onDeleteAnhang(ergebnisId.current, url),
    [onDeleteAnhang]
  )

  const isRilzInFach = rilzFachIds.includes(pruefungFachId)
  const isPending = ergebnis?.zweiterVersuchAusstehend ?? false
  const isAbgeschlossen = ergebnis?.abgeschlossen ?? false
  const versuchVal = isAbgeschlossen
    ? 'abgeschlossen'
    : isPending
      ? (ergebnis?.anzahlVersuche ?? 1) >= 2 ? 'dritter_versuch' : 'zweiter_versuch'
      : 'laufend'
  const rowBg = rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/10'
  const effectiveBg = isPending ? 'bg-status-partial-soft' : rowBg
  const stickyBg = isPending ? 'bg-status-partial-soft' : 'bg-card'

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
    pct >= 75 ? 'text-status-reached' :
    pct >= 40 ? 'text-status-partial' :
    'text-status-not-reached'

  return (
    <tr className={cn('transition-colors group', effectiveBg, isAbgeschlossen && 'opacity-60')}>
      <td className={cn('sticky left-0 z-10 px-3 py-1 border-r border-border max-w-36 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]', stickyBg)}>
        <div className="flex items-center justify-between gap-1 min-w-0">
          <span className={cn('text-sm font-medium truncate flex-1', isAbgeschlossen && 'text-muted-foreground')}>
            {student.vorname} {student.nachname}
          </span>
          <select
            value={versuchVal}
            onChange={e => handleVersuchChange(e.target.value as 'laufend' | 'zweiter_versuch' | 'dritter_versuch' | 'abgeschlossen')}
            className={cn(
              'shrink-0 rounded px-1 py-0.5 text-3xs font-medium border-0 focus:outline-none cursor-pointer',
              versuchVal === 'abgeschlossen' && 'bg-status-reached-soft text-status-reached-fg',
              (versuchVal === 'zweiter_versuch' || versuchVal === 'dritter_versuch') && 'bg-status-partial-soft text-status-partial-fg',
              versuchVal === 'laufend' && 'bg-muted text-muted-foreground',
            )}
          >
            <option value="laufend">1. Versuch</option>
            <option value="zweiter_versuch">2. Versuch</option>
            <option value="dritter_versuch">3. Versuch</option>
            <option value="abgeschlossen">✓ Fertig</option>
          </select>
        </div>
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
                  effectiveBg,
                  lzIdx === group.grundlegend.length - 1 && group.anspruchsvoll.length > 0 && 'border-r border-dashed border-border/60',
                )}
              >
                <StatusCell
                  status={status}
                  readOnly={isAbgeschlossen}
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
                  effectiveBg,
                  isSkipped && 'opacity-25',
                  !isLastGroup && lzIdx === group.anspruchsvoll.length - 1 && 'border-r-2 border-border/50',
                )}
              >
                <StatusCell
                  status={isSkipped ? undefined : status}
                  readOnly={isAbgeschlossen || isSkipped}
                  onSelect={s => onUpdateLz(student.id, lz.id, s)}
                />
              </td>
            )
          }),
        ]
        return <React.Fragment key={group.thema.id}>{cells}</React.Fragment>
      })}

      {/* % */}
      <td className={cn('sticky z-10 px-2 py-1 text-center border-l border-border', stickyBg, settings.punkteEnabled || settings.noteEnabled || settings.anhangEnabled ? '' : 'right-0')}>
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
              disabled={isAbgeschlossen}
              placeholder="—"
              className={cn('w-14 rounded-md border border-border bg-background px-2 py-0.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary', isAbgeschlossen && 'opacity-50 cursor-default')}
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
            disabled={isAbgeschlossen}
            placeholder="—"
            className={cn('w-14 rounded-md border border-border bg-background px-2 py-0.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-primary', isAbgeschlossen && 'opacity-50 cursor-default')}
          />
        </td>
      )}

      <td className="py-1 px-2 border-l border-border/40">
        <input
          type="text"
          value={row.kommentar}
          onChange={e => setRow(r => ({ ...r, kommentar: e.target.value }))}
          disabled={isAbgeschlossen}
          placeholder="—"
          className={cn('w-36 rounded-md border border-border bg-background px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary', isAbgeschlossen && 'opacity-50 cursor-default')}
        />
      </td>

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

type Props = {
  pruefungId: string
  klassId: string
}

export const BeurteilungGrid = ({ pruefungId, klassId }: Props) => {
  const {
    pruefungen, getPruefungErgebnisse, getStudentsForClass, lernziele, themen,
    faecher, updateLernzielStatus, upsertPruefungErgebnis, uploadAnhang, deleteAnhang, updatePruefung,
  } = useData()

  const pruefung = pruefungen.find(p => p.id === pruefungId)
  const settings: AssessmentSettings = pruefung
    ? { punkteEnabled: pruefung.punkteEnabled, noteEnabled: pruefung.noteEnabled, anhangEnabled: pruefung.anhangEnabled }
    : { punkteEnabled: false, noteEnabled: false, anhangEnabled: false }
  const ergebnisse = getPruefungErgebnisse(pruefungId)

  const topScrollRef = useRef<HTMLDivElement>(null)
  const tableScrollRef = useRef<HTMLDivElement>(null)
  const [tableScrollWidth, setTableScrollWidth] = useState(0)

  const allStudents = getStudentsForClass(klassId).sort(
    (a, b) => a.vorname.localeCompare(b.vorname, 'de')
  )

  const pruefungFachId = pruefung?.fachId ?? ''
  const nurRilz = pruefung?.nurRilz ?? false
  const mainStudents = nurRilz
    ? allStudents.filter(s => (pruefung?.rilzSchuelerIds ?? []).includes(s.id))
    : allStudents.filter(s => !s.rilzFachIds?.includes(pruefungFachId))

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

  useEffect(() => {
    if (!pruefung || pruefung.status === 'abgeschlossen' || mainStudents.length === 0) return
    const allDone = mainStudents.every(s =>
      ergebnisse.some(e => e.schuelerId === s.id && e.abgeschlossen)
    )
    if (allDone) updatePruefung(pruefungId, { status: 'abgeschlossen' })
  }, [ergebnisse, mainStudents.length, pruefung?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  const selectedFachObj = faecher.find(f => f.id === pruefungFachId)

  if (!pruefung) return null

  const rilzExcluded = allStudents.length - mainStudents.length
  const bewertet = mainStudents.filter(s =>
    ergebnisse.some(e => e.schuelerId === s.id && e.abgeschlossen)
  ).length

  const hasExtra = true // Kommentar column is always shown

  return (
    <div className="space-y-3">
      {/* Meta */}
      <p className="text-sm text-muted-foreground">
        {selectedFachObj?.name} · {new Date(pruefung.datum).toLocaleDateString('de-CH')} ·{' '}
        {allLzIds.length} Lernziel{allLzIds.length !== 1 ? 'e' : ''} ·{' '}
        {bewertet}/{mainStudents.length} abgeschlossen
        {rilzExcluded > 0 && ` · ${rilzExcluded} RILZ nicht enthalten`}
        {pruefung.maxPunkte != null && ` · max. ${pruefung.maxPunkte} Pkt.`}
      </p>

      {/* Legend */}
      <div className="flex justify-end gap-3">
        {([
          ['bg-status-reached', 'Erreicht'],
          ['bg-status-partial', 'Teilweise'],
          ['bg-status-not-reached-soft border border-status-not-reached', 'Nicht erreicht'],
          ['bg-status-none-soft', 'Nicht bewertet'],
        ] as const).map(([cls, label]) => (
          <span key={label} className="flex items-center gap-1 text-3xs text-muted-foreground/70">
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
                  <th className="bg-card border-l border-border/40" />
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
                            <Badge variant="grundlegend" size="sm" className="w-fit">G</Badge>
                            <span className="text-2xs font-medium text-foreground leading-snug">{lz.label}</span>
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
                            <Badge variant="anspruchsvoll" size="sm" className="w-fit">A</Badge>
                            <span className="text-2xs font-medium text-foreground leading-snug">{lz.label}</span>
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

                <th
                  className="bg-card px-2 py-2 text-left text-xs font-semibold text-muted-foreground border-l border-border/40 whitespace-nowrap"
                  style={{ verticalAlign: 'bottom' }}
                >
                  Kommentar
                </th>

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
                  rilzFachIds={nurRilz ? [] : (student.rilzFachIds ?? [])}
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
                          pct >= 75 ? 'text-status-reached-fg bg-status-reached-soft' :
                          pct >= 40 ? 'text-status-partial-fg bg-status-partial-soft' :
                          'text-status-not-reached-fg bg-status-not-reached-soft'
                        const isAEnd = lz.kategorie === 'anspruchsvoll' && !isLastGroup && lzIdx === group.grundlegend.length + group.anspruchsvoll.length - 1
                        const isGEnd = lz.kategorie === 'grundlegend' && group.anspruchsvoll.length > 0 && lzIdx === group.grundlegend.length - 1
                        return (
                          <td key={lz.id} className={cn(
                            'px-1 py-1.5 text-center',
                            isAEnd && 'border-r-2 border-border/50',
                            isGEnd && 'border-r border-dashed border-border/60',
                          )}>
                            <span className={cn('inline-block text-3xs font-bold tabular-nums rounded-md px-1 py-0.5', color)}>
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
                <td className="border-l border-border/40" />
                {settings.anhangEnabled && <td className="sticky right-0 z-10 bg-card border-l border-border/40" />}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>
  )
}
