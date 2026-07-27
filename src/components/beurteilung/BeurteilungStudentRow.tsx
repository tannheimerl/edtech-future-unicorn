'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StatusCell } from '@/components/shared/StatusCell'
import { PruefungAnhangUpload } from '@/components/pruefungen/PruefungAnhangUpload'
import { cn, statusAvgPct, scoreColor } from '@/lib/utils'
import { todayISO } from '@/lib/dates'
import type { PruefungErgebnis, Schueler, Status, Thema, VersuchSnapshot } from '@/types/domain'

// Eine Schüler-Zeile des Prüfungs-Grids: Status-Zellen, Punkte/Note/Kommentar
// (debounced Autosave) und Versuchs-Verwaltung.
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

export type AssessmentSettings = { punkteEnabled: boolean; noteEnabled: boolean; anhangEnabled: boolean }

type StudentRowProps = {
  student: Schueler
  pruefungId: string
  maxPunkte?: number
  lzGroups: { thema: Thema; grundlegend: { id: string; label: string }[]; anspruchsvoll: { id: string; label: string }[] }[]
  allLzIds: string[]
  ergebnis: PruefungErgebnis | undefined
  settings: AssessmentSettings
  rowIdx: number
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

export const StudentRow = ({
  student, pruefungId, maxPunkte, lzGroups, allLzIds, ergebnis,
  settings, rowIdx, rilzFachIds, pruefungFachId,
  onUpsert, onUpdateLz, onUpload, onDeleteAnhang,
}: StudentRowProps) => {
  const [row, setRow] = useRowState(ergebnis)
  const debouncedRow = useDebounce(row, 500)
  const ergebnisId = useRef(ergebnis?.id ?? crypto.randomUUID())
  const firstRender = useRef(true)

  // Taucht das Ergebnis später mit anderer id auf (z. B. nach reloadData),
  // muss die Ref folgen — sonst legt der nächste Upsert einen Duplikat-Datensatz an.
  useEffect(() => {
    if (ergebnis?.id) ergebnisId.current = ergebnis.id
  }, [ergebnis?.id])

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
              date: todayISO(),
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
    // skip A-LZ for RILZ students in this fach
    const anspruchsvollIds = new Set(lzGroups.flatMap(g => g.anspruchsvoll).map(lz => lz.id))
    const applicable = allLzIds.filter(lzId => !(isRilzInFach && anspruchsvollIds.has(lzId)))
    return statusAvgPct(applicable.map(lzId => student.lernzielStatus[lzId]))
  })()

  const pctColor = scoreColor(pct)

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
