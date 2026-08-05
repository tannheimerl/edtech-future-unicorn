'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Icon } from '@/components/ui/Icon'
import { StatusCell, HoverStatusPicker } from '@/components/shared/StatusCell'
import { cn, statusAvgPct, scoreColor } from '@/lib/utils'
import { todayISO } from '@/lib/dates'
import type { PruefungErgebnis, Schueler, Status, Lernkontrolle, Versuch } from '@/types/domain'

// Eine Schüler-Zeile des Prüfungs-Grids: Status-Zellen (mit Versuchs-Historie
// pro Lernziel) und Kommentar (debounced Autosave).
const useDebounce = <T,>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

type RowState = {
  kommentar: string
}

const useRowState = (ergebnis: PruefungErgebnis | undefined) => {
  const [state, setState] = useState<RowState>({
    kommentar: ergebnis?.kommentar ?? '',
  })
  const prevId = useRef(ergebnis?.id)
  useEffect(() => {
    if (ergebnis?.id !== prevId.current) {
      prevId.current = ergebnis?.id
      setState({ kommentar: ergebnis?.kommentar ?? '' })
    }
  }, [ergebnis])
  return [state, setState] as const
}

// Attempts (Versuche) für ein Lernziel innerhalb einer Zelle: alle bisherigen
// Versuche als Status-Chips linksbündig nebeneinander, dahinter ein
// immer sichtbarer "+"-Button, der beim Hover die Status-Auswahl zeigt.
const AttemptsCell = ({
  fallbackStatus,
  versuche,
  readOnly,
  dim = false,
  onChangeVersuch,
  onAddVersuch,
  onDeleteVersuch,
}: {
  fallbackStatus: Status | undefined
  versuche: Versuch[]
  readOnly: boolean
  /** Nur für RILZ-übersprungene Lernziele — nicht für abgeschlossene Lernkontrollen. */
  dim?: boolean
  onChangeVersuch: (idx: number, status: Status | undefined) => void
  onAddVersuch: (status: Status | undefined) => void
  onDeleteVersuch: (idx: number) => void
}) => {
  const attempts: Versuch[] = versuche.length > 0 ? versuche : [{ date: todayISO(), status: fallbackStatus }]

  return (
    <div className={cn('flex items-center justify-start gap-1', dim && 'opacity-25')}>
      {attempts.map((v, idx) => (
        <StatusCell
          key={idx}
          status={v.status}
          readOnly={readOnly}
          onSelect={s => onChangeVersuch(idx, s)}
          onDelete={attempts.length > 1 ? () => onDeleteVersuch(idx) : undefined}
        />
      ))}
      {!readOnly && (
        <HoverStatusPicker
          onSelect={onAddVersuch}
          triggerTitle="Versuch hinzufügen"
          side="bottom"
          triggerClassName="flex size-5 shrink-0 items-center justify-center rounded-md border border-primary text-primary bg-background transition-colors hover:bg-primary/10 cursor-pointer"
        >
          <Icon name="add" size={16} />
        </HoverStatusPicker>
      )}
    </div>
  )
}

type StudentRowProps = {
  student: Schueler
  pruefungId: string
  lzGroups: { thema: Lernkontrolle; grundlegend: { id: string; label: string }[]; anspruchsvoll: { id: string; label: string }[] }[]
  allLzIds: string[]
  ergebnis: PruefungErgebnis | undefined
  rowIdx: number
  rilzFachIds: string[]
  pruefungFachId: string
  locked: boolean
  onUpsert: (data: Omit<PruefungErgebnis, 'createdAt'>) => void
  onSetVersuche: (studentId: string, lernzielId: string, versuche: Versuch[]) => void
}

const buildUpsertBase = (
  id: string, pruefungId: string, schuelerId: string, ergebnis: PruefungErgebnis | undefined
): Omit<PruefungErgebnis, 'createdAt'> => {
  return {
    id,
    pruefungId,
    schuelerId,
    anzahlVersuche: ergebnis?.anzahlVersuche ?? 1,
    zweiterVersuchAusstehend: ergebnis?.zweiterVersuchAusstehend ?? false,
    abgeschlossen: ergebnis?.abgeschlossen ?? false,
    versuchSnapshots: ergebnis?.versuchSnapshots ?? [],
    status: ergebnis?.status,
    kommentar: ergebnis?.kommentar,
  }
}

