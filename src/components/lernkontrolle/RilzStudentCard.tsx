'use client'

import React, { useState } from 'react'
import { Check, Minus, X } from 'lucide-react'
import { useData } from '@/contexts/DataContext'
import { cn, getFachColor } from '@/lib/utils'
import { AddLzRow } from './RilzBeurteilungView'
import type { Schueler, Thema, Lernziel, Status, RilzLernziel } from '@/types/domain'
import { STATUS_CYCLE } from '@/types/domain'
import { getInitials, getAvatarColor } from '@/lib/avatar-utils'

// Square status cell — same visual as main grid, for class grundlegend Lernziele
function StatusCell({
  status,
  onSelect,
}: {
  status: Status | undefined
  onSelect: (s: Status | undefined) => void
}) {
  function next(s: Status | undefined): Status | undefined {
    if (s === undefined) return 'reached'
    if (s === 'reached') return 'partially_reached'
    if (s === 'partially_reached') return 'not_reached'
    return undefined
  }
  return (
    <div className="flex justify-center">
      <button
        onClick={() => onSelect(next(status))}
        title={
          status === 'reached' ? 'Erreicht'
          : status === 'partially_reached' ? 'Teilweise erreicht'
          : status === 'not_reached' ? 'Nicht erreicht'
          : 'Nicht bewertet'
        }
        className={cn(
          'w-7 h-7 rounded-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer',
          status === 'reached'           ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
          status === 'partially_reached' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
          status === 'not_reached'       ? 'bg-red-100 text-red-500 hover:bg-red-200' :
                                           'bg-slate-100 text-slate-400 hover:bg-slate-200',
        )}
      >
        {status === 'reached'           && <Check className="size-3 stroke-[2.5]" />}
        {status === 'partially_reached' && <Minus className="size-3 stroke-[2.5]" />}
        {status === 'not_reached'       && <X className="size-3 stroke-[2.5]" />}
        {status === undefined           && <span className="size-1.5 rounded-full bg-slate-300" />}
      </button>
    </div>
  )
}

// Square status cell for RILZ Lernziele — cycles without undefined
function RilzStatusCell({
  status,
  onSelect,
}: {
  status: Status
  onSelect: (s: Status) => void
}) {
  function next(s: Status): Status {
    return STATUS_CYCLE[(STATUS_CYCLE.indexOf(s) + 1) % STATUS_CYCLE.length]
  }
  return (
    <div className="flex justify-center">
      <button
        onClick={() => onSelect(next(status))}
        title={
          status === 'reached' ? 'Erreicht'
          : status === 'partially_reached' ? 'Teilweise erreicht'
          : 'Nicht erreicht'
        }
        className={cn(
          'w-7 h-7 rounded-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer',
          status === 'reached'           ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
          status === 'partially_reached' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                                           'bg-red-100 text-red-500 hover:bg-red-200',
        )}
      >
        {status === 'reached'           && <Check className="size-3 stroke-[2.5]" />}
        {status === 'partially_reached' && <Minus className="size-3 stroke-[2.5]" />}
        {status === 'not_reached'       && <X className="size-3 stroke-[2.5]" />}
      </button>
    </div>
  )
}

// Editable column header for a RILZ Lernziel
function RilzLzHeader({ lz, studentId }: { lz: RilzLernziel; studentId: string }) {
  const { updateRilzLernzielLabel, deleteRilzLernziel } = useData()
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(lz.label)

  const confirm = () => {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== lz.label) updateRilzLernzielLabel(studentId, lz.id, trimmed)
    else setDraft(lz.label)
    setEditing(false)
  }

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between gap-0.5">
        <span className="rounded px-1 py-px text-[9px] font-semibold bg-orange-100 text-orange-700 shrink-0">
          RILZ
        </span>
        <button
          onClick={() => deleteRilzLernziel(studentId, lz.id)}
          className="size-3.5 rounded flex items-center justify-center text-muted-foreground/40 hover:text-destructive hover:bg-muted transition-colors opacity-0 group-hover:opacity-100 shrink-0"
          title="Lernziel löschen"
        >
          <X className="size-2.5" />
        </button>
      </div>
      {editing ? (
        <input
          autoFocus
          className="w-full text-[11px] border border-border rounded px-1 py-0.5 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={confirm}
          onKeyDown={e => {
            if (e.key === 'Enter') confirm()
            if (e.key === 'Escape') { setDraft(lz.label); setEditing(false) }
          }}
        />
      ) : (
        <span
          className="text-[11px] font-medium text-foreground leading-snug cursor-pointer hover:text-orange-700"
          onClick={() => { setDraft(lz.label); setEditing(true) }}
          title="Klicken zum Bearbeiten"
        >
          {lz.label}
        </span>
      )}
    </div>
  )
}

