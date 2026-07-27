'use client'

import React, { useState } from 'react'
import { cn, getFachColor, sv, scoreColor, fullName } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { FachChipFilter } from '@/components/shared/FachChipFilter'
import { FilterDropdown } from '@/components/shared/FilterDropdown'
import { UnderlineTabs } from '@/components/shared/UnderlineTabs'
import { DistributionBars } from '@/components/analytics/DistributionBars'
import { ProgressBar } from '@/components/shared/ProgressBar'
import {
  FilterBar, SectionLabel, KpiTile, LZStatusBar, VIEW_OPTIONS,
  type KatFilter, type StatView,
} from '@/components/analytics/shared'
import { DistributionBar } from '@/components/analytics/DistributionBar'
import { StudentRankingTable, type ScoredStudent, type StudentSort } from '@/components/analytics/StudentRankingTable'
import { LZRow } from '@/components/analytics/LZRow'
import { useData } from '@/contexts/DataContext'
import { themaCountsInStats, isLZSkipped, adjustedLZScore, isSpecialStudent } from '@/lib/student-kpis'
import { todayISO } from '@/lib/dates'
import type { Schueler, Thema, Lernziel, Fach } from '@/types/domain'

// ── Helpers ────────────────────────────────────────────────────────────────

const studentLZScore = (student: Schueler, ids: string[]): number => {
  if (ids.length === 0) return 0
  return (ids.reduce((sum, id) => sum + sv(student.lernzielStatus[id] ?? 'not_reached'), 0) / ids.length) * 100
}

// ── Main component ─────────────────────────────────────────────────────────

type ClassAnalyticsProps = {
  klassId: string
  students: Schueler[]
  themen: Thema[]
  lernziele: Lernziel[]
  faecher: Fach[]
}