export const StudentRow = ({
  student, pruefungId, lzGroups, allLzIds, ergebnis,
  rowIdx, rilzFachIds, pruefungFachId, locked,
  onUpsert, onSetVersuche,
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
      kommentar: debouncedRow.kommentar || undefined,
    })
  }, [debouncedRow]) // eslint-disable-line react-hooks/exhaustive-deps

  const isRilzInFach = rilzFachIds.includes(pruefungFachId)
  const rowBg = rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted/10'

  const pct = (() => {
    // skip A-LZ for RILZ students in this fach
    const anspruchsvollIds = new Set(lzGroups.flatMap(g => g.anspruchsvoll).map(lz => lz.id))
    const applicable = allLzIds.filter(lzId => !(isRilzInFach && anspruchsvollIds.has(lzId)))
    return statusAvgPct(applicable.map(lzId => student.lernzielStatus[lzId]))
  })()

  const pctColor = scoreColor(pct)

  const attemptsFor = (lzId: string): Versuch[] => student.lernzielVersuche?.[lzId] ?? []

  const handleChangeVersuch = (lzId: string, idx: number, status: Status | undefined) => {
    const existing = attemptsFor(lzId)
    const base = existing.length > 0 ? existing : [{ date: todayISO(), status: student.lernzielStatus[lzId] }]
    const next = base.map((v, i) => (i === idx ? { ...v, status } : v))
    onSetVersuche(student.id, lzId, next)
  }

  const handleAddVersuch = (lzId: string, status: Status | undefined) => {
    const existing = attemptsFor(lzId)
    const base = existing.length > 0 ? existing : [{ date: todayISO(), status: student.lernzielStatus[lzId] }]
    onSetVersuche(student.id, lzId, [...base, { date: todayISO(), status }])
  }

  const handleDeleteVersuch = (lzId: string, idx: number) => {
    const existing = attemptsFor(lzId)
    const base = existing.length > 0 ? existing : [{ date: todayISO(), status: student.lernzielStatus[lzId] }]
    onSetVersuche(student.id, lzId, base.filter((_, i) => i !== idx))
  }

  return (
    <tr className={cn('transition-colors group', rowBg)}>
      <td className={cn('sticky left-0 z-10 px-3 py-1 border-r border-border max-w-36 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]', rowBg)}>
        <span className="text-sm font-medium truncate block">
          {student.vorname} {student.nachname}
        </span>
      </td>

      {lzGroups.map((group, gi) => {
        const isLastGroup = gi === lzGroups.length - 1
        const cells = [
          ...group.grundlegend.map((lz, lzIdx) => (
            <td
              key={lz.id}
              className={cn(
                'px-1 py-1 text-center',
                rowBg,
                lzIdx === group.grundlegend.length - 1 && group.anspruchsvoll.length > 0 && 'border-r border-dashed border-border/60',
              )}
            >
              <AttemptsCell
                fallbackStatus={student.lernzielStatus[lz.id] as Status | undefined}
                versuche={attemptsFor(lz.id)}
                readOnly={locked}
                onChangeVersuch={(idx, s) => handleChangeVersuch(lz.id, idx, s)}
                onAddVersuch={s => handleAddVersuch(lz.id, s)}
                onDeleteVersuch={idx => handleDeleteVersuch(lz.id, idx)}
              />
            </td>
          )),
          ...group.anspruchsvoll.map((lz, lzIdx) => {
            const isSkipped = isRilzInFach
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
                <AttemptsCell
                  fallbackStatus={isSkipped ? undefined : (student.lernzielStatus[lz.id] as Status | undefined)}
                  versuche={isSkipped ? [] : attemptsFor(lz.id)}
                  readOnly={locked || isSkipped}
                  dim={isSkipped}
                  onChangeVersuch={(idx, s) => handleChangeVersuch(lz.id, idx, s)}
                  onAddVersuch={s => handleAddVersuch(lz.id, s)}
                  onDeleteVersuch={idx => handleDeleteVersuch(lz.id, idx)}
                />
              </td>
            )
          }),
        ]
        return <React.Fragment key={group.thema.id}>{cells}</React.Fragment>
      })}

      {/* % */}
      <td className={cn('sticky z-10 px-2 py-1 text-center border-l border-border', rowBg)}>
        <span className={cn('text-xs font-bold tabular-nums', pctColor)}>{pct}%</span>
      </td>

      <td className="py-1 px-2 border-l border-border/40">
        <input
          type="text"
          value={row.kommentar}
          onChange={e => setRow(r => ({ ...r, kommentar: e.target.value }))}
          disabled={locked}
          className={cn(
            'h-6 w-36 rounded-md border border-border bg-white px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary',
            locked && 'cursor-default',
          )}
        />
      </td>
    </tr>
  )
}