export function RilzStudentCard({
  student,
  selectedThemen,
  grundlegendLernziele,
  faecher,
  rilzLibraryThemen,
}: {
  student: Schueler
  selectedThemen: Thema[]
  grundlegendLernziele: Lernziel[]
  faecher: { id: string; name: string }[]
  rilzLibraryThemen?: Thema[]
}) {
  const {
    addRilzLernziel,
    updateLernzielStatus,
    updateRilzLernzielStatus,
    getFachForThema,
    getLernzieleForThema,
  } = useData()

  const allFachIds = faecher.map(f => f.id)

  const rilzThemen = selectedThemen.filter(t => {
    const fach = getFachForThema(t.id)
    // Include if student has RILZ at Fach level OR has a library RILZ Thema mapping to this standard Thema
    const hasFachRilz = fach ? (student.rilzFachIds ?? []).includes(fach.id) : false
    const hasLibraryRilz = !!(rilzLibraryThemen?.some(rt => rt.standardThemaId === t.id))
    return hasFachRilz || hasLibraryRilz
  })

  const rilzLernziele = student.rilzLernziele ?? []

  // Build column groups per RILZ theme — detecting library mode vs ad-hoc mode
  const colGroups = rilzThemen.map(thema => {
    const fach = getFachForThema(thema.id)
    const libraryRilzThema = rilzLibraryThemen?.find(rt => rt.standardThemaId === thema.id)

    if (libraryRilzThema) {
      // Library mode: use pre-defined RILZ Lernziele from the library Thema
      const rilzLibraryLz = getLernzieleForThema(libraryRilzThema.id)
      return { thema, fach, classGrundlegend: [] as Lernziel[], rilzLz: [] as import('@/types/domain').RilzLernziel[], libraryRilzThema, rilzLibraryLz, mode: 'library' as const }
    }

    // Ad-hoc mode: existing behavior
    const classGrundlegend = grundlegendLernziele.filter(lz => lz.themaId === thema.id)
    const themaRilzLz = rilzLernziele.filter(lz => lz.themaId === thema.id)
    return { thema, fach, classGrundlegend, rilzLz: themaRilzLz, libraryRilzThema: null, rilzLibraryLz: [] as Lernziel[], mode: 'adhoc' as const }
  })

  if (rilzThemen.length === 0) return null

  // Percentage across all column groups
  const allClassLz       = colGroups.flatMap(g => g.classGrundlegend)
  const allRilzLz        = colGroups.flatMap(g => g.rilzLz)
  const allRilzLibraryLz = colGroups.flatMap(g => g.rilzLibraryLz)
  const totalCols        = allClassLz.length + allRilzLz.length + allRilzLibraryLz.length

  function computePct(): number {
    if (totalCols === 0) return 0
    const classSum = allClassLz.reduce((acc, lz) => {
      const st = (student.lernzielStatus[lz.id] as Status | undefined) ?? 'not_reached'
      return acc + (st === 'reached' ? 1 : st === 'partially_reached' ? 0.5 : 0)
    }, 0)
    const rilzSum = allRilzLz.reduce((acc, lz) => {
      return acc + (lz.status === 'reached' ? 1 : lz.status === 'partially_reached' ? 0.5 : 0)
    }, 0)
    const librarySum = allRilzLibraryLz.reduce((acc, lz) => {
      const st = (student.lernzielStatus[lz.id] as Status | undefined) ?? 'not_reached'
      return acc + (st === 'reached' ? 1 : st === 'partially_reached' ? 0.5 : 0)
    }, 0)
    return Math.round(((classSum + rilzSum + librarySum) / totalCols) * 100)
  }

  const pct = computePct()
  const pctColor = pct >= 75 ? 'text-emerald-600' : pct >= 40 ? 'text-amber-600' : 'text-red-500'
  const showThemeGroupHeader = colGroups.length > 1

  return (
    <div className="rounded-2xl border border-orange-200 bg-card overflow-hidden">

      {/* Student header */}
      <div className="flex items-center gap-2.5 px-4 py-3 bg-orange-50 border-b border-orange-200">
        <div className={cn(
          'size-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0',
          getAvatarColor(student.vorname + ' ' + student.nachname),
        )}>
          {getInitials(student.vorname + ' ' + student.nachname)}
        </div>
        <div>
          <p className="text-sm font-semibold">{student.vorname} {student.nachname}</p>
          <div className="flex gap-1 flex-wrap">
            {(student.rilzFachIds ?? []).map(fachId => {
              const fach = faecher.find(f => f.id === fachId)
              return fach ? (
                <span key={fachId} className="rounded px-1 py-px text-[9px] font-semibold bg-orange-100 text-orange-700">
                  RILZ {fach.name}
                </span>
              ) : null
            })}
            {student.bvsa && (
              <span className="rounded px-1 py-px text-[9px] font-semibold bg-purple-100 text-purple-700">BVSA</span>
            )}
          </div>
        </div>
      </div>

      {/* Grid table — only shown when there are columns */}
      {totalCols > 0 && (
        <div className="overflow-x-auto">
          <table className="border-collapse w-max min-w-full">
            <thead>
              {/* Theme group header — only when multiple themes */}
              {showThemeGroupHeader && (
                <tr className="border-b border-border/50">
                  <th className="sticky left-0 z-10 bg-card border-r border-border" />
                  {colGroups.map((g, gi) => {
                    const colSpan = g.mode === 'library'
                      ? g.rilzLibraryLz.length
                      : g.classGrundlegend.length + g.rilzLz.length
                    if (colSpan === 0) return null
                    const isLast = gi === colGroups.length - 1
                    const themaName = g.mode === 'library' ? g.libraryRilzThema!.name : g.thema.name
                    return (
                      <th
                        key={g.thema.id}
                        colSpan={colSpan}
                        className={cn(
                          'px-2 py-1 text-xs font-semibold text-center bg-orange-50/60 text-orange-700',
                          !isLast && 'border-r-2 border-orange-200',
                        )}
                      >
                        <span className="flex items-center justify-center gap-1">
                          {g.fach && (
                            <span className="flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                              <span className={cn('size-1.5 rounded-full shrink-0', getFachColor(g.fach.id, allFachIds).dot)} />
                              {g.fach.name}
                            </span>
                          )}
                          {themaName}
                        </span>
                      </th>
                    )
                  })}
                  <th className="sticky right-0 z-10 bg-card border-l border-border w-12 min-w-12" />
                </tr>
              )}

              {/* LZ column headers */}
              <tr className="border-b border-border bg-muted/20">
                <th className="sticky left-0 z-10 bg-card w-32 min-w-32 border-r border-border px-2 py-1.5 align-bottom">
                  {!showThemeGroupHeader && colGroups[0]?.fach && (
                    <span className="flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <span className={cn('size-1.5 rounded-full shrink-0', getFachColor(colGroups[0].fach.id, allFachIds).dot)} />
                      {colGroups[0].fach.name}
                    </span>
                  )}
                </th>

                {colGroups.map((g, gi) => {
                  const isLastGroup = gi === colGroups.length - 1
                  return (
                    <React.Fragment key={g.thema.id}>
                      {g.mode === 'library' ? (
                        // Library mode: show RILZ library Lernziele as column headers
                        g.rilzLibraryLz.map((lz, lzIdx) => {
                          const isLast = lzIdx === g.rilzLibraryLz.length - 1 && !isLastGroup
                          return (
                            <th
                              key={lz.id}
                              className={cn(
                                'bg-orange-50/30 px-1.5 py-2 text-left align-top',
                                isLast && 'border-r-2 border-orange-200',
                              )}
                              style={{ width: 88, minWidth: 88 }}
                            >
                              <div className="flex flex-col gap-0.5">
                                <span className="rounded px-1 py-px text-[9px] font-semibold bg-orange-100 text-orange-700 self-start">RILZ</span>
                                <span className="text-[11px] font-medium text-foreground leading-snug">{lz.label}</span>
                              </div>
                            </th>
                          )
                        })
                      ) : (
                        <>
                          {/* Class Grundlegend column headers */}
                          {g.classGrundlegend.map((lz, lzIdx) => {
                            const isLastClass = lzIdx === g.classGrundlegend.length - 1
                            const hasDividerToRilz = isLastClass && g.rilzLz.length > 0
                            const hasDividerToGroup = isLastClass && g.rilzLz.length === 0 && !isLastGroup
                            return (
                              <th
                                key={lz.id}
                                className={cn(
                                  'bg-muted/20 px-1.5 py-2 text-left align-top',
                                  (hasDividerToRilz || hasDividerToGroup) && 'border-r-2 border-orange-200/70',
                                )}
                                style={{ width: 72, minWidth: 72 }}
                              >
                                <div className="flex flex-col gap-0.5">
                                  <span className="rounded px-1 py-px text-[9px] font-semibold bg-sky-100 text-sky-700 self-start">G</span>
                                  <span className="text-[11px] font-medium text-foreground leading-snug">{lz.label}</span>
                                </div>
                              </th>
                            )
                          })}

                          {/* RILZ ad-hoc column headers */}
                          {g.rilzLz.map((lz, lzIdx) => {
                            const isLastRilz = lzIdx === g.rilzLz.length - 1 && !isLastGroup
                            return (
                              <th
                                key={lz.id}
                                className={cn(
                                  'bg-orange-50/30 px-1.5 py-2 text-left align-top group',
                                  isLastRilz && 'border-r-2 border-orange-200',
                                )}
                                style={{ width: 88, minWidth: 88 }}
                              >
                                <RilzLzHeader lz={lz} studentId={student.id} />
                              </th>
                            )
                          })}
                        </>
                      )}
                    </React.Fragment>
                  )
                })}

                {/* % column header */}
                <th
                  className="sticky right-0 z-10 bg-card px-2 text-center text-xs font-semibold text-muted-foreground w-12 min-w-12 border-l border-border align-bottom pb-1.5"
                >
                  %
                </th>
              </tr>
            </thead>

            <tbody>
              <tr className="bg-card">
                {/* Student name */}
                <td className="sticky left-0 z-10 bg-card px-3 py-1 text-sm font-medium border-r border-border whitespace-nowrap overflow-hidden text-ellipsis max-w-32">
                  {student.vorname} {student.nachname}
                </td>

                {colGroups.map((g, gi) => {
                  const isLastGroup = gi === colGroups.length - 1
                  return (
                    <React.Fragment key={g.thema.id}>
                      {g.mode === 'library' ? (
                        // Library mode: status cells using lernzielStatus (regular tracking)
                        g.rilzLibraryLz.map((lz, lzIdx) => {
                          const status = student.lernzielStatus[lz.id] as Status | undefined
                          const isLast = lzIdx === g.rilzLibraryLz.length - 1 && !isLastGroup
                          return (
                            <td
                              key={lz.id}
                              className={cn(
                                'px-1 py-1 text-center bg-orange-50/20',
                                isLast && 'border-r-2 border-orange-200',
                              )}
                            >
                              <StatusCell
                                status={status}
                                onSelect={s => updateLernzielStatus(student.id, lz.id, s)}
                              />
                            </td>
                          )
                        })
                      ) : (
                        <>
                          {/* Class Grundlegend status cells */}
                          {g.classGrundlegend.map((lz, lzIdx) => {
                            const status = student.lernzielStatus[lz.id] as Status | undefined
                            const isLastClass = lzIdx === g.classGrundlegend.length - 1
                            const hasDividerToRilz = isLastClass && g.rilzLz.length > 0
                            const hasDividerToGroup = isLastClass && g.rilzLz.length === 0 && !isLastGroup
                            return (
                              <td
                                key={lz.id}
                                className={cn(
                                  'px-1 py-1 text-center',
                                  (hasDividerToRilz || hasDividerToGroup) && 'border-r-2 border-orange-200/70',
                                )}
                              >
                                <StatusCell
                                  status={status}
                                  onSelect={s => updateLernzielStatus(student.id, lz.id, s)}
                                />
                              </td>
                            )
                          })}

                          {/* RILZ ad-hoc status cells */}
                          {g.rilzLz.map((lz, lzIdx) => {
                            const isLastRilz = lzIdx === g.rilzLz.length - 1 && !isLastGroup
                            return (
                              <td
                                key={lz.id}
                                className={cn(
                                  'px-1 py-1 text-center bg-orange-50/20',
                                  isLastRilz && 'border-r-2 border-orange-200',
                                )}
                              >
                                <RilzStatusCell
                                  status={lz.status}
                                  onSelect={s => updateRilzLernzielStatus(student.id, lz.id, s)}
                                />
                              </td>
                            )
                          })}
                        </>
                      )}
                    </React.Fragment>
                  )
                })}

                {/* % cell */}
                <td className="sticky right-0 z-10 bg-card px-2 py-1 text-center border-l border-border">
                  <span className={cn('text-xs font-bold tabular-nums', pctColor)}>
                    {pct}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Add RILZ Lernziel — only for ad-hoc mode groups (library groups use pre-defined LZ) */}
      {colGroups.some(g => g.mode === 'adhoc') && (
        <div className={cn('divide-y divide-border/30', totalCols > 0 && 'border-t border-border/50')}>
          {colGroups.filter(g => g.mode === 'adhoc').map(g => (
            <div key={g.thema.id}>
              {colGroups.filter(g => g.mode === 'adhoc').length > 1 && (
                <p className="px-3 pt-1.5 text-[10px] font-semibold uppercase tracking-wide text-orange-600">
                  {g.thema.name}
                </p>
              )}
              <AddLzRow onAdd={label => addRilzLernziel(student.id, g.thema.id, label)} />
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