export const ClassAnalytics = ({
  klassId, students, themen, lernziele, faecher,
}: ClassAnalyticsProps) => {
  const { pruefungen, pruefungErgebnisse } = useData()

  const [view, setView] = useState<StatView>('gesamt')
  const [selectedFachIds, setSelectedFachIds] = useState<string[]>([])
  const [katFilter, setKatFilter] = useState<KatFilter>('all')
  const [studentSort, setStudentSort] = useState<StudentSort>('score')
  const [selectedThemaId, setSelectedThemaId] = useState<string>('')
  const [selectedPruefungId, setSelectedPruefungId] = useState<string>('')

  if (students.length === 0) {
    return <p className="text-sm text-muted-foreground">Noch keine Schüler in dieser Klasse.</p>
  }
  if (themen.length === 0) {
    return <p className="text-sm text-muted-foreground">Dieser Klasse sind noch keine Themen zugewiesen.</p>
  }

  const today = todayISO()
  const activeThemen = themen.filter(t => themaCountsInStats(t, today))

  const assignedFachIds = [...new Set(themen.map(t => t.fachId))]
  const assignedFaecher = faecher.filter(f => assignedFachIds.includes(f.id))
  const allFachIds = faecher.map(f => f.id)

  const filteredFaecher = selectedFachIds.length === 0
    ? assignedFaecher
    : assignedFaecher.filter(f => selectedFachIds.includes(f.id))

  const scopedThemen = selectedFachIds.length === 0
    ? activeThemen
    : activeThemen.filter(t => selectedFachIds.includes(t.fachId))

  const allScopedLZ = scopedThemen.flatMap(t => lernziele.filter(lz => lz.themaId === t.id))
  const scopedLZ = katFilter === 'all' ? allScopedLZ : allScopedLZ.filter(lz => lz.kategorie === katFilter)

  const allLZ = activeThemen.flatMap(t => lernziele.filter(lz => lz.themaId === t.id))

  const allScored = students.map(s => ({
    ...s,
    allScore: adjustedLZScore(s, allLZ, activeThemen),
  }))

  const scopeScored: ScoredStudent[] = allScored.map(s => ({
    ...s,
    score: adjustedLZScore(s, scopedLZ, activeThemen),
  }))

  const regularStudents = allScored.filter(s => !isSpecialStudent(s))
  const regularScoped = scopeScored.filter(s => !isSpecialStudent(s))

  const avgScore = regularScoped.length
    ? regularScoped.reduce((sum, x) => sum + x.score, 0) / regularScoped.length
    : 0

  const excellent = allScored.filter(s => s.allScore >= 75).length
  const progressing = allScored.filter(s => s.allScore >= 25 && s.allScore < 75).length
  const struggling = allScored.filter(s => s.allScore < 25).length

  const scopeExcellent = scopeScored.filter(s => s.score >= 75).length
  const scopeProgressing = scopeScored.filter(s => s.score >= 25 && s.score < 75).length
  const scopeStruggling = scopeScored.filter(s => s.score < 25).length

  // ── Thema selector data ────────────────────────────────────────────────

  const themaOptions = activeThemen.map(t => ({
    thema: t,
    fach: faecher.find(f => f.id === t.fachId),
  }))

  const selectedThema = themaOptions.find(o => o.thema.id === selectedThemaId)
  const themaLZ = selectedThemaId ? lernziele.filter(lz => lz.themaId === selectedThemaId) : []
  const themaKatFilteredLZ = katFilter === 'all' ? themaLZ : themaLZ.filter(lz => lz.kategorie === katFilter)

  const themaLZStats = themaKatFilteredLZ.map(lz => {
    const eligible = regularStudents.filter(s => !isLZSkipped(lz, s, activeThemen))
    const reached = eligible.filter(s => s.lernzielStatus[lz.id] === 'reached').length
    const partial = eligible.filter(s => s.lernzielStatus[lz.id] === 'partially_reached').length
    return { lz, reached, partial, eligibleCount: eligible.length }
  })

  const themaAvgPct = themaKatFilteredLZ.length === 0 ? 0 : (() => {
    if (regularStudents.length === 0) return 0
    const scores = regularStudents.map(s => adjustedLZScore(s, themaKatFilteredLZ, activeThemen))
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  })()

  const themaStudents = [...scopeScored]
    .map(s => ({ ...s, themaScore: adjustedLZScore(s, themaKatFilteredLZ, activeThemen) }))
    .sort((a, b) => b.themaScore - a.themaScore)

  // ── Prüfungsstatistiken data ───────────────────────────────────────────

  const klassePruefungen = pruefungen
    .filter(p => p.klasseId === klassId)
    .sort((a, b) => b.datum.localeCompare(a.datum))

  const selectedPruefung = klassePruefungen.find(p => p.id === selectedPruefungId)
  const pruefungErgebn = pruefungErgebnisse.filter(e => e.pruefungId === selectedPruefungId)

  const pruefungStudentRows = students
    .filter(s => selectedPruefung?.nurRilz
      ? (selectedPruefung.rilzSchuelerIds ?? []).includes(s.id)
      : !s.rilzFachIds?.includes(selectedPruefung?.fachId ?? ''))
    .map(s => ({ student: s, ergebnis: pruefungErgebn.find(e => e.schuelerId === s.id) }))
    .sort((a, b) => {
      if (selectedPruefung?.punkteEnabled) {
        return (b.ergebnis?.punkte ?? -1) - (a.ergebnis?.punkte ?? -1)
      }
      if (selectedPruefung?.noteEnabled) {
        return parseFloat(b.ergebnis?.note ?? '0') - parseFloat(a.ergebnis?.note ?? '0')
      }
      const ord = { reached: 0, partially_reached: 1, not_reached: 2 }
      return ord[a.ergebnis?.status ?? 'not_reached'] - ord[b.ergebnis?.status ?? 'not_reached']
    })

  // Notenverteilung als Buckets über der festen Skala 1.0–6.0 (0.5-Schritte)
  const gradeDistribution = (() => {
    if (!selectedPruefung?.noteEnabled) return []
    const counts = new Map<number, number>()
    for (const row of pruefungStudentRows) {
      const note = row.ergebnis?.note
      if (!note) continue
      const val = Math.round(parseFloat(note) * 2) / 2
      if (Number.isNaN(val)) continue
      counts.set(val, (counts.get(val) ?? 0) + 1)
    }
    const buckets: { x: number; count: number }[] = []
    for (let g = 1; g <= 6.0001; g += 0.5) {
      const x = Math.round(g * 2) / 2
      buckets.push({ x, count: counts.get(x) ?? 0 })
    }
    return buckets
  })()

  const pointsStats = (() => {
    if (!selectedPruefung?.punkteEnabled) return null
    const values = pruefungStudentRows
      .map(r => r.ergebnis?.punkte)
      .filter((v): v is number => v !== undefined && v !== null)
    if (values.length === 0) return null
    return {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    }
  })()

  // Punkteverteilung als Buckets über 0…maxPunkte (Fallback: beobachteter Bereich)
  const pointsDistribution = (() => {
    if (!selectedPruefung?.punkteEnabled || !pointsStats) return null
    const lo = selectedPruefung.maxPunkte != null ? 0 : pointsStats.min
    const hi = selectedPruefung.maxPunkte ?? pointsStats.max
    const min = Math.floor(lo)
    const max = Math.ceil(hi)
    if (max <= min) return null
    const counts = new Map<number, number>()
    for (const row of pruefungStudentRows) {
      const p = row.ergebnis?.punkte
      if (p == null) continue
      const x = Math.round(p)
      counts.set(x, (counts.get(x) ?? 0) + 1)
    }
    const buckets: { x: number; count: number }[] = []
    for (let p = min; p <= max; p++) buckets.push({ x: p, count: counts.get(p) ?? 0 })
    // ~5 gleichmäßige X-Ticks über den Bereich
    const ticks: number[] = []
    for (let i = 0; i <= 4; i++) ticks.push(Math.round(min + ((max - min) * i) / 4))
    return { buckets, min, max, ticks: [...new Set(ticks)] }
  })()

  const statusDistrib = (() => {
    if (selectedPruefung?.punkteEnabled || selectedPruefung?.noteEnabled || !selectedPruefung) return null
    const r = pruefungStudentRows.filter(x => x.ergebnis?.status === 'reached').length
    const p = pruefungStudentRows.filter(x => x.ergebnis?.status === 'partially_reached').length
    const n = pruefungStudentRows.filter(x => !x.ergebnis || x.ergebnis.status === 'not_reached').length
    return { reached: r, partial: p, notReached: n }
  })()

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">

      {/* Tabs */}
      <UnderlineTabs options={VIEW_OPTIONS} value={view} onChange={setView} />

      {/* ── Unified filter zone ─────────────────────────────────────── */}
      <div className="space-y-2 pb-3 border-b border-border">
        {view === 'fach' && (
          <FachChipFilter
            faecher={assignedFaecher}
            allFachIds={allFachIds}
            selectedIds={selectedFachIds}
            onChange={setSelectedFachIds}
          />
        )}
        {view === 'thema' && (
          <FilterDropdown
            label="Thema"
            allLabel="wählen…"
            showSearch
            value={selectedThemaId}
            onChange={setSelectedThemaId}
            options={[
              { value: '', label: 'Kein Thema' },
              ...assignedFaecher.flatMap(fach => {
                const dot = getFachColor(fach.id, allFachIds, fach.colorIndex).dot
                return themaOptions
                  .filter(o => o.thema.fachId === fach.id)
                  .map(o => ({ value: o.thema.id, label: o.thema.name, dot }))
              }),
            ]}
          />
        )}
        {view === 'pruefungen' && (
          <FilterDropdown
            label="Lernzielkontrolle"
            allLabel="wählen…"
            showSearch
            value={selectedPruefungId}
            onChange={setSelectedPruefungId}
            options={[
              { value: '', label: 'Keine Lernzielkontrolle' },
              ...klassePruefungen.map(p => {
                const fach = faecher.find(f => f.id === p.fachId)
                const modeTag = p.punkteEnabled ? ' [Punkte]' : p.noteEnabled ? ' [Note]' : ' [Status]'
                return {
                  value: p.id,
                  label: `${p.datum} — ${p.name}${fach ? ` (${fach.name})` : ''}${modeTag}`,
                }
              }),
            ]}
          />
        )}
        {view !== 'pruefungen' && (
          <FilterBar katFilter={katFilter} onKatChange={setKatFilter} />
        )}
      </div>

      {/* ── GESAMT ──────────────────────────────────────────────────────── */}
      {view === 'gesamt' && (
        <div className="space-y-5">

          {/* KPI tiles */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <KpiTile
                label="Ø Score"
                value={`${Math.round(avgScore)}%`}
                valueClass={scoreColor(Math.round(avgScore))}
                sub={`${students.length} Schüler`}
              />
              <KpiTile label="Sehr gut" value={excellent} valueClass="text-status-reached" sub={`≥75% · ${students.length} gesamt`} />
              <KpiTile label="Im Aufbau" value={progressing} valueClass="text-status-partial" sub="25–74%" />
              <KpiTile label="Förderbedarf" value={struggling} valueClass={struggling > 0 ? 'text-status-not-reached' : 'text-muted-foreground'} sub="unter 25%" />
            </div>

            <DistributionBar excellent={excellent} progressing={progressing} struggling={struggling} total={students.length} />

          </div>

          {/* Schüler-Ranking */}
          <div className="space-y-2">
            <SectionLabel label={`Lernstand — ${scopeScored.length} Schüler`} />
            <div className="border border-border rounded-2xl overflow-hidden bg-card">
              <StudentRankingTable
                students={scopeScored}
                sort={studentSort}
                onSortChange={setStudentSort}
              />
            </div>
          </div>

        </div>
      )}

      {/* ── FACH ────────────────────────────────────────────────────────── */}
      {view === 'fach' && (
        <div className="space-y-4">
          {filteredFaecher.length > 0 ? (
            <>
              <div className="border border-border rounded-2xl overflow-hidden">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="py-2 px-3 text-left text-4xs font-mono uppercase tracking-widest text-muted-foreground">Fach</th>
                      <th className="py-2 px-3 text-right text-4xs font-mono uppercase tracking-widest text-muted-foreground w-16">Ø</th>
                      <th className="py-2 px-3 text-4xs font-mono uppercase tracking-widest text-muted-foreground w-40">Verlauf</th>
                      <th className="py-2 px-3 text-right text-4xs font-mono uppercase tracking-widest text-muted-foreground w-16">G</th>
                      <th className="py-2 px-3 text-right text-4xs font-mono uppercase tracking-widest text-muted-foreground w-16">A</th>
                      <th className="py-2 px-3 text-right text-4xs font-mono uppercase tracking-widest text-muted-foreground w-12">LZ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFaecher.map(fach => {
                      const fachThemen = activeThemen.filter(t => t.fachId === fach.id)
                      const fachAllLZ = fachThemen.flatMap(t => lernziele.filter(lz => lz.themaId === t.id))
                      const fachLZ = katFilter === 'all' ? fachAllLZ : fachAllLZ.filter(lz => lz.kategorie === katFilter)
                      if (fachLZ.length === 0) return null

                      const grundLZ = fachAllLZ.filter(lz => lz.kategorie === 'grundlegend')
                      const ansprLZ = fachAllLZ.filter(lz => lz.kategorie === 'anspruchsvoll')
                      const nReg = regularStudents.length

                      const avgG = nReg && grundLZ.length
                        ? Math.round(regularStudents.reduce((s, x) => s + studentLZScore(x, grundLZ.map(l => l.id)), 0) / nReg)
                        : null
                      const avgA = nReg && ansprLZ.length
                        ? Math.round(regularStudents.reduce((s, x) => s + studentLZScore(x, ansprLZ.map(l => l.id)), 0) / nReg)
                        : null

                      const reached = fachLZ.reduce((sum, lz) => {
                        const elig = regularStudents.filter(s => !isLZSkipped(lz, s, activeThemen))
                        return sum + elig.filter(s => s.lernzielStatus[lz.id] === 'reached').length
                      }, 0)
                      const partial = fachLZ.reduce((sum, lz) => {
                        const elig = regularStudents.filter(s => !isLZSkipped(lz, s, activeThemen))
                        return sum + elig.filter(s => s.lernzielStatus[lz.id] === 'partially_reached').length
                      }, 0)
                      const total = fachLZ.reduce((sum, lz) =>
                        sum + regularStudents.filter(s => !isLZSkipped(lz, s, activeThemen)).length, 0)
                      const avgPct = total === 0 ? 0 : Math.round(((reached + partial * 0.5) / total) * 100)
                      const fc = getFachColor(fach.id, allFachIds, fach.colorIndex)

                      return (
                        <tr key={fach.id} className="border-b border-border last:border-b-0 hover:bg-accent transition-colors">
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-1.5">
                              <span className={cn('size-2 rounded-full shrink-0', fc.dot)} />
                              <span className="text-sm font-medium">{fach.name}</span>
                            </div>
                          </td>
                          <td className={cn('py-2 px-3 text-right tabular-nums font-bold text-sm', scoreColor(avgPct))}>{avgPct}%</td>
                          <td className="py-2 px-3"><ProgressBar segments={[{ value: avgPct, className: 'bg-primary' }]} total={100} size="xs" /></td>
                          <td className="py-2 px-3 text-right tabular-nums text-xs text-muted-foreground">{avgG !== null ? `${avgG}%` : '—'}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-xs text-muted-foreground">{avgA !== null ? `${avgA}%` : '—'}</td>
                          <td className="py-2 px-3 text-right tabular-nums text-xs text-muted-foreground">{fachAllLZ.length}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              <DistributionBar
                excellent={scopeExcellent}
                progressing={scopeProgressing}
                struggling={scopeStruggling}
                total={scopeScored.length}
              />

              <div className="space-y-2">
                <SectionLabel label={`Lernstand — ${scopeScored.length} Schüler`} />
                <div className="border border-border rounded-2xl overflow-hidden bg-card">
                  <StudentRankingTable
                    students={scopeScored}
                    sort={studentSort}
                    onSortChange={setStudentSort}
                  />
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Keine Fächer für diese Auswahl.</p>
          )}
        </div>
      )}

      {/* ── THEMA ───────────────────────────────────────────────────────── */}
      {view === 'thema' && (
        <div className="space-y-4">
          {!selectedThema ? (
            <p className="text-sm text-muted-foreground">Wähle ein Thema um die Statistiken zu sehen.</p>
          ) : (
            <div className="border border-border rounded-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-muted border-b border-border">
                <div className="flex items-center gap-2">
                  {selectedThema.fach && (
                    <span className={cn('size-2 rounded-full shrink-0', getFachColor(selectedThema.fach.id, allFachIds, selectedThema.fach.colorIndex).dot)} />
                  )}
                  <span className="text-sm font-semibold">{selectedThema.thema.name}</span>
                  {selectedThema.fach && (
                    <span className="text-xs text-muted-foreground">{selectedThema.fach.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{themaLZ.length} LZ</span>
                  <span className={cn('text-sm font-bold tabular-nums', scoreColor(themaAvgPct))}>
                    Ø {themaAvgPct}%
                  </span>
                </div>
              </div>

              {/* LZ breakdown */}
              {themaLZStats.length > 0 && (
                <div className="divide-y divide-border px-2 py-1">
                  {themaLZStats.map(({ lz, reached, partial, eligibleCount }) => (
                    <LZRow key={lz.id} label={lz.label} kategorie={lz.kategorie} reached={reached} partial={partial} total={eligibleCount} />
                  ))}
                </div>
              )}

              {/* Student list */}
              {themaStudents.length > 0 && (() => {
                const themaExcellent = themaStudents.filter(s => s.themaScore >= 75).length
                const themaProgressing = themaStudents.filter(s => s.themaScore >= 25 && s.themaScore < 75).length
                const themaStruggling = themaStudents.filter(s => s.themaScore < 25).length
                const themaAsScored: ScoredStudent[] = themaStudents.map(s => ({ ...s, score: s.themaScore }))
                return (
                  <div className="border-t border-border space-y-4 p-4">
                    <DistributionBar
                      excellent={themaExcellent}
                      progressing={themaProgressing}
                      struggling={themaStruggling}
                      total={themaStudents.length}
                    />
                    <div className="space-y-2">
                      <SectionLabel label={`Lernstand — ${themaStudents.length} Schüler`} />
                      <div className="border border-border rounded-2xl overflow-hidden bg-card">
                        <StudentRankingTable
                          students={themaAsScored}
                          sort={studentSort}
                          onSortChange={setStudentSort}
                        />
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── PRÜFUNGEN ───────────────────────────────────────────────────── */}
      {view === 'pruefungen' && (
        <div className="space-y-4">
          {klassePruefungen.length === 0 ? (
            <p className="text-sm text-muted-foreground">Noch keine Lernzielkontrollen für diese Klasse erfasst.</p>
          ) : !selectedPruefung ? (
            <p className="text-sm text-muted-foreground">Wähle eine Lernzielkontrolle um die Statistiken zu sehen.</p>
          ) : (
            <div className="border border-border rounded-2xl overflow-hidden">
              {/* Exam header */}
              <div className="px-4 py-3 bg-muted border-b border-border flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{selectedPruefung.name}</span>
                    <Badge variant="primary">
                      {selectedPruefung.punkteEnabled ? 'Punkte' : selectedPruefung.noteEnabled ? 'Note' : 'Status'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                    <span>{selectedPruefung.datum}</span>
                    {faecher.find(f => f.id === selectedPruefung.fachId) && (
                      <span>· {faecher.find(f => f.id === selectedPruefung.fachId)!.name}</span>
                    )}
                    <span>· {pruefungStudentRows.length} Schüler</span>
                  </div>
                </div>
              </div>

              {/* Points stats */}
              {selectedPruefung.punkteEnabled && pointsStats && (
                <div className="px-4 py-3 border-b border-border space-y-2">
                  <div className="flex items-center gap-6 text-xs">
                    <div>
                      <span className="text-muted-foreground">Ø Punkte </span>
                      <span className="font-bold tabular-nums">{pointsStats.avg.toFixed(1)}</span>
                      {selectedPruefung.maxPunkte && <span className="text-muted-foreground"> / {selectedPruefung.maxPunkte}</span>}
                    </div>
                    <div><span className="text-muted-foreground">Min </span><span className="font-bold tabular-nums text-status-not-reached">{pointsStats.min}</span></div>
                    <div><span className="text-muted-foreground">Max </span><span className="font-bold tabular-nums text-status-reached">{pointsStats.max}</span></div>
                    <div><span className="text-muted-foreground">Bewertet </span><span className="font-bold tabular-nums">{pointsStats.count}</span></div>
                  </div>
                  {selectedPruefung.maxPunkte && (
                    <ProgressBar segments={[{ value: (pointsStats.avg / selectedPruefung.maxPunkte) * 100, className: 'bg-primary' }]} total={100} size="sm" />
                  )}
                </div>
              )}

              {/* Verteilungen — kompakt, nebeneinander */}
              {((selectedPruefung.punkteEnabled && pointsDistribution) || (selectedPruefung.noteEnabled && gradeDistribution.length > 0)) && (
                <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row gap-6">
                  {selectedPruefung.punkteEnabled && pointsDistribution && (
                    <div className="flex-1 min-w-0">
                      <p className="text-4xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Punkteverteilung</p>
                      <DistributionBars
                        buckets={pointsDistribution.buckets}
                        domainMin={pointsDistribution.min}
                        domainMax={pointsDistribution.max}
                        ticks={pointsDistribution.ticks}
                        ariaLabel="Punkteverteilung der Klasse"
                      />
                    </div>
                  )}
                  {selectedPruefung.noteEnabled && gradeDistribution.length > 0 && (
                    <div className="flex-1 min-w-0">
                      <p className="text-4xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Notenverteilung</p>
                      <DistributionBars
                        buckets={gradeDistribution}
                        domainMin={1}
                        domainMax={6}
                        ticks={[1, 2, 3, 4, 5, 6]}
                        formatTick={v => v.toFixed(1)}
                        ariaLabel="Notenverteilung der Klasse"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Status mode */}
              {statusDistrib && (
                <div className="px-4 py-3 border-b border-border">
                  <LZStatusBar reached={statusDistrib.reached} partial={statusDistrib.partial} notReached={statusDistrib.notReached} />
                </div>
              )}

              {/* Student results */}
              <div className="max-h-72 overflow-y-auto">
                <table className="w-full text-xs border-collapse">
                  <thead className="sticky top-0 bg-card border-b border-border">
                    <tr>
                      <th className="py-2 px-3 text-left text-4xs font-mono uppercase tracking-widest text-muted-foreground">Schüler</th>
                      <th className="py-2 px-3 text-right text-4xs font-mono uppercase tracking-widest text-muted-foreground">
                        {selectedPruefung.punkteEnabled ? 'Punkte' : selectedPruefung.noteEnabled ? 'Note' : 'Status'}
                      </th>
                      {selectedPruefung.punkteEnabled && selectedPruefung.maxPunkte && <th className="py-2 px-3 w-32"></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {pruefungStudentRows.map(({ student, ergebnis }) => (
                      <tr
                        key={student.id}
                        className="border-b border-border last:border-b-0 hover:bg-accent transition-colors"
                      >
                        <td className="py-2 px-3 font-medium">{fullName(student)}</td>
                        <td className="py-2 px-3 text-right font-bold tabular-nums">
                          {selectedPruefung.punkteEnabled
                            ? (ergebnis?.punkte !== undefined
                              ? ergebnis.punkte
                              : <span className="text-muted-foreground font-normal">—</span>)
                            : selectedPruefung.noteEnabled
                            ? (ergebnis?.note ?? <span className="text-muted-foreground font-normal">—</span>)
                            : (
                              <span className={cn('inline-flex items-center gap-1',
                                ergebnis?.status === 'reached' ? 'text-status-reached'
                                  : ergebnis?.status === 'partially_reached' ? 'text-status-partial'
                                  : 'text-muted-foreground',
                              )}>
                                <span className={cn('inline-block size-2 rounded-full',
                                  ergebnis?.status === 'reached' ? 'bg-status-reached'
                                    : ergebnis?.status === 'partially_reached' ? 'bg-status-partial'
                                    : 'bg-status-none-soft',
                                )} />
                                {ergebnis?.status === 'reached' ? 'Erreicht'
                                  : ergebnis?.status === 'partially_reached' ? 'Teilweise'
                                  : 'Nicht erreicht'}
                              </span>
                            )
                          }
                        </td>
                        {selectedPruefung.punkteEnabled && selectedPruefung.maxPunkte && (
                          <td className="py-2 px-3">
                            <ProgressBar
                              segments={[{
                                value: ergebnis?.punkte !== undefined ? (ergebnis.punkte / selectedPruefung.maxPunkte!) * 100 : 0,
                                className: 'bg-primary',
                              }]}
                              total={100}
                              size="xs"
                            />
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  )
}
